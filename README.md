# Office Booking Platform

A comprehensive office desk booking system built with Python (FastAPI) backend and React frontend.

## Features

- 🔐 **Authentication**: Email/password authentication with JWT tokens and role-based access (user/admin)
- 📅 **Desk Booking**: Browse available desks, book for specific dates with interactive seating plan
- 🏢 **Multi-Location Support**: Manage desks across different office locations
- 🚫 **Booking Management**: Users can view and cancel their bookings
- ⚙️ **Admin Panel**: 
  - Manage desks (create, edit, activate/deactivate)
  - View all bookings and cancel on behalf of users
  - Comprehensive audit logging
- 🔒 **Business Rules**:
  - One booking per user per day
  - Prevent double-booking with unique constraints
  - Automatic conflict detection with retry logic
  - Transaction-based operations
- 🎨 **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui principles
- 📊 **Audit Logging**: Track all system actions for compliance

## Tech Stack

### Backend
- **Python 3.11+** with FastAPI
- **PostgreSQL** database
- **SQLAlchemy** ORM
- **JWT** authentication with python-jose
- **Pydantic** for data validation
- **Rate limiting** with SlowAPI

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** (React Query) for data fetching
- **React Hook Form** + **Zod** for form validation
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## Getting Started

### Option 1: Quick Start with Scripts (Easiest! ⚡)

We've created convenient bash scripts to handle everything for you:

```bash
# One command to rule them all!
./scripts/dev.sh
```

That's it! This script will:
- Check prerequisites
- Install all dependencies
- Set up the database
- Seed sample data
- Start both frontend and backend
- Show you the logs

**Other useful scripts:**
```bash
./scripts/start.sh    # Start frontend & backend
./scripts/stop.sh     # Stop all servers
./scripts/seed.sh     # Reseed database
./scripts/clean.sh    # Clean up everything
```

See [scripts/README.md](scripts/README.md) for detailed documentation.

### Option 2: Using Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd OfficeBookingPlatform
```

2. Start all services:
```bash
docker-compose up -d
```

3. Run database migrations and seed data:
```bash
docker-compose exec backend python seed_data.py
```

4. Access the applications:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

### Option 3: Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

5. Update `.env` with your database credentials:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/office_booking
SECRET_KEY=your-secret-key-here
```

6. Create database:
```bash
createdb office_booking
```

7. Run migrations (tables will be created automatically on first run):
```bash
python main.py
```

8. Seed the database:
```bash
python seed_data.py
```

9. Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (if needed):
```bash
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

5. Access the app at http://localhost:5173

## Test Accounts

After seeding the database, you can log in with:

### Admin Accounts
- Email: `admin1@office.com` | Password: `admin123`
- Email: `admin2@office.com` | Password: `admin123`

### User Accounts
- Email: `user1@office.com` | Password: `user123`
- Email: `user2@office.com` | Password: `user123`
- Email: `user3@office.com` | Password: `user123`

## Project Structure

```
OfficeBookingPlatform/
├── backend/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── core/          # Config, database, security
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── main.py            # FastAPI application
│   ├── seed_data.py       # Database seeding script
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml     # Docker setup
└── README.md
```

## API Documentation

When the backend is running, access interactive API documentation at:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Desks
- `GET /api/desks` - Get all desks (with filters)
- `POST /api/desks` - Create desk (admin)
- `PUT /api/desks/{id}` - Update desk (admin)
- `DELETE /api/desks/{id}` - Delete desk (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/by-date` - Get bookings by date
- `POST /api/bookings/{id}/cancel` - Cancel booking
- `GET /api/bookings` - Get all bookings (admin)

### Audit Logs
- `GET /api/audit-logs` - Get audit logs (admin)

## Business Rules

1. **One Booking Per User Per Day**: Users can only have one active booking per day
2. **Desk Availability**: Inactive desks cannot be booked
3. **No Double Booking**: A desk can only be booked once per date (enforced by unique constraint)
4. **Cancel Permissions**: 
   - Users can only cancel their own bookings
   - Admins can cancel any booking
5. **Past Date Validation**: Cannot book desks for past dates
6. **Transaction Safety**: All operations run in database transactions with retry logic

## Development

### Backend Development

Run tests:
```bash
cd backend
pytest
```

Format code:
```bash
black .
```

Lint:
```bash
flake8 .
```

### Frontend Development

Run linter:
```bash
cd frontend
npm run lint
```

Format code:
```bash
npm run format
```

Type check:
```bash
npx tsc --noEmit
```

Build for production:
```bash
npm run build
```

## Deployment

### Production Build

1. Update environment variables in `.env` files
2. Build Docker images:
```bash
docker-compose -f docker-compose.prod.yml build
```

3. Start services:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (generate secure key for production)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `FRONTEND_URL`: Frontend URL for CORS
- `DEFAULT_TIMEZONE`: Default timezone (Australia/Melbourne)

#### Frontend
- `VITE_API_URL`: Backend API URL

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- CORS protection
- SQL injection protection (SQLAlchemy ORM)
- XSS protection (React escaping)
- Input validation (Pydantic + Zod)
- Audit logging for all actions

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
