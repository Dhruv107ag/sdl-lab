# Assignment 6 & 7: Design Traceability Matrix
## Hostel Complaint Management System
**Team ID:** T042  
**Course Code:** CS314 — Software Development Laboratory  
**Institute:** The LNM Institute of Information Technology, Jaipur  
**Authors:** Dhruv Agrawal (24UCS016), Sanyam Humad (24UCS017), Harshil Agrawal (24UCS018), Akshat Khandal (24UCS019)  
**Document Ref:** `docs/design/assignment-06/Design-Traceability.md`

---

## 1. Traceability Chain Overview
The engineering lifecycle enforces an unbroken chain of custody for every system behavior:
$$\text{SRS Requirement} \longrightarrow \text{User Story} \longrightarrow \text{Use Case} \longrightarrow \text{Scenario/Activity Model} \longrightarrow \text{Analysis Class} \longrightarrow \text{Collaboration/State Model} \longrightarrow \text{Design Class} \longrightarrow \text{Architecture/Component} \longrightarrow \text{Implementation Code} \longrightarrow \text{Verification Test}$$

Every implemented route, state transition, and user interface control maps directly to source-grounded documentation from **Lab Assignments 1–5** and **SRS v1.0**.

---

## 2. Comprehensive Traceability Matrix

| Req ID | User Story | Use Case ID & Name | Scenarios & Activity Diagrams | Analysis Classes | State / Collaboration Models | Design Classes | Architectural Component & Route | Database Tables | Test Case ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-001** | US-001 | **UC-001** User Login | Initial precondition | `User` | Authenticate (Login) Include | `User`, `AuthService` | `AuthenticationService`<br>`POST /api/auth/login` | `users` | `TC-AUTH-01` |
| **FR-002** | US-001 | **UC-001** Auth Failure | S-01 Exception Flow | `User` | Exception path | `User` | `authMiddleware`<br>`POST /api/auth/login` | `users` | `TC-AUTH-02` |
| **FR-003** | US-001 | **UC-001** Logout | Session termination | `User` | Session invalidate | `User` | `POST /api/auth/logout` | In-memory token revoke | `TC-AUTH-03` |
| **FR-004** | US-015 | **UC-002** Manage Users | Admin actor flow | `User`, `Administrator` | Admin context | `Administrator`, `User` | `UserMgmtService`<br>`/api/admin/users` | `users` | `TC-ADMIN-01` |
| **FR-005** | US-001 | **UC-001** RBAC Guard | Swimlane permissions | `User` | RBAC Policy | `User`, `RoleGuard` | `roleMiddleware.js` | `users.role` | `TC-AUTH-04` |
| **FR-006** | US-002 | **UC-003** Submit Complaint | S-01 (A3 §1), Activity Diag UC-003 | `Student`, `Complaint` | Fig 5.1 Collaboration, Fig 5.4 State (`Submitted`) | `Student`, `Complaint` | `ComplaintService`<br>`POST /api/complaints` | `complaints`, `history` | `TC-SUBMIT-01` |
| **FR-007** | US-003 | **UC-003** Complaint Info | S-01 Steps 3–5 | `Complaint`, `Category` | Fig 5.1 Message 2–3 | `Complaint`, `ComplaintCategory` | `StudentDashboard.js`<br>`POST /api/complaints` | `complaints` | `TC-SUBMIT-02` |
| **FR-007b**| US-002 | **UC-003** Optional Photo Upload | User Baseline Choice A4 | `Complaint` | Local Attachment | `Complaint.imageUrl` | `uploadMiddleware.js`<br>`/uploads/` directory | `complaints.image_url` | `TC-UPLOAD-01` |
| **FR-008** | US-004 | **UC-003** Status Submitted | S-01 Step 9 | `Complaint` | Fig 5.4 State (`Submitted`) | `Complaint.currentStatus` | `ComplaintService.js` | `complaints.current_status` | `TC-SUBMIT-03` |
| **FR-009** | US-004 | **UC-003** Unique ID | S-01 Step 7 | `Complaint` | Fig 5.1 Message 4 | `Complaint.complaintId` | `complaintService.js` | `complaints.complaint_id` [PK] | `TC-SUBMIT-04` |
| **FR-011** | US-005 | **UC-005** View Own Complaints | Student tracking flow | `Student`, `Complaint` | Ownership isolation | `Student`, `Complaint` | `GET /api/complaints` | `complaints` (`student_id`) | `TC-ISOLATE-01` |
| **FR-013** | US-009 | **UC-006** Review Complaint | S-02 Step 1–3 | `Authority`, `Complaint` | Fig 5.4 State (`Under Review`) | `HostelWardenAuthority` | `GET /api/complaints/:id`<br>`PATCH /api/complaints/:id/review` | `complaints`, `history` | `TC-REVIEW-01` |
| **FR-014** | US-010 | **UC-007** Prioritize Complaint | Authority flow | `Complaint` | Priority update | `Complaint.priority` | `PATCH /api/complaints/:id/priority` | `complaints.priority` | `TC-PRIOR-01` |
| **FR-015** | User A3 | **UC-006** Reject Complaint | SRS-v1.0 §14 | `Authority`, `Complaint` | Terminal state (`Rejected`) | `Complaint`, `Authority` | `POST /api/complaints/:id/reject` | `complaints`, `history` | `TC-REJECT-01` |
| **FR-017** | US-011 | **UC-008** Assign Complaint | S-02 Steps 4–10, Activity Diag UC-008 | `Authority`, `ComplaintAssignment`, `Staff` | Fig 5.2 Collaboration, Fig 5.4 State (`Assigned`) | `ComplaintAssignment`, `Complaint` | `AssignmentService`<br>`POST /api/assignments` | `complaints`, `assignments`, `history` | `TC-ASSIGN-01` |
| **FR-018** | US-012 | **UC-009** View Assigned Tasks | Staff task queue | `MaintenanceStaff`, `Assignment` | Staff isolation | `MaintenanceStaff` | `GET /api/complaints` (`staff_id`) | `complaints.assigned_staff_id` | `TC-STAFF-01` |
| **FR-021** | US-013 | **UC-010** Update Progress | S-03 Step 4, Activity Diag UC-011 | `Staff`, `History` | Fig 5.4 Loop on `In Progress` | `MaintenanceStaff`, `Complaint` | `POST /api/resolutions/progress` | `complaint_status_history` | `TC-PROG-01` |
| **FR-022** | US-014 | **UC-011** Record Resolution | S-03 Steps 5–8 | `Resolution`, `Staff` | Fig 5.3 Collaboration | `Resolution`, `Complaint` | `POST /api/resolutions/resolve` | `complaints`, `history` | `TC-RESOLVE-01` |
| **FR-023** | US-014 | **UC-011** Mark as Resolved | S-03 Step 9 | `Complaint`, `Resolution` | Fig 5.4 State (`Resolved`) | `Complaint.currentStatus` | `ResolutionService.js` | `complaints.current_status` | `TC-RESOLVE-02` |
| **FR-024** | US-014 | **UC-012** Close Complaint | Post-resolution closure | `Authority`, `Complaint` | Fig 5.4 State (`Closed`) | `HostelWardenAuthority` | `POST /api/resolutions/close` | `complaints`, `history` | `TC-CLOSE-01` |
| **FR-025** | US-007 | **UC-014** Audit History | All state transitions | `ComplaintStatusHistory` | Fig 5.1, 5.2, 5.3 Message `recordStatusChange` | `ComplaintStatusHistory` | `HistoryTimeline.js`<br>`GET /api/complaints/:id/history` | `complaint_status_history` | `TC-HIST-01` |
| **FR-032** | US-016 | **UC-016** Summary Dashboard | Aggregated statistics | `InstituteManagement` | KPI Cards | `InstituteManagement` | `GET /api/summary/kpis` | `complaints` aggregate SQL | `TC-MGMT-01` |

---

## 3. Business Rule Enforcement Traceability

| Business Rule ID | Business Rule Statement | Layer of Enforcement | Specific Code & Database Mechanism |
| :--- | :--- | :--- | :--- |
| **BR-001** | Only authenticated users can access protected system functions. | API Middleware | `authMiddleware.js` verifies JWT token on all `/api/*` routes (except `/api/auth/login`). |
| **BR-002** | Only students can submit complaints for themselves. | API & Business Logic | `roleMiddleware('Student')` on `POST /api/complaints`; `student_id` is set strictly from `req.user.userId`. |
| **BR-003** | Every complaint shall have a unique complaint ID. | Database | `complaints.complaint_id PRIMARY KEY` constraint with automatic timestamped prefix generator. |
| **BR-004** | A complaint must contain all mandatory information before submission. | Frontend, API & Database | Form HTML5 + JS validation, Express Joi/custom body validator, SQLite `NOT NULL` & `CHECK(length(...) >= ...)` constraints. |
| **BR-005** | Only authorized Hostel/Warden Authority users can assign complaints. | API & Service Layer | `roleMiddleware('HostelAuthority')` on `POST /api/assignments`. |
| **BR-006** | Maintenance staff can update progress only for complaints assigned to them. | API & Service Layer | Route verifies `complaint.assigned_staff_id == req.user.userId`. |
| **BR-007** | A complaint must be assigned before maintenance staff can update progress. | Service & State Guard | Service checks `current_status IN ('Assigned', 'In Progress')` before permitting progress updates. |
| **BR-008** | A complaint cannot be closed without recorded resolution information. | Service & State Guard | `POST /api/resolutions/close` rejects requests if `current_status != 'Resolved'` or `resolution_details IS NULL`. |
| **BR-009** | Closed/Rejected complaints cannot be modified through normal workflow. | Service & State Guard | All mutation routes check if status is `Closed` or `Rejected / Invalid` and return `HTTP 400 Bad Request`. |
| **BR-010** | Only authorized users can access complaint reports. | API Middleware | `roleMiddleware(['HostelAuthority', 'Administrator', 'InstituteManagement'])` on `/api/summary/*`. |
| **BR-011** | Significant complaint status changes shall be recorded in complaint history. | Database & Service | Executed inside the same ACID SQLite transaction whenever `complaints.current_status` is updated. |
| **BR-012** | Users shall only be able to access complaint information permitted by their role. | API & Controller | Query filtering: Student restricted by `student_id`; Staff restricted by `assigned_staff_id`. |
