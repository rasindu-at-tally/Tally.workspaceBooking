"""Database models"""
from app.models.user import User, UserRole
from app.models.desk import Desk
from app.models.booking import Booking, BookingStatus
from app.models.audit_log import AuditLog
from app.models.meeting_room import MeetingRoom
from app.models.room_booking import RoomBooking, RoomBookingStatus
from app.models.ms_teams_token import MSTeamsToken

try:
    from app.models.floor_plan import FloorPlan
    __all__ = ["User", "UserRole", "Desk", "Booking", "BookingStatus", "AuditLog", 
               "MeetingRoom", "RoomBooking", "RoomBookingStatus", "MSTeamsToken", "FloorPlan"]
except ImportError:
    __all__ = ["User", "UserRole", "Desk", "Booking", "BookingStatus", "AuditLog", 
               "MeetingRoom", "RoomBooking", "RoomBookingStatus", "MSTeamsToken"]



