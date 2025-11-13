# Database Credentials - Updated ✅

## Current Configuration

The application is now configured to use your PostgreSQL database:

```
Database:   officebooking
User:       application_user
Password:   v1NVSCVXFS1Kg3
Host:       localhost
Port:       5432
```

**Connection String:**
```
postgresql://application_user:v1NVSCVXFS1Kg3@localhost:5432/officebooking
```

## Files Updated

### 1. `backend/app/core/config.py`
Updated the `DATABASE_URL` setting with your credentials.

## Connection Status ✅

**Test Results:**
- ✅ Database connection successful
- ✅ PostgreSQL version: 14.18
- ✅ All tables exist (6 tables)
- ✅ Database contains seeded data

## Database Statistics

```
📊 Current Data:
  Users: 5
  Desks: 20
  Bookings: 7
  Floor Plans: 0

📍 Locations Available:
  - Sydney Office: 10 desks
  - Melbourne Office: 10 desks
```

## Tables in Database

1. **users** - User accounts and authentication
2. **desks** - Office desks
3. **bookings** - Desk bookings
4. **audit_logs** - Audit trail
5. **floor_plans** - Floor plan layouts ✨ NEW
6. **alembic_version** - Migration tracking

## Test Accounts

### Admin Accounts
- Email: `admin1@office.com` | Password: `admin123`
- Email: `admin2@office.com` | Password: `admin123`

### User Accounts
- Email: `user1@office.com` | Password: `user123`
- Email: `user2@office.com` | Password: `user123`
- Email: `user3@office.com` | Password: `user123`

## Next Steps

1. **Restart the backend server:**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload
   ```

2. **Restart the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the application:**
   - Login as admin: `admin1@office.com` / `admin123`
   - Go to "Floor Plan" in the menu
   - Select "Sydney Office" or "Melbourne Office"
   - Design and save a floor plan
   - Test booking as a regular user

## Testing Database Connection

You can test the connection anytime with:

```bash
cd backend
source venv/bin/activate
python test_connection.py
```

Or check data statistics:

```bash
python check_data.py
```

## Troubleshooting

### If connection fails:

1. **Check PostgreSQL is running:**
   ```bash
   psql -U application_user -d officebooking
   ```

2. **Verify credentials:**
   - Database: `officebooking`
   - User: `application_user`
   - Password: `v1NVSCVXFS1Kg3`

3. **Check user permissions:**
   ```sql
   -- In psql as superuser
   GRANT ALL PRIVILEGES ON DATABASE officebooking TO application_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO application_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO application_user;
   ```

## Security Note 🔒

For production deployment, consider:
1. Using environment variables for credentials
2. Creating a `.env` file (not committed to git)
3. Using a secrets manager
4. Restricting database user permissions

## Migration Commands

All migrations will use the new database:

```bash
# Check current migration
alembic current

# Apply migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"
```

---

**Status:** ✅ All systems operational with new database credentials!


