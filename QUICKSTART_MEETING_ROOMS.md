# Quick Start: Meeting Rooms Feature

## 🚀 Get Started in 3 Minutes

### Step 1: Update Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run Database Migration
```bash
# From backend directory
alembic upgrade head
```

This creates 3 new tables:
- `meeting_rooms` - Meeting room entities
- `room_bookings` - Booking records
- `ms_teams_tokens` - OAuth tokens (optional)

### Step 3: Seed Sample Data (Optional)
```bash
# From backend directory
python seed_data.py
```

This adds 10 sample meeting rooms:
- 6 rooms in Sydney Office (Floors 1-2)
- 4 rooms in Melbourne Office (Floor 1)
- Various capacities: 2-20 people
- Different amenity combinations

### Step 4: Start the Application
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm install  # Only if not done before
npm run dev
```

### Step 5: Try It Out! 🎉

**Login** (use existing credentials):
- Admin: `admin1@office.com` / `admin123`
- User: `user1@office.com` / `user123`

**Browse Meeting Rooms**:
1. Navigate to: http://localhost:5173/meeting-rooms
2. Filter by floor, capacity, or amenities
3. Click "Book Room" on any available room

**Try AI Recommendations** (Demo Mode):
1. Navigate to: http://localhost:5173/smart-recommendations
2. Enable "Demo Mode" checkbox (enabled by default)
3. See 3 mock meetings with AI-powered room suggestions
4. Match scores show how well each room fits the meeting
5. Click "Book This Room" to reserve

**View Your Bookings**:
1. Navigate to: http://localhost:5173/my-room-bookings
2. See all your room reservations
3. Cancel bookings if needed

**Admin Features** (admin accounts only):
1. Navigate to: http://localhost:5173/admin/meeting-rooms
2. Create, edit, or deactivate meeting rooms
3. Manage room amenities and capacity

## 🎯 Key Features

### Smart Recommendations
The AI engine analyzes:
- **Capacity** (30%): Perfect fit = 1.0-1.5x attendees
- **Amenities** (30%): Projector, video conf, whiteboard
- **Proximity** (40%): Distance from your desk

### Demo Mode
Works immediately without MS Teams:
- 3 realistic mock meetings
- Team Standup (5 people, 30 min)
- Project Planning (8 people, 90 min)
- Client Presentation (12 people, 60 min)

### Real MS Teams (Optional)
To connect your actual calendar:
1. Ask admin to configure Azure AD app
2. Click "Connect MS Teams" in Smart Recommendations
3. Authorize calendar access
4. Get personalized recommendations!

## 📊 What You'll See

### Meeting Rooms Page
```
┌─────────────────────────────────────┐
│ Filters: Floor | Capacity | Amenities│
├─────────────────────────────────────┤
│ [Room Card]  [Room Card]  [Room Card]│
│ • Room Name  • Room Name  • Room Name│
│ • Floor 1    • Floor 2    • Floor 1 │
│ • 8 people   • 12 people  • 4 people│
│ • 📽️📹📝🖥️  • 📽️📹📝🖥️  • 📝       │
│ [Book Room]  [Book Room]  [Book Room]│
└─────────────────────────────────────┘
```

### Smart Recommendations
```
┌─────────────────────────────────────┐
│ 📅 Team Standup | 9:00 AM - 9:30 AM │
│ 👥 5 attendees | ⏱️ 30 min          │
├─────────────────────────────────────┤
│ Recommended Rooms:                  │
│                                     │
│ ┌───────────┐ ┌───────────┐ ┌──────┐│
│ │Huddle 1   │ │Small Room │ │Focus ││
│ │MR-1B      │ │MR-2C      │ │MR-1C ││
│ │    95%    │ │    88%    │ │ 75% ││
│ │✓ Perfect  │ │✓ Spacious │ │✓ Same││
│ │  size     │ │  room     │ │  floor││
│ │✓ Video    │ │✓ Whiteb.  │ │✓ Quiet││
│ │  conf     │ │           │ │  space││
│ │[Book Room]│ │[Book Room]│ │[Book]││
│ └───────────┘ └───────────┘ └──────┘│
└─────────────────────────────────────┘
```

## 🔧 Configuration (Optional)

### MS Teams Integration

**1. Create Azure AD App**:
- Portal: https://portal.azure.com
- Azure AD > App registrations > New
- Redirect URI: `http://localhost:8000/api/teams/callback`

**2. API Permissions**:
```
Microsoft Graph (Delegated):
✓ User.Read
✓ Calendars.Read
✓ OnlineMeetings.Read
✓ Presence.Read
```

**3. Environment Variables** (`backend/.env`):
```env
MS_CLIENT_ID=your-azure-app-client-id
MS_CLIENT_SECRET=your-azure-app-secret
MS_TENANT_ID=your-tenant-id-or-common
MS_REDIRECT_URI=http://localhost:8000/api/teams/callback
```

**4. Restart Backend**:
```bash
cd backend
uvicorn main:app --reload
```

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Database migration completed
- [ ] Can see meeting rooms at `/meeting-rooms`
- [ ] Can access Smart Recommendations at `/smart-recommendations`
- [ ] Demo mode shows 3 mock meetings
- [ ] Can book a room
- [ ] Bookings appear in `/my-room-bookings`
- [ ] Admin can create/edit rooms at `/admin/meeting-rooms`

## 🐛 Common Issues

### Import Error: `msal` not found
```bash
cd backend
pip install msal python-dateutil requests
```

### Migration Error: "relation already exists"
```bash
# Check current migration status
alembic current

# If needed, mark as up-to-date
alembic stamp head
```

### TypeScript Errors in Frontend
```bash
cd frontend
npm install
npm run dev
```

### Can't See New Pages
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors
- Verify frontend is running on port 5173

## 📚 Learn More

- **Full Documentation**: See `MERGE_SUMMARY.md`
- **API Reference**: http://localhost:8000/api/docs
- **MS Teams Setup**: See `README.md` MS Teams Integration section
- **Architecture**: Review `/backend/app/services/recommendation_service.py`

## 🎉 You're Ready!

The meeting rooms feature is now fully integrated. Enjoy smart, AI-powered workspace management!

**What's Next?**
- Invite team members to try it
- Customize meeting rooms for your office
- Configure MS Teams for personalized recommendations
- Monitor usage via audit logs

Need help? Check the API docs or review the code comments!

