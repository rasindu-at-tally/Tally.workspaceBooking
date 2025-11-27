"""Add location field to users table

Revision ID: add_user_location
Revises: rename_floor_to_location
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_user_location'
down_revision = 'rename_floor_to_location'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add location column to users table
    op.add_column('users', sa.Column('location', sa.String(255), nullable=True))
    # Add index for faster queries by location
    op.create_index('ix_users_location', 'users', ['location'])


def downgrade() -> None:
    op.drop_index('ix_users_location', table_name='users')
    op.drop_column('users', 'location')

