"""Microsoft Graph API Service"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import msal
import requests
from dateutil import parser as date_parser

from app.core.config import get_settings

settings = get_settings()


class MSGraphService:
    """Microsoft Graph API service for Teams integration"""
    
    # Microsoft Graph API Configuration
    CLIENT_ID = getattr(settings, 'MS_CLIENT_ID', 'YOUR_CLIENT_ID_HERE')
    CLIENT_SECRET = getattr(settings, 'MS_CLIENT_SECRET', 'YOUR_CLIENT_SECRET_HERE')
    TENANT_ID = getattr(settings, 'MS_TENANT_ID', 'common')
    AUTHORITY = f'https://login.microsoftonline.com/{TENANT_ID}'
    REDIRECT_URI = getattr(settings, 'MS_REDIRECT_URI', 'http://localhost:8000/api/teams/callback')
    SCOPE = [
        'User.Read',
        'Calendars.Read',
        'OnlineMeetings.Read',
        'Presence.Read'
    ]
    GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0'
    
    def __init__(self):
        self.client_id = self.CLIENT_ID
        self.client_secret = self.CLIENT_SECRET
        self.authority = self.AUTHORITY
        self.scope = self.SCOPE
        self.redirect_uri = self.REDIRECT_URI
    
    def is_configured(self) -> bool:
        """Check if MS Graph is properly configured"""
        return (
            self.CLIENT_ID != 'YOUR_CLIENT_ID_HERE' and
            self.CLIENT_SECRET != 'YOUR_CLIENT_SECRET_HERE'
        )
    
    def get_auth_url(self) -> str:
        """Get authorization URL for OAuth flow"""
        app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )
        
        auth_url = app.get_authorization_request_url(
            scopes=self.scope,
            redirect_uri=self.redirect_uri
        )
        return auth_url
    
    def get_token_from_code(self, auth_code: str) -> Dict:
        """Exchange authorization code for access token"""
        app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )
        
        result = app.acquire_token_by_authorization_code(
            auth_code,
            scopes=self.scope,
            redirect_uri=self.redirect_uri
        )
        
        return result
    
    def refresh_token(self, refresh_token: str) -> Dict:
        """Refresh access token using refresh token"""
        app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )
        
        result = app.acquire_token_by_refresh_token(
            refresh_token,
            scopes=self.scope
        )
        
        return result
    
    def get_user_profile(self, access_token: str) -> Optional[Dict]:
        """Get user profile from Microsoft Graph"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(
            f'{self.GRAPH_API_ENDPOINT}/me',
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        return None
    
    def get_calendar_events(
        self,
        access_token: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """Get user's calendar events for a date range"""
        if start_date is None:
            start_date = datetime.now()
        if end_date is None:
            end_date = start_date + timedelta(days=7)
        
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Format dates for Microsoft Graph API
        start_str = start_date.strftime('%Y-%m-%dT00:00:00Z')
        end_str = end_date.strftime('%Y-%m-%dT23:59:59Z')
        
        params = {
            '$select': 'subject,start,end,location,attendees,isOnlineMeeting,onlineMeetingUrl',
            '$filter': f"start/dateTime ge '{start_str}' and end/dateTime le '{end_str}'",
            '$orderby': 'start/dateTime'
        }
        
        response = requests.get(
            f'{self.GRAPH_API_ENDPOINT}/me/calendar/events',
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            return response.json().get('value', [])
        return []
    
    def get_todays_meetings(self, access_token: str) -> List[Dict]:
        """Get today's meetings that might need meeting rooms"""
        today = datetime.now().date()
        events = self.get_calendar_events(
            access_token,
            datetime.combine(today, datetime.min.time()),
            datetime.combine(today, datetime.max.time())
        )
        
        # Filter for meetings that need physical rooms
        meetings_needing_rooms = []
        for event in events:
            # Parse meeting details
            start = date_parser.parse(event['start']['dateTime'])
            end = date_parser.parse(event['end']['dateTime'])
            duration = (end - start).total_seconds() / 60  # Duration in minutes
            
            attendee_count = len(event.get('attendees', []))
            is_online = event.get('isOnlineMeeting', False)
            
            # Only recommend rooms for meetings with multiple attendees
            # and that are long enough to warrant a room
            if attendee_count > 1 and duration >= 15:
                meetings_needing_rooms.append({
                    'subject': event.get('subject', 'No Subject'),
                    'start': start,
                    'end': end,
                    'duration': int(duration),
                    'attendee_count': attendee_count,
                    'is_online': is_online,
                    'location': event.get('location', {}).get('displayName', ''),
                    'online_meeting_url': event.get('onlineMeetingUrl', '')
                })
        
        return meetings_needing_rooms
    
    def check_token_validity(self, token_data: Dict) -> bool:
        """Check if access token is still valid"""
        if not token_data or 'expires_in' not in token_data:
            return False
        return True


def get_mock_meetings() -> List[Dict]:
    """
    Get mock meetings for demo purposes (when MS Graph is not configured)
    This allows testing the recommendation engine without MS credentials
    """
    now = datetime.now()
    
    return [
        {
            'subject': 'Team Standup',
            'start': now.replace(hour=9, minute=0, second=0, microsecond=0),
            'end': now.replace(hour=9, minute=30, second=0, microsecond=0),
            'duration': 30,
            'attendee_count': 5,
            'is_online': False,
            'location': '',
            'online_meeting_url': ''
        },
        {
            'subject': 'Project Planning Session',
            'start': now.replace(hour=14, minute=0, second=0, microsecond=0),
            'end': now.replace(hour=15, minute=30, second=0, microsecond=0),
            'duration': 90,
            'attendee_count': 8,
            'is_online': False,
            'location': '',
            'online_meeting_url': ''
        },
        {
            'subject': 'Client Presentation',
            'start': now.replace(hour=16, minute=0, second=0, microsecond=0),
            'end': now.replace(hour=17, minute=0, second=0, microsecond=0),
            'duration': 60,
            'attendee_count': 12,
            'is_online': True,
            'location': '',
            'online_meeting_url': 'https://teams.microsoft.com/meet/...'
        }
    ]

