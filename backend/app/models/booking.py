"""Booking model"""
import enum
from sqlalchemy import Column, String, Date, Enum, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class BookingStatus(str, enum.Enum):
    """Booking status"""
    ACTIVE = "active"
    CANCELLED = "cancelled"


class Booking(Base):
    """Booking model"""
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    desk_id = Column(UUID(as_uuid=True), ForeignKey("desks.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Booking details
    booking_date = Column(Date, nullable=False, index=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.ACTIVE, nullable=False, index=True)
    
    # Cancellation tracking
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    cancellation_reason = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="bookings")
    desk = relationship("Desk", backref="bookings")
    cancelled_by = relationship("User", foreign_keys=[cancelled_by_user_id])
    
    # Constraints
    __table_args__ = (
        # Prevent double booking same desk on same date
        UniqueConstraint('desk_id', 'booking_date', name='uq_desk_date'),
        # Composite index for common queries
        Index('ix_booking_user_date_status', 'user_id', 'booking_date', 'status'),
    )
    
    def __repr__(self):
        return f"<Booking {self.id} for desk {self.desk_id} on {self.booking_date}>"

