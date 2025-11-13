"""Booking schemas"""
from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.booking import BookingStatus
from app.schemas.user import UserResponse
from app.schemas.desk import DeskResponse


class BookingBase(BaseModel):
    """Base booking schema"""
    desk_id: UUID
    booking_date: date


class BookingCreate(BookingBase):
    """Schema for creating a booking"""
    pass


class BookingCancel(BaseModel):
    """Schema for cancelling a booking"""
    cancellation_reason: Optional[str] = Field(None, max_length=500)


class BookingResponse(BookingBase):
    """Schema for booking response"""
    id: UUID
    user_id: UUID
    status: BookingStatus
    cancelled_at: Optional[datetime] = None
    cancelled_by_user_id: Optional[UUID] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BookingDetailResponse(BookingResponse):
    """Schema for detailed booking response with relationships"""
    user: UserResponse
    desk: DeskResponse
    cancelled_by: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True



