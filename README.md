# Hostel Complaint Management System
## Software Development Laboratory (CS314) — Academic Prototype

**Team ID:** T042  
**Institute:** The LNM Institute of Information Technology, Jaipur  
**Team Members:**
- Dhruv Agrawal (24UCS016)
- Sanyam Humad (24UCS017)
- Harshil Agrawal (24UCS018)
- Akshat Khandal (24UCS019)

---

## 1. Project Overview

The **Hostel Complaint Management System** is a full-stack academic software engineering prototype designed to automate the logging, triage, assignment, progress tracking, resolution, and closure of physical maintenance complaints across student residence halls.

The system enforces strict role-based access control (RBAC), end-to-end data validation, relational referential integrity, and atomic transactions across an unbroken 6-stage complaint lifecycle:

$$\text{Submitted} \longrightarrow \text{Under Review} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}$$

---

## 2. Technology Stack & Architecture

- **Presentation Layer (Frontend):** React 19 Single Page Application (SPA) bundled with Vite, styled with responsive Vanilla CSS design system. Includes a floating **Viva Quick Switch** bar for instant evaluator role changes.
- **API & Routing Layer (Backend):** Node.js runtime with Express 5 REST API, JWT authentication, and Multer for photo attachments.
- **Data Persistence Layer:** Embedded SQLite relational engine (`better-sqlite3`) utilizing Write-Ahead Logging (`WAL`) mode and enforced foreign key constraints (`PRAGMA foreign_keys = ON;`).
- **Architecture Paradigm:** Monolithic Layered Architecture (4 tiers: Presentation, API/Security, Domain Logic, SQLite Data Access).

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
|   complaints.sqlite (Tables: users, categories, complaints, etc.)       |
|   /uploads (Local static disk directory for complaint photos)          |
+-------------------------------------------------------------------------+
```

---

## 3. Quick Start & Execution Guide

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Step 1: Install Dependencies & Initialize Database
```bash
# 1. Setup Backend
cd backend
npm install
npm run seed       # Creates schema and seeds demo accounts

# 2. Setup Frontend
cd ../frontend
npm install
```

### Step 2: Run the Application
Open two terminal windows:

**Terminal 1 (Backend API Server):**
```bash
cd backend
npm start
# Server listens on http://localhost:5000
# Health probe available at http://localhost:5000/api/health
```

**Terminal 2 (Frontend React App):**
```bash
cd frontend
npm run dev
# Vite client runs on http://localhost:5173
```

Navigate your browser to `http://localhost:5173`.

---

## 4. Pre-seeded Demo Credentials

For convenience during viva evaluation and demonstrations, the database comes pre-seeded with 7 active accounts covering all 5 user roles:

| Role | Name | Email | Password | Allowed Dashboards & Actions |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Dhruv Agrawal | `dhruv@lnmiit.ac.in` | `student123` | File complaints, track status, view own complaint history. |
| **Student** | Sanyam Humad | `sanyam@lnmiit.ac.in` | `student123` | Demonstrates cross-student data isolation. |
| **Hostel Authority** | Warden Dr. Sharma | `warden.sharma@lnmiit.ac.in` | `warden123` | Review complaints, assign technicians, close resolved complaints. |
| **Hostel Authority** | Caretaker Verma | `caretaker.verma@lnmiit.ac.in`| `warden123` | Secondary hostel caretaker authority. |
| **Maintenance Staff** | Ramesh Kumar | `ramesh.plumber@lnmiit.ac.in` | `staff123` | Specialization: Plumbing. Start work, log progress, resolve. |
| **Administrator** | System Admin | `admin@lnmiit.ac.in` | `admin123` | Manage user accounts, view active categories. |
| **Institute Management**| Director | `director@lnmiit.ac.in` | `director123` | View high-level KPI dashboard, category breakdowns. |

> **Viva Tip:** You can switch between any of these accounts in 1 click using the **Viva Quick Switch** bar at the top of the screen or via the login page chips.

---

## 5. Automated Testing & Verification

The backend includes a comprehensive, automated end-to-end integration and security test suite:

```bash
cd backend
npm test
```

### Test Suite Summary:
- **Total Tests:** 20
- **Passed:** 20 (100%)
- **Failed:** 0
- **Execution Time:** ~4 seconds

```text
 [PASS] TC-HEALTH-01: Health probe reports UP
 [PASS] TC-AUTH-01: Student login returns 200 and token
 [PASS] TC-AUTH-02: Invalid credentials rejected with 401
 [PASS] TC-AUTH-03: /api/auth/me returns student profile
 [PASS] TC-AUTH-04: Authority login succeeds
 [PASS] TC-AUTH-05: Maintenance Staff login succeeds
 [PASS] TC-SUBMIT-01: Student submits valid complaint -> 201 Created
 [PASS] TC-SUBMIT-02: Complaint details fetched with initial history
 [PASS] TC-ISOLATE-01: Student S102 denied access to S101 complaint -> 403 Forbidden
 [PASS] TC-REVIEW-01: Authority transitions status to Under Review
 [PASS] TC-ASSIGN-01: Authority assigns complaint to staff M07 -> 200 OK
 [PASS] TC-WORK-01: Staff marks complaint In Progress
 [PASS] TC-PROG-01: Staff posts work progress remark
 [PASS] TC-SEC-01: Student cannot resolve complaint -> 403 Forbidden
 [PASS] TC-RESOLVE-01: Staff resolves complaint with valid report -> 200 OK
 [PASS] TC-SEC-02: Staff cannot close complaint -> 403 Forbidden
 [PASS] TC-CLOSE-01: Authority formally closes resolved complaint
 [PASS] TC-RULE-01: Closed complaint cannot be reassigned (BR-009) -> 400 Bad Request
 [PASS] TC-ADMIN-01: Administrator retrieves users list -> 200 OK
 [PASS] TC-MGMT-01: Institute Management fetches aggregate KPI counts
```

---

## 6. Project Documentation Index

All required software engineering artifacts across Assignments 1 through 7 are organized as follows:

### Requirements & Analysis (Assignments 1–5)
- [SRS-v1.0.md](file:///c:/Users/Hitler/Downloads/sdl/SRS-v1.0.md) — Comprehensive Software Requirements Specification (v1.0).
- [Scenarios.md](file:///c:/Users/Hitler/Downloads/sdl/Scenarios.md) — Detailed user scenarios for UC-003, UC-006, and UC-008.
- [Use-Case-Model.md](file:///c:/Users/Hitler/Downloads/sdl/Use-Case-Model.md) — Full use-case model with actor boundaries.
- [T042-till assn5.pdf](file:///c:/Users/Hitler/Downloads/sdl/T042-till%20assn5.pdf) — Complete consolidated submission for Assignments 1 through 5.

### Software Design Deliverables (Assignments 6 & 7)
Located in [`docs/design/assignment-06/`](file:///c:/Users/Hitler/Downloads/sdl/docs/design/assignment-06):
- [Architectural-Design.md](file:///c:/Users/Hitler/Downloads/sdl/docs/design/assignment-06/Architectural-Design.md) — Architectural style, tier boundaries, and subsystem responsibilities.
- [Data-Class-Design.md](file:///c:/Users/Hitler/Downloads/sdl/docs/design/assignment-06/Data-Class-Design.md) — Software design class model, attribute visibilities, and SQLite relational mapping.
- [Component-Level-Design.md](file:///c:/Users/Hitler/Downloads/sdl/docs/design/assignment-06/Component-Level-Design.md) — 10 modular software components with explicit interface contracts.
- [Interface-Design.md](file:///c:/Users/Hitler/Downloads/sdl/docs/design/assignment-06/Interface-Design.md) — Screen specifications and interaction flow for UC-003, UC-008, and UC-011.
- [Design-Traceability.md](file:///c:/Users/Hitler/Downloads/sdl/docs/design/assignment-06/Design-Traceability.md) — Bidirectional traceability matrix connecting SRS requirements to classes, components, routes, and tests.
- High-Resolution Rendered Diagrams:
  - `docs/design/assignment-06/diagrams/Architectural-Diagram.png`
  - `docs/design/assignment-06/diagrams/Design-Class-Diagram.png`
  - `docs/design/assignment-06/diagrams/Component-Design-Diagram.png`
  - `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-01.png`
  - `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-02.png`
  - `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-03.png`

### Verification & Viva Readiness
- [docs/VERIFICATION-REPORT.md](file:///c:/Users/Hitler/Downloads/sdl/docs/VERIFICATION-REPORT.md) — Complete integration audit, RBAC security testing matrix, database integrity verification, and defect log.
- [docs/VIVA-PREPARATION.md](file:///c:/Users/Hitler/Downloads/sdl/docs/VIVA-PREPARATION.md) — Module-by-module viva notes, live demonstration walkthrough script, and 28 likely viva questions with model answers.

---

## 7. Step-by-Step Live Demonstration Walkthrough

During your presentation, follow this 6-step walkthrough:

1. **System Health & Test Suite:** Run `npm test` in `backend/` to prove all 20 automated tests pass. Show the health probe endpoint at `http://localhost:5000/api/health`.
2. **Student Submission (UC-003):** Login as **Dhruv Agrawal** (`dhruv@lnmiit.ac.in`). Submit a new plumbing complaint with block, room number, description, and optional photo. Notice status is `Submitted`.
3. **Authority Triage & Assignment (UC-006 & UC-008):** Switch to **Warden Dr. Sharma**. Review the complaint, set priority to `High`, and assign technician **Ramesh Kumar (Plumber)**. Notice status transitions to `Assigned`.
4. **Technician Progress & Resolution (UC-010 & UC-011):** Switch to **Ramesh Kumar**. Click `Start Work` (`In Progress`), post intermediate progress remarks, and then submit a formal resolution report. Status transitions to `Resolved`.
5. **Authority Final Inspection & Closure (UC-012):** Switch back to **Warden Dr. Sharma**. Inspect the technician's resolution and click `Verify & Close`. Status transitions to `Closed` (immutable). Open `View History` to display the unbroken 6-stage audit trail.
6. **Executive KPI Oversight (UC-016):** Switch to **Director** (`director@lnmiit.ac.in`) to view real-time metrics, charts, category distributions, and facility resolution statistics.

---

## 8. Honest Disclosures of Prototype Limitations

In accordance with academic standards, the following prototype boundaries are disclosed:
1. **Notifications:** Email/SMS notifications are logged in the database audit table (`complaint_status_history`) and displayed as visual alert badges in the UI; external SMTP/Twilio gateway transmission is omitted.
2. **Automated Escalation Timer:** Overdue complaints must be manually flagged by the Hostel Authority; background cron escalation is not active in this development build.
3. **Local Storage:** Uploaded image attachments are stored in the local server directory `backend/uploads/` rather than a cloud bucket (e.g., AWS S3).
4. **Database Engine:** SQLite was chosen for zero-dependency local portability. A high-concurrency enterprise deployment would use PostgreSQL with connection pooling.
#   s d l - l a b  
 