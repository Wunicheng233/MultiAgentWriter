"""
Synchronize harness evaluation reports into database artifacts.

The orchestrator writes evaluation reports to info.json today. This module is
the bridge that brings those reports into the long-term Artifact data model.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from backend.models import Artifact, Chapter, Project
from backend.workflow_service import create_artifact, record_chapter_evaluation_artifact


def _get_chapter(db: Session, project: Project, chapter_index: int | None) -> Chapter | None:
    if chapter_index is None:
        return None
    return db.query(Chapter).filter(
        Chapter.project_id == project.id,
        Chapter.chapter_index == int(chapter_index),
    ).first()


def _record_json_artifact_if_changed(
    db: Session,
    project: Project,
    workflow_run_id: int | None,
    artifact_type: str,
    content_json: dict | list,
    chapter: Chapter | None = None,
    chapter_index: int | None = None,
    source: str = "agent",
) -> Artifact:
    scope = "chapter" if chapter_index is not None else "project"
    current = db.query(Artifact).filter(
        Artifact.project_id == project.id,
        Artifact.artifact_type == artifact_type,
        Artifact.scope == scope,
        Artifact.chapter_index == chapter_index,
        Artifact.is_current.is_(True),
    ).order_by(Artifact.id.desc()).first()
    if (
        current is not None
        and current.workflow_run_id == workflow_run_id
        and (current.content_json or {}) == content_json
    ):
        return current

    return create_artifact(
        db=db,
        project_id=project.id,
        workflow_run_id=workflow_run_id,
        chapter_id=chapter.id if chapter else None,
        artifact_type=artifact_type,
        scope=scope,
        chapter_index=chapter_index,
        source=source,
        content_json=content_json,
    )


def sync_evaluation_reports_to_artifacts(
    db: Session,
    project: Project,
    workflow_run_id: int | None,
    evaluation_reports: list[dict[str, Any]] | None,
) -> list[Artifact]:
    if not evaluation_reports:
        return []

    artifacts: list[Artifact] = []
    for report in evaluation_reports:
        chapter_index = report.get("chapter_index")
        if chapter_index is None:
            continue

        chapter = _get_chapter(db, project, int(chapter_index))
        if chapter is None:
            continue

        artifacts.append(
            record_chapter_evaluation_artifact(
                db=db,
                project_id=project.id,
                chapter=chapter,
                workflow_run_id=workflow_run_id,
                evaluation_report=report,
                source="agent",
            )
        )
        critique_v2 = (report.get("metadata") or {}).get("critique_v2")
        if isinstance(critique_v2, dict):
            artifacts.append(
                _record_json_artifact_if_changed(
                    db=db,
                    project=project,
                    workflow_run_id=workflow_run_id,
                    artifact_type="chapter_critique_v2",
                    content_json=critique_v2,
                    chapter=chapter,
                    chapter_index=chapter.chapter_index,
                )
            )

    return artifacts


def sync_workflow_optimization_artifacts_to_artifacts(
    db: Session,
    project: Project,
    workflow_run_id: int | None,
    info: dict[str, Any] | None,
) -> list[Artifact]:
    """Sync workflow-v2 JSON artifact lists from info.json into Artifact rows."""
    if not info:
        return []

    artifacts: list[Artifact] = []
    artifact_sources = {
        "scene_anchor_plans": "scene_anchor_plan",
        "repair_traces": "repair_trace",
        "stitching_reports": "stitching_report",
        "novel_state_snapshots": "novel_state_snapshot",
    }
    for info_key, artifact_type in artifact_sources.items():
        items = info.get(info_key) or []
        if not isinstance(items, list):
            continue
        grouped: dict[int | None, list[dict[str, Any]]] = {}
        for item in items:
            if isinstance(item, dict):
                raw_chapter_index = item.get("chapter_index")
                chapter_index = int(raw_chapter_index) if raw_chapter_index is not None else None
                grouped.setdefault(chapter_index, []).append(item)

        for chapter_index, grouped_items in grouped.items():
            chapter = _get_chapter(db, project, chapter_index)
            content_json: dict[str, Any] | list[dict[str, Any]]
            if len(grouped_items) == 1:
                content_json = grouped_items[0]
            else:
                content_json = {
                    "artifact_type": artifact_type,
                    "chapter_index": chapter_index,
                    "items": grouped_items,
                }
            artifacts.append(
                _record_json_artifact_if_changed(
                    db=db,
                    project=project,
                    workflow_run_id=workflow_run_id,
                    artifact_type=artifact_type,
                    content_json=content_json,
                    chapter=chapter,
                    chapter_index=chapter_index,
                )
            )
    return artifacts
