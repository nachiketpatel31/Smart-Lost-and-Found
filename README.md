# Smart Lost & Found Management System with Hybrid Image + Metadata Engine & Campus Map System

A complete, production-quality MERN (MongoDB, Express, React, Node.js) web application designed for **GSFC University** featuring a **Location & Campus Map System**, **Hybrid Image + Metadata Similarity Engine**, claim verification workflows, physical handovers, and security audit logs.

---

## 🌟 Key Features

1. **Location and Campus Map System (GSFC University)**:
   - **Interactive Leaflet + OpenStreetMap Campus Map**: Centered on GSFC University campus (`[22.3705, 73.1585]`).
   - **Method A (Campus Location Dropdown)**: Pre-configured campus building list (Main Building, Library, Canteen, Computer Lab, Classroom, Laboratory, Parking Area, Hostel, Sports Ground, Security Office, Other).
   - **Method B (Specific Location Details)**: Precision text input (e.g., `"Near Canteen entrance"`).
   - **Method C (Interactive Map Picker)**: Click or drag markers on the Leaflet map to capture coordinates.
   - **Method D (📍 Use My Current Location)**: Custom pre-permission modal popup explaining privacy *before* requesting browser GPS access. Auto-fills coordinates & centers map.
   - **Campus Geofence Boundary Restriction**: Blocks invalid submissions outside GSFC University boundary (`3.5 km` max radius) with `"Please select a location within the university campus."`
   - **Haversine Distance Matching**: Incorporates geographic proximity into the similarity engine.
2. **Dual Role Access Control (User & Admin)**:
   - **Student / Normal User**: Report lost/found items with map locations & photos, search/filter database, view potential matches, submit ownership claims, track status, receive notifications, leave feedback.
   - **Campus Security / Admin**: Access command dashboard, verify claim evidence side-by-side with map previews, approve/reject claims, track handovers, review audit logs.
3. **Hybrid Image + Metadata Similarity Engine**:
   - Viva-friendly matching algorithm combining category match (+25%), campus area (+20%), date proximity (+15%), text keyword overlap (+20%), Haversine physical distance, and image color metrics (+20%).
4. **Duplicate Report Detection**:
   - Live pre-submission check alerting users if a similar report already exists in the same campus area.
5. **Strict Ownership Privacy Safeguards**:
   - Phone numbers, emails, serial numbers, and claim evidence are hidden from public view.

---

## 📁 Exact Files Created & Modified

### **Backend (`server/`)**
- `server/config/campusConfig.js` *(NEW)* — GSFC University coordinates, geofence bounds, location list, and Haversine distance helper.
- `server/models/Item.js` *(MODIFIED)* — Extended schema with `locationName`, `latitude`, `longitude`, `locationSource`.
- `server/controllers/itemController.js` *(MODIFIED)* — Added campus geofence validation and proximity search filtering.
- `server/services/imageMatchingService.js` *(MODIFIED)* — Added Haversine distance location scoring.
- `server/utils/seed.js` *(MODIFIED)* — Seeded GSFC University coordinates for sample items.

### **Frontend (`client/`)**
- `client/src/config/campusConfig.js` *(NEW)* — Frontend campus coordinates & building defaults.
- `client/src/components/CampusMap.jsx` *(NEW)* — Reusable Leaflet map component with OpenStreetMap tiles.
- `client/src/components/LocationPermissionModal.jsx` *(NEW)* — Custom location permission explanation popup.
- `client/src/components/LocationPicker.jsx` *(NEW)* — Integrated Location Picker combining Methods A, B, C, D with geofence validation.
- `client/src/pages/ReportLost.jsx` & `ReportFound.jsx` *(MODIFIED)* — Integrated `LocationPicker`.
- `client/src/pages/ItemDetails.jsx` *(MODIFIED)* — Added interactive Leaflet map for item report location.
- `client/src/pages/Search.jsx` *(MODIFIED)* — Added campus location filter & GPS proximity sorting.
- `client/src/pages/admin/AdminClaims.jsx` *(MODIFIED)* — Added map preview & coordinates to admin claim evidence review.

---

## 📦 Packages Installed

- **Frontend (`client`)**: `leaflet` (v1.9.4) & `@types/leaflet` (Dynamic OpenStreetMap tile rendering).

---

## ⚙️ Environment Variables & Configuration

### `.env` File Template:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_lost_found
JWT_SECRET=super_secret_jwt_key_smart_lost_and_found_2026_5th_sem
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration (Optional - falls back to local uploads if empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### How Campus Coordinates & Boundary are Configured:
Edit `server/config/campusConfig.js` and `client/src/config/campusConfig.js`:
```javascript
export const CAMPUS_CONFIG = {
  universityName: 'GSFC University',
  center: { latitude: 22.3705, longitude: 73.1585 },
  maxRadiusKm: 3.5, // Geofence radius in km
  locations: [
    { name: 'Main Building', latitude: 22.3705, longitude: 73.1585 },
    { name: 'Library', latitude: 22.3708, longitude: 73.1582 },
    { name: 'Canteen', latitude: 22.3701, longitude: 73.1590 },
    ...
  ]
};
```

---

## 📄 Example MongoDB Item Document with Location Data

```json
{
  "_id": "65f8a1b2c3d4e5f678901234",
  "reportId": "LST-2026-000001",
  "type": "lost",
  "itemName": "Black Leather Wallet",
  "category": "Wallets",
  "description": "Black WildHorn leather wallet containing college ID card and emergency cash.",
  "location": "Library",
  "locationName": "Library",
  "specificLocation": "2nd floor reading section near window",
  "latitude": 22.3708,
  "longitude": 73.1582,
  "locationSource": "map_selection",
  "date": "2026-09-15T00:00:00.000Z",
  "time": "14:30",
  "identifyingFeatures": "Small silver brand logo on bottom right corner",
  "images": [
    "https://images.unsplash.com/photo-1627123424574-724758594e93"
  ],
  "reporter": "65f8a1b2c3d4e5f678901001",
  "status": "Potential Match",
  "createdAt": "2026-09-15T14:30:00.000Z",
  "updatedAt": "2026-09-15T14:30:00.000Z"
}
```

---

## 🚀 Windows Setup & How to Run

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB**: Either local MongoDB Server installed or a cloud **MongoDB Atlas** database URI.
  > **Note on MongoDB in Windows**: Having *MongoDB Compass* installed is a visual UI client and does **NOT** mean the MongoDB server is running. Ensure the local Windows service is running via:
  > ```powershell
  > net start MongoDB
  > ```
  > (or open `services.msc` and verify "MongoDB Server" is Running), OR provide a cloud MongoDB Atlas connection URI in your `.env`.

### 1. Configure Environment
Create `.env` in the project root (or copy `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_lost_found
JWT_SECRET=super_secret_jwt_key_smart_lost_and_found_2026_5th_sem
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary configuration for cloud image storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
*(If using MongoDB Atlas, replace `MONGO_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_lost_found?retryWrites=true&w=majority`)*.

### 2. Install Dependencies
Run from the project root:
```bash
npm run install-all
```
*(Installs root concurrently tool, server backend dependencies, and client frontend packages).*

### 3. Seed Database (Optional - Creates Sample Campus Data)
Populates the database with realistic sample lost/found reports, users, claims, and GSFC campus coordinates:
```bash
npm run seed
```
**Default Demo Accounts**:
- **Campus Security Admin**: `admin@college.edu` / `Admin@123`
- **Student User**: `rahul@college.edu` / `User@123`

### 4. Start Application Concurrently
```bash
npm run dev
```
- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧪 Exact Steps to Test Location Features

1. **Report Lost Item with Campus Location**:
   - Click **Report Lost Item**.
   - Select **Library** from Method A dropdown -> Observe map marker auto-position on `[22.3708, 73.1582]`.
2. **Report Found Item with Map Click**:
   - Click **Report Found Item**.
   - Click anywhere on the campus map (Method C) -> Marker places and lat/lng values update.
3. **Test "Use My Current Location"**:
   - Click `[ 📍 Use My Current Location ]` -> Pre-permission modal appears.
   - Click **Allow Location** -> Browser requests GPS -> Map centers on your GPS location.
4. **Test Campus Geofence Boundary**:
   - Drag or click map far outside GSFC University -> Warning `"Please select a location within the university campus."` appears and blocks submission.
5. **View Item Location Map**:
   - Open any submitted item report -> Interactive Leaflet map renders with location marker and popup details.
