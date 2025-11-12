# Quick Start Guide

## ⚡ Fastest Way to Get Started (Bash Scripts)

**The easiest method - one command does everything!**

```bash
./scripts/dev.sh
```

This single command will:
- ✅ Check all prerequisites
- ✅ Install backend dependencies (Python virtual environment)
- ✅ Install frontend dependencies (npm packages)
- ✅ Create .env files
- ✅ Set up PostgreSQL database
- ✅ Seed with sample data
- ✅ Start both backend and frontend servers
- ✅ Show you the logs

**Test accounts:**
- Admin: `admin1@office.com` / `admin123`
- User: `user1@office.com` / `user123`

**Other useful scripts:**
```bash
./scripts/start.sh    # Start servers (after setup)
./scripts/stop.sh     # Stop all servers  
./scripts/seed.sh     # Reseed database
./scripts/clean.sh    # Clean everything
```

**To stop servers:** Press `Ctrl+C`

📖 Full scripts documentation: [scripts/README.md](scripts/README.md)

---

## Using Docker Compose

1. Make sure Docker and Docker Compose are installed

2. Clone the repository and navigate to the project:
```bash
cd OfficeBookingPlatform
```

3. Start all services:
```bash
docker-compose up -d
```

4. Wait for services to be ready (about 30 seconds), then seed the database:
```bash
docker-compose exec backend python seed_data.py
```

5. Access the application:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/api/docs

6. Log in with test accounts:
   - **Admin**: admin1@office.com / admin123
   - **User**: user1@office.com / user123

## Manual Setup (Without Docker)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

### Backend Setup

1. Create PostgreSQL database:
```bash
createdb office_booking
```

2. Set up backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database URL:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/office_booking
```

5. Seed the database:
```bash
python seed_data.py
```

6. Start backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. In a new terminal, set up frontend:
```bash
cd frontend
npm install
```

2. Start frontend:
```bash
npm run dev
```

3. Access the app at http://localhost:5173

## Testing the Application

### User Flow
1. Log in as `user1@office.com` / `user123`
2. Select a date and location on the Dashboard
3. Click on an available desk to book it
4. View your bookings in "My Bookings"
5. Cancel a booking if needed

### Admin Flow
1. Log in as `admin1@office.com` / `admin123`
2. Manage Desks: Create, edit, activate/deactivate desks
3. View All Bookings: See and manage all user bookings
4. Audit Logs: Track all system actions

## Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Type Check
```bash
cd frontend
npx tsc --noEmit
```

## Key Features to Try

✅ **Book a desk** - Select date, location, and desk
✅ **Prevent double booking** - Try booking the same desk twice
✅ **One booking per day** - Try booking multiple desks on same day
✅ **Cancel booking** - Cancel your own bookings
✅ **Admin management** - Create and manage desks (admin only)
✅ **Audit logging** - View all system actions (admin only)

## Troubleshooting

**Database connection errors?**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env is correct

**Frontend can't connect to backend?**
- Make sure backend is running on port 8000
- Check VITE_API_URL in frontend/.env

**Port already in use?**
- Change ports in docker-compose.yml or configuration files

## Next Steps

- Explore the API documentation at http://localhost:8000/api/docs
- Check out the full README.md for detailed information
- Customize the seating plan in the seed script
- Add your own office locations and desks

## Support

For issues or questions, refer to the README.md or open an issue on the repository.

