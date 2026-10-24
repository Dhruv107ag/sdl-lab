# Assignment 7: Interface Design
## Hostel Complaint Management System
**Team ID:** T042  
**Course Code:** CS314 — Software Development Laboratory  
**Institute:** The LNM Institute of Information Technology, Jaipur  
**Authors:** Dhruv Agrawal (24UCS016), Sanyam Humad (24UCS017), Harshil Agrawal (24UCS018), Akshat Khandal (24UCS019)  
**Document Ref:** `docs/design/assignment-06/Interface-Design.md`  
**Wireframe Refs:**  
- `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-01.png` (UC-003 Submit Complaint)
- `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-02.png` (UC-008 Assign Complaint)
- `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-03.png` (UC-011 Resolve Complaint)

---

## 1. Overview of User Interface Design
The user interface follows modern, minimal desktop web design principles:
- **Clean Layout & Consistent Navigation:** Unified top navigation bar displaying system branding, the authenticated user's name, role badge, and a distinct logout button.
- **Visual Feedback:** Real-time field validation, disabled submission buttons during network flight, explicit error alert banners, and color-coded status badges for instant comprehension during demonstrations.
- **Zero Ambiguity:** Direct role-based routing so users only see screens and controls appropriate to their responsibilities.

---

## 2. Screen Specifications for Selected Use Cases

### 2.1 Screen 1: Submit Complaint (UC-003)
- **Actor:** Student
- **Wireframe Reference:** `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-01.png`
- **Purpose:** Allows a resident student to file a new complaint regarding their hostel room or common facilities.
- **Input Fields & Constraints:**
  1. **Complaint Title:** Text input, mandatory, 5 to 100 characters.
  2. **Category:** Single-select dropdown populated from `complaint_categories` (e.g., *Plumbing*, *Electrical*, *Carpentry*, *Internet/LAN*, *Housekeeping*, *Other*), mandatory.
  3. **Hostel Block:** Single-select dropdown (e.g., *Hostel Block A*, *Hostel Block B*, *Hostel Block C*), mandatory.
  4. **Room / Location:** Text input, mandatory, e.g., "Room 204", "1st Floor Common Washroom", 2 to 50 characters.
  5. **Problem Description:** Multiline textarea, mandatory, 10 to 1000 characters.
  6. **Attach Photo:** File input, optional, accepted formats: `.jpg`, `.jpeg`, `.png`, maximum file size: 2 MB.
- **Action Buttons:**
  - `Submit Complaint` (Primary blue button) — Triggers frontend validation, sends `multipart/form-data` POST request.
  - `Cancel / Reset` (Secondary button) — Clears the form or closes modal.
- **Outputs & Feedback:**
  - Success message: *"Complaint successfully submitted with reference ID: CMP-XXX"*.
  - Validation error messages: Inline red text beneath invalid fields (e.g., *"Title must be at least 5 characters"*).
  - Server error message: Top red alert banner (*"Failed to submit complaint. Please try again."*).

---

### 2.2 Screen 2: Review & Assign Complaint (UC-008)
- **Actor:** Hostel/Warden Authority
- **Wireframe Reference:** `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-02.png`
- **Purpose:** Enables hostel authorities to inspect complaint details, set priority, assign an active maintenance technician, or reject invalid complaints.
- **Display Fields (Read-Only):**
  - Complaint ID, Student Name, Student Roll Number, Hostel Block, Room Number, Submission Timestamp.
  - Current Status Badge (e.g., `Submitted` or `Under Review`).
  - Complaint Title and Description.
  - Attached Image thumbnail (clickable for full preview).
- **Interactive Input Fields:**
  1. **Priority Level:** Dropdown selector (`Low`, `Medium`, `High`, `Urgent`), default: `Medium`.
  2. **Select Maintenance Staff:** Dropdown of active maintenance personnel displaying `[Staff ID] - Name (Specialization)` (e.g., `M07 - Ramesh Kumar (Plumber, Active)`).
  3. **Assignment Instructions / Remarks:** Textarea, optional, 0 to 500 characters.
- **Action Buttons:**
  - `Confirm & Assign Staff` (Green button) — Validates staff selection, transitions status to `Assigned`.
  - `Reject Complaint` (Red button) — Prompts for a mandatory rejection reason and transitions status to `Rejected / Invalid`.
  - `Mark as Under Review` — Quick action to transition newly submitted complaints to `Under Review`.
  - `Close Complaint` (Purple button, enabled only when status is `Resolved`) — Transitions status to `Closed`.

---

### 2.3 Screen 3: Resolve Complaint (UC-011)
- **Actor:** Maintenance Staff
- **Wireframe Reference:** `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-03.png`
- **Purpose:** Allows assigned maintenance workers to view task specifications, post work-in-progress logs, and submit the final resolution report.
- **Display Fields (Read-Only):**
  - Work Order ID, Location (Hostel & Room), Urgency Priority Badge, Student Contact Number, Issue Description.
  - Historical Work Log Timeline.
- **Interactive Input Fields:**
  1. **Intermediate Progress Remark:** Textarea for ongoing status updates (status remains `In Progress`).
  2. **Final Resolution Details:** Textarea, mandatory for resolution, minimum 10 characters, maximum 1000 characters. Explains actions taken (e.g., *"Replaced damaged washer on the basin tap line. Tested water flow without leaks."*).
- **Action Buttons:**
  - `Start Work (Set In Progress)` (Blue button) — Transitions status from `Assigned` to `In Progress`.
  - `Add Progress Remark` (Gray button) — Appends progress remark to history without closing task.
  - `Mark Issue as Resolved` (Green button) — Validates resolution text and transitions complaint to `Resolved`.

---

## 3. Software Interface Specifications (REST API Contracts)

All requests and responses use standard JSON encoding (except image uploads which use `multipart/form-data`).

### 3.1 Authentication Endpoints
- **POST `/api/auth/login`**
  - **Inputs:** `{ "email": "dhruv@lnmiit.ac.in", "password": "password123" }`
  - **Outputs (200 OK):** `{ "token": "jwt_or_session_key", "user": { "userId": "S101", "name": "Dhruv Agrawal", "role": "Student" } }`
  - **Errors:** `401 Unauthorized` (`{ "error": "Invalid email or password" }`), `403 Forbidden` (`{ "error": "Account is inactive" }`).

- **POST `/api/auth/logout`**
  - **Inputs:** None (Bearer token in header).
  - **Outputs (200 OK):** `{ "message": "Logged out successfully" }`

### 3.2 Complaint Endpoints (UC-003, UC-005, UC-013)
- **POST `/api/complaints` (UC-003)**
  - **Permission:** `Student` role only.
  - **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
  - **Body (form fields):** `title`, `description`, `categoryId`, `hostelBlock`, `roomNumber`, `image` (optional file).
  - **Outputs (201 Created):** `{ "complaintId": "CMP-101", "status": "Submitted", "message": "Complaint filed successfully" }`
  - **Errors:** `400 Bad Request` (Missing fields or file too large), `403 Forbidden` (Non-student).

- **GET `/api/complaints`**
  - **Permission:** Authenticated users.
  - **Behavior:**
    - If `Student`: returns only complaints where `student_id == req.user.userId`.
    - If `MaintenanceStaff`: returns only complaints where `assigned_staff_id == req.user.userId`.
    - If `HostelAuthority`, `Administrator`, or `InstituteManagement`: returns all complaints.
  - **Outputs (200 OK):** Array of complaint objects.

- **GET `/api/complaints/:id`**
  - **Outputs (200 OK):** Full complaint record including status history array and assignment history.

### 3.3 Assignment Endpoints (UC-008)
- **POST `/api/assignments`**
  - **Permission:** `HostelAuthority` role only.
  - **Body:** `{ "complaintId": "CMP-101", "staffId": "M07", "priority": "High", "remarks": "Urgent leak repair" }`
  - **Outputs (200 OK):** `{ "message": "Complaint assigned successfully", "newStatus": "Assigned" }`
  - **Errors:** `400 Bad Request` (Staff does not exist / inactive), `403 Forbidden` (Unauthorized role), `404 Not Found` (Complaint not found).

- **POST `/api/complaints/:id/reject`**
  - **Permission:** `HostelAuthority` role only.
  - **Body:** `{ "reason": "Not a valid hostel maintenance issue" }`
  - **Outputs (200 OK):** `{ "message": "Complaint marked as Rejected / Invalid" }`

### 3.4 Resolution & Closure Endpoints (UC-011, UC-012)
- **POST `/api/resolutions/progress`**
  - **Permission:** Assigned `MaintenanceStaff` or `HostelAuthority`.
  - **Body:** `{ "complaintId": "CMP-101", "remarks": "Inspected pipe, fetching replacement part." }`
  - **Outputs (200 OK):** `{ "message": "Progress logged successfully" }`

- **POST `/api/resolutions/resolve` (UC-011)**
  - **Permission:** Assigned `MaintenanceStaff` or `HostelAuthority`.
  - **Body:** `{ "complaintId": "CMP-101", "resolutionDetails": "Replaced damaged washer and tested water flow." }`
  - **Outputs (200 OK):** `{ "message": "Complaint resolved successfully", "newStatus": "Resolved" }`
  - **Errors:** `400 Bad Request` (Missing resolution details).

- **POST `/api/resolutions/close` (UC-012)**
  - **Permission:** `HostelAuthority` role strictly.
  - **Body:** `{ "complaintId": "CMP-101" }`
  - **Outputs (200 OK):** `{ "message": "Complaint formally closed" }`
  - **Errors:** `400 Bad Request` (Complaint is not in `Resolved` status — BR-008).

### 3.5 Administration & Summary Endpoints (UC-002, UC-016, UC-017)
- **GET `/api/admin/users`** (Administrator only: list all users).
- **POST `/api/admin/users`** (Administrator only: create demo account).
- **PATCH `/api/admin/users/:id/status`** (Administrator only: toggle Active/Inactive).
- **GET `/api/summary/kpis`** (HostelAuthority & InstituteManagement: aggregate status and category counts).

---

## 4. Visual Artifact Reference
The exported low-fidelity wireframes are located at:
- `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-01.png`
- `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-02.png`
- `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-03.png`
