"""MS Teams Integration API endpoints"""
from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import get_settings
from app.models.user import User
from app.models.ms_teams_token import MSTeamsToken
from app.schemas.room_booking import MeetingInfo
from app.schemas.meeting_room import RoomRecommendation
from app.services.ms_graph_service import MSGraphService, get_mock_meetings
from app.services.recommendation_service import RoomRecommendationService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/teams", tags=["ms-teams"])
settings = get_settings()


@router.get("/connect")
def connect_teams(
    current_user: User = Depends(get_current_user)
):
    """Initiate MS Teams connection"""
    ms_graph = MSGraphService()
    
    # Check if MS credentials are configured
    if not ms_graph.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Microsoft Teams integration is not configured. Demo mode is available."
        )
    
    auth_url = ms_graph.get_auth_url()
    return {"auth_url": auth_url}


@router.get("/callback")
def teams_callback(
    code: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Handle MS Teams OAuth callback"""
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code not provided"
        )
    
    ms_graph = MSGraphService()
    result = ms_graph.get_token_from_code(code)
    
    if 'access_token' not in result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to authenticate with Microsoft Teams"
        )
    
    # Store tokens in database
    expires_at = datetime.utcnow() + timedelta(seconds=result.get('expires_in', 3600))
    
    # Check if token already exists
    existing_token = db.query(MSTeamsToken).filter(
        MSTeamsToken.user_id == current_user.id
    ).first()
    
    if existing_token:
        # Update existing token
        existing_token.access_token = result['access_token']
        existing_token.refresh_token = result.get('refresh_token', '')
        existing_token.token_expires_at = expires_at
        existing_token.updated_at = datetime.utcnow()
    else:
        # Create new token
        new_token = MSTeamsToken(
            user_id=current_user.id,
            access_token=result['access_token'],
            refresh_token=result.get('refresh_token', ''),
            token_expires_at=expires_at
        )
        db.add(new_token)
    
    db.commit()
    
    # Log audit
    AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action="CONNECT_MS_TEAMS",
        entity_type="ms_teams_token",
        entity_id=str(current_user.id),
        details="Connected Microsoft Teams account"
    )
    
    # Redirect to frontend success page
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    return RedirectResponse(url=f"{frontend_url}/dashboard?teams_connected=true")


@router.get("/status")
def get_teams_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if user has connected MS Teams"""
    token = db.query(MSTeamsToken).filter(
        MSTeamsToken.user_id == current_user.id
    ).first()
    
    if not token:
        return {
            "connected": False,
            "demo_mode": True
        }
    
    # Check if token is expired
    is_expired = token.token_expires_at and token.token_expires_at < datetime.utcnow()
    
    return {
        "connected": True,
        "expires_at": token.token_expires_at,
        "is_expired": is_expired,
        "demo_mode": False
    }


@router.delete("/disconnect")
def disconnect_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Disconnect MS Teams"""
    token = db.query(MSTeamsToken).filter(
        MSTeamsToken.user_id == current_user.id
    ).first()
    
    if token:
        db.delete(token)
        db.commit()
        
        # Log audit
        AuditService.log_action(
            db=db,
            user_id=current_user.id,
            action="DISCONNECT_MS_TEAMS",
            entity_type="ms_teams_token",
            entity_id=str(current_user.id),
            details="Disconnected Microsoft Teams account"
        )
    
    return {"message": "Disconnected successfully"}


@router.get("/meetings/today", response_model=List[MeetingInfo])
def get_todays_meetings(
    use_demo: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get today's meetings from calendar"""
    ms_graph = MSGraphService()
    
    # Check if using demo mode or real MS Graph
    if use_demo or not ms_graph.is_configured():
        # Use mock data for demo
        meetings = get_mock_meetings()
        return [MeetingInfo(**meeting) for meeting in meetings]
    
    # Get real calendar data from MS Graph
    token = db.query(MSTeamsToken).filter(
        MSTeamsToken.user_id == current_user.id
    ).first()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please connect to Microsoft Teams first"
        )
    
    # Check if token is expired
    if token.token_expires_at and token.token_expires_at < datetime.utcnow():
        # Try to refresh token
        if token.refresh_token:
            result = ms_graph.refresh_token(token.refresh_token)
            if 'access_token' in result:
                token.access_token = result['access_token']
                token.token_expires_at = datetime.utcnow() + timedelta(seconds=result.get('expires_in', 3600))
                db.commit()
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired. Please reconnect to Microsoft Teams"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired. Please reconnect to Microsoft Teams"
            )
    
    meetings = ms_graph.get_todays_meetings(token.access_token)
    return [MeetingInfo(**meeting) for meeting in meetings]


@router.get("/meetings/recommendations", response_model=List[dict])
def get_meeting_recommendations(
    use_demo: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get room recommendations for today's meetings"""
    ms_graph = MSGraphService()
    
    # Get today's meetings
    if use_demo or not ms_graph.is_configured():
        meetings = get_mock_meetings()
    else:
        token = db.query(MSTeamsToken).filter(
            MSTeamsToken.user_id == current_user.id
        ).first()
        
        if not token:
            # Fall back to demo mode
            meetings = get_mock_meetings()
        else:
            # Check if token is expired
            if token.token_expires_at and token.token_expires_at < datetime.utcnow():
                if token.refresh_token:
                    result = ms_graph.refresh_token(token.refresh_token)
                    if 'access_token' in result:
                        token.access_token = result['access_token']
                        token.token_expires_at = datetime.utcnow() + timedelta(seconds=result.get('expires_in', 3600))
                        db.commit()
                        meetings = ms_graph.get_todays_meetings(token.access_token)
                    else:
                        meetings = get_mock_meetings()
                else:
                    meetings = get_mock_meetings()
            else:
                meetings = ms_graph.get_todays_meetings(token.access_token)
    
    # Get recommendations for each meeting
    recommender = RoomRecommendationService(db)
    
    # Get user's current desk booking for proximity scoring
    from app.models.booking import Booking, BookingStatus
    today = datetime.now().date()
    user_booking = db.query(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.booking_date == today,
        Booking.status == BookingStatus.ACTIVE
    ).first()
    
    user_desk_id = str(user_booking.desk_id) if user_booking else None
    
    meetings_with_recommendations = []
    for meeting in meetings:
        meeting_info = MeetingInfo(**meeting)
        recommendations = recommender.recommend_rooms(meeting_info, user_desk_id)
        
        meetings_with_recommendations.append({
            'meeting': meeting_info.model_dump(),
            'recommendations': [rec.model_dump() for rec in recommendations]
        })
    
    return meetings_with_recommendations

