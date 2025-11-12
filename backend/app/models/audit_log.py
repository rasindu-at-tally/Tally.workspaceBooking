"""Audit log model"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class AuditLog(Base):
    """Audit log for tracking important actions"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Who performed the action
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # What action was performed
    action = Column(String(100), nullable=False, index=True)  # e.g., "booking_created", "booking_cancelled", "desk_deactivated"
    entity_type = Column(String(50), nullable=False)  # e.g., "booking", "desk", "user"
    entity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Additional context
    meta_data = Column("metadata", JSON, nullable=True)  # Store additional details as JSON
    ip_address = Column(String(45), nullable=True)  # Support IPv4 and IPv6
    user_agent = Column(String(500), nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    user = relationship("User", backref="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog {self.action} on {self.entity_type} {self.entity_id}>"

