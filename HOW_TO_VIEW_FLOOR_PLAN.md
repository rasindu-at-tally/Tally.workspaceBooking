# How to View Floor Plan on Dashboard ✅

## ✅ Floor Plans in Database

Good news! Your floor plans are saved:

```
✅ Sydney Office - Floor plan exists
✅ Melbourne Office - Floor plan exists
```

## How to See the Floor Plan

### Step-by-Step Instructions:

1. **Go to Dashboard**
   - Login as any user (admin or regular user)
   - Navigate to the main Dashboard page

2. **Select a Specific Location** ⚠️ IMPORTANT
   - In the "Location" dropdown
   - **DO NOT select "All Locations"**
   - Select either:
     - **"Sydney Office"** OR
     - **"Melbourne Office"**

3. **Floor Plan Will Appear**
   - Once you select a specific location, the floor plan will load automatically
   - You should see the canvas with desks and chairs you designed
   - Items will be color-coded:
     - 🔵 Blue = Available
     - ⚫ Gray = Booked
     - 🔴 Red = Inactive

## Why "All Locations" Doesn't Work

- Each floor plan is tied to a specific location
- When you select "All Locations", no specific floor plan is loaded
- You'll see desks listed, but not the visual floor plan
- **Solution:** Always select a specific location to see the floor plan

## Testing Instructions

### Test 1: View Sydney Office Floor Plan

```
1. Login: user1@office.com / user123
2. Go to Dashboard
3. Select: "Sydney Office" from dropdown
4. Result: Should see floor plan canvas
```

### Test 2: View Melbourne Office Floor Plan

```
1. Same as above
2. Select: "Melbourne Office" from dropdown
3. Result: Should see floor plan canvas
```

## Debugging

If you still don't see the floor plan:

### 1. Check Browser Console

Open browser console (F12) and look for these messages:

**Good signs:**
```
[SeatingPlan] Loading floor plan for location: Sydney Office
[SeatingPlan] Floor plan loaded: {id: 1, location: ...}
[SeatingPlan] Parsed items: 2
```

**Bad signs:**
```
[SeatingPlan] No location selected, skipping floor plan load
[SeatingPlan] No floor plan found for location: ...
[SeatingPlan] Error loading floor plan: ...
```

### 2. Verify Selection

Make sure:
- ✅ A specific location is selected (NOT "All Locations")
- ✅ The location matches what you designed (Sydney Office or Melbourne Office)
- ✅ You're not filtering by date/time that has no desks

### 3. Check Network Tab

In browser DevTools → Network tab:
- Should see a request to: `GET /api/floor-plans/Sydney%20Office`
- Status should be: `200 OK`
- Response should contain: `{"id":1,"location":"Sydney Office",...}`

### 4. Hard Refresh

Sometimes cached JavaScript causes issues:
- **Mac**: `Cmd + Shift + R`
- **Windows**: `Ctrl + Shift + R`

## Expected Behavior

### When Location is Selected:

✅ **What you should see:**
- Canvas with grid background
- Desks (brown/wooden color)
- Chairs (blue color)
- Items positioned where you placed them
- Correct rotations
- Click on blue items to book

❌ **What you should NOT see:**
- "No floor plan available" message
- Empty canvas
- Only a list of desks (that's the old view)

### When "All Locations" is Selected:

- No floor plan shown
- Shows "No desks available" or list view
- **This is expected behavior**

## Screenshots of What You Should See

### Correct Flow:

1. **Location Dropdown:** 
   - Select "Sydney Office" ✅

2. **Floor Plan Canvas:**
   - Grid background visible
   - Desks and chairs placed on canvas
   - Color-coded by availability

3. **Click to Book:**
   - Click any available (blue) item
   - Booking modal opens

## Still Not Working?

Try this checklist:

- [ ] Backend server is running (`http://localhost:8000/health` returns OK)
- [ ] Frontend is running (`http://localhost:5173`)
- [ ] Logged in as a user (any user)
- [ ] Selected "Sydney Office" or "Melbourne Office" (NOT "All Locations")
- [ ] Hard refreshed browser (Cmd+Shift+R)
- [ ] Checked browser console for errors
- [ ] Verified floor plan exists in database (it does!)

## Database Verification

You can verify floor plans are in the database:

```bash
cd backend
source venv/bin/activate
python check_data.py
```

Should show:
```
Floor Plans: 2
```

---

**TL;DR:** Select "Sydney Office" or "Melbourne Office" from the location dropdown (NOT "All Locations") to see the floor plan! 🎯


