"""Helpers for safely dispatching Celery tasks tracked in the database."""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.models import GenerationTask, Project
from backend.workflow_service import update_workflow_run_status


def make_task_id(prefix: str) -> str:
    """Create a task id short enough for GenerationTask.celery_task_id."""
    safe_prefix = prefix.strip().lower().replace("_", "-") or "task"
    return f"{safe_prefix}-{uuid4().hex}"


def dispatch_tracked_task(
    *,
    db: Session,
    task: GenerationTask,
    celery_task,
    args: tuple,
    project: Project | None = None,
    failure_step_key: str = "enqueue_failed",
):
    """
    Dispatch a Celery task whose id was already persisted in GenerationTask.

    Creating the DB row before dispatch prevents a race where a fast worker
    starts, looks up its task id, and cannot find the tracking record yet.
    """
    try:
        return celery_task.apply_async(args=args, task_id=task.celery_task_id)
    except Exception as exc:
        task.status = "failure"
        task.completed_at = datetime.utcnow()
        task.error_message = f"Failed to enqueue celery task: {exc}"
        if project is not None:
            project.status = "failed"
        update_workflow_run_status(
            db=db,
            generation_task=task,
            task_status="failure",
            current_step_key=failure_step_key,
            metadata_updates={"enqueue_error": str(exc)},
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="任务入队失败，请稍后重试",
        ) from exc
