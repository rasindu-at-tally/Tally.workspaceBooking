"""Room Booking schemas"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from uuid import UUID

from app.models.room_booking import RoomBookingStatus


class RoomBookingBase(BaseModel):
    """Base room booking schema"""
    room_id: UUID
    start_time: datetime
    end_time: datetime
    meeting_subject: Optional[str] = Field(None, max_length=255)
    attendee_count: Optional[int] = Field(None, ge=1, le=100)
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class RoomBookingCreate(RoomBookingBase):
    """Schema for creating a room booking"""
    pass


class RoomBookingUpdate(BaseModel):
    """Schema for updating a room booking"""
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    meeting_subject: Optional[str] = Field(None, max_length=255)
    attendee_count: Optional[int] = Field(None, ge=1, le=100)
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        if v and 'start_time' in info.data and info.data['start_time'] and v <= info.data['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class RoomBookingResponse(BaseModel):
    """Schema for room booking response"""
    id: UUID
    room_id: UUID
    user_id: UUID
    start_time: datetime
    end_time: datetime
    meeting_subject: Optional[str]
    attendee_count: Optional[int]
    status: RoomBookingStatus
    cancelled_at: Optional[datetime]
    cancelled_by_user_id: Optional[UUID]
    cancellation_reason: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class RoomBookingWithDetails(RoomBookingResponse):
    """Schema for room booking with room and user details"""
    room_name: Optional[str] = None
    room_number: Optional[str] = None
    floor: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None


class RoomBookingCancel(BaseModel):
    """Schema for cancelling a room booking"""
    cancellation_reason: Optional[str] = Field(None, max_length=500)


class RoomAvailabilityRequest(BaseModel):
    """Schema for checking room availability"""
    start_time: datetime
    end_time: datetime
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class MeetingInfo(BaseModel):
    """Schema for meeting information (from calendar)"""
    subject: str
    start: datetime
    end: datetime
    duration: int  # minutes
    attendee_count: int
    is_online: bool
    location: Optional[str] = None
    online_meeting_url: Optional[str] = None

