"""Audit log schemas"""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel

from app.schemas.user import UserResponse


class AuditLogResponse(BaseModel):
    """Schema for audit log response"""
    id: UUID
    user_id: Optional[UUID]
    action: str
    entity_type: str
    entity_id: UUID
    meta_data: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuditLogDetailResponse(AuditLogResponse):
    """Schema for detailed audit log response"""
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

