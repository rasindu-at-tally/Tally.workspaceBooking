"""Check database data"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.desk import Desk
from app.models.booking import Booking
from app.models.floor_plan import FloorPlan

db: Session = SessionLocal()

try:
    user_count = db.query(User).count()
    desk_count = db.query(Desk).count()
    booking_count = db.query(Booking).count()
    floor_plan_count = db.query(FloorPlan).count()
    
    print('📊 Database Statistics:')
    print(f'  Users: {user_count}')
    print(f'  Desks: {desk_count}')
    print(f'  Bookings: {booking_count}')
    print(f'  Floor Plans: {floor_plan_count}')
    
    if desk_count > 0:
        print('\n📍 Available Locations:')
        locations = db.query(Desk.location).distinct().all()
        for (location,) in locations:
            count = db.query(Desk).filter(Desk.location == location).count()
            print(f'  - {location}: {count} desks')
    
    if user_count == 0:
        print('\n⚠️  No data found. Run seed_data.py to populate the database.')
    else:
        print('\n✅ Database has data!')
        
finally:
    db.close()


