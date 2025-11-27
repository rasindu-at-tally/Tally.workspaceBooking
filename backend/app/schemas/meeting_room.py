"""Meeting Room schemas"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class MeetingRoomBase(BaseModel):
    """Base meeting room schema"""
    room_name: str = Field(..., min_length=1, max_length=100)
    room_number: str = Field(..., min_length=1, max_length=50)
    location: str = Field(..., min_length=1, max_length=50)
    capacity: int = Field(..., gt=0, le=100)
    has_projector: bool = False
    has_video_conf: bool = False
    has_whiteboard: bool = False
    has_screen_share: bool = False
    description: Optional[str] = Field(None, max_length=500)


class MeetingRoomCreate(MeetingRoomBase):
    """Schema for creating a meeting room"""
    pass


class MeetingRoomUpdate(BaseModel):
    """Schema for updating a meeting room"""
    room_name: Optional[str] = Field(None, min_length=1, max_length=100)
    room_number: Optional[str] = Field(None, min_length=1, max_length=50)
    location: Optional[str] = Field(None, min_length=1, max_length=50)
    capacity: Optional[int] = Field(None, gt=0, le=100)
    has_projector: Optional[bool] = None
    has_video_conf: Optional[bool] = None
    has_whiteboard: Optional[bool] = None
    has_screen_share: Optional[bool] = None
    is_active: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=500)


class MeetingRoomResponse(MeetingRoomBase):
    """Schema for meeting room response"""
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class MeetingRoomFilter(BaseModel):
    """Schema for filtering meeting rooms"""
    location: Optional[str] = None
    min_capacity: Optional[int] = Field(None, ge=1)
    has_projector: Optional[bool] = None
    has_video_conf: Optional[bool] = None
    has_whiteboard: Optional[bool] = None
    has_screen_share: Optional[bool] = None
    is_active: Optional[bool] = True


class RoomRecommendation(BaseModel):
    """Schema for room recommendation"""
    room: MeetingRoomResponse
    score: float = Field(..., ge=0, le=100)
    match_reasons: list[str]
    
    model_config = ConfigDict(from_attributes=True)

