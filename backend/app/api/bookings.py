"""Booking routes"""
from datetime import date
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.schemas.booking import (
    BookingCreate,
    BookingCancel,
    BookingResponse,
    BookingDetailResponse,
)
from app.models.booking import BookingStatus
from app.services.booking_service import BookingService
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingDetailResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new booking"""
    booking = BookingService.create_booking(
        db,
        current_user,
        booking_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.refresh(booking)
    return BookingDetailResponse.model_validate(booking)


@router.get("/my-bookings", response_model=List[BookingDetailResponse])
def get_my_bookings(
    status: Optional[BookingStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's bookings"""
    bookings = BookingService.get_user_bookings(db, current_user.id, status=status)
    return [BookingDetailResponse.model_validate(booking) for booking in bookings]


@router.get("/by-date", response_model=List[BookingDetailResponse])
def get_bookings_by_date(
    booking_date: date = Query(..., description="Booking date in YYYY-MM-DD format"),
    status: Optional[BookingStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all bookings for a specific date"""
    bookings = BookingService.get_bookings_by_date(db, booking_date, status=status)
    return [BookingDetailResponse.model_validate(booking) for booking in bookings]


@router.get("/desk/{desk_id}", response_model=List[BookingDetailResponse])
def get_desk_bookings(
    desk_id: UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[BookingStatus] = BookingStatus.ACTIVE,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all bookings for a specific desk"""
    bookings = BookingService.get_desk_bookings(
        db,
        desk_id,
        start_date=start_date,
        end_date=end_date,
        status=status,
    )
    return [BookingDetailResponse.model_validate(booking) for booking in bookings]


@router.get("/{booking_id}", response_model=BookingDetailResponse)
def get_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific booking by ID"""
    booking = BookingService.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    return BookingDetailResponse.model_validate(booking)


@router.post("/{booking_id}/cancel", response_model=BookingDetailResponse)
def cancel_booking(
    booking_id: UUID,
    cancel_data: Optional[BookingCancel] = None,
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel a booking"""
    booking = BookingService.cancel_booking(
        db,
        booking_id,
        current_user,
        cancel_data=cancel_data,
        ip_address=request.client.host if request and request.client else None,
        user_agent=request.headers.get("user-agent") if request else None,
    )
    db.refresh(booking)
    return BookingDetailResponse.model_validate(booking)


# Admin endpoints
@router.get("", response_model=List[BookingDetailResponse])
def get_all_bookings(
    user_id: Optional[UUID] = None,
    desk_id: Optional[UUID] = None,
    booking_date: Optional[date] = None,
    status: Optional[BookingStatus] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get all bookings with filters (admin only)"""
    from app.models.booking import Booking
    
    query = db.query(Booking)
    
    if user_id:
        query = query.filter(Booking.user_id == user_id)
    
    if desk_id:
        query = query.filter(Booking.desk_id == desk_id)
    
    if booking_date:
        query = query.filter(Booking.booking_date == booking_date)
    
    if status:
        query = query.filter(Booking.status == status)
    
    bookings = query.order_by(Booking.created_at.desc()).limit(limit).offset(offset).all()
    return [BookingDetailResponse.model_validate(booking) for booking in bookings]

