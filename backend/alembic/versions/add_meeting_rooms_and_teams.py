"""add meeting rooms and ms teams tables

Revision ID: add_meeting_rooms
Revises: 6bcd08b685f1
Create Date: 2024-11-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_meeting_rooms'
down_revision = '6bcd08b685f1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create meeting_rooms table
    op.create_table(
        'meeting_rooms',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('room_name', sa.String(length=100), nullable=False),
        sa.Column('room_number', sa.String(length=50), nullable=False),
        sa.Column('floor', sa.String(length=50), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('has_projector', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_video_conf', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_whiteboard', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_screen_share', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('room_name'),
        sa.UniqueConstraint('room_number')
    )
    op.create_index('ix_meeting_rooms_floor', 'meeting_rooms', ['floor'])
    op.create_index('ix_meeting_rooms_is_active', 'meeting_rooms', ['is_active'])

    # Create room_bookings table
    op.create_table(
        'room_bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('room_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('meeting_subject', sa.String(length=255), nullable=True),
        sa.Column('attendee_count', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'CANCELLED', name='roombookingstatus'), nullable=False, server_default='ACTIVE'),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cancelled_by_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('cancellation_reason', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['room_id'], ['meeting_rooms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['cancelled_by_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_room_bookings_room_id', 'room_bookings', ['room_id'])
    op.create_index('ix_room_bookings_user_id', 'room_bookings', ['user_id'])
    op.create_index('ix_room_bookings_start_time', 'room_bookings', ['start_time'])
    op.create_index('ix_room_bookings_status', 'room_bookings', ['status'])
    op.create_index('ix_room_booking_time_status', 'room_bookings', ['room_id', 'start_time', 'end_time', 'status'])
    op.create_index('ix_room_booking_user_time', 'room_bookings', ['user_id', 'start_time', 'status'])

    # Create ms_teams_tokens table
    op.create_table(
        'ms_teams_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('access_token', sa.String(), nullable=True),
        sa.Column('refresh_token', sa.String(), nullable=True),
        sa.Column('token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('ix_ms_teams_tokens_user_id', 'ms_teams_tokens', ['user_id'], unique=True)


def downgrade() -> None:
    # Drop ms_teams_tokens table
    op.drop_index('ix_ms_teams_tokens_user_id', table_name='ms_teams_tokens')
    op.drop_table('ms_teams_tokens')

    # Drop room_bookings table
    op.drop_index('ix_room_booking_user_time', table_name='room_bookings')
    op.drop_index('ix_room_booking_time_status', table_name='room_bookings')
    op.drop_index('ix_room_bookings_status', table_name='room_bookings')
    op.drop_index('ix_room_bookings_start_time', table_name='room_bookings')
    op.drop_index('ix_room_bookings_user_id', table_name='room_bookings')
    op.drop_index('ix_room_bookings_room_id', table_name='room_bookings')
    op.drop_table('room_bookings')
    op.execute('DROP TYPE roombookingstatus')

    # Drop meeting_rooms table
    op.drop_index('ix_meeting_rooms_is_active', table_name='meeting_rooms')
    op.drop_index('ix_meeting_rooms_floor', table_name='meeting_rooms')
    op.drop_table('meeting_rooms')

