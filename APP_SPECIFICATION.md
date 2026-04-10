# Evolute_v3 NEMT App - Technical Specification

**Version:** 1.0  
**Date:** April 2026  
**Status:** Specification (Pre-Development)

---

## 1. Product Overview

### 1.1 What is Evolute_v3?
Evolute_v3 is a Non-Emergency Medical Transportation (NEMT) service provider that offers chaperoned rides for passengers requiring medical-related transportation. The app serves as the operational backbone for managing and tracking active rides in real-time.

### 1.2 Purpose
The Evolute_v3 app provides dispatchers, operations managers, drivers, and chaperones with a centralized platform to:
- Track active rides in real-time with live location and status updates
- Manage driver and chaperone assignments and availability
- Maintain visibility into ride operations and schedule
- Ensure safe, reliable medical transportation service delivery

### 1.3 Target Users
- **Dispatchers:** Create rides, assign drivers/chaperones, manage operations
- **Operations Managers:** Monitor KPIs, view full operational picture, manage staff
- **Drivers:** Accept/view assignments, update ride status, navigate to pickups/dropoffs
- **Chaperones:** View assignments, manage passenger needs during rides

### 1.4 Core Value Proposition
Real-time visibility into NEMT operations with a simple, reliable interface that ensures timely, safe medical transportation.

---

## 2. Core Features

### 2.1 Dashboard

**Purpose:** Provide operations staff with a quick overview of the day's activity and current operational status.

**Key Sections:**
1. **Top Metrics Bar**
   - Total rides today (count)
   - On-time completion rate (%)
   - Active vehicles (count)
   - Drivers on duty (count)
   - Chaperones on duty (count)

2. **Ride Status Summary**
   - Pie or donut chart showing ride status breakdown:
     - Scheduled (not yet started)
     - Driver En Route (to passenger)
     - Passenger Picked Up
     - In Transit (to destination)
     - Arrived (at destination)
     - Completed
   - Displays count for each status

3. **Today's Schedule**
   - Chronological list of upcoming rides (next 8 hours)
   - Each ride shows: time, passenger name, pickup location, driver name
   - Color-coded status badge
   - Click to expand for full details or jump to Ride Detail view

4. **Active Rides Quick View**
   - Scrollable list of currently active rides (status between Scheduled and In Transit)
   - Shows: passenger, status, ETA, driver name
   - Click action goes to Active Rides Tracking page

5. **Alerts & Notifications Section**
   - Overdue rides (rides past expected ETA)
   - Driver status changes (offline/offline)
   - Critical notes on rides (medical flags, accessibility needs)
   - Dismissible alert items

**Refresh Rate:** Data updates every 10-15 seconds (mock data will simulate this)

---

### 2.2 Active Rides Tracking

**Purpose:** Display all in-progress rides with real-time status, allowing quick monitoring and drill-down into details.

**Main List View:**
- **Columns/Data Points per Ride:**
  - Ride ID / Confirmation #
  - Passenger Name
  - Pickup Location → Dropoff Location
  - Assigned Driver
  - Assigned Chaperone
  - Current Status (with color badge)
  - ETA to Destination
  - Scheduled Time
  - Actions (View Details, Edit, Call Driver)

**Status Indicators (Color-Coded):**
- **Scheduled** — Gray | Not yet dispatched
- **Driver En Route** — Yellow | Driver heading to passenger
- **Passenger Picked Up** — Blue | En route to destination
- **In Transit** — Blue | In progress
- **Arrived** — Green | At destination, awaiting completion
- **Completed** — Dark Gray | Ride finished
- **Cancelled** — Red | Ride cancelled
- **No-Show** — Orange | Passenger did not appear

**Interactions:**
- Click row to open Ride Detail View
- Sort by: status, time, driver, chaperone
- Filter by: status, driver, chaperone, time range
- Bulk actions (future): reassign, cancel

**View Options:**
- List view (default)
- Map view (future): shows active rides with pins, live driver location

---

### 2.3 Ride Detail View

**Purpose:** Show comprehensive information about a single ride with ability to manage status and reassignments.

**Information Sections:**

1. **Ride Header**
   - Ride ID / Confirmation #
   - Current Status (prominent badge)
   - Scheduled Time vs. Actual Time
   - Last updated timestamp

2. **Passenger Information**
   - Name
   - Phone number (with call button)
   - Age/DOB (if available)
   - Accessibility needs / Medical alerts
   - Special instructions / Medical notes
   - Passenger's emergency contact

3. **Route Information**
   - Pickup address (with "View Map" link)
   - Dropoff address (with "View Map" link)
   - Pickup time (scheduled)
   - Scheduled arrival time
   - Actual pickup time (if available)
   - Actual arrival time (if available)
   - Estimated distance / duration

4. **Assignment Information**
   - **Driver:**
     - Name (click to view driver profile)
     - License plate / Vehicle info
     - Phone number (with call button)
     - Current location (if available)
     - ETA to pickup/destination
   - **Chaperone:**
     - Name (click to view chaperone profile)
     - Certifications
     - Phone number (with call button)
     - Status

5. **Ride Timeline / History**
   - Chronological list of status updates:
     - Timestamp
     - Status changed to [status]
     - Changed by [user/system]
     - Additional notes (if any)

6. **Medical/Special Instructions**
   - Full text of any medical notes
   - Accessibility accommodations needed
   - Behavioral notes
   - Dietary restrictions (if relevant)

7. **Actions Section**
   - **Update Status** button (dropdown menu with valid next statuses)
   - **Reassign Driver** button (opens modal to select new driver)
   - **Reassign Chaperone** button (opens modal to select new chaperone)
   - **Add Note** button (text field to append to ride record)
   - **Cancel Ride** button (with confirmation dialog)
   - **Contact Driver** / **Contact Chaperone** buttons (phone dial links)

8. **Map Section (Future)**
   - Embedded map showing pickup/dropoff locations
   - Live driver location pin (when in transit)

---

### 2.4 Driver Management

**Purpose:** View driver roster, manage availability, and monitor driver performance.

**Driver List View:**
- **Columns:**
  - Driver Name
  - Current Status (Available / On Ride / Off-Duty)
  - Phone Number
  - Vehicle (License Plate + Make/Model)
  - Current Rides (count)
  - Next Scheduled Ride Time
  - Total Rides Today (count)
  - On-Time Percentage

**Filtering & Sorting:**
- Filter by: status, vehicle, certification type
- Sort by: name, status, rides completed, on-time rate

**Driver Profile Card (Click row to expand):**
- **Personal Info**
  - Full name
  - Phone
  - Email
  - License number + expiration
  - Date of hire
  - Years of service

- **Vehicle Information**
  - License plate
  - Make, model, year
  - Current mileage
  - Last service date
  - Inspection status (valid/expired)

- **Certifications & Requirements**
  - Background check (status + date)
  - Medical transport certification
  - First aid / CPR certification (status + expiration)
  - Defensive driving course (status + date)

- **Performance Metrics (Today)**
  - Rides completed
  - On-time rate %
  - Average rating (if passenger ratings exist)
  - Cancellations

- **Current & Upcoming Rides**
  - List of rides assigned today
  - Statuses and ETAs

- **Availability Toggle**
  - Button to mark Available / Off-Duty
  - Confirmation required for status change

---

### 2.5 Chaperone Management

**Purpose:** View chaperone roster, manage availability, and track assignments.

**Chaperone List View:**
- **Columns:**
  - Chaperone Name
  - Current Status (Available / On Assignment / Off-Duty)
  - Phone Number
  - Current Assignment (if on-duty)
  - Rides Today (count)
  - Certifications (badge indicators)

**Filtering & Sorting:**
- Filter by: status, certification type, experience level
- Sort by: name, status, rides completed

**Chaperone Profile Card (Click row to expand):**
- **Personal Info**
  - Full name
  - Phone
  - Email
  - Date of hire
  - Years of service

- **Certifications & Requirements**
  - Background check (status + date)
  - Medical transport certification (expiration)
  - First aid / CPR certification (expiration)
  - Specialized training (dementia care, mobility assistance, etc.)

- **Current & Upcoming Assignments**
  - List of rides assigned today
  - Passenger names, pickup/dropoff, times

- **Availability Toggle**
  - Button to mark Available / Off-Duty
  - Confirmation required for status change

---

### 2.6 Ride History

**Purpose:** Provide searchable, filterable log of completed and historical rides for reporting and auditing.

**History List View:**
- **Columns:**
  - Date / Time
  - Ride ID
  - Passenger Name
  - Driver
  - Chaperone
  - Pickup → Dropoff (abbreviated)
  - Status (Completed / Cancelled / No-Show)
  - On-Time? (Yes / No / N/A)

**Filters & Search:**
- Date range picker (from / to dates)
- Search by: Ride ID, Passenger Name, Driver Name
- Filter by: Status (Completed, Cancelled, No-Show), Driver, Chaperone
- Sort by: date (newest first), passenger, driver

**Ride History Detail (Click row):**
- Full ride information (same as Ride Detail View)
- Completion time
- Total duration
- Notes added during ride
- Driver feedback / ratings (if collected)

**Export Function (Future):**
- Export selected rides to CSV
- Export to PDF report format

---

### 2.7 Settings

**Purpose:** Configure organizational settings and user preferences.

**Settings Sections:**

1. **Organization Profile**
   - Organization name
   - Address
   - Phone number
   - Website
   - Operating hours
   - Service area (geographic boundaries)

2. **General Settings**
   - Dashboard refresh rate
   - Time zone
   - Date/time format preferences
   - Units (miles vs. km)

3. **Notification Preferences**
   - Email notification toggles (ride created, status change, alert)
   - SMS notification toggles
   - In-app notification settings
   - Do not disturb hours

4. **User Management (Future)**
   - List of app users
   - Role assignments (Admin, Dispatcher, Driver, Chaperone, Viewer)
   - Add/remove users
   - Permission management

5. **About**
   - App version
   - API version
   - Last updated info

---

## 3. Data Model

### 3.1 Core Entities

#### **Ride**
```
{
  id: string (UUID)                          // Unique ride identifier
  confirmationNumber: string                  // Human-readable confirmation #
  passengerId: string                         // Reference to Passenger
  driverId: string (nullable)                 // Assigned driver
  chaperoneId: string (nullable)              // Assigned chaperone
  pickupTime: datetime                        // Scheduled pickup time
  estimatedArrivalTime: datetime              // Scheduled arrival time
  actualPickupTime: datetime (nullable)       // When passenger was actually picked up
  actualArrivalTime: datetime (nullable)      // When ride arrived at destination
  status: enum                                // Current ride status
  pickupAddress: string                       // Full address or venue name
  dropoffAddress: string                      // Full address or venue name
  estimatedDistance: number                   // In miles
  estimatedDuration: number                   // In minutes
  medicalNotes: string                        // Any medical-relevant information
  specialInstructions: string                 // Driver/chaperone instructions
  accessibilityNeeds: string[]                // Array: wheelchair, mobility, etc.
  createdAt: datetime
  updatedAt: datetime
  createdBy: string                           // User who created the ride
  cancelledAt: datetime (nullable)
  cancelledBy: string (nullable)
  cancelReason: string (nullable)
}

// Status enum values:
"Scheduled" | "DriverEnRoute" | "PassengerPickedUp" | "InTransit" | "Arrived" | "Completed" | "Cancelled" | "NoShow"
```

#### **Driver**
```
{
  id: string (UUID)
  firstName: string
  lastName: string
  phone: string
  email: string
  licenseNumber: string
  licenseExpiration: date
  backgroundCheckStatus: enum               // "Verified" | "Pending" | "Expired"
  backgroundCheckDate: date
  medicalTransportCertified: boolean
  firstAidCertified: boolean
  firstAidExpirationDate: date (nullable)
  defensiveDrivingCertified: boolean
  defensiveDrivingDate: date (nullable)
  vehicleId: string                         // Reference to Vehicle
  status: enum                              // "Available" | "OnRide" | "OffDuty"
  hireDate: date
  yearsOfService: number
  totalRidesCompleted: number
  onTimePercentage: number (0-100)
  averageRating: number (1-5, nullable)     // If ratings exist
  isActive: boolean
  createdAt: datetime
  updatedAt: datetime
}
```

#### **Chaperone**
```
{
  id: string (UUID)
  firstName: string
  lastName: string
  phone: string
  email: string
  backgroundCheckStatus: enum               // "Verified" | "Pending" | "Expired"
  backgroundCheckDate: date
  medicalTransportCertified: boolean
  medicalTransportExpiration: date (nullable)
  firstAidCertified: boolean
  firstAidExpiration: date (nullable)
  cprCertified: boolean
  cprExpiration: date (nullable)
  specializations: string[]                 // ["dementia_care", "mobility_assistance", "pediatric", etc.]
  status: enum                              // "Available" | "OnAssignment" | "OffDuty"
  hireDate: date
  yearsOfService: number
  totalAssignmentsCompleted: number
  isActive: boolean
  createdAt: datetime
  updatedAt: datetime
}
```

#### **Passenger**
```
{
  id: string (UUID)
  firstName: string
  lastName: string
  dateOfBirth: date
  phone: string
  email: string (nullable)
  primaryAddress: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  medicalAlerts: string[]                   // Array of medical conditions/alerts
  accessibilityNeeds: string[]              // ["wheelchair", "mobility_aid", "visual_impairment", etc.]
  mobilityRequirements: string (nullable)   // Detailed mobility notes
  behavioralNotes: string (nullable)        // Any behavioral considerations
  dietaryRestrictions: string (nullable)
  preferredDrivers: string[] (nullable)      // Array of driver IDs (if applicable)
  frequentPassenger: boolean
  createdAt: datetime
  updatedAt: datetime
}
```

#### **Vehicle**
```
{
  id: string (UUID)
  licensePlate: string
  vin: string
  make: string
  model: string
  year: number
  color: string
  mileage: number
  fuelType: enum                            // "Gas" | "Electric" | "Hybrid"
  lastServiceDate: date
  lastInspectionDate: date
  inspectionExpirationDate: date
  wheelchairAccessible: boolean
  capacity: number                          // Number of passengers
  amenities: string[]                       // ["wifi", "charging", "climate_control", etc.]
  assignedDriverId: string (nullable)
  status: enum                              // "Active" | "InService" | "Maintenance"
  createdAt: datetime
  updatedAt: datetime
}
```

#### **RideStatusUpdate**
```
{
  id: string (UUID)
  rideId: string                            // Reference to Ride
  previousStatus: string
  newStatus: string
  changedAt: datetime
  changedBy: string                         // User ID or system
  notes: string (nullable)                  // Optional context for status change
  latitude: number (nullable)               // Location when status changed
  longitude: number (nullable)
  createdAt: datetime
}
```

#### **User (Future)**
```
{
  id: string (UUID)
  email: string
  firstName: string
  lastName: string
  role: enum                                // "Admin" | "Dispatcher" | "Driver" | "Chaperone" | "Viewer"
  phone: string
  isActive: boolean
  lastLoginAt: datetime (nullable)
  createdAt: datetime
  updatedAt: datetime
}
```

### 3.2 Data Relationships
```
Ride → Passenger (many to one)
Ride → Driver (many to one)
Ride → Chaperone (many to one)
Driver → Vehicle (many to one)
RideStatusUpdate → Ride (many to one)
```

---

## 4. Page-by-Page Wireframe Descriptions

### 4.1 Dashboard

**Layout:** Two-column with top metrics bar

**Header Section:**
- Navigation menu (hamburger on mobile)
- Evolute_v3 logo / title
- Current date and time
- User avatar / logout menu

**Top Metrics Bar (Full Width):**
- 5 metric cards in a row (responsive: 3 on tablet, 1 per row on mobile)
- Each metric shows: label, number, and icon
- Slight shadow/elevation for visual hierarchy

**Main Content Area (Two Column on Desktop):**
- **Left Column (60%):**
  - "Today's Schedule" section (upcoming rides)
  - Expandable ride cards showing time, passenger, driver, status
  - Scroll if more than 5 rides
  
- **Right Column (40%):**
  - "Ride Status Summary" pie/donut chart
  - "Alerts & Notifications" scrollable list
  - Badge indicators for count of alerts

**Refresh Indicator:**
- Subtle timestamp showing "Last updated: [time]"
- Auto-refresh every 10-15 seconds (visual indicator)

---

### 4.2 Active Rides Tracking

**Layout:** Full-width list with toolbar

**Header:**
- Page title "Active Rides"
- Count badge: "15 rides in progress"

**Toolbar (Above List):**
- Search field (search by passenger name, ride ID)
- Filter button (status, driver, chaperone, time range)
- View toggle (list vs. map)
- Refresh button

**Data Table:**
- Sortable columns (click column header to sort)
- Alternating row background colors (white, light gray) for readability
- Color-coded status badges for each row
- Hover state shows available actions (View Details, Call Driver)

**Empty State:**
- If no active rides: "No active rides. Check the dashboard for today's schedule."

**Mobile Responsiveness:**
- On mobile: hide some columns (ETA, Chaperone), show in expanded row detail
- Stack actions vertically

---

### 4.3 Ride Detail

**Layout:** Single column with sections

**Header Section:**
- Back button
- Ride ID / Confirmation #
- Large status badge
- Edit button (future: toggle edit mode)

**Main Content Sections (Stacked Vertically):**

1. **Ride Summary Card**
   - Pickup → Dropoff with icons
   - Scheduled time vs. actual
   - Status timeline (visual progress bar showing where ride is in lifecycle)

2. **Passenger Information Card**
   - Name, phone (clickable to call)
   - Medical alerts in prominent red/orange
   - Accessibility needs with icons
   - Emergency contact info

3. **Assignment Card**
   - Driver: name (click to profile), vehicle, phone (call button)
   - Chaperone: name (click to profile), certifications, phone (call button)
   - Each with reassign button

4. **Route & Timeline Card**
   - Pickup address (with map link)
   - Dropoff address (with map link)
   - Distance and estimated duration
   - Status history timeline (vertical timeline of updates)

5. **Medical & Special Instructions Card**
   - Full text of medical notes
   - Special instructions
   - Accessibility accommodations

6. **Actions Card (Bottom)**
   - Status dropdown (shows valid next statuses)
   - Reassign Driver button
   - Reassign Chaperone button
   - Add Note text field
   - Cancel Ride button (with warning)

**Mobile Responsiveness:**
- Single column on all breakpoints
- Buttons full-width on mobile
- Phone numbers with tel: links (native dial)

---

### 4.4 Driver Management

**Layout:** Responsive grid/list with sidebar filters

**Header:**
- Page title "Driver Management"
- Total drivers count
- Drivers on duty count

**Filters Sidebar (Left, collapsible on mobile):**
- Status filter (checkboxes)
- Vehicle filter (dropdown)
- Certification filters (checkboxes)
- Clear filters button

**Main List (Right):**
- Data table with sortable columns
- Row click expands driver profile in overlay/modal
- Color-coded status badges
- Action buttons: View Profile, Call, Toggle Availability

**Driver Profile Modal/Panel:**
- Stacked sections: Personal Info, Vehicle, Certifications, Today's Performance, Rides, Availability Toggle
- Close button
- All information in read-only mode unless edit mode enabled (future)

**Mobile Responsiveness:**
- Filters in collapsible drawer
- List becomes card-based layout on mobile
- Tap card to expand profile

---

### 4.5 Chaperone Management

**Layout:** Similar to Driver Management

**Header:**
- Page title "Chaperone Management"
- Total chaperones count
- Chaperones on duty count

**Filters Sidebar:**
- Status filter (checkboxes)
- Certification filters (checkboxes)
- Specialization filters (checkboxes)
- Clear filters button

**Main List:**
- Data table with sortable columns
- Row click expands chaperone profile
- Certification badges displayed inline
- Action buttons: View Profile, Call, Toggle Availability

**Chaperone Profile Modal/Panel:**
- Sections: Personal Info, Certifications, Specializations, Today's Assignments, Availability Toggle

---

### 4.6 Ride History

**Layout:** List with advanced filters

**Header:**
- Page title "Ride History"
- Total rides in view count

**Filter & Search Area:**
- Search field (ride ID, passenger name, driver)
- Date range picker (from/to)
- Status filter (multi-select dropdown)
- Driver filter (dropdown)
- Chaperone filter (dropdown)
- Apply Filters button
- Clear Filters button
- Export button (future)

**Data Table:**
- Sortable columns
- Color-coded status badges
- On-time indicator (checkmark or X)
- Row click opens full ride detail (read-only)

**Pagination:**
- Show X rows per page (25, 50, 100)
- Previous/Next buttons
- Page indicator (e.g., "Page 3 of 47")

**Mobile Responsiveness:**
- Filters in collapsible drawer
- List becomes simplified card view
- Show fewer columns on mobile

---

### 4.7 Settings

**Layout:** Two-column with navigation sidebar

**Sidebar (Left, collapsible on mobile):**
- Settings menu items (Organization, General, Notifications, Users, About)
- Highlight active section

**Main Content (Right):**
- Settings form for selected section
- Form inputs vary by section
- Save button at bottom

**Organization Profile Section:**
- Text inputs for org name, address, phone, website
- Service area map picker (future)
- Operating hours time pickers

**General Settings Section:**
- Dropdowns for refresh rate, time zone, date format
- Checkbox for metric units

**Notification Preferences Section:**
- Toggle switches for each notification type
- Time range picker for "Do not disturb"

**About Section:**
- Read-only info display
- No edit controls

---

## 5. User Flows

### 5.1 Dispatcher Creates a New Ride

**Flow Steps:**
1. Dispatcher is on Dashboard or Active Rides page
2. Clicks "New Ride" or "Create Ride" button
3. Modal/form opens with fields:
   - Passenger (search existing or create new)
   - Pickup address
   - Dropoff address
   - Pickup time
   - Special instructions / medical notes
   - Accessibility needs
4. Dispatcher clicks "Find Driver & Chaperone" or selects manually
   - System shows available drivers/chaperones sorted by proximity or availability
   - Dispatcher selects driver and chaperone
5. Dispatcher reviews ride summary
6. Clicks "Create Ride" to confirm
7. System assigns ride, creates confirmation number
8. Confirmation sent to driver and chaperone (SMS/notification)
9. Ride appears in Active Rides list and Dashboard
10. Dispatcher can monitor ride from Active Rides or Ride Detail

---

### 5.2 Driver Starts and Completes a Ride

**Flow Steps:**

**Starting a Ride:**
1. Driver receives notification of assigned ride (SMS/app notification)
2. Driver opens app, sees "Assigned Rides" section with new ride
3. Driver reviews ride: passenger name, pickup address, special instructions
4. Driver clicks "Start Ride" or "En Route"
5. Status updates to "DriverEnRoute"
6. Driver's location is tracked (if location services enabled)
7. Driver navigates to pickup address (Google Maps integration, future)

**Picking Up Passenger:**
8. Driver arrives at pickup location
9. Driver clicks "Passenger Picked Up"
10. Status updates to "PassengerPickedUp"
11. Driver confirms passenger name and any accessibility needs
12. Driver navigates to dropoff address

**Completing the Ride:**
13. Driver arrives at destination
14. Driver clicks "Arrived"
15. Status updates to "Arrived"
16. Passenger exits vehicle, driver confirms
17. Driver clicks "Complete Ride"
18. Status updates to "Completed"
19. Ride is moved to history

**Notes:**
- Driver can add notes at any point
- If issues arise (passenger not ready, traffic), driver can update status with notes
- Driver cannot skip statuses (must go Scheduled → EnRoute → PickedUp → InTransit → Arrived → Completed)

---

### 5.3 Chaperone Assignment Flow

**Flow Steps:**
1. Dispatcher creates ride (see flow 5.1)
2. At step 4, dispatcher selects chaperone from available list
3. Chaperone receives notification of assignment
4. Chaperone opens app, sees "Assigned Rides" section with ride
5. Chaperone reviews ride: passenger name, pickup time, location, medical notes, specializations needed
6. Chaperone meets driver at specified time/location (or gets picked up)
7. Chaperone is present for ride with passenger
8. Chaperone notes any issues (passenger behavior, medical events, accessibility needs met)
9. At completion, chaperone confirms ride is finished
10. Chaperone can add post-ride notes (passenger condition, feedback)

**Notifications:**
- Chaperone receives SMS/push notification when assigned
- Reminder 30 minutes before pickup time
- Real-time updates if ride status changes or is delayed

---

### 5.4 Ride Status Update Flow

**Dispatcher/Driver can update status:**
1. Open Ride Detail view
2. Click "Update Status" button
3. Dropdown shows available next statuses (context-aware)
   - From "Scheduled": can go to "DriverEnRoute" or "Cancelled"
   - From "DriverEnRoute": can go to "PassengerPickedUp" or back to "Scheduled"
   - From "PassengerPickedUp": can go to "InTransit" or back to "DriverEnRoute"
   - etc.
4. Select new status
5. Optional: Add note explaining status change (e.g., "Traffic on I-95, ETA delayed 10 min")
6. Click "Confirm"
7. Status updates immediately
8. RideStatusUpdate record created with timestamp and user
9. All viewers of this ride see status update in real-time (if live data enabled)
10. If status is critical (Cancelled, No-Show), dispatcher is notified via alert

---

## 6. Technical Architecture

### 6.1 Tech Stack

**Frontend:**
- **Framework:** Next.js 16+ (React 19+)
- **Build/Deploy:** Static export (output: export in next.config.ts)
- **Hosting:** Netlify (static site)
- **Styling:** Tailwind CSS v4
- **State Management:** React Context + useState (no Redux/Zustand yet)
- **UI Components:** Custom components (HTML/JSX) + Headless UI for accessibility
- **Data Fetching:** Mock data initially (simulated JSON in localStorage or in-memory)

**Mock Data:**
- JSON files or TypeScript objects with sample Rides, Drivers, Chaperones, Passengers
- Simulated real-time updates (setInterval to update ride statuses)
- Mock "current time" to simulate ride progression

**Future Backend:**
- Node.js + Express (or Next.js API routes)
- PostgreSQL database
- Supabase for real-time data sync (WebSocket subscriptions)
- Location services (Google Maps API)

### 6.2 Key Architectural Decisions

1. **Static Export:**
   - App is built as static HTML/CSS/JS
   - No server-side rendering
   - Configuration: `next.config.ts` with `output: "export"`
   - Images must have `unoptimized: true`

2. **Mock Data Layer:**
   - Data fetched from in-memory mock store or localStorage
   - Simulates API responses
   - Easy to swap out for real API later
   - No changes needed to component structure

3. **Real-Time Updates (Future):**
   - Supabase real-time subscriptions (WebSocket)
   - Subscribe to Ride, Driver, Chaperone tables
   - Auto-update components when data changes
   - Polling fallback if WebSocket unavailable

4. **Responsive Design:**
   - Mobile-first breakpoints: 640px (tablet), 1024px (desktop)
   - Touch-friendly tap targets (48px minimum)
   - Collapsible navigation on mobile
   - Simplified data tables on mobile (show essential columns)

5. **State Management:**
   - React Context for global app state (auth, current user, UI preferences)
   - Local component state for forms and UI interactions
   - No complex state management library (avoid over-engineering)

6. **Accessibility:**
   - Semantic HTML5 elements
   - ARIA labels and roles
   - Keyboard navigation support
   - Color contrast ratios ≥ 4.5:1 (WCAG AA)
   - Screen reader tested components

### 6.3 File Structure (Next.js App Router)

```
evolute-v2/
├── app/
│   ├── layout.tsx                 // Root layout
│   ├── page.tsx                   // Dashboard (home)
│   ├── active-rides/
│   │   └── page.tsx               // Active Rides list
│   ├── rides/
│   │   └── [id]/
│   │       └── page.tsx           // Ride detail
│   ├── drivers/
│   │   └── page.tsx               // Driver management
│   ├── chaperones/
│   │   └── page.tsx               // Chaperone management
│   ├── history/
│   │   └── page.tsx               // Ride history
│   ├── settings/
│   │   └── page.tsx               // Settings
│   └── api/                        // (Placeholder for future backend)
├── components/
│   ├── dashboard/
│   │   ├── MetricsBar.tsx
│   │   ├── StatusSummary.tsx
│   │   └── ScheduleSection.tsx
│   ├── rides/
│   │   ├── RideList.tsx
│   │   ├── RideCard.tsx
│   │   ├── RideDetail.tsx
│   │   └── StatusBadge.tsx
│   ├── drivers/
│   │   ├── DriverList.tsx
│   │   ├── DriverCard.tsx
│   │   └── DriverProfile.tsx
│   ├── chaperones/
│   │   ├── ChaperoneList.tsx
│   │   ├── ChaperoneCard.tsx
│   │   └── ChaperoneProfile.tsx
│   ├── common/
│   │   ├── Navigation.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── MainLayout.tsx
├── lib/
│   ├── data/                      // Mock data
│   │   ├── rides.ts
│   │   ├── drivers.ts
│   │   ├── chaperones.ts
│   │   ├── passengers.ts
│   │   └── vehicles.ts
│   ├── types/                     // TypeScript types
│   │   └── index.ts
│   ├── utils/                     // Utility functions
│   │   ├── formatting.ts
│   │   ├── dateTime.ts
│   │   └── statusHelpers.ts
│   ├── hooks/                     // Custom React hooks
│   │   ├── useRides.ts
│   │   ├── useDrivers.ts
│   │   └── useFilter.ts
│   └── services/                  // Data fetching (mock or real)
│       └── api.ts
├── styles/
│   ├── globals.css                // Tailwind global styles
│   └── variables.css              // CSS custom properties (colors, etc.)
├── public/                        // Static assets
│   ├── logo.svg
│   ├── icons/
│   └── placeholder-images/
├── APP_SPECIFICATION.md           // This file
├── README.md
├── next.config.ts                 // Next.js config (output: export)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 6.4 Key Component Props & Interfaces

**RideListProps:**
```typescript
interface RideListProps {
  rides: Ride[];
  isLoading: boolean;
  onRideClick: (rideId: string) => void;
  filters?: {
    status?: string;
    driver?: string;
    chaperone?: string;
  };
}
```

**RideDetailProps:**
```typescript
interface RideDetailProps {
  rideId: string;
  onStatusUpdate: (newStatus: string, notes?: string) => void;
  onDriverReassign: (newDriverId: string) => void;
  onChaperoneReassign: (newChaperoneId: string) => void;
}
```

**StatusBadgeProps:**
```typescript
interface StatusBadgeProps {
  status: RideStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}
```

---

## 7. Design Direction

### 7.1 Visual Identity

**Color Palette:**
- **Primary:** Teal/Blue (#0891b2 or similar) — trust, healthcare, transportation
- **Secondary:** Light Teal (#06b6d4) — highlights, active states
- **Success:** Green (#10b981) — completed, on-time, available
- **Warning:** Amber (#f59e0b) — delays, pending, caution
- **Error/Alert:** Red (#ef4444) — cancelled, urgent, overdue
- **Neutral:**
  - White (#ffffff) — backgrounds
  - Light Gray (#f3f4f6) — alternating rows, cards
  - Medium Gray (#6b7280) — secondary text
  - Dark Gray (#1f2937) — primary text
  - Near Black (#111827) — headings

**Typography:**
- **Font Family:** Inter, system sans-serif (no serif fonts)
- **Headings:** 24px (h1), 20px (h2), 16px (h3), bold weight
- **Body Text:** 14px, regular weight, line-height 1.5
- **Small Text:** 12px, secondary info, medium gray color

**Spacing:**
- Base unit: 4px
- Padding: 8px, 12px, 16px, 24px, 32px
- Margin: same scale
- Component gaps: 16px typical

**Borders & Shadows:**
- Border radius: 4px (inputs, buttons), 8px (cards)
- Shadow: subtle (box-shadow: 0 1px 3px rgba(0,0,0,0.1))
- Card elevations (hover): slightly increased shadow

### 7.2 Component Design Patterns

**Buttons:**
- **Primary:** Teal background, white text, 12px padding, rounded 4px
- **Secondary:** White background, teal border, teal text
- **Danger:** Red background, white text
- **States:** Hover (darker shade), Active (pressed), Disabled (gray, 50% opacity)
- **Sizes:** Small (28px height), Medium (36px), Large (44px)

**Form Inputs:**
- Light gray background (#f9fafb)
- Teal border on focus (2px)
- Placeholder text in medium gray
- Label above field, bold, 12px
- Error message below in red, small font

**Data Tables:**
- Header row: light gray background, bold text, teal text for sortable columns
- Body rows: alternating white/light gray backgrounds
- Hover state: darker gray background
- Right-aligned numbers
- Left-aligned text

**Status Badges:**
- Inline badges with color backgrounds and white text
- Rounded corners (8px)
- Padding: 4px 8px
- Font-weight: 500
- Colors per status type (see Color Palette)

**Cards:**
- White background
- Light border (1px, light gray)
- Rounded 8px
- Padding: 16px
- Shadow on desktop, lighter on mobile

**Modals/Overlays:**
- Dark overlay (rgba(0,0,0,0.5))
- Centered card
- Close button (X) in top-right
- Action buttons at bottom (right-aligned)

### 7.3 Responsive Design Principles

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: ≥ 1024px

**Mobile-First Approach:**
- Design mobile layout first
- Stack vertically on mobile
- Expand to multi-column on tablet/desktop
- Hide less-critical columns on mobile (show in row expand)
- Full-width buttons on mobile
- Touch targets ≥ 48px × 48px

**Navigation:**
- Desktop: Sidebar (persistent)
- Tablet: Top nav with collapsible sidebar
- Mobile: Hamburger menu (drawer/modal)

**Data Tables:**
- Desktop: Full table with all columns
- Tablet: Fewer columns, horizontal scroll if needed
- Mobile: Card-based layout, tap to expand details

**Images & Icons:**
- SVG icons (scalable)
- Responsive images (srcset for different sizes)
- No icons smaller than 16px × 16px

### 7.4 Accessibility Standards (WCAG 2.1 AA)

**Compliance Requirements:**
- Semantic HTML5 elements (<button>, <header>, <nav>, <main>, <article>)
- ARIA labels for screen readers: role, aria-label, aria-describedby
- Keyboard navigation: Tab order logical, Enter/Space for buttons
- Color contrast: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- Focus indicators: visible blue outline (2px)
- Form labels: associated <label> elements (not placeholder-only)
- Error messages: associated with form fields, clear text
- Images: alt text (meaningful, concise)
- Links: descriptive link text (not "click here")

**Testing:**
- Browser DevTools Lighthouse audit
- Keyboard-only navigation testing
- Screen reader testing (NVDA, JAWS on Windows; VoiceOver on Mac)

### 7.5 Dark Mode (Future Enhancement)

**Considerations:**
- Light gray backgrounds become dark gray (#1f2937)
- Text colors invert (light text on dark)
- Primary teal remains same hue but adjusted lightness (lighter on dark)
- Borders more subtle
- No pure black or pure white (eye strain)
- Toggle in Settings (system preference or manual)

---

## 8. Success Criteria & Launch Checklist

### 8.1 MVP Features (Must Have for Launch)
- [ ] Dashboard with metrics and today's schedule
- [ ] Active Rides list with filtering and sorting
- [ ] Ride Detail view with status management
- [ ] Driver roster and availability toggle
- [ ] Chaperone roster and availability toggle
- [ ] Ride History with search and filtering
- [ ] Settings page (basic)
- [ ] Mock data populating all screens
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] WCAG AA accessibility compliance

### 8.2 Testing Requirements
- [ ] All pages load without errors
- [ ] Filters and searches work correctly
- [ ] Status updates reflect in mock data
- [ ] Responsive design tested on: iPhone SE, iPad, MacBook (Chrome, Safari)
- [ ] Keyboard navigation functional on all pages
- [ ] Screen reader testing (at least VoiceOver on Mac)
- [ ] Lighthouse audit: Accessibility ≥ 95

### 8.3 Performance Targets
- [ ] Page load time: < 2 seconds (Netlify static)
- [ ] Lighthouse Performance score: ≥ 90
- [ ] Lighthouse Best Practices score: ≥ 90
- [ ] Lighthouse SEO score: ≥ 90 (if public)

### 8.4 Deployment
- [ ] Code on GitHub (bmichals25 org)
- [ ] Deployed to Netlify with custom domain (evolute.app or internal)
- [ ] Environment variables configured (Netlify UI)
- [ ] Build process tested (next.js static export)
- [ ] Fallback to mock data if any API issues (graceful degradation)

---

## 9. Future Enhancements (Post-MVP)

### 9.1 Phase 2 Features
- Real-time location tracking with Google Maps integration
- Driver/chaperone mobile app (native or React Native)
- Passenger ratings and feedback
- User authentication and role-based access
- SMS notifications for driver/chaperone (Twilio)
- Ride creation wizard with AI-suggested driver/chaperone matches
- Performance analytics and KPI dashboard
- Export rides to CSV/PDF

### 9.2 Phase 3 Features
- Supabase real-time sync for live updates
- Advanced scheduling and optimization
- Automated dispatcher alerts
- Integration with medical records (FHIR standards)
- Billing and invoicing system
- Multi-organization support

### 9.3 Backend Migration Strategy
1. Build API endpoints in Next.js API routes
2. Replace mock data calls with real API endpoints
3. Implement authentication (JWT or Supabase Auth)
4. Migrate data to PostgreSQL via Supabase
5. Enable Supabase real-time subscriptions
6. Update components to use live data

---

## 10. Glossary & Definitions

| Term | Definition |
|------|-----------|
| **NEMT** | Non-Emergency Medical Transportation — transportation for patients who are not experiencing emergencies but need medical transportation |
| **Chaperone** | Staff member who accompanies passengers during rides to provide assistance, monitoring, and support |
| **Driver** | Staff member who operates the vehicle and transports passengers |
| **Ride** | A single transportation instance for one or more passengers from pickup to dropoff location |
| **Dispatcher** | Staff member who creates rides, assigns drivers/chaperones, and manages operations |
| **Status** | Current state of a ride in its lifecycle (Scheduled, DriverEnRoute, etc.) |
| **ETA** | Estimated Time of Arrival |
| **On-Time** | Ride completed within scheduled time or within acceptable variance (e.g., ±5 minutes) |
| **Accessibility Needs** | Physical or medical accommodations required by passenger (e.g., wheelchair access, oxygen, mobility assistance) |

---

## 11. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 2026 | Initial specification document |

---

**Document Author:** Technical Writer  
**Last Updated:** April 9, 2026  
**Status:** Ready for Development
