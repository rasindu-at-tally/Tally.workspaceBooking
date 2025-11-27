"""rename floor to location in meeting_rooms

Revision ID: rename_floor_to_location
Revises: add_meeting_rooms
Create Date: 2024-11-26 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'rename_floor_to_location'
down_revision = 'add_meeting_rooms'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename the 'floor' column to 'location' in meeting_rooms table
    op.alter_column('meeting_rooms', 'floor', new_column_name='location')
    
    # Drop the old index and create a new one with the correct name
    op.drop_index('ix_meeting_rooms_floor', table_name='meeting_rooms')
    op.create_index('ix_meeting_rooms_location', 'meeting_rooms', ['location'])


def downgrade() -> None:
    # Rename the 'location' column back to 'floor'
    op.alter_column('meeting_rooms', 'location', new_column_name='floor')
    
    # Drop the new index and recreate the old one
    op.drop_index('ix_meeting_rooms_location', table_name='meeting_rooms')
    op.create_index('ix_meeting_rooms_floor', 'meeting_rooms', ['floor'])

