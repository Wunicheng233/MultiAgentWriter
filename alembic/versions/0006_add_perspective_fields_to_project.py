"""add perspective fields to project

Revision ID: 0006
Revises: 0005
Create Date: 2026-04-24 22:56:08.934356

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0006'
down_revision: Union[str, Sequence[str], None] = '0005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add the four new perspective fields to projects table
    op.add_column('projects', sa.Column('writer_perspective', sa.String(length=100), nullable=True))
    op.add_column('projects', sa.Column('use_perspective_critic', sa.Boolean(), nullable=False, server_default=sa.text('true')))
    op.add_column('projects', sa.Column('perspective_strength', sa.Float(), nullable=False, server_default=sa.text('0.7')))
    op.add_column('projects', sa.Column('perspective_mix', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('projects', 'writer_perspective')
    op.drop_column('projects', 'use_perspective_critic')
    op.drop_column('projects', 'perspective_strength')
    op.drop_column('projects', 'perspective_mix')
