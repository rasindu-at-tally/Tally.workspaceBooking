"""Meeting Room model"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class MeetingRoom(Base):
    """Meeting Room model"""
    __tablename__ = "meeting_rooms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_name = Column(String(100), nullable=False, unique=True)
    room_number = Column(String(50), nullable=False, unique=True)
    location = Column(String(50), nullable=False, index=True)
    capacity = Column(Integer, nullable=False)
    
    # Amenities
    has_projector = Column(Boolean, default=False, nullable=False)
    has_video_conf = Column(Boolean, default=False, nullable=False)
    has_whiteboard = Column(Boolean, default=False, nullable=False)
    has_screen_share = Column(Boolean, default=False, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Description
    description = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<MeetingRoom {self.room_name} ({self.room_number})>"

