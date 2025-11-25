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
        
        # Create admin users
        admin1 = User(
            id=uuid.uuid4(),
            email="admin1@office.com",
            full_name="Admin One",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
        )
        admin2 = User(
            id=uuid.uuid4(),
            email="admin2@office.com",
            full_name="Admin Two",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
        )
        
        # Create regular users
        user1 = User(
            id=uuid.uuid4(),
            email="user1@office.com",
            full_name="User One",
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER,
        )
        user2 = User(
            id=uuid.uuid4(),
            email="user2@office.com",
            full_name="User Two",
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER,
        )
        user3 = User(
            id=uuid.uuid4(),
            email="user3@office.com",
            full_name="User Three",
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER,
        )
        
        db.add_all([admin1, admin2, user1, user2, user3])
        db.flush()
        
        print("✓ Created 2 admin users and 3 regular users")
        
        # Create desks for two locations based on the seating plan image
        # Location 1: Sydney Office
        sydney_desks = []
        
        # Top left - 3x 6-seater tables
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"SYD-TL-{i+1}",
                location="Sydney Office",
                position_x=1,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top left area",
                is_active=True,
            )
            sydney_desks.append(desk)
        
        # Center left - 2x 4-seater tables
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"SYD-CL-{i+1}",
                location="Sydney Office",
                position_x=2,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center left area",
                is_active=True,
            )
            sydney_desks.append(desk)
        
        # Center right - 2x 4-seater tables
        for i in range(2):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"SYD-CR-{i+1}",
                location="Sydney Office",
                position_x=3,
                position_y=i,
                desk_type="4-seater",
                description="4-person desk in center right area",
                is_active=True,
            )
            sydney_desks.append(desk)
        
        # Top right - 3x 6-seater tables
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"SYD-TR-{i+1}",
                location="Sydney Office",
                position_x=4,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top right area",
                is_active=True,
            )
            sydney_desks.append(desk)
        
        # Location 2: Melbourne Office (similar layout)
        melbourne_desks = []
        
        # Top left - 3x 6-seater tables
        for i in range(3):
            desk = Desk(
                id=uuid.uuid4(),
                name=f"MEL-TL-{i+1}",
                location="Melbourne Office",
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
                location="Melbourne Office",
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
                location="Melbourne Office",
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
                location="Melbourne Office",
                position_x=4,
                position_y=i,
                desk_type="6-seater",
                description="6-person desk in top right area",
                is_active=True,
            )
            melbourne_desks.append(desk)
        
        all_desks = sydney_desks + melbourne_desks
        db.add_all(all_desks)
        db.flush()
        
        print(f"✓ Created {len(sydney_desks)} desks in Sydney Office")
        print(f"✓ Created {len(melbourne_desks)} desks in Melbourne Office")
        
        # Create meeting rooms
        meeting_rooms = [
            # Sydney Office - Floor 1
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Conference Room A",
                room_number="SYD-MR-1A",
                floor="Floor 1",
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
                room_number="SYD-MR-1B",
                floor="Floor 1",
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
                room_number="SYD-MR-1C",
                floor="Floor 1",
                capacity=16,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Executive board room for large meetings",
                is_active=True
            ),
            # Sydney Office - Floor 2
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Meeting Room Alpha",
                room_number="SYD-MR-2A",
                floor="Floor 2",
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
                room_number="SYD-MR-2B",
                floor="Floor 2",
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
                room_number="SYD-MR-2C",
                floor="Floor 2",
                capacity=4,
                has_projector=False,
                has_video_conf=False,
                has_whiteboard=True,
                has_screen_share=False,
                description="Intimate meeting space",
                is_active=True
            ),
            # Melbourne Office - Floor 1
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Executive Suite",
                room_number="MEL-MR-1A",
                floor="Floor 1",
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
                floor="Floor 1",
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
                floor="Floor 1",
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
                floor="Floor 1",
                capacity=20,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Large creative space for workshops",
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



