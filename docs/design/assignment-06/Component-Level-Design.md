# Assignment 7: Component-Level Design
## Hostel Complaint Management System
**Team ID:** T042  
**Course Code:** CS314 — Software Development Laboratory  
**Institute:** The LNM Institute of Information Technology, Jaipur  
**Authors:** Dhruv Agrawal (24UCS016), Sanyam Humad (24UCS017), Harshil Agrawal (24UCS018), Akshat Khandal (24UCS019)  
**Document Ref:** `docs/design/assignment-06/Component-Level-Design.md`  
**Diagram Ref:** `docs/design/assignment-06/diagrams/Component-Design-Diagram.png`

---

## 1. Component Architecture Overview
The component design refines the initial 10 components identified in **Lab Assignment 5 (pp. 40–41)**. The system is partitioned into modular, highly cohesive software units communicating through explicitly defined interfaces.

```text
+--------------------------------------------------------------------------------+
|                 PRESENTATION SUBSYSTEM (React Components)                      |
|  [StudentWebUI] [HostelAuthorityUI] [MaintenanceStaffUI] [AdminUI] [MgmtUI]    |
+--------------------------------------------------------------------------------+
             |                     |                     |
        (IComplaintSubmit)    (IComplaintReview)    (IAssignedWork)
             |                     |                     |
             v                     v                     v
+--------------------------------------------------------------------------------+
|                    APPLICATION SERVICES SUBSYSTEM (Express)                    |
|  [AuthService] [ComplaintService] [AssignmentService] [ResolutionService]      |
|  [UserMgmtService] [SummaryKPIService] [FileStorageService]                    |
+--------------------------------------------------------------------------------+
                                           |
                                    (IDataAccess)
                                           v
+--------------------------------------------------------------------------------+
|                     DATA ACCESS & STORAGE SUBSYSTEM                            |
|             [DatabaseService] ----> SQLite Engine (database.sqlite)           |
+--------------------------------------------------------------------------------+
```

---

## 2. Component Specifications and Provided/Required Interfaces

### 2.1 Component 1: `StudentWebInterface`
- **Stereotype:** `<<component>>`
- **Layer:** Presentation (Frontend)
- **Provides:** Interactive views for complaint registration, complaint tracking, and history timeline.
- **Requires:** `IAuth` (for session credentials), `IComplaintSubmit` (to post new complaints), `IFileUpload` (for attaching optional image evidence).

### 2.2 Component 2: `HostelAuthorityInterface`
- **Stereotype:** `<<component>>`
- **Layer:** Presentation (Frontend)
- **Provides:** Workflows for reviewing pending complaints, assigning maintenance staff, setting priority, rejecting invalid requests, and formally closing resolved complaints.
- **Requires:** `IAuth`, `IComplaintReview`, `IAssign`, `IClose`.

### 2.3 Component 3: `MaintenanceStaffInterface`
- **Stereotype:** `<<component>>`
- **Layer:** Presentation (Frontend)
- **Provides:** Staff task queue, start-work action (`In Progress`), intermediate work remarks log, and resolution submission.
- **Requires:** `IAuth`, `IAssignedWork`, `IResolve`.

### 2.4 Component 4: `AuthenticationService`
- **Stereotype:** `<<component>>`
- **Layer:** Application / Security (Backend)
- **Provides:** `IAuth` (`verifyCredentials`, `generateSessionToken`, `enforceRole`).
- **Requires:** `IDataAccess` (queries `users` table for email and bcrypt password hash).

### 2.5 Component 5: `ComplaintManagementService`
- **Stereotype:** `<<component>>`
- **Layer:** Business Logic (Backend)
- **Provides:** `IComplaintSubmit`, `IComplaintReview` (`validateComplaint`, `createComplaintRecord`, `markUnderReview`, `rejectComplaint`).
- **Requires:** `IDataAccess`, `IAuditLog` (`logStatusTransition`).

### 2.6 Component 6: `AssignmentManagementService`
- **Stereotype:** `<<component>>`
- **Layer:** Business Logic (Backend)
- **Provides:** `IAssign`, `IAssignedWork` (`assignTechnician`, `reassignTechnician`, `listAssignedTasks`).
- **Requires:** `IDataAccess`, `IAuditLog`.

### 2.7 Component 7: `ResolutionManagementService`
- **Stereotype:** `<<component>>`
- **Layer:** Business Logic (Backend)
- **Provides:** `IResolve`, `IClose` (`recordProgressRemark`, `recordResolutionDetails`, `closeComplaint`).
- **Requires:** `IDataAccess`, `IAuditLog`.

### 2.8 Component 8: `DatabaseService`
- **Stereotype:** `<<component>>`
- **Layer:** Persistence (SQLite)
- **Provides:** `IDataAccess` (executes parameterized SQL, starts transactions, verifies foreign keys, enforces relational constraints).
- **Requires:** File system storage for `database.sqlite`.

---

## 3. Detailed Logic & Algorithms for Selected Use Cases

### 3.1 Operation 1: `submitComplaint(...)` (Supports UC-003)
- **Component:** `ComplaintManagementService`
- **Method Signature:** `submitComplaint(studentId, complaintData, uploadedFile) -> Result<ComplaintRecord>`
- **Structured Logic / Algorithm:**
```text
ALGORITHM SubmitComplaint(studentId, complaintData, uploadedFile):
    1. Input Validation:
        IF string_length(complaintData.title) < 5 OR string_length(complaintData.title) > 100 THEN
            RETURN Error(400, "Complaint title must be between 5 and 100 characters.")
        ENDIF
        IF string_length(complaintData.description) < 10 OR string_length(complaintData.description) > 1000 THEN
            RETURN Error(400, "Description must be between 10 and 1000 characters.")
        ENDIF
        IF complaintData.categoryId IS NULL OR complaintData.hostelBlock IS NULL OR complaintData.roomNumber IS NULL THEN
            RETURN Error(400, "Category, hostel block, and room location are required.")
        ENDIF

    2. Category Existence Check:
        category = DB.query("SELECT is_active FROM complaint_categories WHERE category_id = ?", [complaintData.categoryId])
        IF category IS NULL OR category.is_active != 1 THEN
            RETURN Error(400, "Selected complaint category is invalid or inactive.")
        ENDIF

    3. Optional File Handling:
        imageUrl = NULL
        IF uploadedFile IS NOT NULL THEN
            IF uploadedFile.mimetype NOT IN ["image/jpeg", "image/png"] OR uploadedFile.size > 2097152 THEN
                RETURN Error(400, "File must be a valid JPEG or PNG image under 2MB.")
            ENDIF
            imageUrl = "/uploads/" + uploadedFile.filename
        ENDIF

    4. Generate Unique Complaint ID:
        complaintId = "CMP-" + GenerateTimestampedSequence()

    5. Execute Atomic Database Insertion:
        BEGIN TRANSACTION
            INSERT INTO complaints (
                complaint_id, student_id, category_id, title, description,
                hostel_block, room_number, priority, current_status, image_url
            ) VALUES (
                complaintId, studentId, complaintData.categoryId, complaintData.title, complaintData.description,
                complaintData.hostelBlock, complaintData.roomNumber, 'Medium', 'Submitted', imageUrl
            );

            historyId = "H-" + GenerateUUID()
            INSERT INTO complaint_status_history (
                history_id, complaint_id, previous_status, new_status, changed_by, comments
            ) VALUES (
                historyId, complaintId, NULL, 'Submitted', studentId, 'Complaint submitted by resident student.'
            );
        COMMIT TRANSACTION

    6. RETURN Success(201, { complaintId: complaintId, status: "Submitted" })
END ALGORITHM
```

---

### 3.2 Operation 2: `assignComplaint(...)` (Supports UC-008)
- **Component:** `AssignmentManagementService`
- **Method Signature:** `assignComplaint(authorityId, complaintId, staffId, priority, remarks) -> Result<AssignmentRecord>`
- **Structured Logic / Algorithm:**
```text
ALGORITHM AssignComplaint(authorityId, complaintId, staffId, priority, remarks):
    1. Authorization Check:
        userRole = DB.query("SELECT role FROM users WHERE user_id = ?", [authorityId])
        IF userRole != "HostelAuthority" THEN
            RETURN Error(403, "Only authorized hostel authorities can assign complaints.")
        ENDIF

    2. Complaint Eligibility Check:
        complaint = DB.query("SELECT current_status FROM complaints WHERE complaint_id = ?", [complaintId])
        IF complaint IS NULL THEN
            RETURN Error(404, "Complaint not found.")
        ENDIF
        IF complaint.current_status IN ["Closed", "Rejected / Invalid"] THEN
            RETURN Error(400, "Cannot assign a closed or rejected complaint.")
        ENDIF

    3. Staff Validation:
        staff = DB.query("SELECT role, account_status FROM users WHERE user_id = ?", [staffId])
        IF staff IS NULL OR staff.role != "MaintenanceStaff" OR staff.account_status != "Active" THEN
            RETURN Error(400, "Selected staff member is invalid, unauthorized, or inactive.")
        ENDIF

    4. Execute Assignment Transaction:
        BEGIN TRANSACTION
            assignmentId = "AS-" + GenerateUUID()
            INSERT INTO complaint_assignments (
                assignment_id, complaint_id, staff_id, assigned_by, assignment_status, remarks
            ) VALUES (
                assignmentId, complaintId, staffId, authorityId, 'Assigned', remarks
            );

            UPDATE complaints SET
                assigned_staff_id = staffId,
                assigned_by = authorityId,
                assignment_date_time = CURRENT_TIMESTAMP,
                priority = priority,
                current_status = 'Assigned'
            WHERE complaint_id = complaintId;

            historyId = "H-" + GenerateUUID()
            INSERT INTO complaint_status_history (
                history_id, complaint_id, previous_status, new_status, changed_by, comments
            ) VALUES (
                historyId, complaintId, complaint.current_status, 'Assigned', authorityId,
                'Assigned to staff ' + staffId + '. Priority set to ' + priority
            );
        COMMIT TRANSACTION

    5. RETURN Success(200, { complaintId: complaintId, newStatus: "Assigned", staffId: staffId })
END ALGORITHM
```

---

### 3.3 Operation 3: `resolveComplaint(...)` (Supports UC-011)
- **Component:** `ResolutionManagementService`
- **Method Signature:** `resolveComplaint(staffId, complaintId, resolutionDetails) -> Result<Boolean>`
- **Structured Logic / Algorithm:**
```text
ALGORITHM ResolveComplaint(staffId, complaintId, resolutionDetails):
    1. Verify Caller Assignment:
        complaint = DB.query("SELECT current_status, assigned_staff_id FROM complaints WHERE complaint_id = ?", [complaintId])
        IF complaint IS NULL THEN
            RETURN Error(404, "Complaint not found.")
        ENDIF
        IF complaint.assigned_staff_id != staffId THEN
            callerRole = DB.query("SELECT role FROM users WHERE user_id = ?", [staffId])
            IF callerRole != "HostelAuthority" THEN
                RETURN Error(403, "Maintenance staff can only resolve complaints assigned to them.")
            ENDIF
        ENDIF

    2. Status Guard:
        IF complaint.current_status NOT IN ["Assigned", "In Progress"] THEN
            RETURN Error(400, "Only complaints in Assigned or In Progress state can be resolved.")
        ENDIF

    3. Resolution Data Validation:
        IF resolutionDetails IS NULL OR string_length(resolutionDetails) < 10 THEN
            RETURN Error(400, "Resolution details must be provided (at least 10 characters).")
        ENDIF

    4. Execute Atomic Resolution Update:
        BEGIN TRANSACTION
            UPDATE complaints SET
                current_status = 'Resolved',
                resolution_details = resolutionDetails,
                resolved_by = staffId,
                resolution_date_time = CURRENT_TIMESTAMP
            WHERE complaint_id = complaintId;

            UPDATE complaint_assignments SET
                assignment_status = 'Completed'
            WHERE complaint_id = complaintId AND staff_id = staffId;

            historyId = "H-" + GenerateUUID()
            INSERT INTO complaint_status_history (
                history_id, complaint_id, previous_status, new_status, changed_by, comments
            ) VALUES (
                historyId, complaintId, complaint.current_status, 'Resolved', staffId,
                'Issue resolved: ' + resolutionDetails
            );
        COMMIT TRANSACTION

    5. RETURN Success(200, { complaintId: complaintId, newStatus: "Resolved" })
END ALGORITHM
```

---

## 4. Visual Artifact Reference
The exported high-resolution Component Design Diagram is saved at:
`docs/design/assignment-06/diagrams/Component-Design-Diagram.png`  
Editable Mermaid source: `docs/design/assignment-06/diagrams/sources/Component-Design-Diagram.mmd`  
Generator script: `docs/design/assignment-06/diagrams/sources/generate_diagrams.py`
