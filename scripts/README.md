# Scripts Documentation

This directory contains utility scripts for managing the Office Booking Platform development environment.

## Available Scripts

### 🚀 `dev.sh` - Quick Start (Recommended)

The easiest way to get started. Automatically runs setup if needed, then starts the application.

```bash
./scripts/dev.sh
```

This script:
- Checks if setup is needed
- Runs setup automatically if required
- Starts both frontend and backend servers
- Shows logs from both servers

**Use this if you want everything done automatically!**

---

### 🔧 `setup.sh` - Initial Setup

Sets up the development environment (only needed once).

```bash
./scripts/setup.sh
```

This script:
- Checks prerequisites (Python, Node.js, PostgreSQL)
- Creates Python virtual environment
- Installs backend dependencies
- Installs frontend dependencies
- Creates .env files from examples
- Creates PostgreSQL database (if possible)
- Optionally seeds the database

---

### ▶️ `start.sh` - Start Servers

Starts both frontend and backend servers.

```bash
./scripts/start.sh
```

This script:
- Starts backend on http://localhost:8000
- Starts frontend on http://localhost:5173
- Shows combined logs from both servers
- Handles graceful shutdown with Ctrl+C

Access points:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

---

### ⏹️ `stop.sh` - Stop Servers

Stops all running servers.

```bash
./scripts/stop.sh
```

This script:
- Stops backend server
- Stops frontend server
- Kills processes on ports 8000 and 5173
- Cleans up PID and log files

---

### 🌱 `seed.sh` - Seed Database

Seeds the database with sample data.

```bash
./scripts/seed.sh
```

This script creates:
- 2 admin users (admin1@office.com, admin2@office.com)
- 3 regular users (user1-3@office.com)
- 20 desks across 2 locations
- Sample bookings

**Password for all test users:** See seed output

---

### 🧹 `clean.sh` - Clean Up

Removes all generated files and dependencies.

```bash
./scripts/clean.sh
```

This script removes:
- Python virtual environment
- Node modules
- Python cache files
- Log files
- Build artifacts
- Test database

**Warning:** You'll need to run `setup.sh` again after cleaning.

---

## Usage Examples

### First Time Setup

```bash
# Option 1: Use dev.sh (automatic)
./scripts/dev.sh

# Option 2: Manual
./scripts/setup.sh
./scripts/start.sh
```

### Daily Development

```bash
# Start the application
./scripts/start.sh

# When done
# Press Ctrl+C or run:
./scripts/stop.sh
```

### Reset Everything

```bash
# Clean everything
./scripts/clean.sh

# Set up again
./scripts/setup.sh

# Reseed database
./scripts/seed.sh

# Start
./scripts/start.sh
```

### Reseed Database

```bash
# If you need fresh data
./scripts/seed.sh
```

---

## Troubleshooting

### Permission Denied Error

If you get a "Permission denied" error, make scripts executable:

```bash
chmod +x scripts/*.sh
```

### Port Already in Use

If ports 8000 or 5173 are already in use:

```bash
# Stop the application
./scripts/stop.sh

# Or manually kill processes
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error

1. Check PostgreSQL is running
2. Verify credentials in `backend/.env`
3. Ensure database exists: `createdb office_booking`

### Frontend Not Loading

1. Check `frontend/.env` has correct API URL
2. Ensure backend is running
3. Check browser console for errors

---

## Files Created by Scripts

### `.pids/` directory
- `backend.pid` - Backend process ID
- `frontend.pid` - Frontend process ID
- `backend.log` - Backend logs
- `frontend.log` - Frontend logs

These files are automatically cleaned up when stopping servers.

---

## Environment Files

After running setup, configure these files:

### `backend/.env`
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/office_booking
SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:8000
```

---

## Tips

1. **Always use `dev.sh` for the first time** - it handles everything
2. **Use Ctrl+C to stop servers gracefully** - it cleans up properly
3. **Check logs** at `.pids/backend.log` and `.pids/frontend.log`
4. **Run `clean.sh` if things get weird** - fresh start often helps

---

## Script Dependencies

```
dev.sh
  ├── setup.sh (if needed)
  └── start.sh
      └── stop.sh (on Ctrl+C)

clean.sh
  └── stop.sh
```

---

## Need Help?

- Check the main [README.md](../README.md)
- Check [QUICKSTART.md](../QUICKSTART.md)
- Review logs in `.pids/` directory
- Ensure all prerequisites are installed



