"""Initial schema — users, projects, estimations, boq_items

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id',            postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email',         sa.String(255), nullable=False, unique=True),
        sa.Column('name',          sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role',          sa.String(50),  server_default='engineer'),
        sa.Column('is_active',     sa.Boolean(),   server_default='true'),
        sa.Column('created_at',    sa.DateTime(),  server_default=sa.func.now()),
        sa.Column('updated_at',    sa.DateTime(),  server_default=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Projects
    op.create_table(
        'projects',
        sa.Column('id',              postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id',         postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name',            sa.String(500), nullable=False),
        sa.Column('project_type',    sa.String(100), server_default='residential'),
        sa.Column('location',        sa.String(255)),
        sa.Column('city',            sa.String(100)),
        sa.Column('state',           sa.String(100)),
        sa.Column('total_area_sqft', sa.Numeric(12, 2)),
        sa.Column('num_floors',      sa.Integer(),   server_default='1'),
        sa.Column('finish_quality',  sa.String(50),  server_default='standard'),
        sa.Column('description',     sa.Text()),
        sa.Column('blueprint_url',   sa.String(500)),
        sa.Column('status',          sa.String(50),  server_default='draft'),
        sa.Column('created_at',      sa.DateTime(),  server_default=sa.func.now()),
        sa.Column('updated_at',      sa.DateTime(),  server_default=sa.func.now()),
    )
    op.create_index('ix_projects_user_id', 'projects', ['user_id'])

    # Estimations
    op.create_table(
        'estimations',
        sa.Column('id',               postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id',       postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('total_cost',       sa.Numeric(15, 2)),
        sa.Column('cost_per_sqft',    sa.Numeric(10, 2)),
        sa.Column('civil_work_cost',  sa.Numeric(15, 2)),
        sa.Column('finishing_cost',   sa.Numeric(15, 2)),
        sa.Column('electrical_cost',  sa.Numeric(15, 2)),
        sa.Column('plumbing_cost',    sa.Numeric(15, 2)),
        sa.Column('contingency_pct',  sa.Numeric(5, 2),  server_default='5.0'),
        sa.Column('contingency_cost', sa.Numeric(15, 2)),
        sa.Column('ai_confidence',    sa.String(20)),
        sa.Column('ai_notes',         sa.Text()),
        sa.Column('gemini_raw',       sa.Text()),
        sa.Column('version',          sa.Integer(), server_default='1'),
        sa.Column('created_at',       sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_estimations_project_id', 'estimations', ['project_id'])

    # BOQ Items
    op.create_table(
        'boq_items',
        sa.Column('id',             postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('estimation_id',  postgresql.UUID(as_uuid=True), sa.ForeignKey('estimations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category',       sa.String(100), nullable=False),
        sa.Column('item_code',      sa.String(50)),
        sa.Column('description',    sa.String(500), nullable=False),
        sa.Column('unit',           sa.String(50),  nullable=False),
        sa.Column('quantity',       sa.Numeric(12, 3)),
        sa.Column('rate',           sa.Numeric(10, 2)),
        sa.Column('amount',         sa.Numeric(15, 2)),
        sa.Column('is_user_edited', sa.Boolean(),   server_default='false'),
        sa.Column('sort_order',     sa.Integer(),   server_default='0'),
        sa.Column('created_at',     sa.DateTime(),  server_default=sa.func.now()),
    )
    op.create_index('ix_boq_items_estimation_id', 'boq_items', ['estimation_id'])


def downgrade() -> None:
    op.drop_table('boq_items')
    op.drop_table('estimations')
    op.drop_table('projects')
    op.drop_table('users')
