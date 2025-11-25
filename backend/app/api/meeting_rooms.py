"""Meeting Rooms API endpoints"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.schemas.meeting_room import (
    MeetingRoomCreate,
    MeetingRoomUpdate,
    MeetingRoomResponse,
    MeetingRoomFilter
)
from app.services.meeting_room_service import MeetingRoomService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/meeting-rooms", tags=["meeting-rooms"])


@router.post(
    "",
    response_model=MeetingRoomResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)]
)
def create_meeting_room(
    room_data: MeetingRoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new meeting room (Admin only)"""
    try:
        room = MeetingRoomService.create_meeting_room(db, room_data)
        
        # Log audit
        AuditService.log_action(
            db=db,
            user_id=current_user.id,
            action="CREATE_MEETING_ROOM",
            entity_type="meeting_room",
            entity_id=str(room.id),
            details=f"Created meeting room: {room.room_name}"
        )
        
        return room
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[MeetingRoomResponse])
def get_meeting_rooms(
    floor: Optional[str] = Query(None),
    min_capacity: Optional[int] = Query(None, ge=1),
    has_projector: Optional[bool] = Query(None),
    has_video_conf: Optional[bool] = Query(None),
    has_whiteboard: Optional[bool] = Query(None),
    has_screen_share: Optional[bool] = Query(None),
    is_active: Optional[bool] = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all meeting rooms with optional filters"""
    filters = MeetingRoomFilter(
        floor=floor,
        min_capacity=min_capacity,
        has_projector=has_projector,
        has_video_conf=has_video_conf,
        has_whiteboard=has_whiteboard,
        has_screen_share=has_screen_share,
        is_active=is_active
    )
    
    rooms = MeetingRoomService.get_meeting_rooms(db, filters, skip, limit)
    return rooms


@router.get("/floors", response_model=List[str])
def get_floors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of unique floors"""
    floors = MeetingRoomService.get_floors(db)
    return floors


@router.get("/{room_id}", response_model=MeetingRoomResponse)
def get_meeting_room(
    room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific meeting room"""
    room = MeetingRoomService.get_meeting_room(db, room_id)
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting room not found"
        )
    
    return room


@router.put(
    "/{room_id}",
    response_model=MeetingRoomResponse,
    dependencies=[Depends(require_admin)]
)
def update_meeting_room(
    room_id: UUID,
    room_data: MeetingRoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a meeting room (Admin only)"""
    room = MeetingRoomService.update_meeting_room(db, room_id, room_data)
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting room not found"
        )
    
    # Log audit
    AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action="UPDATE_MEETING_ROOM",
        entity_type="meeting_room",
        entity_id=str(room.id),
        details=f"Updated meeting room: {room.room_name}"
    )
    
    return room


@router.delete(
    "/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)]
)
def delete_meeting_room(
    room_id: UUID,
    soft_delete: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete or deactivate a meeting room (Admin only)"""
    success = MeetingRoomService.delete_meeting_room(db, room_id, soft_delete)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting room not found"
        )
    
    # Log audit
    action = "DEACTIVATE_MEETING_ROOM" if soft_delete else "DELETE_MEETING_ROOM"
    AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action=action,
        entity_type="meeting_room",
        entity_id=str(room_id),
        details=f"{'Deactivated' if soft_delete else 'Deleted'} meeting room"
    )


@router.post(
    "/{room_id}/activate",
    response_model=MeetingRoomResponse,
    dependencies=[Depends(require_admin)]
)
def activate_meeting_room(
    room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate a meeting room (Admin only)"""
    room = MeetingRoomService.activate_meeting_room(db, room_id)
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting room not found"
        )
    
    # Log audit
    AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action="ACTIVATE_MEETING_ROOM",
        entity_type="meeting_room",
        entity_id=str(room.id),
        details=f"Activated meeting room: {room.room_name}"
    )
    
    return room

