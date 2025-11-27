"""Room Bookings API endpoints"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.room_booking import RoomBookingStatus
from app.schemas.room_booking import (
    RoomBookingCreate,
    RoomBookingUpdate,
    RoomBookingResponse,
    RoomBookingCancel,
    RoomAvailabilityRequest,
    RoomBookingWithDetails
)
from app.services.room_booking_service import RoomBookingService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/room-bookings", tags=["room-bookings"])


@router.post(
    "",
    response_model=RoomBookingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_room_booking(
    booking_data: RoomBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new room booking"""
    try:
        booking = RoomBookingService.create_booking(db, current_user.id, booking_data)
        
        # Log audit
        AuditService.log_action(
            db=db,
            user_id=current_user.id,
            action="CREATE_ROOM_BOOKING",
            entity_type="room_booking",
            entity_id=booking.id,
            metadata={"room_id": str(booking.room_id), "start_time": str(booking.start_time), "end_time": str(booking.end_time)}
        )
        
        return booking
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/my-bookings", response_model=List[RoomBookingResponse])
def get_my_room_bookings(
    status_filter: Optional[RoomBookingStatus] = Query(None),
    start_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's room bookings"""
    bookings = RoomBookingService.get_user_bookings(
        db,
        current_user.id,
        status_filter,
        start_date,
        skip,
        limit
    )
    return bookings


@router.get("", response_model=List[RoomBookingWithDetails])
def get_all_room_bookings(
    status_filter: Optional[RoomBookingStatus] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all room bookings (Admin can see all, users see only their own)"""
    if current_user.role == UserRole.ADMIN:
        bookings = RoomBookingService.get_bookings_with_details(
            db,
            status_filter,
            start_date,
            end_date,
            skip,
            limit
        )
    else:
        # Regular users only see their own bookings
        bookings = RoomBookingService.get_user_bookings(
            db,
            current_user.id,
            status_filter,
            start_date,
            skip,
            limit
        )
    
    return bookings


@router.get("/room/{room_id}", response_model=List[RoomBookingResponse])
def get_room_bookings_by_room(
    room_id: UUID,
    status_filter: Optional[RoomBookingStatus] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get bookings for a specific room"""
    bookings = RoomBookingService.get_room_bookings(
        db,
        room_id,
        status_filter,
        start_date,
        end_date,
        skip,
        limit
    )
    return bookings


@router.get("/{booking_id}", response_model=RoomBookingResponse)
def get_room_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific room booking"""
    booking = RoomBookingService.get_booking(db, booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room booking not found"
        )
    
    # Check if user has permission to view this booking
    if current_user.role != UserRole.ADMIN and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this booking"
        )
    
    return booking


@router.put("/{booking_id}", response_model=RoomBookingResponse)
def update_room_booking(
    booking_id: UUID,
    booking_data: RoomBookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a room booking"""
    booking = RoomBookingService.get_booking(db, booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room booking not found"
        )
    
    # Check if user has permission to update this booking
    if current_user.role != UserRole.ADMIN and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this booking"
        )
    
    try:
        updated_booking = RoomBookingService.update_booking(db, booking_id, booking_data)
        
        # Log audit
        AuditService.log_action(
            db=db,
            user_id=current_user.id,
            action="UPDATE_ROOM_BOOKING",
            entity_type="room_booking",
            entity_id=booking_id,
            metadata={"action": "updated"}
        )
        
        return updated_booking
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{booking_id}/cancel", response_model=RoomBookingResponse)
def cancel_room_booking(
    booking_id: UUID,
    cancel_data: Optional[RoomBookingCancel] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a room booking"""
    booking = RoomBookingService.get_booking(db, booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room booking not found"
        )
    
    # Check if user has permission to cancel this booking
    if current_user.role != UserRole.ADMIN and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to cancel this booking"
        )
    
    cancelled_booking = RoomBookingService.cancel_booking(
        db,
        booking_id,
        current_user.id,
        cancel_data
    )
    
    # Log audit
    AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action="CANCEL_ROOM_BOOKING",
        entity_type="room_booking",
        entity_id=booking_id,
        metadata={"action": "cancelled"}
    )
    
    return cancelled_booking


@router.post("/check-availability", response_model=dict)
def check_room_availability(
    room_id: UUID,
    availability_request: RoomAvailabilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if a room is available for a specific time slot"""
    is_available = RoomBookingService.check_availability(
        db,
        room_id,
        availability_request.start_time,
        availability_request.end_time
    )
    
    return {
        "room_id": str(room_id),
        "start_time": availability_request.start_time,
        "end_time": availability_request.end_time,
        "is_available": is_available
    }

