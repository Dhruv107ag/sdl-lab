# Hostel Complaint Management System (HCMS)

A robust, full-stack web application designed to streamline the logging, triage, technician assignment, progress tracking, resolution, and closure of physical maintenance issues across student residence halls.

---

## 1. Key Features

- **Role-Based Access Control (RBAC):** Dedicated, secure dashboards tailored to 5 stakeholder roles:
  - **Student:** File complaints, upload photographic evidence, track status, view resolution reports, and inspect lifecycle audit history.
  - **Hostel Warden / Authority:** Triage incoming requests, set priority levels (`Low`, `Medium`, `High`, `Urgent`), assign tasks to specialized maintenance technicians, reject invalid issues with mandatory reasons, and formally close completed tickets.
  - **Maintenance Staff (Plumber, Electrician, etc.):** View personal work orders, commence work (`In Progress`), post intermediate progress updates, and submit official resolution reports.
  - **System Administrator:** Manage user accounts, allocate roles, and toggle account activation statuses.
  - **Institute Management (Director):** High-level executive dashboard showing complaint category distributions, institutional resolution rates, and live maintenance activity streams.
- **Strict 6-Stage Lifecycle State Machine:**
  $$\text{Submitted} \longrightarrow \text{Under Review} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}$$
  *(With alternative branch: $\text{Under Review} \longrightarrow \text{Rejected / Invalid}$)*
- **Complete Audit Trail:** Every transition, assignment, and status update is permanently timestamped and logged in `complaint_status_history` for accountability.
- **Secure Authentication:** Industry-standard **JSON Web Tokens (JWT)** and **bcrypt** salted password hashing (cost factor 10).
- **Photo Attachments:** Upload and preview defect photos with 2MB size cap and strict MIME type validation.

---

## 2. Technology Stack & Architecture

- **Frontend:** React 19 Single Page Application (SPA), bundled with **Vite**, styled with a clean, low-saturation responsive CSS design system.
- **Backend:** Node.js with **Express 5** RESTful API services and modular route architecture.
- **Database:** Embedded relational **SQLite** via `better-sqlite3`, running in high-performance Write-Ahead Logging (`WAL`) mode with enforced foreign key referential integrity (`PRAGMA foreign_keys = ON;`).
- **File Storage:** Local disk storage engine (`backend/uploads/`) for photographic evidence.

```text
+-------------------------------------------------------------------------+
|                  1. PRESENTATION LAYER (React 19 SPA)                   |
|  StudentDashboard  |  AuthorityPortal  |  StaffPortal  |  Admin | Mgmt  |
+-------------------------------------------------------------------------+
                                    │
                    HTTP / JSON REST API (Port 5000)
                                    ▼
+-------------------------------------------------------------------------+
|                2. API & SECURITY LAYER (Express 5 Router)               |
|   authMiddleware   |   roleMiddleware   |   uploadMiddleware (Multer)   |
|   /api/auth        |   /api/complaints  |   /api/assignments            |
|   /api/resolutions |   /api/admin       |   /api/summary                |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|               3. BUSINESS LOGIC & DOMAIN SERVICE LAYER                  |
|   AuthService      |   ComplaintWorkflowService |   AssignmentService   |
|   ResolutionService|   AuditHistoryService      |   SummaryKPIService   |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|            4. DATA ACCESS & STORAGE LAYER (better-sqlite3)              |
|   Parameterized SQL Statements | Foreign Key Enforcement | Transactions |
|   backend/database/complaints.sqlite (Tables: users, categories, etc.)   |
|   backend/uploads (Local static disk directory for complaint photos)    |
+-------------------------------------------------------------------------+
```

---

## 3. Project Structure

```text
sdl/
├── backend/                        # Backend Express application
│   ├── config/
│   │   └── database.js             # SQLite connection & WAL mode config
│   ├── database/
│   │   ├── schema.sql              # DDL schema definitions (5 tables)
│   │   ├── seed.js                 # Database seeder with sample accounts
│   │   └── complaints.sqlite       # Relational SQLite database file
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT extraction and verification
│   │   ├── roleMiddleware.js       # Role-based access control guards
│   │   └── uploadMiddleware.js     # Multer image upload filter & limits
│   ├── routes/
│   │   ├── adminRoutes.js          # User account creation & status toggling
│   │   ├── assignmentRoutes.js     # Staff allocation & task assignment
│   │   ├── authRoutes.js           # Login, me, and logout handlers
│   │   ├── complaintRoutes.js      # Complaint submission, list & details
│   │   ├── resolutionRoutes.js     # Start work, progress logs & resolution
│   │   └── summaryRoutes.js        # Executive KPIs & activity feed
│   ├── tests/
│   │   └── api_verification.js     # 20 integration & security test suites
│   ├── package.json
│   └── server.js                   # Application entry point & router setup
│
├── frontend/                       # Frontend React application
│   ├── public/                     # Static icons and assets
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js        # Centralized HTTP client & token handling
│   │   ├── components/
│   │   │   ├── ComplaintDetailsModal.jsx
│   │   │   ├── HistoryTimeline.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AuthorityDashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ManagementDashboard.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── styles/
│   │   │   └── index.css           # Clean design system & CSS variables
│   │   ├── App.jsx                 # Role-based routing orchestrator
│   │   └── main.jsx                # DOM client root
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Vite server & API proxy configuration
│
├── run-backend.bat                 # 1-Click launcher for backend server
├── run-frontend.bat                # 1-Click launcher for frontend client
├── run-tests.bat                   # 1-Click launcher for automated test suite
└── README.md                       # Project documentation
```

---

## 4. Quick Start & Execution Guide

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Option 1: 1-Click Batch Launchers (Windows)
1. Double-click `run-backend.bat` (Starts backend API on `http://localhost:5000`)
2. Double-click `run-frontend.bat` (Starts frontend client on `http://localhost:5173`)
3. Open `http://localhost:5173` in your browser.

---

### Option 2: Terminal Execution

#### 1. Setup & Run Backend API
```bash
cd backend
npm install
npm run seed       # Initializes database schema and pre-populates sample data
npm start          # Runs server on port 5000
```
*Health probe available at:* `http://localhost:5000/api/health`

#### 2. Setup & Run Frontend Client
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev        # Launches Vite development server on port 5173
```
*Access the site at:* `http://localhost:5173`

#### 3. Run Automated Integration & Security Tests
Open a third terminal window:
```bash
cd backend
npm test           # Executes 20 automated tests validating auth, RBAC, and workflows
```

---

## 5. Sample User Credentials

The database comes pre-seeded with active accounts across all 5 roles:

| Role | Name | Email (Login ID) | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Dhruv Agrawal | `dhruv@lnmiit.ac.in` | `student123` | Submit complaints, upload photos, track status, view audit history. |
| **Student** | Sanyam Humad | `sanyam@lnmiit.ac.in` | `student123` | Submit complaints and monitor resolution status. |
| **Hostel Authority** | Chief Warden Sharma | `warden.sharma@lnmiit.ac.in` | `warden123` | Triage, set priority, assign technicians, reject invalid tickets, verify and close. |
| **Maintenance Staff** | Ramesh Kumar (Plumber) | `ramesh.plumber@lnmiit.ac.in` | `staff123` | View assigned plumbing jobs, update progress, submit resolution reports. |
| **Maintenance Staff** | Suresh Sharma (Electrician) | `suresh.electric@lnmiit.ac.in` | `staff123` | View and resolve assigned electrical issues. |
| **Administrator** | System Admin | `admin@lnmiit.ac.in` | `admin123` | Manage accounts, create users, toggle activation status. |
| **Institute Management** | Director Office | `director@lnmiit.ac.in` | `director123` | Real-time facility metrics, category distributions, resolution rates. |

---

## 6. REST API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate using email and password; returns signed JWT and user profile.
- `GET /api/auth/me` — Retrieve the currently authenticated user's profile.
- `POST /api/auth/logout` — Terminate user session.

### Complaints (`/api/complaints`)
- `GET /api/complaints` — Retrieve complaints matching user scope (Student: own complaints; Staff: assigned jobs; Authority: all complaints).
- `POST /api/complaints` — Submit a new complaint (supports `multipart/form-data` with photo upload).
- `GET /api/complaints/categories` — List active maintenance categories.
- `GET /api/complaints/:id` — Retrieve full complaint details, photo URL, and chronological audit history.
- `PATCH /api/complaints/:id/review` — Transition complaint status from `Submitted` to `Under Review`.
- `POST /api/complaints/:id/reject` — Reject an invalid complaint with a mandatory reason.

### Assignments (`/api/assignments`)
- `POST /api/assignments` — Assign complaint to an active technician with priority level and instructions.
- `GET /api/assignments/staff` — List active maintenance personnel with trade specializations.

### Resolutions (`/api/resolutions`)
- `POST /api/resolutions/start-work` — Technician flags assigned work as `In Progress`.
- `POST /api/resolutions/progress` — Record intermediate work remarks without altering status.
- `POST /api/resolutions/resolve` — Submit final resolution report and transition ticket to `Resolved`.
- `POST /api/resolutions/close` — Authority inspects work, confirms satisfaction, and permanently marks as `Closed`.

### Admin & Summary (`/api/admin`, `/api/summary`)
- `GET /api/admin/users` — Administrator lists all system users.
- `POST /api/admin/users` — Administrator registers a new user with bcrypt-hashed credentials.
- `PATCH /api/admin/users/:id/status` — Toggle user account between `Active` and `Inactive`.
- `GET /api/summary/kpis` — Aggregate counts, category distribution percentages, and recent system activity.

---

## 7. Automated Testing Suite

The repository includes an automated integration and security test suite in `backend/tests/api_verification.js`. Run with `npm test` in the `backend` directory.

### Verified Test Suites (20 Test Cases)
1. **Health & Database Probe:** Checks SQLite connectivity, WAL mode, and foreign keys.
2. **Authentication & Session Security:** Verifies login tokens, invalid credential rejection, and inactive account blocking.
3. **Complaint Submission & Validation:** Verifies title/description length constraints, category selection, and transaction safety.
4. **Authority Review & Triage:** Tests status transitions to `Under Review` and rejection with mandatory rationale.
5. **Technician Assignment:** Tests valid assignment, trade matching, and rejection of assignment to inactive accounts.
6. **Task Resolution Flow:** Tests start work, progress notes, and final resolution validation (minimum 10 characters).
7. **Authority Closure:** Tests formal closure by authorities and verifies tickets cannot be modified once closed.
8. **RBAC Isolation & Security:** Verifies students cannot access authority endpoints (HTTP 403) and students cannot inspect peer complaints (`TC-ISOLATE-01`).
9. **Management KPI Verification:** Verifies summary counts and distribution mathematics.
