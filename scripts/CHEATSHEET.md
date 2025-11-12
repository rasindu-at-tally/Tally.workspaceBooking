# Scripts Cheatsheet 📋

Quick reference for all available scripts.

## 🚀 Quick Commands

```bash
# FIRST TIME - Setup & Run Everything
./scripts/dev.sh

# DAILY USE - Just start the servers
./scripts/start.sh

# STOP - Stop all servers
./scripts/stop.sh
# or press Ctrl+C in the terminal running start.sh

# RESEED - Populate database with fresh data
./scripts/seed.sh

# CLEAN - Remove all dependencies and caches
./scripts/clean.sh
```

---

## 📊 Script Comparison

| Script | What It Does | When To Use |
|--------|--------------|-------------|
| `dev.sh` | Setup + Start everything | First time, or after clean |
| `start.sh` | Start frontend + backend | Daily development |
| `stop.sh` | Stop all servers | End of work session |
| `setup.sh` | Install dependencies | First time setup only |
| `seed.sh` | Populate database | Need fresh test data |
| `clean.sh` | Remove everything | Fresh start needed |

---

## 🎯 Common Workflows

### First Time Setup
```bash
./scripts/dev.sh
```

### Daily Development
```bash
# Morning
./scripts/start.sh

# Work on your changes...

# Evening
# Press Ctrl+C or:
./scripts/stop.sh
```

### Need Fresh Data
```bash
./scripts/seed.sh
```

### Something's Broken
```bash
# Nuclear option - start fresh
./scripts/clean.sh
./scripts/dev.sh
```

### Quick Restart
```bash
./scripts/stop.sh
./scripts/start.sh
```

---

## 📍 Access Points

After running `start.sh` or `dev.sh`:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

## 🔑 Test Accounts

**Admin:**
- Email: `admin1@office.com`
- Password: `admin123`

**User:**
- Email: `user1@office.com`
- Password: `user123`

---

## 📝 Logs Location

While servers are running:
- Backend: `.pids/backend.log`
- Frontend: `.pids/frontend.log`

View logs in real-time:
```bash
tail -f .pids/backend.log
tail -f .pids/frontend.log
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
./scripts/stop.sh
# or manually:
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Permission Denied
```bash
chmod +x scripts/*.sh
```

### Database Issues
```bash
# Recreate database
dropdb office_booking
createdb office_booking
./scripts/seed.sh
```

### Everything's Broken
```bash
# Start fresh
./scripts/clean.sh
./scripts/dev.sh
```

---

## 💡 Tips

1. **Always use `dev.sh` first time** - It handles everything
2. **Use `Ctrl+C` to stop** - Cleaner than kill commands
3. **Check logs if issues** - They're in `.pids/` folder
4. **Reseed often** - Fresh data helps testing

---

## ⚡ One-Liners

```bash
# Complete reset and restart
./scripts/clean.sh && ./scripts/dev.sh

# Quick restart
./scripts/stop.sh && ./scripts/start.sh

# Reseed and restart backend
./scripts/stop.sh && ./scripts/seed.sh && ./scripts/start.sh

# View both logs at once
tail -f .pids/*.log
```

---

## 📚 More Info

- Detailed docs: [scripts/README.md](README.md)
- Main docs: [../README.md](../README.md)
- Quick start: [../QUICKSTART.md](../QUICKSTART.md)

