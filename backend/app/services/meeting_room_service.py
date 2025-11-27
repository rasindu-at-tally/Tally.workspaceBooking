"""Meeting Room Service"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.meeting_room import MeetingRoom
from app.schemas.meeting_room import (
    MeetingRoomCreate,
    MeetingRoomUpdate,
    MeetingRoomFilter
)


class MeetingRoomService:
    """Service for meeting room operations"""
    
    @staticmethod
    def create_meeting_room(
        db: Session,
        room_data: MeetingRoomCreate
    ) -> MeetingRoom:
        """Create a new meeting room"""
        room = MeetingRoom(**room_data.model_dump())
        db.add(room)
        db.commit()
        db.refresh(room)
        return room
    
    @staticmethod
    def get_meeting_room(db: Session, room_id: UUID) -> Optional[MeetingRoom]:
        """Get a meeting room by ID"""
        return db.query(MeetingRoom).filter(MeetingRoom.id == room_id).first()
    
    @staticmethod
    def get_meeting_rooms(
        db: Session,
        filters: Optional[MeetingRoomFilter] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[MeetingRoom]:
        """Get meeting rooms with optional filters"""
        query = db.query(MeetingRoom)
        
        if filters:
            if filters.location is not None:
                query = query.filter(MeetingRoom.location == filters.location)
            
            if filters.min_capacity is not None:
                query = query.filter(MeetingRoom.capacity >= filters.min_capacity)
            
            if filters.has_projector is not None:
                query = query.filter(MeetingRoom.has_projector == filters.has_projector)
            
            if filters.has_video_conf is not None:
                query = query.filter(MeetingRoom.has_video_conf == filters.has_video_conf)
            
            if filters.has_whiteboard is not None:
                query = query.filter(MeetingRoom.has_whiteboard == filters.has_whiteboard)
            
            if filters.has_screen_share is not None:
                query = query.filter(MeetingRoom.has_screen_share == filters.has_screen_share)
            
            if filters.is_active is not None:
                query = query.filter(MeetingRoom.is_active == filters.is_active)
        
        return query.order_by(MeetingRoom.location, MeetingRoom.room_name).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_meeting_room(
        db: Session,
        room_id: UUID,
        room_data: MeetingRoomUpdate
    ) -> Optional[MeetingRoom]:
        """Update a meeting room"""
        room = db.query(MeetingRoom).filter(MeetingRoom.id == room_id).first()
        
        if not room:
            return None
        
        update_data = room_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(room, key, value)
        
        db.commit()
        db.refresh(room)
        return room
    
    @staticmethod
    def delete_meeting_room(
        db: Session,
        room_id: UUID,
        soft_delete: bool = True
    ) -> bool:
        """Delete or deactivate a meeting room"""
        room = db.query(MeetingRoom).filter(MeetingRoom.id == room_id).first()
        
        if not room:
            return False
        
        if soft_delete:
            room.is_active = False
            db.commit()
        else:
            db.delete(room)
            db.commit()
        
        return True
    
    @staticmethod
    def activate_meeting_room(db: Session, room_id: UUID) -> Optional[MeetingRoom]:
        """Activate a meeting room"""
        room = db.query(MeetingRoom).filter(MeetingRoom.id == room_id).first()
        
        if not room:
            return None
        
        room.is_active = True
        db.commit()
        db.refresh(room)
        return room
    
    @staticmethod
    def get_locations(db: Session) -> List[str]:
        """Get list of unique locations"""
        locations = db.query(MeetingRoom.location).distinct().order_by(MeetingRoom.location).all()
        return [location[0] for location in locations]
    
    @staticmethod
    def get_room_count(db: Session, is_active: Optional[bool] = None) -> int:
        """Get count of meeting rooms"""
        query = db.query(MeetingRoom)
        
        if is_active is not None:
            query = query.filter(MeetingRoom.is_active == is_active)
        
        return query.count()

