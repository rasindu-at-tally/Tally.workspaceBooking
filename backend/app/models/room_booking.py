"""Room Booking model"""
import enum
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class RoomBookingStatus(str, enum.Enum):
    """Room booking status"""
    ACTIVE = "active"
    CANCELLED = "cancelled"


class RoomBooking(Base):
    """Room Booking model"""
    __tablename__ = "room_bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign keys
    room_id = Column(UUID(as_uuid=True), ForeignKey("meeting_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Booking details
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    meeting_subject = Column(String(255), nullable=True)
    attendee_count = Column(Integer, nullable=True)
    status = Column(Enum(RoomBookingStatus), default=RoomBookingStatus.ACTIVE, nullable=False, index=True)
    
    # Cancellation tracking
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    cancellation_reason = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    room = relationship("MeetingRoom", backref="bookings")
    user = relationship("User", foreign_keys=[user_id], backref="room_bookings")
    cancelled_by = relationship("User", foreign_keys=[cancelled_by_user_id])
    
    # Composite indexes for common queries
    __table_args__ = (
        Index('ix_room_booking_time_status', 'room_id', 'start_time', 'end_time', 'status'),
        Index('ix_room_booking_user_time', 'user_id', 'start_time', 'status'),
    )
    
    def __repr__(self):
        return f"<RoomBooking {self.id} for room {self.room_id} at {self.start_time}>"

