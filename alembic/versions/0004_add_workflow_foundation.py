"""Add workflow foundation tables for long-term creation runtime

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-22 23:45:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workflow_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("generation_task_id", sa.Integer(), nullable=True),
        sa.Column("parent_run_id", sa.Integer(), nullable=True),
        sa.Column("run_kind", sa.String(length=30), nullable=False),
        sa.Column("trigger_source", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("current_step_key", sa.String(length=50), nullable=True),
        sa.Column("current_chapter", sa.Integer(), nullable=True),
        sa.Column("triggered_by_user_id", sa.Integer(), nullable=True),
        sa.Column("run_metadata", sa.JSON(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["generation_task_id"], ["generation_tasks.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["parent_run_id"], ["workflow_runs.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["triggered_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("generation_task_id"),
    )

    op.create_table(
        "artifacts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("workflow_run_id", sa.Integer(), nullable=True),
        sa.Column("chapter_id", sa.Integer(), nullable=True),
        sa.Column("artifact_type", sa.String(length=50), nullable=False),
        sa.Column("scope", sa.String(length=20), nullable=False),
        sa.Column("chapter_index", sa.Integer(), nullable=True),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("is_current", sa.Boolean(), nullable=True),
        sa.Column("source", sa.String(length=30), nullable=False),
        sa.Column("content_text", sa.Text(), nullable=True),
        sa.Column("content_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["workflow_run_id"], ["workflow_runs.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "feedback_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("workflow_run_id", sa.Integer(), nullable=True),
        sa.Column("chapter_id", sa.Integer(), nullable=True),
        sa.Column("artifact_id", sa.Integer(), nullable=True),
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
        sa.Column("feedback_scope", sa.String(length=20), nullable=False),
        sa.Column("feedback_type", sa.String(length=30), nullable=False),
        sa.Column("action_type", sa.String(length=30), nullable=False),
        sa.Column("chapter_index", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("feedback_metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["workflow_run_id"], ["workflow_runs.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["artifact_id"], ["artifacts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "workflow_step_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workflow_run_id", sa.Integer(), nullable=False),
        sa.Column("step_key", sa.String(length=50), nullable=False),
        sa.Column("step_type", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("attempt", sa.Integer(), nullable=False),
        sa.Column("chapter_index", sa.Integer(), nullable=True),
        sa.Column("input_artifact_id", sa.Integer(), nullable=True),
        sa.Column("output_artifact_id", sa.Integer(), nullable=True),
        sa.Column("step_data", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["workflow_run_id"], ["workflow_runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["input_artifact_id"], ["artifacts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["output_artifact_id"], ["artifacts.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("workflow_step_runs")
    op.drop_table("feedback_items")
    op.drop_table("artifacts")
    op.drop_table("workflow_runs")
