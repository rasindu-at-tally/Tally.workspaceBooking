# 🚀 Scripts Guide - Office Booking Platform

## TL;DR - Just Run This!

```bash
./scripts/dev.sh
```

This single command handles everything: setup, dependencies, database, and starts both servers!

---

## 📦 What's Been Created

We've added 6 powerful bash scripts to make your development life easier:

### 1. `dev.sh` - The Magic Button ✨
**Use this for first-time setup!**

```bash
./scripts/dev.sh
```

**What it does:**
- Detects if setup is needed
- Runs setup automatically
- Starts both frontend and backend
- Shows combined logs

**Perfect for:** First time use, after cleaning

---

### 2. `setup.sh` - One-Time Setup 🔧

```bash
./scripts/setup.sh
```

**What it does:**
- Checks prerequisites (Python, Node.js, PostgreSQL)
- Creates Python virtual environment
- Installs all backend dependencies
- Installs all frontend dependencies  
- Creates `.env` files from examples
- Creates PostgreSQL database
- Optionally seeds sample data

**Perfect for:** Initial project setup

---

### 3. `start.sh` - Daily Driver 🏃

```bash
./scripts/start.sh
```

**What it does:**
- Starts backend on http://localhost:8000
- Starts frontend on http://localhost:5173
- Shows live logs from both
- Handles graceful shutdown with Ctrl+C

**Perfect for:** Daily development work

**Stop with:** `Ctrl+C` or run `./scripts/stop.sh`

---

### 4. `stop.sh` - Clean Shutdown 🛑

```bash
./scripts/stop.sh
```

**What it does:**
- Stops backend server
- Stops frontend server
- Kills any processes on ports 8000 and 5173
- Cleans up PID and log files

**Perfect for:** When you need to stop servers manually

---

### 5. `seed.sh` - Fresh Data 🌱

```bash
./scripts/seed.sh
```

**What it does:**
- Populates database with sample data:
  - 2 admin users
  - 3 regular users
  - 20 desks (2 locations)
  - Sample bookings

**Perfect for:** When you need fresh test data

---

### 6. `clean.sh` - Nuclear Option 🧹

```bash
./scripts/clean.sh
```

**What it does:**
- Stops all servers
- Removes Python virtual environment
- Removes Node modules
- Clears all caches
- Removes log files

**Perfect for:** Fresh start when things go wrong

---

## 🎯 Usage Examples

### First Time Ever
```bash
./scripts/dev.sh
```

### Daily Workflow
```bash
# Morning
./scripts/start.sh

# Do your work...

# Evening (press Ctrl+C or run)
./scripts/stop.sh
```

### Need Fresh Data
```bash
./scripts/seed.sh
```

### Complete Reset
```bash
./scripts/clean.sh
./scripts/dev.sh
```

### Quick Restart
```bash
./scripts/stop.sh
./scripts/start.sh
```

---

## 🌐 Access Points

After starting:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/api/docs | Swagger UI |

---

## 🔑 Test Accounts

### Admin Access
```
Email: admin1@office.com
Password: admin123
```

### Regular User
```
Email: user1@office.com
Password: user123
```

---

## 📊 Script Features

All scripts include:
- ✅ Colored output for easy reading
- ✅ Error checking and validation
- ✅ Helpful status messages
- ✅ Prerequisite verification
- ✅ Graceful error handling
- ✅ Automatic cleanup on exit

---

## 📝 Logs & Debugging

### Log Files
While servers are running:
```bash
# View backend logs
tail -f .pids/backend.log

# View frontend logs  
tail -f .pids/frontend.log

# View both at once
tail -f .pids/*.log
```

### Process IDs
Server PIDs are stored in:
- `.pids/backend.pid`
- `.pids/frontend.pid`

---

## 🔧 Troubleshooting

### "Permission denied" error
```bash
chmod +x scripts/*.sh
```

### Port already in use
```bash
./scripts/stop.sh
# Or manually:
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database connection error
```bash
# Check PostgreSQL is running
brew services list  # macOS with Homebrew
# or
sudo service postgresql status  # Linux

# Verify .env settings
cat backend/.env
```

### Setup fails partway through
```bash
./scripts/clean.sh
./scripts/setup.sh
```

---

## 📚 Additional Documentation

- **Detailed Scripts Docs**: [scripts/README.md](scripts/README.md)
- **Quick Reference**: [scripts/CHEATSHEET.md](scripts/CHEATSHEET.md)
- **Main Project Docs**: [README.md](README.md)
- **Quick Start Guide**: [QUICKSTART.md](QUICKSTART.md)

---

## 💡 Pro Tips

1. **Always use `dev.sh` first** - It detects what's needed
2. **Keep servers running** - They auto-reload on code changes
3. **Check logs first** - Most issues show up in logs
4. **Reseed regularly** - Fresh data helps catch bugs
5. **Use Ctrl+C** - Cleaner than kill commands

---

## 🎨 Script Architecture

```
dev.sh (Main Entry)
  └── Checks if setup needed
      ├── If yes: runs setup.sh
      │   ├── Check prerequisites
      │   ├── Install backend deps
      │   ├── Install frontend deps
      │   ├── Create .env files
      │   └── Seed database
      └── Then: runs start.sh
          ├── Start backend (port 8000)
          ├── Start frontend (port 5173)
          └── Show logs & wait for Ctrl+C
              └── On exit: runs stop.sh
                  ├── Kill backend
                  ├── Kill frontend
                  └── Clean up PIDs
```

---

## ✅ Next Steps

1. **Run the app:**
   ```bash
   ./scripts/dev.sh
   ```

2. **Open browser:**
   - Go to http://localhost:5173

3. **Log in:**
   - Use `user1@office.com` / `user123`

4. **Start coding:**
   - Backend changes auto-reload
   - Frontend has hot module replacement

5. **Need help?**
   - Check the logs: `.pids/*.log`
   - Read the docs: `scripts/README.md`
   - Review the code: Both backend and frontend are well-documented

---

**Happy Coding! 🎉**

