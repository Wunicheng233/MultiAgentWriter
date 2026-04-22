"""
工作流基础服务
为长期架构演进提供最小可用的数据写入入口。
当前阶段只承接两件事：
- 生成任务触发时创建 WorkflowRun / WorkflowStepRun / Artifact
- 用户驳回章节时记录结构化 FeedbackItem
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models import Artifact, FeedbackItem, GenerationTask, Project, WorkflowRun, WorkflowStepRun


def _next_artifact_version(
    db: Session,
    project_id: int,
    artifact_type: str,
    scope: str,
    chapter_index: int | None = None,
) -> int:
    current_max = db.query(func.max(Artifact.version_number)).filter(
        Artifact.project_id == project_id,
        Artifact.artifact_type == artifact_type,
        Artifact.scope == scope,
        Artifact.chapter_index == chapter_index,
    ).scalar()
    return (current_max or 0) + 1


def create_generation_workflow_run(
    db: Session,
    project: Project,
    generation_task: GenerationTask,
    triggered_by_user_id: int | None,
    regenerate: bool = False,
    parent_run: WorkflowRun | None = None,
) -> WorkflowRun:
    run = WorkflowRun(
        project_id=project.id,
        generation_task_id=generation_task.id,
        parent_run_id=parent_run.id if parent_run else None,
        run_kind="regeneration" if regenerate else "generation",
        trigger_source="manual" if parent_run is None else "feedback",
        status=generation_task.status or "pending",
        current_step_key="queued_generation",
        triggered_by_user_id=triggered_by_user_id,
        run_metadata={
            "regenerate": regenerate,
            "project_status_at_start": project.status,
            "source_task_id": generation_task.celery_task_id,
        },
    )
    db.add(run)
    db.flush()

    version = _next_artifact_version(
        db=db,
        project_id=project.id,
        artifact_type="project_config_snapshot",
        scope="project",
    )
    artifact = Artifact(
        project_id=project.id,
        workflow_run_id=run.id,
        artifact_type="project_config_snapshot",
        scope="project",
        version_number=version,
        is_current=True,
        source="system",
        content_json=project.config or {},
    )
    db.add(artifact)

    step = WorkflowStepRun(
        workflow_run_id=run.id,
        step_key="queued_generation",
        step_type="system",
        status="completed",
        step_data={
            "generation_task_id": generation_task.id,
            "celery_task_id": generation_task.celery_task_id,
        },
        started_at=datetime.utcnow(),
        completed_at=datetime.utcnow(),
    )
    db.add(step)
    db.flush()
    return run


def create_feedback_item(
    db: Session,
    project_id: int,
    workflow_run_id: int | None,
    created_by_user_id: int | None,
    content: str,
    chapter_index: int | None,
    feedback_scope: str,
    feedback_type: str,
    action_type: str,
    chapter_id: int | None = None,
    artifact_id: int | None = None,
    feedback_metadata: dict | None = None,
) -> FeedbackItem:
    feedback_item = FeedbackItem(
        project_id=project_id,
        workflow_run_id=workflow_run_id,
        chapter_id=chapter_id,
        artifact_id=artifact_id,
        created_by_user_id=created_by_user_id,
        feedback_scope=feedback_scope,
        feedback_type=feedback_type,
        action_type=action_type,
        chapter_index=chapter_index,
        content=content,
        feedback_metadata=feedback_metadata or {},
    )
    db.add(feedback_item)
    db.flush()
    return feedback_item


def update_workflow_run_status(
    db: Session,
    generation_task: GenerationTask,
    task_status: str,
    current_step_key: str | None = None,
    current_chapter: int | None = None,
    metadata_updates: dict | None = None,
) -> WorkflowRun | None:
    workflow_run = generation_task.workflow_run
    if workflow_run is None:
        return None

    status_mapping = {
        "pending": "pending",
        "started": "running",
        "progress": "running",
        "waiting_confirm": "waiting_confirm",
        "success": "completed",
        "failure": "failed",
        "cancelled": "cancelled",
    }
    workflow_run.status = status_mapping.get(task_status, workflow_run.status)

    if current_step_key is not None:
        workflow_run.current_step_key = current_step_key
    if current_chapter is not None:
        workflow_run.current_chapter = current_chapter

    if metadata_updates:
        merged_metadata = dict(workflow_run.run_metadata or {})
        merged_metadata.update(metadata_updates)
        workflow_run.run_metadata = merged_metadata

    if workflow_run.status in {"completed", "failed", "cancelled"}:
        workflow_run.completed_at = datetime.utcnow()
    elif task_status in {"started", "progress"} and workflow_run.started_at is None:
        workflow_run.started_at = datetime.utcnow()

    db.flush()
    return workflow_run
