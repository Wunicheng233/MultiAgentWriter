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


def _infer_step_type(step_key: str) -> str:
    mapping = {
        "queued_generation": "system",
        "booting": "system",
        "planning": "planner",
        "generating_settings": "planner",
        "generating_chapter": "generator",
        "waiting_confirm": "approval",
        "completed": "system",
        "failed": "system",
        "cancelled": "system",
    }
    return mapping.get(step_key, "system")


def _sync_workflow_step_run(
    db: Session,
    workflow_run: WorkflowRun,
    task_status: str,
    step_key: str | None,
    chapter_index: int | None,
    step_data: dict | None = None,
) -> None:
    if not step_key:
        return

    now = datetime.utcnow()
    step_status_mapping = {
        "pending": "pending",
        "started": "running",
        "progress": "running",
        "waiting_confirm": "waiting_confirm",
        "success": "completed",
        "failure": "failed",
        "cancelled": "cancelled",
    }
    desired_status = step_status_mapping.get(task_status, "running")

    active_steps = db.query(WorkflowStepRun).filter(
        WorkflowStepRun.workflow_run_id == workflow_run.id,
        WorkflowStepRun.status.in_(["pending", "running", "waiting_confirm"]),
    ).all()
    for active_step in active_steps:
        same_step = active_step.step_key == step_key and active_step.chapter_index == chapter_index
        if not same_step:
            active_step.status = "completed"
            active_step.completed_at = active_step.completed_at or now

    current_step = db.query(WorkflowStepRun).filter(
        WorkflowStepRun.workflow_run_id == workflow_run.id,
        WorkflowStepRun.step_key == step_key,
        WorkflowStepRun.chapter_index == chapter_index,
    ).order_by(WorkflowStepRun.id.desc()).first()

    if current_step is None:
        current_step = WorkflowStepRun(
            workflow_run_id=workflow_run.id,
            step_key=step_key,
            step_type=_infer_step_type(step_key),
            status=desired_status,
            chapter_index=chapter_index,
            step_data=step_data or {},
            started_at=now,
        )
        if desired_status in {"completed", "failed", "cancelled"}:
            current_step.completed_at = now
        db.add(current_step)
        db.flush()
        return

    merged_step_data = dict(current_step.step_data or {})
    if step_data:
        merged_step_data.update(step_data)
    current_step.step_data = merged_step_data
    current_step.step_type = _infer_step_type(step_key)
    current_step.status = desired_status
    current_step.started_at = current_step.started_at or now
    if desired_status in {"completed", "failed", "cancelled"}:
        current_step.completed_at = current_step.completed_at or now
    elif desired_status == "waiting_confirm":
        current_step.completed_at = None
    else:
        current_step.completed_at = None


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

    step_data = {
        "task_status": task_status,
        "workflow_status": workflow_run.status,
    }
    if metadata_updates:
        step_data.update(metadata_updates)
    _sync_workflow_step_run(
        db=db,
        workflow_run=workflow_run,
        task_status=task_status,
        step_key=current_step_key,
        chapter_index=current_chapter,
        step_data=step_data,
    )

    if workflow_run.status in {"completed", "failed", "cancelled"}:
        workflow_run.completed_at = datetime.utcnow()
    elif task_status in {"started", "progress"} and workflow_run.started_at is None:
        workflow_run.started_at = datetime.utcnow()

    db.flush()
    return workflow_run
