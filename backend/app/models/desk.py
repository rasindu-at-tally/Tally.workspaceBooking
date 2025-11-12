"""Desk model"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class Desk(Base):
    """Desk model"""
    __tablename__ = "desks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False, index=True)
    
    # Position in the floor map (for UI rendering)
    position_x = Column(Integer, nullable=False)
    position_y = Column(Integer, nullable=False)
    desk_type = Column(String(50), nullable=False)  # e.g., "6-seater", "4-seater"
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Metadata
    description = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Desk {self.name} at {self.location}>"

