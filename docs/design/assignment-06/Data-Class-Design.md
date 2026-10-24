# Assignment 6: Data and Class Design
## Hostel Complaint Management System
**Team ID:** T042  
**Course Code:** CS314 — Software Development Laboratory  
**Institute:** The LNM Institute of Information Technology, Jaipur  
**Authors:** Dhruv Agrawal (24UCS016), Sanyam Humad (24UCS017), Harshil Agrawal (24UCS018), Akshat Khandal (24UCS019)  
**Document Ref:** `docs/design/assignment-06/Data-Class-Design.md`  
**Diagram Ref:** `docs/design/assignment-06/diagrams/Design-Class-Diagram.png`

---

## 1. Introduction and Design Objectives
This document establishes the implementation-oriented design class model for the Hostel Complaint Management System prototype. It directly refines the 10 analysis classes defined in **Lab Assignment 4 (pp. 30–35)** while incorporating the confirmed requirements baseline:
1. Canonical use-case numbering per **SRS-v1.0** (**UC-003** Submit Complaint, **UC-008** Assign Complaint, **UC-011** Resolve Complaint, **UC-012** Close Complaint).
2. The 5 user roles (**Student**, **HostelWardenAuthority**, **MaintenanceStaff**, **Administrator**, and **InstituteManagement**).
3. The 7-state complaint lifecycle (`Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved` → `Closed` / `Rejected / Invalid`).
4. Optional local image upload support during complaint submission.
5. Persistent relational mapping to SQLite with strict data integrity constraints.

---

## 2. Design Class Specifications

### 2.1 User Hierarchy (Generalization)

#### 2.1.1 Class `User` (Base Entity)
- **Stereotype:** `<<entity>>`
- **Responsibilities:** Encapsulates common user identity, role classification, credential security, and session management.
- **Attributes:**
  - `- userId: String` [PK] — Unique identifier (e.g., `S101`, `A12`, `M07`, `ADM01`, `MGT01`).
  - `- name: String` — Full legal name of user.
  - `- email: String` [Unique] — Institutional email address used for login.
  - `- passwordHash: String` — Salted bcrypt password hash (never plain-text).
  - `- contactNumber: String` — Phone number for maintenance contact.
  - `- role: UserRole` — Enum: `Student`, `HostelAuthority`, `MaintenanceStaff`, `Administrator`, `InstituteManagement`.
  - `- accountStatus: AccountStatus` — Enum: `Active`, `Inactive`.
  - `- createdAt: DateTime` — Record creation timestamp.
- **Operations:**
  - `+ login(credentials: Credentials): SessionToken`
  - `+ logout(): Boolean`
  - `+ updateProfile(details: ProfileDTO): Boolean`

#### 2.1.2 Class `Student` (extends `User`)
- **Stereotype:** `<<entity>>`
- **Responsibilities:** Represents resident students reporting maintenance problems.
- **Attributes:**
  - `- studentId: String` — Student roll number (e.g., `24UCS016`).
- **Operations:**
  - `+ submitComplaint(details: ComplaintDTO, fileAttachment: File): Complaint` (UC-003)
  - `+ viewStatus(complaintId: String): ComplaintStatus` (UC-013)
  - `+ viewOwnComplaints(): List<Complaint>` (UC-005)
  - `+ viewHistory(complaintId: String): List<ComplaintStatusHistory>` (UC-014)

#### 2.1.3 Class `HostelWardenAuthority` (extends `User`)
- **Stereotype:** `<<entity>>`
- **Responsibilities:** Administrative authority responsible for reviewing, setting priority, assigning staff, rejecting invalid complaints, and closing resolved complaints.
- **Attributes:**
  - `- authorityId: String` — Official employee code (e.g., `A12`).
  - `- assignedBlock: String` — Hostel block jurisdiction (e.g., `Block A`).
- **Operations:**
  - `+ reviewComplaint(complaintId: String): Boolean` (UC-006)
  - `+ categorizeComplaint(complaintId: String, categoryId: String): Boolean` (UC-004)
  - `+ prioritizeComplaint(complaintId: String, priority: PriorityLevel): Boolean` (UC-007)
  - `+ rejectComplaint(complaintId: String, reason: String): Boolean` (BR-009)
  - `+ assignComplaint(complaintId: String, staffId: String): ComplaintAssignment` (UC-008)
  - `+ closeComplaint(complaintId: String): Boolean` (UC-012)

#### 2.1.4 Class `MaintenanceStaff` (extends `User`)
- **Stereotype:** `<<entity>>`
- **Responsibilities:** Field personnel executing repairs and documenting resolution.
- **Attributes:**
  - `- staffId: String` — Staff identifier (e.g., `M07`).
  - `- specialization: String` — Skill domain (e.g., `Plumbing`, `Electrical`, `Carpentry`).
- **Operations:**
  - `+ viewAssignedComplaints(): List<Complaint>` (UC-009)
  - `+ startWork(complaintId: String): Boolean` (Transition to `In Progress`)
  - `+ updateProgress(complaintId: String, remarks: String): Boolean` (UC-010)
  - `+ recordResolution(complaintId: String, details: String): Resolution` (UC-011)

#### 2.1.5 Class `Administrator` (extends `User`)
- **Stereotype:** `<<entity>>`
- **Responsibilities:** System-level user and role management.
- **Attributes:**
  - `- adminId: String`
- **Operations:**
  - `+ manageUsers(): List<User>` (UC-002)
  - `+ createDemoUser(data: UserDTO): User`
  - `+ toggleAccountStatus(userId: String): Boolean`

#### 2.1.6 Class `InstituteManagement` (extends `User`)
- **Stereotype:** `<<entity>>`
- **Responsibilities:** Executive monitoring and high-level summary review.
- **Attributes:**
  - `- managementId: String`
- **Operations:**
  - `+ viewExecutiveSummary(): SummaryReport` (UC-016 / FR-032)
  - `+ viewCategoryBreakdown(): Map<String, Integer>`

---

### 2.2 Core Domain Entities

#### 2.2.1 Class `Complaint`
- **Stereotype:** `<<entity>>`
- **Attributes:**
  - `- complaintId: String` [PK] — Format: `CMP-XXX` (Unique).
  - `- studentId: String` [FK] — Reference to `User.userId`.
  - `- categoryId: String` [FK] — Reference to `ComplaintCategory.categoryId`.
  - `- title: String` (Length: 5–100 chars, NOT NULL).
  - `- description: String` (Length: 10–1000 chars, NOT NULL).
  - `- hostelBlock: String` (e.g., `Hostel A`, `Hostel B`, `Hostel C`).
  - `- roomNumber: String` (e.g., `204`, `Common Room`).
  - `- priority: PriorityLevel` (Enum: `Low`, `Medium`, `High`, `Urgent`, default: `Medium`).
  - `- currentStatus: ComplaintStatus` (Enum: `Submitted`, `Under Review`, `Assigned`, `In Progress`, `Resolved`, `Closed`, `Rejected / Invalid`).
  - `- imageUrl: String` [Nullable] — Relative path to local stored JPEG/PNG.
  - `- submissionDateTime: DateTime` (Default: CURRENT_TIMESTAMP).
  - `- assignedStaffId: String` [FK, Nullable]
  - `- assignedBy: String` [FK, Nullable]
  - `- assignmentDateTime: DateTime` [Nullable]
  - `- resolutionDetails: String` [Nullable]
  - `- resolvedBy: String` [FK, Nullable]
  - `- resolutionDateTime: DateTime` [Nullable]
  - `- rejectionReason: String` [Nullable]
  - `- closedDateTime: DateTime` [Nullable]
- **Operations:**
  - `+ validateComplaint(): Boolean`
  - `+ create(): Complaint`
  - `+ updateStatus(newStatus: ComplaintStatus, actorId: String, notes: String): Boolean`
  - `+ retrieveHistory(): List<ComplaintStatusHistory>`

#### 2.2.2 Class `ComplaintCategory`
- **Stereotype:** `<<entity>>`
- **Attributes:**
  - `- categoryId: String` [PK] — e.g., `CAT-PLUMB`, `CAT-ELEC`, `CAT-CARP`.
  - `- categoryName: String` [Unique] — e.g., `Plumbing`, `Electrical`, `Carpentry`, `Internet/LAN`, `Housekeeping`, `Other`.
  - `- description: String`
  - `- isActive: Boolean`
- **Operations:**
  - `+ validateCategory(): Boolean`
  - `+ checkAvailability(): Boolean`

#### 2.2.3 Class `ComplaintAssignment` (Composition with `Complaint`)
- **Stereotype:** `<<entity>>`
- **Attributes:**
  - `- assignmentId: String` [PK] — e.g., `AS-501`.
  - `- complaintId: String` [FK]
  - `- staffId: String` [FK]
  - `- assignedBy: String` [FK]
  - `- assignmentDateTime: DateTime`
  - `- assignmentStatus: AssignmentStatus` (Enum: `Assigned`, `In Progress`, `Completed`, `Reassigned`, `Cancelled`).
  - `- remarks: String`
- **Operations:**
  - `+ assignStaff(): Boolean`
  - `+ validateAssignment(): Boolean`
  - `+ reassign(newStaffId: String): Boolean`

#### 2.2.4 Class `ComplaintStatusHistory` (Composition with `Complaint`)
- **Stereotype:** `<<entity>>`
- **Attributes:**
  - `- historyId: String` [PK] — e.g., `H-901`.
  - `- complaintId: String` [FK]
  - `- previousStatus: String` [Nullable]
  - `- newStatus: String`
  - `- changedBy: String` [FK]
  - `- changeDateTime: DateTime`
  - `- comments: String`
- **Operations:**
  - `+ recordStatusChange(): Boolean`
  - `+ retrieveHistory(): List<ComplaintStatusHistory>`

#### 2.2.5 Class `Resolution` (Composition with `Complaint`)
- **Stereotype:** `<<entity>>`
- **Attributes:**
  - `- resolutionId: String` [PK] — e.g., `RES-101`.
  - `- complaintId: String` [FK, Unique]
  - `- resolutionDetails: String` (Required resolution report).
  - `- resolvedBy: String` [FK]
  - `- resolutionDateTime: DateTime`
- **Operations:**
  - `+ validateResolution(): Boolean`
  - `+ recordResolution(): Boolean`

---

## 3. Class Relationships and Multiplicities

| Class A | Relationship Type | Class B | Multiplicity | Justification |
| :--- | :---: | :--- | :---: | :--- |
| `User` | **Generalization** | `Student` | N/A | Student is a specialized system user. |
| `User` | **Generalization** | `HostelWardenAuthority` | N/A | Authority is a specialized system user. |
| `User` | **Generalization** | `MaintenanceStaff` | N/A | Staff member is a specialized system user. |
| `User` | **Generalization** | `Administrator` | N/A | Administrator manages accounts and roles. |
| `User` | **Generalization** | `InstituteManagement` | N/A | Management views aggregate statistics. |
| `Student` | **Association** | `Complaint` | `1` : `0..*` | A student can submit zero or many complaints; each complaint belongs to one student. |
| `ComplaintCategory` | **Association** | `Complaint` | `1` : `0..*` | A category classifies zero or many complaints. |
| `Complaint` | **Composition** | `ComplaintAssignment` | `1` : `0..*` | Assignments belong strictly to a complaint lifecycle. |
| `MaintenanceStaff` | **Association** | `ComplaintAssignment` | `1` : `0..*` | A staff member can receive multiple assignments. |
| `HostelWardenAuthority`| **Association** | `ComplaintAssignment` | `1` : `0..*` | An authority can issue multiple assignments. |
| `Complaint` | **Composition** | `ComplaintStatusHistory` | `1` : `0..*` | History records are owned by the complaint and deleted with it. |
| `User` | **Association** | `ComplaintStatusHistory` | `1` : `0..*` | The user who triggered the transition is logged. |
| `Complaint` | **Composition** | `Resolution` | `1` : `0..1` | A complaint has at most one final recorded resolution entity. |
| `User` | **Association** | `Resolution` | `1` : `0..*` | A staff member or authority records the resolution. |

---

## 4. Mapping Analysis Classes to Database Structures

| Analysis Class | SQLite Table Name | Primary Key | Foreign Keys & Target Table | Key Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `User` | `users` | `user_id` (TEXT) | None | `email UNIQUE`, `role IN (...)`, `account_status IN (...)` |
| `ComplaintCategory` | `complaint_categories` | `category_id` (TEXT) | None | `category_name UNIQUE`, `is_active IN (0, 1)` |
| `Complaint` | `complaints` | `complaint_id` (TEXT) | `student_id -> users(user_id)`<br>`category_id -> complaint_categories(category_id)`<br>`assigned_staff_id -> users(user_id)` | `length(title) BETWEEN 5 AND 100`<br>`length(description) BETWEEN 10 AND 1000`<br>`current_status IN (7 states)` |
| `ComplaintAssignment` | `complaint_assignments` | `assignment_id` (TEXT) | `complaint_id -> complaints(complaint_id)` [CASCADE]<br>`staff_id -> users(user_id)`<br>`assigned_by -> users(user_id)` | `assignment_status IN (...)` |
| `ComplaintStatusHistory` | `complaint_status_history` | `history_id` (TEXT) | `complaint_id -> complaints(complaint_id)` [CASCADE]<br>`changed_by -> users(user_id)` | `comments NOT NULL` |
| `Resolution` | (Inlined into `complaints` & `complaint_status_history`) | `complaint_id` | `resolved_by -> users(user_id)` | Enforces 1-to-1 relationship with zero partial records. |

---

## 5. Visual Artifact Reference
The exported high-resolution UML Design Class Diagram is saved at:
`docs/design/assignment-06/diagrams/Design-Class-Diagram.png`  
Editable Mermaid source: `docs/design/assignment-06/diagrams/sources/Design-Class-Diagram.mmd`  
Generator script: `docs/design/assignment-06/diagrams/sources/generate_diagrams.py`
