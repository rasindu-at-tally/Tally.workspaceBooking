"""Seed script to populate database with sample data"""
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.desk import Desk
from app.models.booking import Booking, BookingStatus
from app.models.meeting_room import MeetingRoom
from app.models.room_booking import RoomBooking, RoomBookingStatus
import uuid


def seed_database():
    """Seed the database with sample data"""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping...")
            return
        
        print("Starting database seed...")
        
        # Create admin users (admins have no location restriction - can book anywhere)
        admin1 = User(
            id=uuid.uuid4(),
            email="admin1@office.com",
            full_name="Admin One",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            location=None,  # Admins can access all locations
        )
        admin2 = User(
            id=uuid.uuid4(),
            email="admin2@office.com",
            full_name="Admin Two",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            location=None,  # Admins can access all locations
        )
        
        # Create regular users with assigned locations
        user1 = User(
            id=uuid.uuid4(),
            email="user1@office.com",
            full_name="User One",
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER,
            location="Melbourne",  # Can only book Melbourne desks
        )
        user2 = User(
            id=uuid.uuid4(),
            email="user2@office.com",
            full_name="User Two",
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER,
            location="Brisbane",  # Can only book Brisbane desks
        )
        user3 = User(
            id=uuid.uuid4(),
            email="user3@office.com",
            full_name="User Three",
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER,
            location="Auckland",  # Can only book Auckland desks
        )
        user4 = User(
            id=uuid.uuid4(),
            email="user4@office.com",
            full_name="User Four",
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER,
            location="Hyderabad",  # Can only book Hyderabad desks
        )
        
        db.add_all([admin1, admin2, user1, user2, user3, user4])
        db.flush()
        
        print("✓ Created 2 admin users and 4 regular users with location assignments")
        
        # Create desks for four locations
        # Location 1: Melbourne Office
        melbourne_desks = []
        
        # Top left - 3x 6-seater tables
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"MEL-TL-{i+1}",
                location="Melbourne",
                position_x=1,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top left area",
                is_active=True,
            )
            melbourne_desks.append(desk)
        
        # Center left - 2x 4-seater tables
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"MEL-CL-{i+1}",
                location="Melbourne",
                position_x=2,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center left area",
                is_active=True,
            )
            melbourne_desks.append(desk)
        
        # Center right - 2x 4-seater tables
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"MEL-CR-{i+1}",
                location="Melbourne",
                position_x=3,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center right area",
                is_active=True,
            )
            melbourne_desks.append(desk)
        
        # Top right - 3x 6-seater tables
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"MEL-TR-{i+1}",
                location="Melbourne",
                position_x=4,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top right area",
                is_active=True,
            )
            melbourne_desks.append(desk)
        
        # Location 2: Brisbane Office
        brisbane_desks = []
        
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"BRI-TL-{i+1}",
                location="Brisbane",
                position_x=1,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top left area",
                is_active=True,
            )
            brisbane_desks.append(desk)
        
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"BRI-CL-{i+1}",
                location="Brisbane",
                position_x=2,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center left area",
                is_active=True,
            )
            brisbane_desks.append(desk)
        
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"BRI-CR-{i+1}",
                location="Brisbane",
                position_x=3,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center right area",
                is_active=True,
            )
            brisbane_desks.append(desk)
        
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"BRI-TR-{i+1}",
                location="Brisbane",
                position_x=4,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top right area",
                is_active=True,
            )
            brisbane_desks.append(desk)
        
        # Location 3: Auckland Office
        auckland_desks = []
        
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"AKL-TL-{i+1}",
                location="Auckland",
                position_x=1,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top left area",
                is_active=True,
            )
            auckland_desks.append(desk)
        
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"AKL-CL-{i+1}",
                location="Auckland",
                position_x=2,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center left area",
                is_active=True,
            )
            auckland_desks.append(desk)
        
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"AKL-CR-{i+1}",
                location="Auckland",
                position_x=3,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center right area",
                is_active=True,
            )
            auckland_desks.append(desk)
        
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"AKL-TR-{i+1}",
                location="Auckland",
                position_x=4,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top right area",
                is_active=True,
            )
            auckland_desks.append(desk)
        
        # Location 4: Hyderabad Office
        hyderabad_desks = []
        
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"HYD-TL-{i+1}",
                location="Hyderabad",
                position_x=1,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top left area",
                is_active=True,
            )
            hyderabad_desks.append(desk)
        
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"HYD-CL-{i+1}",
                location="Hyderabad",
                position_x=2,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center left area",
                is_active=True,
            )
            hyderabad_desks.append(desk)
        
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"HYD-CR-{i+1}",
                location="Hyderabad",
                position_x=3,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center right area",
                is_active=True,
            )
            hyderabad_desks.append(desk)
        
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"HYD-TR-{i+1}",
                location="Hyderabad",
                position_x=4,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top right area",
                is_active=True,
            )
            hyderabad_desks.append(desk)
        
        all_desks = melbourne_desks + brisbane_desks + auckland_desks + hyderabad_desks
        db.add_all(all_desks)
        db.flush()
        
        print(f"✓ Created {len(melbourne_desks)} desks in Melbourne Office")
        print(f"✓ Created {len(brisbane_desks)} desks in Brisbane Office")
        print(f"✓ Created {len(auckland_desks)} desks in Auckland Office")
        print(f"✓ Created {len(hyderabad_desks)} desks in Hyderabad Office")
        
        # Create meeting rooms
        meeting_rooms = [
            # Melbourne Office
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Executive Suite",
                room_number="MEL-MR-1A",
                location="Melbourne",
                capacity=12,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Premium meeting space",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Team Room Beta",
                room_number="MEL-MR-1B",
                location="Melbourne",
                capacity=8,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Team meeting room",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Focus Room",
                room_number="MEL-MR-1C",
                location="Melbourne",
                capacity=2,
                has_projector=False,
                has_video_conf=False,
                has_whiteboard=True,
                has_screen_share=False,
                description="Quiet room for focused discussions",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Innovation Lab",
                room_number="MEL-MR-1D",
                location="Melbourne",
                capacity=20,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Large creative space for workshops",
                is_active=True
            ),
            # Brisbane Office
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Conference Room A",
                room_number="BRI-MR-1A",
                location="Brisbane",
                capacity=8,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Large conference room with full AV equipment",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Huddle Space 1",
                room_number="BRI-MR-1B",
                location="Brisbane",
                capacity=4,
                has_projector=False,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=False,
                description="Small meeting space for quick discussions",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Board Room",
                room_number="BRI-MR-1C",
                location="Brisbane",
                capacity=16,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Executive board room for large meetings",
                is_active=True
            ),
            # Auckland Office
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Meeting Room Alpha",
                room_number="AKL-MR-1A",
                location="Auckland",
                capacity=6,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Medium-sized meeting room",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Collaboration Space",
                room_number="AKL-MR-1B",
                location="Auckland",
                capacity=10,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Open collaboration space",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Small Meeting Room",
                room_number="AKL-MR-1C",
                location="Auckland",
                capacity=4,
                has_projector=False,
                has_video_conf=False,
                has_whiteboard=True,
                has_screen_share=False,
                description="Intimate meeting space",
                is_active=True
            ),
            # Hyderabad Office
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Tech Hub",
                room_number="HYD-MR-1A",
                location="Hyderabad",
                capacity=14,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Technology-focused meeting room",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Brainstorm Room",
                room_number="HYD-MR-1B",
                location="Hyderabad",
                capacity=8,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Creative brainstorming space",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Quick Connect",
                room_number="HYD-MR-1C",
                location="Hyderabad",
                capacity=4,
                has_projector=False,
                has_video_conf=True,
                has_whiteboard=False,
                has_screen_share=True,
                description="Video conferencing room",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Training Center",
                room_number="HYD-MR-1D",
                location="Hyderabad",
                capacity=25,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Large training and workshop space",
                is_active=True
            )
        ]
        
        db.add_all(meeting_rooms)
        db.flush()
        
        print(f"✓ Created {len(meeting_rooms)} meeting rooms")
        
        # Create sample bookings
        today = date.today()
        bookings = []
        
        # Active bookings for today and future
        bookings.append(
            Booking(
                id=uuid.uuid4(),
                user_id=user1.id,
                desk_id=sydney_desks[0].id,
                booking_date=today,
                status=BookingStatus.ACTIVE,
            )
        )
        
        bookings.append(
            Booking(
                id=uuid.uuid4(),
                user_id=user2.id,
                desk_id=sydney_desks[1].id,
                booking_date=today,
                status=BookingStatus.ACTIVE,
            )
        )
        
        bookings.append(
            Booking(
                id=uuid.uuid4(),
                user_id=user3.id,
                desk_id=melbourne_desks[0].id,
                booking_date=today + timedelta(days=1),
                status=BookingStatus.ACTIVE,
            )
        )
        
        bookings.append(
            Booking(
                id=uuid.uuid4(),
                user_id=user1.id,
                desk_id=melbourne_desks[1].id,
                booking_date=today + timedelta(days=2),
                status=BookingStatus.ACTIVE,
            )
        )
        
        # One cancelled booking example
        cancelled_booking = Booking(
            id=uuid.uuid4(),
            user_id=user2.id,
            desk_id=sydney_desks[2].id,
            booking_date=today - timedelta(days=1),
            status=BookingStatus.CANCELLED,
            cancelled_by_user_id=user2.id,
            cancellation_reason="Plans changed",
        )
        bookings.append(cancelled_booking)
        
        # Past bookings
        bookings.append(
            Booking(
                id=uuid.uuid4(),
                user_id=user1.id,
                desk_id=sydney_desks[3].id,
                booking_date=today - timedelta(days=7),
                status=BookingStatus.ACTIVE,
            )
        )
        
        bookings.append(
            Booking(
                id=uuid.uuid4(),
                user_id=user3.id,
                desk_id=melbourne_desks[2].id,
                booking_date=today - timedelta(days=5),
                status=BookingStatus.ACTIVE,
            )
        )
        
        db.add_all(bookings)
        db.commit()
        
        print(f"✓ Created {len(bookings)} sample bookings")
        print("\n" + "="*50)
        print("Database seeded successfully!")
        print("="*50)
        print("\nTest Accounts:")
        print("-" * 50)
        print("Admins:")
        print("  Email: admin1@office.com | Password: admin123")
        print("  Email: admin2@office.com | Password: admin123")
        print("\nUsers:")
        print("  Email: user1@office.com | Password: user123")
        print("  Email: user2@office.com | Password: user123")
        print("  Email: user3@office.com | Password: user123")
        print("="*50)
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()



