"""Booking service with business logic"""
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.booking import Booking, BookingStatus
from app.models.desk import Desk
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreate, BookingCancel
from app.services.audit_service import AuditService


class BookingError:
    """Booking error codes"""
    DESK_ALREADY_BOOKED_FOR_DATE = "DESK_ALREADY_BOOKED_FOR_DATE"
    DESK_INACTIVE = "DESK_INACTIVE"
    USER_ALREADY_HAS_BOOKING = "USER_ALREADY_HAS_BOOKING"
    BOOKING_NOT_FOUND = "BOOKING_NOT_FOUND"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    PAST_DATE_BOOKING = "PAST_DATE_BOOKING"


class BookingService:
    """Booking service"""
    
    @staticmethod
    def create_booking(
        db: Session,
        user: User,
        booking_data: BookingCreate,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Booking:
        """Create a new booking with transactional guarantees"""
        
        # Validate booking date is not in the past
        if booking_data.booking_date < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=BookingError.PAST_DATE_BOOKING,
            )
        
        # Check if desk exists and is active
        desk = db.query(Desk).filter(Desk.id == booking_data.desk_id).first()
        if not desk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Desk not found",
            )
        
        if not desk.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=BookingError.DESK_INACTIVE,
            )
        
        # Check if user already has an active booking on this date
        existing_user_booking = db.query(Booking).filter(
            and_(
                Booking.user_id == user.id,
                Booking.booking_date == booking_data.booking_date,
                Booking.status == BookingStatus.ACTIVE,
            )
        ).first()
        
        if existing_user_booking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=BookingError.USER_ALREADY_HAS_BOOKING,
            )
        
        # Create booking with retry logic for race conditions
        max_retries = 3
        for attempt in range(max_retries):
            try:
                new_booking = Booking(
                    user_id=user.id,
                    desk_id=booking_data.desk_id,
                    booking_date=booking_data.booking_date,
                    status=BookingStatus.ACTIVE,
                )
                
                db.add(new_booking)
                db.flush()  # Flush to trigger unique constraint check
                
                # Create audit log
                AuditService.log_action(
                    db=db,
                    user_id=user.id,
                    action="booking_created",
                    entity_type="booking",
                    entity_id=new_booking.id,
                    metadata={
                        "desk_id": str(booking_data.desk_id),
                        "booking_date": booking_data.booking_date.isoformat(),
                    },
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                
                db.commit()
                db.refresh(new_booking)
                return new_booking
                
            except IntegrityError as e:
                db.rollback()
                if "uq_desk_date" in str(e.orig):
                    if attempt < max_retries - 1:
                        continue  # Retry
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=BookingError.DESK_ALREADY_BOOKED_FOR_DATE,
                    )
                raise
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create booking after retries",
        )
    
    @staticmethod
    def cancel_booking(
        db: Session,
        booking_id: UUID,
        user: User,
        cancel_data: Optional[BookingCancel] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Booking:
        """Cancel a booking"""
        # Get booking
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=BookingError.BOOKING_NOT_FOUND,
            )
        
        # Check if already cancelled
        if booking.status == BookingStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking already cancelled",
            )
        
        # Check permissions: only the booking owner or admin can cancel
        if booking.user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=BookingError.INSUFFICIENT_PERMISSIONS,
            )
        
        # Cancel booking in transaction
        try:
            booking.status = BookingStatus.CANCELLED
            booking.cancelled_at = datetime.utcnow()
            booking.cancelled_by_user_id = user.id
            if cancel_data and cancel_data.cancellation_reason:
                booking.cancellation_reason = cancel_data.cancellation_reason
            
            # Create audit log
            AuditService.log_action(
                db=db,
                user_id=user.id,
                action="booking_cancelled",
                entity_type="booking",
                entity_id=booking.id,
                metadata={
                    "original_user_id": str(booking.user_id),
                    "cancelled_by_admin": user.role == UserRole.ADMIN,
                    "reason": cancel_data.cancellation_reason if cancel_data else None,
                },
                ip_address=ip_address,
                user_agent=user_agent,
            )
            
            db.commit()
            db.refresh(booking)
            return booking
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to cancel booking: {str(e)}",
            )
    
    @staticmethod
    def get_user_bookings(
        db: Session,
        user_id: UUID,
        status: Optional[BookingStatus] = None,
    ) -> List[Booking]:
        """Get all bookings for a user"""
        query = db.query(Booking).filter(Booking.user_id == user_id)
        
        if status:
            query = query.filter(Booking.status == status)
        
        return query.order_by(Booking.booking_date.desc()).all()
    
    @staticmethod
    def get_desk_bookings(
        db: Session,
        desk_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        status: Optional[BookingStatus] = BookingStatus.ACTIVE,
    ) -> List[Booking]:
        """Get all bookings for a desk"""
        query = db.query(Booking).filter(Booking.desk_id == desk_id)
        
        if status:
            query = query.filter(Booking.status == status)
        
        if start_date:
            query = query.filter(Booking.booking_date >= start_date)
        
        if end_date:
            query = query.filter(Booking.booking_date <= end_date)
        
        return query.order_by(Booking.booking_date).all()
    
    @staticmethod
    def get_bookings_by_date(
        db: Session,
        booking_date: date,
        status: Optional[BookingStatus] = BookingStatus.ACTIVE,
    ) -> List[Booking]:
        """Get all bookings for a specific date"""
        query = db.query(Booking).filter(Booking.booking_date == booking_date)
        
        if status:
            query = query.filter(Booking.status == status)
        
        return query.all()
    
    @staticmethod
    def get_booking_by_id(db: Session, booking_id: UUID) -> Optional[Booking]:
        """Get a booking by ID"""
        return db.query(Booking).filter(Booking.id == booking_id).first()



