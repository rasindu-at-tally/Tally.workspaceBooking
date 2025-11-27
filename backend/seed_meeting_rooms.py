"""Script to add meeting rooms to an existing database"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.meeting_room import MeetingRoom
import uuid


def seed_meeting_rooms():
    """Add meeting rooms to the database"""
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if meeting rooms already exist
        existing_count = db.query(MeetingRoom).count()
        if existing_count > 0:
            print(f"Found {existing_count} existing meeting rooms.")
            response = input("Do you want to add more rooms anyway? (y/n): ")
            if response.lower() != 'y':
                print("Skipping meeting room creation.")
                return
        
        print("Creating meeting rooms...")
        
        meeting_rooms = [
            # Sydney Office
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Conference Room A",
                room_number="SYD-MR-1A",
                location="Sydney",
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
                location="Sydney",
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
                location="Sydney",
                capacity=16,
                has_projector=True,
                has_video_conf=True,
                has_whiteboard=True,
                has_screen_share=True,
                description="Executive board room for large meetings",
                is_active=True
            ),
            MeetingRoom(
                id=uuid.uuid4(),
                room_name="Meeting Room Alpha",
                room_number="SYD-MR-2A",
                location="Sydney",
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
                location="Sydney",
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
                location="Sydney",
                capacity=4,
                has_projector=False,
                has_video_conf=False,
                has_whiteboard=True,
                has_screen_share=False,
                description="Intimate meeting space",
                is_active=True
            ),
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
            )
        ]
        
        # Check for duplicates and only add new rooms
        added_count = 0
        for room in meeting_rooms:
            existing = db.query(MeetingRoom).filter(
                MeetingRoom.room_number == room.room_number
            ).first()
            if not existing:
                db.add(room)
                added_count += 1
                print(f"  + {room.room_name} ({room.location})")
            else:
                print(f"  - {room.room_name} already exists, skipping")
        
        db.commit()
        
        print(f"\n✓ Added {added_count} new meeting rooms")
        print("\nMeeting Rooms Summary:")
        print("-" * 50)
        
        # Show summary by location
        for location in ["Sydney", "Melbourne"]:
            rooms = db.query(MeetingRoom).filter(
                MeetingRoom.location == location,
                MeetingRoom.is_active == True
            ).all()
            print(f"\n{location} ({len(rooms)} rooms):")
            for room in rooms:
                amenities = []
                if room.has_projector: amenities.append("📽️")
                if room.has_video_conf: amenities.append("📹")
                if room.has_whiteboard: amenities.append("📝")
                if room.has_screen_share: amenities.append("🖥️")
                print(f"  • {room.room_name} ({room.room_number}) - {room.capacity} people {' '.join(amenities)}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_meeting_rooms()

