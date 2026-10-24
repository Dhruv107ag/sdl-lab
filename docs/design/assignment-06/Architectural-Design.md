# Assignment 6: Architectural Design
## Hostel Complaint Management System
**Team ID:** T042  
**Course Code:** CS314 — Software Development Laboratory  
**Institute:** The LNM Institute of Information Technology, Jaipur  
**Authors:** Dhruv Agrawal (24UCS016), Sanyam Humad (24UCS017), Harshil Agrawal (24UCS018), Akshat Khandal (24UCS019)  
**Document Ref:** `docs/design/assignment-06/Architectural-Design.md`  
**Diagram Ref:** `docs/design/assignment-06/diagrams/Architectural-Diagram.png`

---

## 1. Architectural Style and Paradigm
The Hostel Complaint Management System is built using a **Monolithic Layered Architecture** with a clear separation of concerns across four primary tiers:
1. **Presentation Layer (Client):** A responsive Single Page Application (SPA) developed with **React (Plain JavaScript + CSS)**.
2. **API & Routing Layer:** An **Express.js** application serving RESTful JSON endpoints, handling route guards, authentication tokens, and payload validation.
3. **Business Logic & Service Layer:** Modular JavaScript service modules encapsulating domain rules, state transitions, permission enforcement, and business workflows.
4. **Data Access & Persistence Layer:** An embedded **SQLite** relational engine communicating via parameterized SQL statements and ACID transactions.

### 1.1 Justification for Monolithic Architecture in Academic Prototype
- **Simplicity & Viva Defendability:** Monolithic architectures avoid network serialization overhead, inter-service latency, and distributed consensus issues inherent in microservices. It is straightforward for examiners to trace a request from button click to database row.
- **Data Integrity & ACID Guarantees:** Multi-table operations (e.g., assigning a staff member, creating an assignment row, updating complaint status, and writing an audit trail) execute within a single atomic SQLite transaction.
- **Portability:** The entire application runs locally on any standard machine using Node.js without requiring Docker, external database daemons, or cloud dependencies.

---

## 2. Layered Subsystems and Responsibilities

```text
+-------------------------------------------------------------------------+
|                  1. PRESENTATION LAYER (React 18 SPA)                   |
|  StudentDashboard  |  AuthorityPortal  |  StaffPortal  |  Admin | Mgmt  |
+-------------------------------------------------------------------------+
                                    |
                    HTTP / JSON REST API (Port 5000)
                                    v
+-------------------------------------------------------------------------+
|                2. API & SECURITY LAYER (Express.js Router)              |
|   authMiddleware   |   roleMiddleware   |   uploadMiddleware (Multer)   |
|   /api/auth        |   /api/complaints  |   /api/assignments            |
|   /api/resolutions |   /api/admin       |   /api/summary                |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|               3. BUSINESS LOGIC & DOMAIN SERVICE LAYER                  |
|   AuthService      |   ComplaintWorkflowService |   AssignmentService   |
|   ResolutionService|   AuditHistoryService      |   SummaryKPIService   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|            4. DATA ACCESS & STORAGE LAYER (better-sqlite3 / sqlite3)    |
|   Parameterized SQL Statements | Foreign Key Enforcement | Transactions |
|   database.sqlite (Tables: users, categories, complaints, assignments)  |
|   /uploads (Local static disk directory for complaint photos)          |
+-------------------------------------------------------------------------+
```

### 2.1 Layer Responsibilities

#### Layer 1: Presentation Layer (`/frontend`)
- **Technology:** React 18, Plain JavaScript (`.js`/`.jsx`), Vanilla CSS.
- **Responsibilities:**
  - Render desktop-friendly, clean, role-tailored dashboards.
  - Client-side form validation (required checks, character bounds, file type guards).
  - Centralized HTTP client (`apiClient.js`) that attaches bearer tokens / session credentials.
  - Visual status badges and chronological history timeline.

#### Layer 2: API & Security Layer (`/backend/routes`, `/backend/middleware`)
- **Technology:** Express.js, JSON Parser, Multer.
- **Responsibilities:**
  - Route incoming requests to respective controllers.
  - `authMiddleware`: Validates user authentication tokens.
  - `roleMiddleware`: Guards endpoints to ensure only authorized roles execute sensitive transitions (e.g., only `HostelAuthority` can close complaints or assign staff; only `Student` can submit complaints).
  - `uploadMiddleware`: Validates uploaded image attachments (JPEG/PNG MIME check, 2MB size limit, sanitizes file names).

#### Layer 3: Business Logic Layer (`/backend/services`)
- **Technology:** Plain JavaScript modules.
- **Responsibilities:**
  - Validates complaint lifecycle transitions against the 7 approved states.
  - Verifies that staff members are active and specialized before assignment.
  - Prevents modification of closed complaints (BR-009).
  - Enforces mandatory resolution text before closure can be accepted (BR-008).
  - Ensures every state transition simultaneously creates a timestamped record in `complaint_status_history`.

#### Layer 4: Data Access & Storage Layer (`/backend/database`)
- **Technology:** SQLite engine (`database.sqlite`).
- **Responsibilities:**
  - Enforces relational constraints: Foreign Keys enabled on connection (`PRAGMA foreign_keys = ON;`).
  - Ensures parameterized queries to prevent SQL Injection vulnerabilities.
  - Executes assignment and resolution operations within SQLite transactions (`BEGIN TRANSACTION ... COMMIT`).
  - Serves uploaded image assets from `/backend/uploads`.

---

## 3. Communication Paths & Sequence of Key Flows

### 3.1 Flow 1: UC-003 — Submit Complaint
1. **Student** enters title, description, category, hostel, room, and optionally attaches a photo on `StudentDashboard`.
2. React frontend validates constraints and sends a `multipart/form-data` POST request to `/api/complaints`.
3. `authMiddleware` verifies the session and extracts the authenticated `student_id`.
4. `uploadMiddleware` validates the image and stores it in `/uploads/` with a unique timestamped filename.
5. `ComplaintWorkflowService` generates a unique ID (e.g., `CMP-101`), creates a complaint record with status `Submitted`, and inserts the initial row into `complaint_status_history`.
6. Express responds with `HTTP 201 Created` returning the complaint ID.
7. Frontend updates the complaints table and displays a success notification.

### 3.2 Flow 2: UC-008 — Assign Complaint
1. **Hostel Authority** selects a complaint in `Submitted` or `Under Review` status.
2. Authority chooses an active Maintenance Staff member from the dropdown and submits the form.
3. Backend receives POST `/api/assignments` with `{ complaintId, staffId, remarks, priority }`.
4. `roleMiddleware` verifies the caller has the `HostelAuthority` role.
5. SQLite transaction starts:
   - Updates `complaints` record: `current_status = 'Assigned'`, `assigned_staff_id = staffId`, `priority = priority`.
   - Inserts new row into `complaint_assignments`.
   - Inserts audit row into `complaint_status_history` (`previous_status = 'Under Review'`, `new_status = 'Assigned'`).
6. Transaction commits. Returns `HTTP 200 OK`.

### 3.3 Flow 3: UC-011 — Resolve Complaint
1. **Maintenance Staff** logs in and views complaints assigned specifically to their `staff_id`.
2. Staff updates status to `In Progress` when beginning physical repair.
3. Upon repair completion, staff enters mandatory resolution report and clicks "Mark Resolved".
4. Backend receives POST `/api/resolutions` with `{ complaintId, resolutionDetails }`.
5. `roleMiddleware` confirms caller is the assigned staff member.
6. SQLite transaction:
   - Updates `complaints`: `current_status = 'Resolved'`, `resolution_details = resolutionDetails`, `resolved_by = staffId`, `resolution_date_time = CURRENT_TIMESTAMP`.
   - Inserts audit history row.
7. Transaction commits. Returns `HTTP 200 OK`.

---

## 4. Implementation Folder & Module Mapping

| Architectural Layer | Implementation Folder / File | Key Responsibilities |
| :--- | :--- | :--- |
| **Presentation** | `frontend/src/pages/` | `LoginPage.js`, `StudentDashboard.js`, `AuthorityDashboard.js`, `StaffDashboard.js`, `AdminDashboard.js`, `ManagementDashboard.js` |
| **Presentation** | `frontend/src/components/`| `Navbar.js`, `StatusBadge.js`, `HistoryTimeline.js`, `ProtectedRoute.js` |
| **Presentation** | `frontend/src/api/` | `apiClient.js` (Fetch abstraction with token headers) |
| **API & Routing** | `backend/routes/` | `authRoutes.js`, `complaintRoutes.js`, `assignmentRoutes.js`, `resolutionRoutes.js`, `adminRoutes.js`, `summaryRoutes.js` |
| **Middleware** | `backend/middleware/` | `authMiddleware.js`, `roleMiddleware.js`, `uploadMiddleware.js` |
| **Business Logic** | `backend/services/` | `complaintService.js`, `assignmentService.js`, `resolutionService.js`, `userService.js` |
| **Data Layer** | `backend/database/` | `database.js`, `schema.sql`, `seed.js`, `database.sqlite` |
| **File Storage** | `backend/uploads/` | Static directory for uploaded complaint photo evidence |

---

## 5. Visual Artifact Reference
The exported high-resolution Architectural Diagram is saved at:
`docs/design/assignment-06/diagrams/Architectural-Diagram.png`  
Editable Mermaid source: `docs/design/assignment-06/diagrams/sources/Architectural-Diagram.mmd`  
Generator script: `docs/design/assignment-06/diagrams/sources/generate_diagrams.py`
