# How to Show API Calls During Demo - Step-by-Step Guide

## 🎯 Showing `PUT /api/admin/bookings/{id}/assign` API Call

### Prerequisites
- Browser Developer Tools open
- Network tab visible and active
- Admin account logged in
- At least one booking exists in the system
- At least one technician exists in the system

---

## 📋 Step-by-Step Instructions

### Step 1: Prepare Browser Developer Tools (Before Demo)

1. **Open Developer Tools**:
   - **Chrome/Edge**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - **Firefox**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

2. **Navigate to Network Tab**:
   - Click on the **"Network"** tab in Developer Tools
   - Make sure it's visible (you may need to resize the panel)

3. **Clear Previous Requests** (Optional but recommended):
   - Click the **clear/trash icon** (🚫) to clear existing network requests
   - This makes it easier to see only the new API call

4. **Filter Setup** (Optional):
   - In the filter box, type `api` to filter only API calls
   - Or leave it unfiltered to see all network activity

---

### Step 2: Navigate to Admin Dashboard

1. **Go to Admin Dashboard**:
   - Navigate to `https://fixlyappliance.com/dashboard`
   - Make sure you're logged in as an **ADMIN** user

2. **Open "All Bookings" Tab**:
   - Click on the **"All Bookings"** tab
   - You should see a list of bookings

3. **Find a Booking Without Assigned Technician**:
   - Look for a booking that shows **"Assign Technician"** button (not "Reassign")
   - This ensures you're assigning, not reassigning

---

### Step 3: Show the API Call in Action

#### **Before Clicking "Assign Technician":**

1. **Point Out the Network Tab**:
   - Say: *"Notice I have the Network tab open. This will show us all API calls in real-time."*

2. **Explain What Will Happen**:
   - Say: *"When I assign a technician, this will trigger a PUT request to our backend API."*

#### **Click "Assign Technician" Button:**

1. **Click the Button**:
   - Click **"Assign Technician"** on any booking
   - A dialog/modal will open

2. **Select a Technician**:
   - In the dropdown, select a technician
   - **Don't click "Assign Technician" yet!**

#### **Before Submitting (Important!):**

1. **Point to Network Tab**:
   - Say: *"Watch the Network tab - when I click Assign, you'll see the API call appear here."*

2. **Explain the Endpoint**:
   - Say: *"This will make a PUT request to `/api/admin/bookings/{id}/assign` where {id} is the booking ID."*

#### **Click "Assign Technician" in Dialog:**

1. **Click the "Assign Technician" Button** in the dialog
2. **Immediately Look at Network Tab**:
   - A new request should appear in the Network tab
   - It will be named something like: `assign?bookingId=...` or just `assign`

---

### Step 4: Explain What You See in Network Tab

#### **Find the Request:**

1. **Look for the Request**:
   - Find the request that says `assign` or contains `bookings` and `assign`
   - It should show as a **PUT** request (method column)

2. **Click on the Request**:
   - Click on the request row to expand details
   - You'll see multiple tabs: Headers, Payload, Preview, Response

#### **Show Request Details:**

**Tab 1: Headers**
- **Request URL**: `https://fixlyappliance.com/api/admin/bookings/{booking-id}/assign`
- **Request Method**: `PUT`
- **Status Code**: `200` (if successful)
- **Content-Type**: `application/json`

**Tab 2: Payload (Request Body)**
- Click on **"Payload"** tab
- Show the request body:
  ```json
  {
    "technicianId": "clx1234567890abcdef"
  }
  ```
- **Explain**: *"This is the data we're sending - the technician ID we want to assign."*

**Tab 3: Response**
- Click on **"Response"** tab
- Show the response body:
  ```json
  {
    "id": "booking-id",
    "assignedTechnicianId": "technician-id",
    "date": "2024-01-15",
    "startTime": "10:00",
    "status": "CONFIRMED",
    "technician": {
      "id": "technician-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    ...
  }
  ```
- **Explain**: *"The API returns the updated booking with the assigned technician information."*

---

### Step 5: Explain What Happens Behind the Scenes

While showing the API call, explain:

1. **Authentication**:
   - *"Notice the request includes authentication headers - only admins can access this endpoint."*

2. **Database Update**:
   - *"The API updates the booking record in our PostgreSQL database, linking it to the technician."*

3. **Notifications**:
   - *"Behind the scenes, the system also creates a notification for the technician and sends them an email."*

4. **Real-Time Update**:
   - *"The frontend then refreshes to show the updated booking with the assigned technician."*

---

## 🎤 Script for This Section

### Complete Talking Points:

1. **Before Clicking**:
   ```
   "I have the Network tab open in Developer Tools. This shows us all 
   API calls happening in real-time. When I assign a technician, 
   watch for a PUT request to appear here."
   ```

2. **While Selecting Technician**:
   ```
   "I'm selecting a technician from the dropdown. When I click 
   'Assign Technician', this will trigger a PUT request to our 
   backend API endpoint."
   ```

3. **After Clicking (Point to Network Tab)**:
   ```
   "There it is! You can see the PUT request to 
   '/api/admin/bookings/{id}/assign' appeared in the Network tab. 
   Let me show you the details."
   ```

4. **Show Request Payload**:
   ```
   "In the Payload tab, you can see we're sending the technician ID 
   in JSON format. This is the data our backend needs to make the 
   assignment."
   ```

5. **Show Response**:
   ```
   "The Response tab shows the updated booking object returned from 
   the server. Notice it now includes the assigned technician 
   information. The frontend uses this response to update the UI 
   immediately."
   ```

6. **Explain Backend Operations**:
   ```
   "Behind the scenes, this API endpoint does several things:
   - Validates that the user is an admin
   - Updates the booking record in the database
   - Creates a notification for the technician
   - Sends an email notification
   All of this happens in a single API call, demonstrating the 
   efficiency of our API-driven architecture."
   ```

---

## 🔍 What to Look For

### ✅ Success Indicators:
- **Status Code**: `200 OK` (green)
- **Request Method**: `PUT`
- **Response Time**: Usually < 500ms
- **Response Body**: Contains updated booking with technician info

### ⚠️ If You See Errors:
- **Status 401**: Authentication issue - make sure you're logged in as admin
- **Status 403**: Authorization issue - user doesn't have admin role
- **Status 400**: Bad request - technician ID missing or invalid
- **Status 500**: Server error - check console for details

---

## 💡 Pro Tips

1. **Slow Down**: Don't rush - give the audience time to see the Network tab update

2. **Zoom In**: If presenting on a large screen, zoom the browser so the Network tab is clearly visible

3. **Highlight**: Use your cursor to point to specific parts of the request/response

4. **Explain Status Codes**: Mention what the status code means (200 = success)

5. **Show Multiple Tabs**: Click through Headers, Payload, and Response tabs to show different aspects

6. **Compare**: If you have time, show another API call (like GET /api/admin/bookings) to compare request types

---

## 🎬 Alternative: Show in Console Instead

If Network tab is hard to see, you can also:

1. **Open Console Tab** instead
2. **Add Console Logging** (if you have access to modify code):
   ```javascript
   console.log('Assigning technician:', technicianId);
   ```
3. **Or Explain**: *"In production, we'd add logging to track these API calls, but for now, the Network tab shows us everything."*

---

## 📸 Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│  Browser Window                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Admin Dashboard - All Bookings Tab                │ │
│  │  [Booking 1] [Assign Technician]                   │ │
│  │  [Booking 2] [Assign Technician]                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Developer Tools - Network Tab                      │ │
│  │  ┌───────────────────────────────────────────────┐ │ │
│  │  │ Name          Method  Status  Type            │ │ │
│  │  │ assign        PUT     200     xhr             │ │ │ ← Point here!
│  │  │ bookings      GET     200     xhr             │ │ │
│  │  └───────────────────────────────────────────────┘ │ │
│  │                                                     │ │
│  │  [Headers] [Payload] [Preview] [Response]          │ │
│  │  ┌───────────────────────────────────────────────┐ │ │
│  │  │ Payload:                                      │ │ │
│  │  │ {                                             │ │ │
│  │  │   "technicianId": "clx123..."                │ │ │
│  │  │ }                                             │ │ │
│  │  └───────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Takeaways to Emphasize

1. **API-Driven**: Every action triggers an API call
2. **Real-Time**: Network tab shows requests as they happen
3. **RESTful**: Using standard HTTP methods (PUT for updates)
4. **Structured Data**: JSON format for request/response
5. **Error Handling**: Status codes indicate success/failure
6. **Efficiency**: Single API call handles multiple operations

---

**Practice this a few times before your presentation to ensure smooth execution!** 🚀

