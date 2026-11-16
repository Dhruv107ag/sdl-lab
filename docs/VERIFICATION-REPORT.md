# Final Integration, Testing, and Verification Report
## Hostel Complaint Management System
**Team ID:** T042  
**Course Code:** CS314 — Software Development Laboratory  
**Institute:** The LNM Institute of Information Technology, Jaipur  
**Authors:** Dhruv Agrawal (24UCS016), Sanyam Humad (24UCS017), Harshil Agrawal (24UCS018), Akshat Khandal (24UCS019)  
**Document Ref:** `docs/VERIFICATION-REPORT.md`  
**Date:** October 2026  
**Status:** Approved & Verified (All 20 Automated Tests Passed)

---

## 1. Executive Summary

This report documents the final integration, security verification, database integrity audits, and acceptance testing of the **Hostel Complaint Management System** academic prototype. 

The application is built on a **Monolithic Layered Architecture** using **React 19** for the Presentation Layer, **Node.js with Express 5** for the API & Routing Layer, and an embedded **SQLite relational engine (`better-sqlite3`)** for atomic, ACID-compliant persistence.

All core workflows across all five stakeholder roles (**Student**, **Hostel Authority/Warden**, **Maintenance Staff**, **Administrator**, and **Institute Management**) have been integrated and verified against the requirements baseline established in **Lab Assignments 1–5**, the **Initial SRS (v1.0)**, and the architectural specifications of **Assignments 6 and 7**.

---

## 2. Scope of Verification

### 2.1 User Roles Verified
1. **Resident Student (UC-003, UC-004, UC-005):** Authenticated login, complaint registration with optional image attachment, real-time status inspection, private history isolation.
2. **Hostel Warden / Authority (UC-006, UC-007, UC-008, UC-012):** Review of incoming complaints, priority override, assignment to active maintenance technicians, complaint rejection with formal reason, and final verification & closure.
3. **Maintenance Staff / Technician (UC-009, UC-010, UC-011):** Inspection of work orders assigned specifically to the staff member, initiating work (*In Progress*), intermediate progress notes, and final resolution reporting.
4. **Administrator (UC-001, UC-002):** System-wide user directory listing, account status checks, and category management.
5. **Institute Management (UC-016 / FR-032):** Aggregated facility Key Performance Indicators (KPIs), category distributions, and real-time audit logs.

### 2.2 Core Workflows Verified End-to-End
```text
[Student: Submit] 
       │ (Status: Submitted)
       ▼
[Authority: Review] ──(Invalid)──► [Status: Rejected / Invalid]
       │ (Status: Under Review)
       ▼
[Authority: Assign Staff] 
       │ (Status: Assigned)
       ▼
[Staff: Start Work & Progress] 
       │ (Status: In Progress)
       ▼
[Staff: Record Resolution] 
       │ (Status: Resolved)
       ▼
[Authority: Final Inspection & Close] 
       │ (Status: Closed - Immutable)
       ▼
[Immutable Audit Record Persisted]
```

---

## 3. Automated API Integration & Security Test Suite

The automated test harness (`backend/tests/api_verification.js`) exercises all REST endpoints, headers, authentication tokens, status transitions, role boundaries, and relational foreign keys against an active Express instance and SQLite database.

### 3.1 Test Execution Results (20 / 20 PASSED)

| Test ID | Test Category | Scenario / Assertion Description | Relevant Req / UC | HTTP Status | Outcome |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-HEALTH-01** | System Diagnostics | Health probe reports `UP` with database connected | System | `200 OK` | **PASS** |
| **TC-AUTH-01** | Authentication | Valid Student login produces signed JWT token & user profile | FR-001 / UC-001 | `200 OK` | **PASS** |
| **TC-AUTH-02** | Authentication | Invalid password rejected with standard error banner | FR-002 / BR-001 | `401 Unauthorized` | **PASS** |
| **TC-AUTH-03** | Authorization | `/api/auth/me` validates token and returns authenticated role | FR-004 | `200 OK` | **PASS** |
| **TC-AUTH-04** | Authentication | Authority/Warden login succeeds with role permissions | FR-001 | `200 OK` | **PASS** |
| **TC-AUTH-05** | Authentication | Maintenance Staff login succeeds with role permissions | FR-001 | `200 OK` | **PASS** |
| **TC-SUBMIT-01** | Complaint Mgmt | Student submits valid complaint with title, block, room, category | FR-009 / UC-003 | `201 Created` | **PASS** |
| **TC-SUBMIT-02** | Complaint Mgmt | Complaint details retrieved with initial status history entry | FR-013 / UC-005 | `200 OK` | **PASS** |
| **TC-ISOLATE-01**| Security & Isolation| Student S102 denied access to private complaint filed by S101 | FR-014 / BR-012 | `403 Forbidden` | **PASS** |
| **TC-REVIEW-01** | Authority Review | Authority transitions new complaint from `Submitted` to `Under Review` | FR-018 / UC-006 | `200 OK` | **PASS** |
| **TC-ASSIGN-01** | Assignment Mgmt | Authority assigns complaint to staff `M07` with High priority | FR-019 / UC-008 | `200 OK` | **PASS** |
| **TC-WORK-01**   | Work Execution | Assigned staff member marks complaint `In Progress` | FR-023 / UC-010 | `200 OK` | **PASS** |
| **TC-PROG-01**   | Work Execution | Assigned staff member posts intermediate progress notes | FR-024 / UC-010 | `200 OK` | **PASS** |
| **TC-SEC-01**    | Role Boundary | Student cannot resolve complaint (strictly staff permission) | BR-006 | `403 Forbidden` | **PASS** |
| **TC-RESOLVE-01**| Work Execution | Assigned staff member submits formal resolution remarks -> `Resolved` | FR-025 / UC-011 | `200 OK` | **PASS** |
| **TC-SEC-02**    | Role Boundary | Maintenance staff cannot close complaint (strictly authority permission) | BR-008 | `403 Forbidden` | **PASS** |
| **TC-CLOSE-01**  | Authority Review | Authority formally reviews resolution and marks complaint `Closed` | FR-026 / UC-012 | `200 OK` | **PASS** |
| **TC-RULE-01**   | Business Rules | Re-assignment of a `Closed` complaint is blocked | BR-009 | `400 Bad Request`| **PASS** |
| **TC-ADMIN-01**  | Administration | Administrator retrieves global user directory | FR-004 / UC-002 | `200 OK` | **PASS** |
| **TC-MGMT-01**   | Management KPI | Institute Management retrieves aggregate statistics & breakdown | FR-032 / UC-016 | `200 OK` | **PASS** |

---

## 4. Security & Role-Based Access Control (RBAC) Verification

We conducted boundary testing on authorization middleware (`middleware/roleMiddleware.js` and `middleware/authMiddleware.js`) to guarantee strict role isolation:

```text
+------------------------+---------+-----------+-------+-------+------------+
| Action / Route Target  | Student | Authority | Staff | Admin | Management |
+------------------------+---------+-----------+-------+-------+------------+
| Submit Complaint       |   YES   |    NO     |  NO   |  NO   |     NO     |
| View Own Complaints    |   YES   |    --     |  --   |  --   |     --     |
| View Other Student's   |   NO    |    YES    |  NO*  |  YES  |    YES     |
| Review / Transition    |   NO    |    YES    |  NO   |  NO   |     NO     |
| Assign Technician      |   NO    |    YES    |  NO   |  NO   |     NO     |
| Start Work / Progress  |   NO    |    YES    |  YES* |  NO   |     NO     |
| Submit Resolution      |   NO    |    NO     |  YES* |  NO   |     NO     |
| Close Complaint        |   NO    |    YES    |  NO   |  NO   |     NO     |
| View User Directory    |   NO    |    NO     |  NO   |  YES  |     NO     |
| View Executive KPIs    |   NO    |    NO     |  NO   |  YES  |    YES     |
+------------------------+---------+-----------+-------+-------+------------+
*Note: Staff may only view and modify complaints specifically assigned to their staff ID (BR-006).
```

### 4.1 SQL Injection & Parameterized Queries
- **Verification:** All SQL operations utilize prepared statements (`db.prepare(...)`) via `better-sqlite3`. No dynamic string concatenation exists in SQL queries.
- **Result:** Immune to standard SQL injection payloads (e.g., `' OR '1'='1`).

### 4.2 Password Hashing
- **Verification:** Passwords are never stored or logged in plain text. Passwords in `users.password_hash` are hashed using **bcrypt** with a cost factor of 10 (`bcrypt.hashSync(..., 10)`).
- **Result:** Verified in database inspection.

### 4.3 Input Validation & Error Propagation
- Mandatory form fields (title: 5–100 chars, description: 10–1000 chars, valid foreign key category, non-empty hostel block and room number) are validated on the client and enforced on the server.
- Missing or malformed payloads return HTTP 400 with a user-friendly error string without leaking stack traces to the client.

---

## 5. Database Integrity & Persistence Audits

The relational database (`database/complaints.sqlite`) was audited for relational consistency and durability across restarts:

1. **Foreign Key Enforcement:** SQLite foreign keys are explicitly turned on upon connection via `PRAGMA foreign_keys = ON;`. Deleting a non-existent foreign reference (e.g., invalid `category_id` or non-existent `staff_id`) is rejected with a foreign key constraint violation.
2. **Atomic Multi-Table Transactions:** Critical state transitions execute inside atomic transactions (`db.transaction(...)`):
   - **Complaint Submission:** Inserts row into `complaints` and initial log into `complaint_status_history`.
   - **Complaint Assignment:** Updates `complaints.current_status = 'Assigned'`, creates a row in `complaint_assignments`, and appends an audit row to `complaint_status_history`.
   - **Resolution & Closure:** Updates `complaints`, marks assignment `Completed`, and appends a timestamped history entry.
   - **Guarantee:** If any step fails, the entire transaction rolls back; partial records are physically impossible.
3. **Restart Persistence:** Server process was terminated and re-spawned. All complaint records, assignments, and uploaded media remained intact on disk.

---

## 6. Verification of Assignment 6 & Assignment 7 Deliverables

All documentation, architecture diagrams, component specifications, and wireframes comply with course standards:

| Artifact Name | Path | Format | Verification Status |
| :--- | :--- | :---: | :--- |
| **Architectural Design** | `docs/design/assignment-06/Architectural-Design.md` | Markdown | Verified (Monolithic 4-tier style justified) |
| **Data Class Design** | `docs/design/assignment-06/Data-Class-Design.md` | Markdown | Verified (UML class specs & SQLite mapping) |
| **Component Design** | `docs/design/assignment-06/Component-Level-Design.md` | Markdown | Verified (Component interfaces & contracts) |
| **Interface Design** | `docs/design/assignment-06/Interface-Design.md` | Markdown | Verified (UI specs for UC-003, UC-008, UC-011) |
| **Design Traceability** | `docs/design/assignment-06/Design-Traceability.md` | Markdown | Verified (SRS FRs mapped to Code & Tests) |
| **Architectural Diagram** | `docs/design/assignment-06/diagrams/Architectural-Diagram.png` | PNG | Verified (Generated from Mermaid source) |
| **Design Class Diagram** | `docs/design/assignment-06/diagrams/Design-Class-Diagram.png` | PNG | Verified (Generated from Mermaid source) |
| **Component Diagram** | `docs/design/assignment-06/diagrams/Component-Design-Diagram.png`| PNG | Verified (Generated from Mermaid source) |
| **UI Wireframe UC-003** | `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-01.png` | PNG | Verified (High-resolution rendered wireframe) |
| **UI Wireframe UC-008** | `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-02.png` | PNG | Verified (High-resolution rendered wireframe) |
| **UI Wireframe UC-011** | `docs/design/assignment-06/diagrams/interfaces/UI-Wireframe-03.png` | PNG | Verified (High-resolution rendered wireframe) |
| **Diagram Sources** | `docs/design/assignment-06/diagrams/sources/` | `.mmd` / Python | Verified (`generate_diagrams.py` builds all PNGs) |

---

## 7. Defects Discovered and Resolved

During final verification, three technical defects were identified and resolved:

1. **Defect 1: Port Connection Handling in Automated Test Runner**
   - *Issue:* `api_verification.js` threw `ECONNREFUSED` when invoked standalone without a previously running server process.
   - *Fix:* Integrated Express server lifecycle directly into `api_verification.js` so that `npm test` automatically boots the server, runs all 20 test cases, gracefully closes the port, and exits with code 0.
2. **Defect 2: Non-Monotonic Complaint ID Collision Risk**
   - *Issue:* Complaint ID generation previously utilized `SELECT COUNT(*)`, which risked primary key collisions if test complaints were deleted or re-inserted.
   - *Fix:* Replaced with `SELECT MAX(CAST(SUBSTR(complaint_id, 5) AS INTEGER))`, ensuring sequential, monotonically increasing unique IDs (`CMP-101`, `CMP-102`, ...).
3. **Defect 3: React 19 Linting & Redundant Re-render Warnings**
   - *Issue:* `oxlint` reported synchronous `setState` inside `useEffect` during initial boot of dashboard components.
   - *Fix:* Refactored `App.jsx` to initialize user session state synchronously via lazy `useState(() => api.getCurrentUser())`, eliminated redundant `loading` state, and cleaned unused variables across all dashboards. `oxlint` now reports **0 errors and 0 warnings**.

---

## 8. Known Limitations & Honest Disclosures

To uphold academic integrity during viva evaluation, the following prototype limitations are disclosed:

1. **Email / SMS Notifications:** Notifications are logged in the database audit table (`complaint_status_history`) and displayed as visual alerts in the UI; external SMTP/SMS gateway transmission is omitted in this local prototype.
2. **Automated Escalation Timer:** Overdue complaints must be inspected and flagged manually by the Hostel Authority; background cron escalation is not active in this development build.
3. **Local File Storage:** Image attachments are stored on the local disk filesystem under `backend/uploads/` rather than a distributed cloud bucket (e.g., AWS S3).
4. **Single-Node SQLite:** SQLite is ideal for a single-server academic demo, but concurrent high-throughput multi-server deployments would require PostgreSQL or MySQL.

---

## 9. Suggested Git Commands for Version Control

Per project instructions, no automated commits or pushes were executed. When ready, the team can review and initialize git tracking using the following commands:

```bash
# 1. Initialize local repository
git init

# 2. Add files while respecting .gitignore (node_modules and build artifacts excluded)
git add .

# 3. Create initial baseline commit
git commit -m "feat: complete Hostel Complaint Management System prototype (T042 Assignments 1-7)"

# 4. Link to remote repository (when ready)
# git remote add origin <your-github-repo-url>
# git branch -M main
# git push -u origin main
```
