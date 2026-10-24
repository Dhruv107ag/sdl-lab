# Viva Examination Preparation Guide
## Hostel Complaint Management System
**Team ID:** T042  
**Course Code:** CS314 — Software Development Laboratory  
**Institute:** The LNM Institute of Information Technology, Jaipur  
**Authors:** Dhruv Agrawal (24UCS016), Sanyam Humad (24UCS017), Harshil Agrawal (24UCS018), Akshat Khandal (24UCS019)  
**Document Ref:** `docs/VIVA-PREPARATION.md`  
**Date:** October 2026  

---

## 1. How to Use This Guide

This document is prepared specifically for defending the **Hostel Complaint Management System** academic prototype during course viva examinations. It connects every software engineering concept directly to the actual files, functions, routes, tables, and tests implemented in the codebase.

---

## 2. Module-by-Module Technical Walkthrough

### Module 1: React Frontend & Component Architecture
- **Purpose:** Delivers a responsive Single Page Application (SPA) providing role-tailored dashboards for all 5 system stakeholders.
- **Inputs & Outputs:** User events (form inputs, button clicks) -> HTTP REST requests via `fetch` -> reactive state rendering.
- **Main Files & Components:**
  - `frontend/src/App.jsx`: Top-level orchestrator; tracks `currentUser` state; renders role-specific dashboard.
  - `frontend/src/components/Navbar.jsx`: Global header displaying branding, user name, role badge, and logout trigger.
  - `frontend/src/pages/LoginPage.jsx`: Multi-role login screen with instant 1-click demo credential chips for rapid viva testing.
  - `frontend/src/pages/StudentDashboard.jsx`: Complaint filing form and personal complaint tracker.
  - `frontend/src/pages/AuthorityDashboard.jsx`: Global triage grid, priority selector, assignment modal, and closure actions.
  - `frontend/src/pages/StaffDashboard.jsx`: Assigned work order list, start-work action, progress logger, and resolution modal.
  - `frontend/src/pages/AdminDashboard.jsx`: User account management and category overview.
  - `frontend/src/pages/ManagementDashboard.jsx`: High-level KPI summary cards and category distribution breakdown.
  - `frontend/src/api/apiClient.js`: Centralized API service with auth header injection.
- **Communication:** Communicates with the backend Express server over HTTP JSON REST APIs at `http://localhost:5000/api`.
- **Validation:** Client-side validation prevents submitting empty forms or files exceeding 2 MB before sending a request.
- **Error Handling:** Displays inline field warnings and dismissible red/green alert banners.
- **Relevant Requirements & Use Cases:** All use cases (UC-001 through UC-016).
- **Tests Verifying Behavior:** Verified via browser interaction and automated frontend build (`npm run build`).
- **Likely Viva Questions & Model Answers:**
  - *Q: Why choose React Single Page Application over traditional Multi-Page Application (SSR)?*  
    **A:** A React SPA provides immediate, fluid feedback without full-page reloads. When an authority assigns a complaint, the modal updates state instantly, giving a native-app feel suitable for high-frequency administrative tasks.
  - *Q: How is cross-role navigation secured on the frontend?*  
    **A:** The top-level `App.jsx` conditionally renders dashboards strictly matching `currentUser.role`. Furthermore, the backend independently verifies JWT tokens on every endpoint, ensuring frontend tampering cannot bypass security.

---

### Module 2: Authentication, Sessions & Role-Based Authorization
- **Purpose:** Authenticates users securely and enforces role boundaries on every API endpoint.
- **Inputs & Outputs:** Email + password -> returns signed JWT token + user metadata (`user_id`, `role`, `name`).
- **Main Files & Functions:**
  - `backend/routes/authRoutes.js`: Handles `/api/auth/login`, `/api/auth/me`, and `/api/auth/logout`.
  - `backend/middleware/authMiddleware.js`: Intercepts requests, extracts `Bearer <token>`, verifies signature via `jsonwebtoken`, and attaches decoded user payload to `req.user`.
  - `backend/middleware/roleMiddleware.js`: Factory function taking allowed role(s) (e.g. `roleMiddleware('Student')`) and returning 403 Forbidden if `req.user.role` does not match.
  - `backend/database/complaints.sqlite` (`users` table).
- **Communication:** Used as pre-routing guards on Express route handlers.
- **Validation:** Validates that email exists, account status is `Active`, and password hash matches `bcrypt.compareSync()`.
- **Error Handling:** Returns `401 Unauthorized` for bad credentials or expired tokens; `403 Forbidden` for role violations.
- **Relevant Requirements & Use Cases:** FR-001 (Authentication), FR-004 (Role Enforcement), UC-001, BR-001.
- **Tests Verifying Behavior:** `TC-AUTH-01`, `TC-AUTH-02`, `TC-AUTH-03`, `TC-AUTH-04`, `TC-AUTH-05`, `TC-ISOLATE-01`.
- **Likely Viva Questions & Model Answers:**
  - *Q: Why use JWT (JSON Web Tokens) instead of server-side sessions?*  
    **A:** JWT tokens are stateless. The server does not need to store active session IDs in RAM or a Redis cache, keeping the prototype lightweight, self-contained, and easy to restart without kicking users out.
  - *Q: How do you prevent plain-text password exposure?*  
    **A:** We use **bcryptjs** with a cost factor of 10 (`bcrypt.hashSync(pass, 10)`). Even if the SQLite file is inspected directly, only irreversible salted hashes are visible.

---

### Module 3: Express REST API Routing & Middleware
- **Purpose:** Routes incoming HTTP requests, parses payloads, handles file uploads, and provides centralized error trapping.
- **Inputs & Outputs:** HTTP requests (`GET`, `POST`, `PATCH`, `DELETE`) -> JSON responses.
- **Main Files:**
  - `backend/server.js`: Express application setup, CORS configuration, static `/uploads` serving, route mounting, and centralized error handler.
  - `backend/middleware/uploadMiddleware.js`: **Multer** disk storage engine with filename hashing, 2MB size cap, and MIME validation (`image/jpeg`, `image/png`).
- **Communication:** Bridges React client requests to SQLite database transactions.
- **Validation:** Validates HTTP methods, content types, and parameter types before business logic executes.
- **Error Handling:** Centralized Express error handler catches unhandled rejections, logs to console, and sends clean HTTP 500 JSON without stack traces.
- **Relevant Requirements:** FR-028, FR-029.
- **Tests Verifying Behavior:** `TC-HEALTH-01`, `TC-SUBMIT-01`.
- **Likely Viva Questions & Model Answers:**
  - *Q: What middleware pipeline does a complaint submission pass through?*  
    **A:** 1) `cors()`, 2) `express.json()`, 3) `authMiddleware` (validates JWT), 4) `roleMiddleware('Student')`, 5) `upload.single('image')` (Multer file inspection), and finally the route handler.
  - *Q: How do you handle static file uploads safely?*  
    **A:** Uploaded images are renamed using timestamp + random integer suffixes to prevent directory traversal or name collisions, and served through Express's restricted static directory.

---

### Module 4: Relational SQLite Schema & Constraints
- **Purpose:** Provides ACID-compliant, persistent relational data storage.
- **Inputs & Outputs:** Parameterized SQL queries -> typed row objects.
- **Main Files:**
  - `backend/config/database.js`: Initializes `better-sqlite3`, enables WAL mode (`PRAGMA journal_mode = WAL;`), and enforces foreign keys (`PRAGMA foreign_keys = ON;`).
  - `backend/database/schema.sql`: DDL for 5 core tables.
  - `backend/database/seed.js`: Idempotent data seeder with 7 pre-hashed demo accounts across all 5 roles.
- **Tables & Relationships:**
  1. `users`: (`user_id` PK, `email` UNIQUE, `role`, `account_status`).
  2. `complaint_categories`: (`category_id` PK, `category_name`, `is_active`).
  3. `complaints`: (`complaint_id` PK, `student_id` FK -> `users`, `category_id` FK -> `complaint_categories`, `assigned_staff_id` FK -> `users`, `current_status`).
  4. `complaint_assignments`: (`assignment_id` PK, `complaint_id` FK -> `complaints`, `staff_id` FK -> `users`, `assigned_by` FK -> `users`).
  5. `complaint_status_history`: (`history_id` PK, `complaint_id` FK -> `complaints`, `changed_by` FK -> `users`, `change_date_time`).
- **Validation:** Column constraints (`CHECK(current_status IN (...))`, `NOT NULL`, `UNIQUE`).
- **Relevant Requirements:** FR-003, FR-006, FR-012, FR-019, FR-021.
- **Tests Verifying Behavior:** `TC-RULE-01`, `TC-HEALTH-01`, and `seed.js` execution.
- **Likely Viva Questions & Model Answers:**
  - *Q: Why is foreign key enforcement enabled explicitly via PRAGMA in SQLite?*  
    **A:** In SQLite, foreign key enforcement is disabled by default for legacy backward compatibility. We explicitly execute `PRAGMA foreign_keys = ON;` on connection to guarantee referential integrity.
  - *Q: How is SQLite protected against concurrent write locks?*  
    **A:** We enable Write-Ahead Logging (`PRAGMA journal_mode = WAL;`), which allows concurrent readers without blocking writes, drastically improving throughput for academic demonstrations.

---

### Module 5: Complaint Submission Workflow (UC-003)
- **Purpose:** Allows authenticated resident students to report physical hostel defects.
- **Inputs & Outputs:** Title, description, category, hostel block, room number, optional photo -> returns `201 Created` with unique `complaintId` (`CMP-XXX`).
- **Main Route & Handler:** `POST /api/complaints` in `backend/routes/complaintRoutes.js`.
- **Business Rules Enforced:**
  - BR-002: Only users with `role = 'Student'` can submit complaints.
  - Unique ID Generation: Monotonically increments `CMP-XXX` based on `SELECT MAX(...)`.
  - Atomic Transaction: Inserts complaint row AND initial status history row simultaneously.
- **Error Handling:** Returns 400 for validation failures (e.g. title < 5 chars); 500 for database aborts.
- **Relevant Requirements:** FR-009, FR-010, FR-011, FR-012, UC-003.
- **Tests Verifying Behavior:** `TC-SUBMIT-01`, `TC-SUBMIT-02`.
- **Likely Viva Questions & Model Answers:**
  - *Q: What happens if the status history insert fails after the complaint is inserted?*  
    **A:** Because both operations execute inside an atomic SQLite transaction (`db.transaction(...)`), the entire operation rolls back automatically, leaving zero orphan or partial records.

---

### Module 6: Authority Review & Assignment Workflow (UC-006 & UC-008)
- **Purpose:** Enables hostel authorities to inspect submitted complaints, verify validity, prioritize, and allocate tasks to maintenance staff.
- **Inputs & Outputs:** `complaintId`, `staffId`, `priority`, `remarks` -> updates status to `Assigned`, returns `200 OK`.
- **Main Routes & Handlers:**
  - `PATCH /api/complaints/:id/review`: Transitions status from `Submitted` to `Under Review`.
  - `POST /api/complaints/:id/reject`: Rejects invalid complaints with mandatory reason -> `Rejected / Invalid`.
  - `POST /api/assignments`: Validates staff availability, inserts `complaint_assignments`, sets status `Assigned`.
- **Business Rules Enforced:**
  - BR-004: Only `HostelAuthority` can review and assign complaints.
  - BR-005: Assigned staff must have `role = 'MaintenanceStaff'` and `account_status = 'Active'`.
  - BR-009: Complaints in `Closed` or `Rejected / Invalid` cannot be re-assigned.
- **Relevant Requirements:** FR-018, FR-019, FR-020, UC-006, UC-007, UC-008.
- **Tests Verifying Behavior:** `TC-REVIEW-01`, `TC-ASSIGN-01`, `TC-RULE-01`.
- **Likely Viva Questions & Model Answers:**
  - *Q: How does the system prevent assigning work to an inactive staff member?*  
    **A:** In `assignmentRoutes.js`, the query explicitly checks `WHERE user_id = ? AND role = 'MaintenanceStaff' AND account_status = 'Active'`. If not found, a 400 Bad Request error is returned.

---

### Module 7: Maintenance Staff Work Execution & Resolution (UC-010 & UC-011)
- **Purpose:** Enables technicians to manage their allocated work orders, record work commencement, log progress notes, and report final resolutions.
- **Inputs & Outputs:** 
  - Start Work: `complaintId` -> transitions to `In Progress`.
  - Progress Note: `complaintId`, `remarks` -> logs progress entry.
  - Resolution: `complaintId`, `resolutionDetails` -> transitions to `Resolved`.
- **Main Routes:**
  - `POST /api/resolutions/start-work`
  - `POST /api/resolutions/progress`
  - `POST /api/resolutions/resolve`
- **Business Rules Enforced:**
  - BR-006: Staff can ONLY start work, update progress, or resolve complaints assigned directly to their `staff_id`.
  - BR-007: Resolution details are mandatory (minimum 10 characters).
  - Status must be `Assigned` to start work, and `In Progress` or `Assigned` to resolve.
- **Relevant Requirements:** FR-023, FR-024, FR-025, UC-010, UC-011.
- **Tests Verifying Behavior:** `TC-WORK-01`, `TC-PROG-01`, `TC-SEC-01`, `TC-RESOLVE-01`.
- **Likely Viva Questions & Model Answers:**
  - *Q: Can a student resolve their own complaint if they fix it themselves?*  
    **A:** No. `roleMiddleware(['MaintenanceStaff', 'HostelAuthority'])` rejects students with HTTP 403 Forbidden (`TC-SEC-01`), upholding process accountability.

---

### Module 8: Authority Final Inspection & Formal Closure (UC-012)
- **Purpose:** Completes the lifecycle by allowing the authority to inspect the technician's resolution and formally close the issue.
- **Inputs & Outputs:** `complaintId` -> updates status to `Closed`, timestamps `closed_date_time`.
- **Main Route:** `POST /api/resolutions/close` in `backend/routes/resolutionRoutes.js`.
- **Business Rules Enforced:**
  - BR-008: Only `HostelAuthority` can close complaints. Staff cannot close their own work (`TC-SEC-02`).
  - Complaint must be in `Resolved` state before closure.
- **Relevant Requirements:** FR-026, FR-027, UC-012.
- **Tests Verifying Behavior:** `TC-SEC-02`, `TC-CLOSE-01`.
- **Likely Viva Questions & Model Answers:**
  - *Q: Why cannot maintenance staff close complaints directly upon fixing the problem?*  
    **A:** Quality assurance. The authority or warden must verify that the work actually satisfies the student's issue before the complaint is formally closed.

---

### Module 9: Status Lifecycle & Audit History
- **Purpose:** Provides an immutable audit trail of every transition for transparency, dispute resolution, and viva demonstration.
- **Lifecycle Graph:**
  `Submitted` -> `Under Review` -> `Assigned` -> `In Progress` -> `Resolved` -> `Closed`  
  *(Alternative branch: `Under Review` -> `Rejected / Invalid`)*
- **Database Table:** `complaint_status_history` (`history_id`, `complaint_id`, `previous_status`, `new_status`, `changed_by`, `change_date_time`, `comments`).
- **Relevant Requirements:** FR-015, FR-016, FR-017, FR-030.
- **Tests Verifying Behavior:** `TC-SUBMIT-02`, `TC-ISOLATE-01`.
- **Likely Viva Questions & Model Answers:**
  - *Q: How does the student see the history of what happened to their complaint?*  
    **A:** The student clicks "View History & Timeline" on their dashboard, triggering `GET /api/complaints/:id`. The server joins `complaint_status_history` with `users`, returning a chronological timeline with timestamps, actors, and remarks.

---

### Module 10: Executive Summary & KPI Reporting (UC-016 / FR-032)
- **Purpose:** Offers real-time institutional metrics for high-level campus administration.
- **Inputs & Outputs:** Authenticated `GET /api/summary/kpis` -> aggregate statistics JSON.
- **Metrics Computed:**
  - Total complaints, pending triage, active in-progress, resolved, closed, and rejected counts.
  - Category breakdown (Plumbing, Electrical, Carpentry, LAN, Housekeeping, Other).
  - Recent audit activity log.
- **Relevant Requirements:** FR-032, FR-033, UC-016.
- **Tests Verifying Behavior:** `TC-MGMT-01`.
- **Likely Viva Questions & Model Answers:**
  - *Q: Can students or staff see the Institute Management dashboard?*  
    **A:** No. Access is protected by `roleMiddleware(['InstituteManagement', 'Administrator'])`.

---

### Module 11: Monolithic Layered Architecture & SDLC Justification
- **Architecture:** 4-Layered Monolith (Presentation -> Routing/Security -> Domain Logic -> SQLite Relational Persistence).
- **SDLC Model:** Agile + Incremental Development.
  - Increment 1: Project Skeleton, DB Schema & Authentication.
  - Increment 2: Student Complaint Submission & Private Tracking.
  - Increment 3: Authority Review & Staff Assignment Workflow.
  - Increment 4: Maintenance Work Execution & Resolution.
  - Increment 5: Authority Closure, Admin & Management Reporting.
- **Viva Defense:**
  - *Q: Why did you choose a monolithic architecture over microservices?*  
    **A:** For an academic institutional prototype, microservices introduce unnecessary operational complexity (service discovery, distributed transactions, network latency). A monolithic architecture allows atomic ACID multi-table transactions in SQLite, zero-dependency local execution, and easy traceability during viva evaluation.

---

### Module 12: Assignment 6 & 7 Design Models
- **Assignment 6 (Design Class Model & Architectural Design):**
  - Refined domain analysis classes (`User`, `Complaint`, `ComplaintAssignment`, `ComplaintStatusHistory`, `ComplaintCategory`) into software design classes with explicit visibility (`+`, `-`, `#`), exact data types, parameter lists, and design patterns.
- **Assignment 7 (Component-Level Design & Interface Design):**
  - Partitioned system into 10 software components with explicit interface contracts (`IComplaintSubmit`, `IComplaintReview`, `IAssignedWork`, `IDataAccess`).
  - Wireframed 3 primary use cases: UC-003 (Submit), UC-008 (Assign), UC-011 (Resolve).
- **Viva Defense:**
  - *Q: How does your code trace back to your UML Component Diagram?*  
    **A:** Each component in the diagram corresponds directly to a file: `ComplaintService` -> `routes/complaintRoutes.js`, `AssignmentService` -> `routes/assignmentRoutes.js`, `DatabaseService` -> `config/database.js`.

---

## 3. Step-by-Step Live Demonstration Script for Examiners

Follow this exact sequence during your viva presentation:

### Step 1: System Boot & Test Suite Run
1. Open terminal in `backend/` and run:
   ```bash
   npm test
   ```
2. **Show the Examiner:** Point out that all **20 automated integration and security tests pass with 0 errors**.
3. Point out that the health probe is available at `http://localhost:5000/api/health`.

### Step 2: Resident Student Demo (UC-003)
1. Navigate browser to `http://localhost:5173`.
2. Use the **Viva Quick Switch** bar to click **"Student (Dhruv)"**.
3. Click **"+ New Complaint"** button.
4. Fill in:
   - **Title:** `Water leakage under washbasin in Room 302`
   - **Category:** `Plumbing`
   - **Hostel Block:** `Hostel Block A`
   - **Room:** `Room 302`
   - **Description:** `The drain pipe under the basin is cracked and dripping continuously onto the floor.`
5. Click **"Submit Complaint"**.
6. **Show the Examiner:** The new complaint appears immediately in the table with status badge **"Submitted"** and ID `CMP-XXX`.
7. Click **"View Details"** to show that the initial status history entry has been created with an immutable timestamp.

### Step 3: Hostel Authority / Warden Demo (UC-006 & UC-008)
1. On the top Quick Switch bar, click **"Warden (Sharma)"**.
2. **Show the Examiner:** The authority dashboard displays the complaint just filed by Dhruv.
3. Click **"Review"** -> Status transitions to **"Under Review"**.
4. Click **"Assign Staff"**:
   - Select Technician: `M07 - Ramesh Kumar (Plumber)`
   - Priority: `High`
   - Remarks: `Inspect and replace pipe connector before 5 PM.`
5. Click **"Confirm & Assign Staff"**.
6. **Show the Examiner:** Status updates to **"Assigned"** and Ramesh Kumar is listed as the assigned technician.

### Step 4: Maintenance Technician Demo (UC-010 & UC-011)
1. On the top Quick Switch bar, click **"Staff (Ramesh Plumber)"**.
2. **Show the Examiner:** Ramesh's portal only shows complaints assigned to him.
3. Click **"Start Work"** -> Status transitions to **"In Progress"**.
4. Click **"Log Progress"** -> Enter `Procured 1.5 inch PVC pipe connector from store.` -> Click Save.
5. Click **"Resolve Complaint"**:
   - Resolution Details: `Replaced cracked drain connector with new high-pressure PVC pipe. Tested flow with zero leakage.`
   - Click **"Submit Resolution"**.
6. **Show the Examiner:** Status is now **"Resolved"**. Note that Ramesh cannot close the complaint.

### Step 5: Authority Final Inspection & Closure (UC-012)
1. Switch back to **"Warden (Sharma)"**.
2. Notice the complaint is now in the **Resolved** section.
3. Click **"Verify & Close"**.
4. **Show the Examiner:** Status is now **"Closed"** (green badge). Re-assignment is locked.
5. Click **"View History"** to display the complete, unbroken 6-stage lifecycle audit log with timestamps and actors!

### Step 6: Executive Management Overview (UC-016)
1. Switch to **"Management (Director)"**.
2. **Show the Examiner:** Total complaints, category distribution graph, resolution rates, and recent activity logs updated in real time.

---

## 4. Honest Disclosures of Prototype Limitations

When asked by the examiner: *"What are the limitations of your implementation?"*, give this honest, technically sound response:

1. **Email / SMS Gateway:** Notifications are logged in the database audit table (`complaint_status_history`) and displayed in the UI; external SMTP/Twilio integration was excluded to keep the local academic prototype self-contained.
2. **Automated Escalation Timer:** Overdue complaints must be inspected and flagged manually by the Hostel Authority; background cron escalation is omitted in this build.
3. **Local File Storage:** Image attachments are stored on the local disk under `backend/uploads/` rather than a cloud bucket (e.g. AWS S3).
4. **Single-Node SQLite:** SQLite was chosen for portability and zero-daemon setup; in an enterprise multi-server production environment, PostgreSQL with connection pooling would replace SQLite.
