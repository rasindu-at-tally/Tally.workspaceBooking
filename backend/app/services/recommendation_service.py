"""Meeting Room Recommendation Service"""
from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.meeting_room import MeetingRoom
from app.models.room_booking import RoomBooking, RoomBookingStatus
from app.models.desk import Desk
from app.schemas.room_booking import MeetingInfo
from app.schemas.meeting_room import RoomRecommendation, MeetingRoomResponse


class RoomRecommendationService:
    """Intelligent meeting room recommendation service"""
    
    # Recommendation settings
    PROXIMITY_WEIGHT = 0.4
    CAPACITY_WEIGHT = 0.3
    AMENITIES_WEIGHT = 0.3
    MAX_RECOMMENDATIONS = 3
    
    def __init__(self, db: Session):
        self.db = db
    
    def recommend_rooms(
        self,
        meeting: MeetingInfo,
        user_desk_id: Optional[str] = None
    ) -> List[RoomRecommendation]:
        """
        Recommend meeting rooms for a given meeting
        
        Args:
            meeting: Meeting information
            user_desk_id: User's current desk booking (for proximity scoring)
        
        Returns:
            List of recommended rooms with scores
        """
        # Get all available meeting rooms
        available_rooms = self._get_available_rooms(meeting.start, meeting.end)
        
        if not available_rooms:
            return []
        
        # Score each room
        scored_rooms = []
        for room in available_rooms:
            score = self._calculate_room_score(
                room,
                meeting,
                user_desk_id
            )
            match_reasons = self._get_match_reasons(room, meeting)
            
            scored_rooms.append(RoomRecommendation(
                room=MeetingRoomResponse.model_validate(room),
                score=score,
                match_reasons=match_reasons
            ))
        
        # Sort by score (descending) and return top recommendations
        scored_rooms.sort(key=lambda x: x.score, reverse=True)
        return scored_rooms[:self.MAX_RECOMMENDATIONS]
    
    def _get_available_rooms(
        self,
        start_time: datetime,
        end_time: datetime
    ) -> List[MeetingRoom]:
        """Get meeting rooms that are available for the time slot"""
        # Find rooms that don't have conflicting bookings
        conflicting_bookings = self.db.query(RoomBooking.room_id).filter(
            and_(
                RoomBooking.status == RoomBookingStatus.ACTIVE,
                or_(
                    # Booking starts during the meeting
                    and_(
                        RoomBooking.start_time <= start_time,
                        RoomBooking.end_time > start_time
                    ),
                    # Booking ends during the meeting
                    and_(
                        RoomBooking.start_time < end_time,
                        RoomBooking.end_time >= end_time
                    ),
                    # Booking is completely within the meeting
                    and_(
                        RoomBooking.start_time >= start_time,
                        RoomBooking.end_time <= end_time
                    )
                )
            )
        ).subquery()
        
        # Get rooms that are active and not in conflicting bookings
        available_rooms = self.db.query(MeetingRoom).filter(
            and_(
                MeetingRoom.is_active == True,
                ~MeetingRoom.id.in_(conflicting_bookings)
            )
        ).order_by(MeetingRoom.capacity).all()
        
        return available_rooms
    
    def _calculate_room_score(
        self,
        room: MeetingRoom,
        meeting: MeetingInfo,
        user_desk_id: Optional[str] = None
    ) -> float:
        """Calculate match score for a room (0-100)"""
        score = 0.0
        
        # 1. Capacity match (30 points max)
        capacity_score = self._score_capacity(room.capacity, meeting.attendee_count)
        score += capacity_score * self.CAPACITY_WEIGHT * 100
        
        # 2. Amenities match (30 points max)
        amenities_score = self._score_amenities(room, meeting)
        score += amenities_score * self.AMENITIES_WEIGHT * 100
        
        # 3. Proximity to user's desk (40 points max)
        if user_desk_id:
            proximity_score = self._score_proximity(room, user_desk_id)
            score += proximity_score * self.PROXIMITY_WEIGHT * 100
        else:
            # If no desk, give average proximity score
            score += 0.5 * self.PROXIMITY_WEIGHT * 100
        
        return round(score, 2)
    
    def _score_capacity(self, room_capacity: int, attendee_count: int) -> float:
        """
        Score room capacity match (0-1)
        Perfect: room capacity is 1.0-1.5x attendee count
        """
        if attendee_count <= 0:
            return 0.5
        
        ratio = room_capacity / attendee_count
        
        if ratio < 1.0:
            # Room too small
            return 0.2
        elif 1.0 <= ratio <= 1.5:
            # Perfect fit
            return 1.0
        elif 1.5 < ratio <= 2.0:
            # Slightly too large but okay
            return 0.8
        elif 2.0 < ratio <= 3.0:
            # Too large
            return 0.5
        else:
            # Way too large
            return 0.3
    
    def _score_amenities(self, room: MeetingRoom, meeting: MeetingInfo) -> float:
        """
        Score amenities match (0-1)
        Considers video conferencing for online meetings, projector for presentations
        """
        score = 0.5  # Base score
        
        # If online meeting, video conferencing is important
        if meeting.is_online:
            if room.has_video_conf:
                score += 0.3
        
        # Projector is generally useful for meetings
        if room.has_projector:
            score += 0.1
        
        # Whiteboard is useful for collaborative sessions
        if room.has_whiteboard:
            score += 0.1
        
        return min(score, 1.0)
    
    def _score_proximity(self, room: MeetingRoom, user_desk_id: str) -> float:
        """
        Score proximity to user's desk (0-1)
        Same floor = 1.0, adjacent floor = 0.7, far floor = 0.4
        """
        # Get user's desk floor
        desk = self.db.query(Desk).filter(Desk.id == user_desk_id).first()
        
        if not desk:
            return 0.5
        
        desk_location = desk.location
        room_floor = room.floor
        
        # If desk location contains floor information, extract it
        # Otherwise, compare directly
        if desk_location == room_floor:
            return 1.0
        
        # Try to extract floor numbers for comparison
        try:
            # Extract floor numbers (e.g., "1st Floor" -> 1, "Floor 2" -> 2)
            desk_floor_num = self._extract_floor_number(desk_location)
            room_floor_num = self._extract_floor_number(room_floor)
            
            if desk_floor_num and room_floor_num:
                floor_diff = abs(desk_floor_num - room_floor_num)
                
                if floor_diff == 0:
                    return 1.0
                elif floor_diff == 1:
                    return 0.7
                elif floor_diff == 2:
                    return 0.5
                else:
                    return 0.3
        except:
            pass
        
        # Default to moderate score if we can't determine proximity
        return 0.5
    
    def _extract_floor_number(self, text: str) -> Optional[int]:
        """Extract floor number from text"""
        import re
        # Try to find numbers in the text
        match = re.search(r'(\d+)', text)
        if match:
            return int(match.group(1))
        return None
    
    def _get_match_reasons(self, room: MeetingRoom, meeting: MeetingInfo) -> List[str]:
        """Get human-readable reasons why this room is a good match"""
        reasons = []
        
        capacity_ratio = room.capacity / max(meeting.attendee_count, 1)
        
        if 1.0 <= capacity_ratio <= 1.5:
            reasons.append(f"Perfect size for {meeting.attendee_count} people")
        elif capacity_ratio > 1.5:
            reasons.append(f"Spacious room (capacity: {room.capacity})")
        
        if meeting.is_online and room.has_video_conf:
            reasons.append("Video conferencing equipment available")
        
        if room.has_projector:
            reasons.append("Projector available for presentations")
        
        if room.has_whiteboard:
            reasons.append("Whiteboard available for collaboration")
        
        if room.has_screen_share:
            reasons.append("Screen sharing capabilities")
        
        return reasons

