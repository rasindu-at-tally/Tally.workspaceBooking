# Office Booking Platform

A comprehensive office desk booking system built with Python (FastAPI) backend and React frontend.

## Features

### Desk Booking
- 🔐 **Authentication**: Email/password authentication with JWT tokens and role-based access (user/admin)
- 📅 **Desk Booking**: Browse available desks, book for specific dates with interactive seating plan
- 🏢 **Multi-Location Support**: Manage desks across different office locations
- 🚫 **Booking Management**: Users can view and cancel their bookings
- 🔒 **Business Rules**:
  - One booking per user per day
  - Prevent double-booking with unique constraints
  - Automatic conflict detection with retry logic
  - Transaction-based operations

### Meeting Rooms (NEW!)
- 🏛️ **Meeting Room Management**: Browse and book meeting rooms with capacity and amenity filters
- 🤖 **AI-Powered Recommendations**: Intelligent room suggestions based on:
  - Meeting duration and attendee count
  - Room capacity matching (prevents oversized room bookings)
  - Available amenities (projector, video conferencing, whiteboard)
  - Proximity to your desk location
- 📅 **MS Teams Integration**: 
  - Connect your Microsoft Teams calendar (optional)
  - Automatic detection of meetings requiring physical rooms
  - Real-time calendar sync with OAuth 2.0
  - Works in demo mode without MS credentials
- 🎯 **Smart Features**:
  - Match scoring (0-100%) with detailed reasoning
  - One-click booking from recommendations
  - Real-time availability checking
  - Automatic conflict detection

### Admin Panel
- ⚙️ **Desk Management**: Create, edit, activate/deactivate desks
- 🏛️ **Meeting Room Management**: Full CRUD operations for meeting rooms
- 📊 **Booking Overview**: View and manage all desk and room bookings
- 📈 **Audit Logging**: Comprehensive tracking of all system actions
- 🎨 **Floor Plan Designer**: Interactive floor plan management

### Technical Features
- 🎨 **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui principles
- 📊 **Audit Logging**: Track all system actions for compliance
- 🔒 **Security**: JWT authentication, role-based access control, rate limiting

## Tech Stack

### Backend
- **Python 3.11+** with FastAPI
- **PostgreSQL** database
- **SQLAlchemy** ORM
- **JWT** authentication with python-jose
- **Pydantic** for data validation
- **Rate limiting** with SlowAPI
- **MSAL** for Microsoft Teams integration
- **Recommendation Engine** for AI-powered room suggestions

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
   - Backend API: http://localhost:5001
   - API Documentation: http://localhost:5001/api/docs

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
uvicorn main:app --reload --port 5001
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
VITE_API_URL=http://localhost:5001
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
- Swagger UI: http://localhost:5001/api/docs
- ReDoc: http://localhost:5001/api/redoc

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

**Microsoft Teams Integration (Optional):**
- `MS_CLIENT_ID`: Azure AD Application (Client) ID
- `MS_CLIENT_SECRET`: Azure AD Client Secret
- `MS_TENANT_ID`: Azure AD Tenant ID (or 'common' for multi-tenant)
- `MS_REDIRECT_URI`: OAuth callback URL (default: http://localhost:5001/api/teams/callback)

#### Frontend
- `VITE_API_URL`: Backend API URL

## Microsoft Teams Integration

The application includes optional MS Teams integration for AI-powered meeting room recommendations.

### Demo Mode (No Configuration Required)

The smart recommendations feature works out-of-the-box in demo mode with mock calendar data. No Microsoft credentials needed!

### Production Setup (Optional)

To enable real MS Teams calendar integration:

1. **Register Application in Azure AD**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to Azure Active Directory > App registrations
   - Click "New registration"
   - Set redirect URI: `http://localhost:5001/api/teams/callback` (or your production URL)

2. **Configure API Permissions**:
   - Add the following Microsoft Graph permissions:
     - `User.Read` (Delegated)
     - `Calendars.Read` (Delegated)
     - `OnlineMeetings.Read` (Delegated)
     - `Presence.Read` (Delegated)
   - Grant admin consent for your organization

3. **Create Client Secret**:
   - In your app registration, go to Certificates & secrets
   - Create a new client secret
   - Copy the secret value immediately (it won't be shown again)

4. **Update Environment Variables**:
   ```bash
   MS_CLIENT_ID=your-client-id-here
   MS_CLIENT_SECRET=your-client-secret-here
   MS_TENANT_ID=your-tenant-id-or-common
   MS_REDIRECT_URI=http://localhost:5001/api/teams/callback
   ```

5. **Restart the Backend**:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

Users can then connect their Microsoft Teams accounts from the "Smart Recommendations" page to get personalized meeting room suggestions based on their actual calendar.

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
