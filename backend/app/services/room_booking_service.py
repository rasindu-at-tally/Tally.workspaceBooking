"""Room Booking Service"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.room_booking import RoomBooking, RoomBookingStatus
from app.models.meeting_room import MeetingRoom
from app.models.user import User
from app.schemas.room_booking import (
    RoomBookingCreate,
    RoomBookingUpdate,
    RoomBookingCancel
)


class RoomBookingService:
    """Service for room booking operations"""
    
    @staticmethod
    def create_booking(
        db: Session,
        user_id: UUID,
        booking_data: RoomBookingCreate
    ) -> RoomBooking:
        """Create a new room booking"""
        # Check if room is available
        is_available = RoomBookingService.check_availability(
            db,
            booking_data.room_id,
            booking_data.start_time,
            booking_data.end_time
        )
        
        if not is_available:
            raise ValueError("Room is not available for the selected time slot")
        
        # Create booking
        booking = RoomBooking(
            user_id=user_id,
            **booking_data.model_dump()
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def check_availability(
        db: Session,
        room_id: UUID,
        start_time: datetime,
        end_time: datetime,
        exclude_booking_id: Optional[UUID] = None
    ) -> bool:
        """Check if a room is available for a time slot"""
        query = db.query(RoomBooking).filter(
            and_(
                RoomBooking.room_id == room_id,
                RoomBooking.status == RoomBookingStatus.ACTIVE,
                or_(
                    # Booking starts during the requested time
                    and_(
                        RoomBooking.start_time <= start_time,
                        RoomBooking.end_time > start_time
                    ),
                    # Booking ends during the requested time
                    and_(
                        RoomBooking.start_time < end_time,
                        RoomBooking.end_time >= end_time
                    ),
                    # Booking is completely within the requested time
                    and_(
                        RoomBooking.start_time >= start_time,
                        RoomBooking.end_time <= end_time
                    )
                )
            )
        )
        
        if exclude_booking_id:
            query = query.filter(RoomBooking.id != exclude_booking_id)
        
        conflicting_booking = query.first()
        return conflicting_booking is None
    
    @staticmethod
    def get_booking(db: Session, booking_id: UUID) -> Optional[RoomBooking]:
        """Get a room booking by ID"""
        return db.query(RoomBooking).filter(RoomBooking.id == booking_id).first()
    
    @staticmethod
    def get_user_bookings(
        db: Session,
        user_id: UUID,
        status: Optional[RoomBookingStatus] = None,
        start_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[RoomBooking]:
        """Get bookings for a specific user"""
        query = db.query(RoomBooking).filter(RoomBooking.user_id == user_id)
        
        if status:
            query = query.filter(RoomBooking.status == status)
        
        if start_date:
            query = query.filter(RoomBooking.start_time >= start_date)
        
        return query.order_by(RoomBooking.start_time.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_room_bookings(
        db: Session,
        room_id: UUID,
        status: Optional[RoomBookingStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[RoomBooking]:
        """Get bookings for a specific room"""
        query = db.query(RoomBooking).filter(RoomBooking.room_id == room_id)
        
        if status:
            query = query.filter(RoomBooking.status == status)
        
        if start_date:
            query = query.filter(RoomBooking.end_time >= start_date)
        
        if end_date:
            query = query.filter(RoomBooking.start_time <= end_date)
        
        return query.order_by(RoomBooking.start_time).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_all_bookings(
        db: Session,
        status: Optional[RoomBookingStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[RoomBooking]:
        """Get all room bookings (admin)"""
        query = db.query(RoomBooking)
        
        if status:
            query = query.filter(RoomBooking.status == status)
        
        if start_date:
            query = query.filter(RoomBooking.end_time >= start_date)
        
        if end_date:
            query = query.filter(RoomBooking.start_time <= end_date)
        
        return query.order_by(RoomBooking.start_time.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_booking(
        db: Session,
        booking_id: UUID,
        booking_data: RoomBookingUpdate
    ) -> Optional[RoomBooking]:
        """Update a room booking"""
        booking = db.query(RoomBooking).filter(RoomBooking.id == booking_id).first()
        
        if not booking:
            return None
        
        # If updating time, check availability
        update_data = booking_data.model_dump(exclude_unset=True)
        if 'start_time' in update_data or 'end_time' in update_data:
            new_start = update_data.get('start_time', booking.start_time)
            new_end = update_data.get('end_time', booking.end_time)
            
            is_available = RoomBookingService.check_availability(
                db,
                booking.room_id,
                new_start,
                new_end,
                exclude_booking_id=booking_id
            )
            
            if not is_available:
                raise ValueError("Room is not available for the new time slot")
        
        for key, value in update_data.items():
            setattr(booking, key, value)
        
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def cancel_booking(
        db: Session,
        booking_id: UUID,
        cancelled_by_user_id: UUID,
        cancel_data: Optional[RoomBookingCancel] = None
    ) -> Optional[RoomBooking]:
        """Cancel a room booking"""
        booking = db.query(RoomBooking).filter(RoomBooking.id == booking_id).first()
        
        if not booking:
            return None
        
        booking.status = RoomBookingStatus.CANCELLED
        booking.cancelled_at = datetime.utcnow()
        booking.cancelled_by_user_id = cancelled_by_user_id
        
        if cancel_data and cancel_data.cancellation_reason:
            booking.cancellation_reason = cancel_data.cancellation_reason
        
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def get_booking_count(
        db: Session,
        user_id: Optional[UUID] = None,
        status: Optional[RoomBookingStatus] = None
    ) -> int:
        """Get count of room bookings"""
        query = db.query(RoomBooking)
        
        if user_id:
            query = query.filter(RoomBooking.user_id == user_id)
        
        if status:
            query = query.filter(RoomBooking.status == status)
        
        return query.count()
    
    @staticmethod
    def get_bookings_with_details(
        db: Session,
        status: Optional[RoomBookingStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[dict]:
        """Get room bookings with room and user details"""
        query = db.query(
            RoomBooking,
            MeetingRoom.room_name,
            MeetingRoom.room_number,
            MeetingRoom.floor,
            User.full_name,
            User.email
        ).join(
            MeetingRoom, RoomBooking.room_id == MeetingRoom.id
        ).join(
            User, RoomBooking.user_id == User.id
        )
        
        if status:
            query = query.filter(RoomBooking.status == status)
        
        if start_date:
            query = query.filter(RoomBooking.end_time >= start_date)
        
        if end_date:
            query = query.filter(RoomBooking.start_time <= end_date)
        
        results = query.order_by(RoomBooking.start_time.desc()).offset(skip).limit(limit).all()
        
        # Convert to dict with details
        bookings_with_details = []
        for booking, room_name, room_number, floor, user_name, user_email in results:
            booking_dict = {
                **booking.__dict__,
                'room_name': room_name,
                'room_number': room_number,
                'floor': floor,
                'user_name': user_name,
                'user_email': user_email
            }
            # Remove SQLAlchemy internal state
            booking_dict.pop('_sa_instance_state', None)
            bookings_with_details.append(booking_dict)
        
        return bookings_with_details

