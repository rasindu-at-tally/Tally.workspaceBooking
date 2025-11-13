"""Booking tests"""
import pytest
from datetime import date, timedelta


def test_create_booking(client, auth_headers, test_desk):
    """Test creating a booking"""
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    response = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={"desk_id": str(test_desk.id), "booking_date": tomorrow},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["desk_id"] == str(test_desk.id)
    assert data["booking_date"] == tomorrow
    assert data["status"] == "active"


def test_cannot_book_past_date(client, auth_headers, test_desk):
    """Test that booking past dates fails"""
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    response = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={"desk_id": str(test_desk.id), "booking_date": yesterday},
    )
    assert response.status_code == 400


def test_cannot_double_book_desk(client, auth_headers, test_user, test_desk, db):
    """Test that double booking the same desk fails"""
    from app.models.booking import Booking, BookingStatus
    
    tomorrow = date.today() + timedelta(days=1)
    
    # Create first booking
    booking = Booking(
        user_id=test_user.id,
        desk_id=test_desk.id,
        booking_date=tomorrow,
        status=BookingStatus.ACTIVE,
    )
    db.add(booking)
    db.commit()
    
    # Try to create second booking for same desk and date
    response = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={"desk_id": str(test_desk.id), "booking_date": tomorrow.isoformat()},
    )
    assert response.status_code == 409
    assert "DESK_ALREADY_BOOKED_FOR_DATE" in response.json()["detail"]


def test_user_can_cancel_own_booking(client, auth_headers, test_user, test_desk, db):
    """Test that user can cancel their own booking"""
    from app.models.booking import Booking, BookingStatus
    
    tomorrow = date.today() + timedelta(days=1)
    
    # Create booking
    booking = Booking(
        user_id=test_user.id,
        desk_id=test_desk.id,
        booking_date=tomorrow,
        status=BookingStatus.ACTIVE,
    )
    db.add(booking)
    db.commit()
    
    # Cancel booking
    response = client.post(
        f"/api/bookings/{booking.id}/cancel",
        headers=auth_headers,
        json={"cancellation_reason": "Changed plans"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"
    assert data["cancellation_reason"] == "Changed plans"


def test_admin_can_cancel_any_booking(client, admin_headers, test_user, test_desk, db):
    """Test that admin can cancel any user's booking"""
    from app.models.booking import Booking, BookingStatus
    
    tomorrow = date.today() + timedelta(days=1)
    
    # Create booking for regular user
    booking = Booking(
        user_id=test_user.id,
        desk_id=test_desk.id,
        booking_date=tomorrow,
        status=BookingStatus.ACTIVE,
    )
    db.add(booking)
    db.commit()
    
    # Admin cancels the booking
    response = client.post(
        f"/api/bookings/{booking.id}/cancel",
        headers=admin_headers,
        json={"cancellation_reason": "Cancelled by admin"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"


def test_get_my_bookings(client, auth_headers, test_user, test_desk, db):
    """Test getting user's bookings"""
    from app.models.booking import Booking, BookingStatus
    
    tomorrow = date.today() + timedelta(days=1)
    
    # Create booking
    booking = Booking(
        user_id=test_user.id,
        desk_id=test_desk.id,
        booking_date=tomorrow,
        status=BookingStatus.ACTIVE,
    )
    db.add(booking)
    db.commit()
    
    # Get bookings
    response = client.get("/api/bookings/my-bookings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["desk_id"] == str(test_desk.id)



