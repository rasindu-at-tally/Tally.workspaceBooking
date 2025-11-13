"""Desk schemas"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class DeskBase(BaseModel):
    """Base desk schema"""
    name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=255)
    position_x: int = Field(..., ge=0)
    position_y: int = Field(..., ge=0)
    desk_type: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)


class DeskCreate(DeskBase):
    """Schema for creating a desk"""
    is_active: bool = True


class DeskUpdate(BaseModel):
    """Schema for updating a desk"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    position_x: Optional[int] = Field(None, ge=0)
    position_y: Optional[int] = Field(None, ge=0)
    desk_type: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class DeskResponse(DeskBase):
    """Schema for desk response"""
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True



