# The LNM Institute of Information Technology, Jaipur

## Software Development Laboratory

### Course Code: CS314

# Lab Assignment 2 --- Requirements Specification / Initial SRS (v1.0)

**Project Name:** Hostel Complaint Management System\
**Project Type:** Web-based Hostel Complaint Management and Tracking
System\
**Team ID:** T042\
**Team Members:** DHRUV AGRAWAL, SANYAM HUMAD, HARSHIL AGRAWAL, AKSHAT
KHANDAL\
**Roll Numbers:** 24UCS016, 24UCS017, 24UCS018, 24UCS019\
**Development Model:** Agile + Incremental Development\
**Version:** SRS v1.0

------------------------------------------------------------------------

## 1. User Classes

### 1.1 Student

Students are the primary users who report hostel-related problems.

**Responsibilities and interactions:** - Authenticate into the system. -
Submit hostel complaints. - Provide complaint details and select an
appropriate category. - View submitted complaints. - Track the current
status of complaints. - View complaint history and resolution/outcome. -
Receive relevant complaint/status notifications.

### 1.2 Hostel/Warden Authority

Hostel/Warden Authority members manage complaints within their
responsibility.

**Responsibilities and interactions:** - View submitted complaints. -
Review and prioritize complaints. - Manage complaint information and
status. - Assign complaints to appropriate maintenance staff where
applicable. - Monitor pending and unresolved complaints. - View basic
complaint reports/dashboard information.

### 1.3 Maintenance Staff

Maintenance Staff handle complaints assigned to them.

**Responsibilities and interactions:** - View complaints assigned to
them. - Review complaint details. - Work on assigned maintenance
issues. - Update progress information. - Update resolution
information/status.

### 1.4 Administrator

Administrators manage system-level access and users.

**Responsibilities and interactions:** - Manage user accounts. - Assign
and manage user roles. - Monitor overall system activity. - Manage
system-level configuration where applicable. - Access administrative
reports/dashboard information.

------------------------------------------------------------------------

## 2. System Context

The Hostel Complaint Management System acts as the central platform
between students, hostel authorities, maintenance staff and
administrators.

### External actors/entities

-   **Student:** submits complaints and tracks their status/history.
-   **Hostel/Warden Authority:** reviews, prioritizes, assigns and
    monitors complaints.
-   **Maintenance Staff:** handles assigned complaints and updates
    progress/resolution.
-   **Administrator:** manages users, roles and overall system activity.
-   **Central Database:** stores user, complaint, assignment, status,
    notification and history records.

### Context-level interaction

``` text
                    +-----------------------------+
                    |   Student                   |
                    | Submit / Track Complaints   |
                    +-------------+---------------+
                                  |
                                  v
+----------------+       +--------+---------+       +----------------------+
| Administrator  |<----->| Hostel Complaint |<----->| Hostel/Warden        |
| Users / Roles  |       | Management       |       | Authority             |
+----------------+       | System           |       | Review / Assign /     |
                         |                  |       | Monitor Complaints    |
                         +--------+---------+       +----------------------+
                                  |
                                  v
                    +-------------+---------------+
                    | Maintenance Staff           |
                    | Handle / Update Complaints  |
                    +-----------------------------+
                                  |
                                  v
                    +-----------------------------+
                    | Central Database            |
                    | Users / Complaints /        |
                    | History / Notifications     |
                    +-----------------------------+
```

------------------------------------------------------------------------

## 3. Functional Requirements

### 3.1 Authentication and Account Management

**FR-001 --- User Login**\
The system shall allow a registered user to authenticate using valid
credentials.

**FR-002 --- Authentication Failure**\
The system shall display an appropriate error message when
authentication fails without revealing sensitive authentication
information.

**FR-003 --- Logout**\
The system shall allow authenticated users to terminate their active
session.

**FR-004 --- Role Assignment**\
The system shall allow an authorized administrator to assign an
appropriate role to a user.

**FR-005 --- Role-Based Access**\
The system shall restrict system functions according to the
authenticated user's assigned role.

### 3.2 Complaint Submission and Categorization

**FR-006 --- Submit Complaint**\
The system shall allow an authenticated student to submit a
hostel-related complaint.

**FR-007 --- Complaint Details**\
The system shall allow a student to provide required complaint
information including complaint title, description, category and
relevant hostel/location details.

**FR-008 --- Complaint Category**\
The system shall allow a student to select a complaint category from the
categories available in the system.

**FR-009 --- Complaint Record Creation**\
The system shall create a unique complaint record when a valid complaint
is submitted.

**FR-010 --- Submission Confirmation**\
The system shall display a confirmation containing the complaint
reference after successful complaint submission.

### 3.3 Complaint Viewing and Management

**FR-011 --- View Own Complaints**\
The system shall allow a student to view complaints submitted by that
student.

**FR-012 --- View Complaint Details**\
The system shall display the relevant details of a selected complaint to
an authorized user.

**FR-013 --- View All Managed Complaints**\
The system shall allow authorized hostel personnel to view complaints
within their responsibility.

**FR-014 --- Prioritize Complaint**\
The system shall allow an authorized hostel authority to assign or
update the priority of a complaint.

**FR-015 --- Update Complaint Status**\
The system shall allow authorized users to update a complaint's status
according to the defined workflow.

**FR-016 --- Complaint Status Display**\
The system shall display the current complaint status to the student and
authorized personnel according to their access permissions.

### 3.4 Complaint Assignment

**FR-017 --- Assign Complaint**\
The system shall allow an authorized hostel authority to assign an
appropriate complaint to available/authorized maintenance staff where
applicable.

**FR-018 --- View Assigned Complaints**\
The system shall allow maintenance staff to view complaints assigned to
them.

**FR-019 --- Assignment Information**\
The system shall maintain the assigned maintenance staff information for
each assigned complaint.

**FR-020 --- Assignment Update**\
The system shall allow an authorized hostel authority to update the
assignment of a complaint where required.

### 3.5 Complaint Progress and Resolution

**FR-021 --- Update Progress**\
The system shall allow authorized maintenance staff to update the
progress information of complaints assigned to them.

**FR-022 --- Update Resolution**\
The system shall allow authorized maintenance staff to enter resolution
information for complaints handled by them.

**FR-023 --- Resolve Complaint**\
The system shall allow an authorized user to mark a complaint as
resolved when the required resolution information has been provided.

**FR-024 --- Close Complaint**\
The system shall allow an authorized hostel authority to close a
complaint according to the defined complaint workflow.

### 3.6 Complaint History

**FR-025 --- Maintain Complaint History**\
The system shall maintain the history of significant updates made to
each complaint.

**FR-026 --- View Complaint History**\
The system shall allow authorized users to view the complaint history
according to their roles.

**FR-027 --- History Timestamp**\
The system shall record the date/time associated with each significant
complaint update.

### 3.7 Notifications and Status Updates

**FR-028 --- Complaint Submission Notification**\
The system shall provide a relevant notification/status update after
successful complaint submission.

**FR-029 --- Status Change Notification**\
The system shall notify the affected student when the status of their
complaint changes significantly.

**FR-030 --- Assignment/Update Notification**\
The system shall provide relevant notifications to authorized users when
a complaint is assigned or requires action.

**FR-031 --- Resolution Notification**\
The system shall notify the affected student when their complaint is
marked resolved/closed.

### 3.8 Reports and Dashboard

**FR-032 --- Complaint Summary Report**\
The system shall generate basic complaint summary information for
authorized users.

**FR-033 --- Pending Complaint Report**\
The system shall allow authorized hostel personnel to view information
about pending and unresolved complaints.

**FR-034 --- Resolved Complaint Report**\
The system shall allow authorized users to view information about
resolved/closed complaints.

**FR-035 --- Administrative Dashboard**\
The system shall provide authorized administrators with basic summary
information about complaint activity.

------------------------------------------------------------------------

## 4. Business Rules

  -----------------------------------------------------------------------
  ID                                  Business Rule
  ----------------------------------- -----------------------------------
  BR-001                              Only authenticated and authorized
                                      users shall access protected system
                                      functions.

  BR-002                              Students shall be permitted to
                                      submit complaints related to hostel
                                      facilities/services.

  BR-003                              Every submitted complaint shall
                                      have a unique complaint identifier.

  BR-004                              A complaint shall have a defined
                                      category.

  BR-005                              Only authorized hostel personnel
                                      shall review, prioritize and manage
                                      complaints.

  BR-006                              Only authorized hostel personnel
                                      shall assign complaints to
                                      maintenance staff.

  BR-007                              Maintenance staff shall only update
                                      complaints assigned to them,
                                      subject to their permissions.

  BR-008                              Complaint status shall be updated
                                      only by authorized users.

  BR-009                              A complaint shall retain its
                                      significant status/update history.

  BR-010                              A complaint shall not be marked
                                      resolved without appropriate
                                      resolution information.

  BR-011                              Closed complaints shall not
                                      normally be modified except by an
                                      authorized user according to
                                      applicable permissions.

  BR-012                              Users shall only access complaint
                                      information permitted by their
                                      role.

  BR-013                              Administrative reports shall only
                                      be accessible to authorized users.

  BR-014                              Notifications/status updates shall
                                      be generated for significant
                                      complaint events where notification
                                      functionality is enabled.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. Non-Functional Requirements

### 5.1 Performance

**NFR-001:** The system shall provide acceptable response times for
normal operations such as login, complaint submission and complaint
viewing under the expected workload.

**NFR-002:** Complaint search, filtering and listing operations shall
return results within an acceptable time under expected workload.

**NFR-003:** The system shall support the expected number of concurrent
users for the prototype deployment.

### 5.2 Security

**NFR-004:** Protected functionality shall require authentication.

**NFR-005:** Access to system functionality and complaint data shall be
controlled using role-based access.

**NFR-006:** The system shall not expose passwords or other sensitive
authentication information to unauthorized users.

**NFR-007:** Administrative and other significant privileged operations
should be auditable.

### 5.3 Usability

**NFR-008:** The system shall provide consistent navigation across major
user interfaces.

**NFR-009:** Error and validation messages shall be understandable to
the intended users.

**NFR-010:** Common tasks such as submitting a complaint and checking
complaint status shall require minimal unnecessary interaction.

### 5.4 Reliability

**NFR-011:** Successfully submitted complaint records shall be reliably
stored in the centralized database.

**NFR-012:** Complaint history and status records shall not be lost
during normal system operation.

### 5.5 Availability

**NFR-013:** The system should be available during normal hostel/campus
operating periods except during planned maintenance.

### 5.6 Maintainability

**NFR-014:** The software shall follow a modular architecture so that
individual components can be modified with limited impact on unrelated
components.

**NFR-015:** Source code shall be maintained using version control.

**NFR-016:** Relevant software documentation shall be updated when
significant system changes are made.

### 5.7 Scalability

**NFR-017:** The architecture should allow the system to support
increasing numbers of users, complaints and complaint records.

### 5.8 Compatibility

**NFR-018:** The web application should operate correctly on commonly
used modern web browsers.

### 5.9 Privacy

**NFR-019:** Personal information and complaint information shall be
accessible only to users authorized by the applicable role and
responsibility.

### 5.10 Auditability

**NFR-020:** Significant administrative and complaint-management actions
should be recorded with the responsible user and timestamp where
applicable.

------------------------------------------------------------------------

## 6. Data Requirements

The initial logical information requirements include the following
entities.

### 6.1 User

**Attributes:** - User ID - Name - Email - Contact information - Role -
Account status - Authentication information

### 6.2 Complaint

**Attributes:** - Complaint ID - Student/User ID - Title - Description -
Category - Hostel/location details - Priority - Current status -
Submission date/time - Assigned staff ID - Resolution information -
Closure date/time

### 6.3 Complaint Category

**Attributes:** - Category ID - Category name - Description - Category
status

### 6.4 Assignment

**Attributes:** - Assignment ID - Complaint ID - Maintenance Staff ID -
Assigned by - Assignment date/time - Assignment status

### 6.5 Complaint History

**Attributes:** - History ID - Complaint ID - Updated by - Previous
status - New status - Action/comment - Timestamp

### 6.6 Notification

**Attributes:** - Notification ID - Recipient User ID - Complaint ID -
Notification type - Message - Timestamp - Read/status information

### 6.7 Report

**Attributes:** - Report ID - Report type - Generated by - Generation
date/time - Report parameters/summary information

------------------------------------------------------------------------

## 7. Major Use Cases

  -----------------------------------------------------------------------
  Use Case ID             Use Case                Primary Actor
  ----------------------- ----------------------- -----------------------
  UC-001                  Login                   All Users

  UC-002                  Manage Users and Roles  Administrator

  UC-003                  Submit Complaint        Student

  UC-004                  Categorize Complaint    Student

  UC-005                  View Complaint          Student / Authorized
                                                  Staff

  UC-006                  Manage Complaint        Hostel/Warden Authority

  UC-007                  Prioritize Complaint    Hostel/Warden Authority

  UC-008                  Assign Complaint        Hostel/Warden Authority

  UC-009                  View Assigned Complaint Maintenance Staff

  UC-010                  Update Complaint        Maintenance Staff
                          Progress                

  UC-011                  Resolve Complaint       Maintenance Staff /
                                                  Authorized Authority

  UC-012                  Close Complaint         Hostel/Warden Authority

  UC-013                  Track Complaint Status  Student

  UC-014                  View Complaint History  Student / Authorized
                                                  Staff

  UC-015                  Receive Notification    Student / Authorized
                                                  User

  UC-016                  Generate Complaint      Authorized User
                          Reports                 

  UC-017                  View Administrative     Administrator
                          Dashboard               
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 8. Detailed Use Cases

### UC-003 --- Submit Complaint

**Primary Actor:** Student

**Preconditions:** - Student has a valid account. - Student is
authenticated. - Student is authorized to submit hostel complaints.

**Main Flow:** 1. Student selects the option to submit a complaint. 2.
System displays the complaint submission form. 3. Student enters
complaint title and description. 4. Student selects the appropriate
complaint category. 5. Student provides relevant hostel/location
information. 6. Student submits the complaint. 7. System validates the
required information. 8. System creates a unique complaint record. 9.
System stores the complaint in the centralized database. 10. System
displays the complaint reference/confirmation. 11. System generates the
applicable submission notification/status update.

**Alternative/Exception Flows:** - If required information is missing,
the system asks the student to complete the required fields. - If the
student is not authenticated, the system redirects the student to
login. - If the complaint cannot be stored, the system displays an
appropriate error and does not show false submission success.

**Postconditions:** - A valid complaint record exists. - The complaint
has a unique identifier and initial status. - The student can view/track
the submitted complaint.

------------------------------------------------------------------------

### UC-008 --- Assign Complaint

**Primary Actor:** Hostel/Warden Authority

**Preconditions:** - Authority user is authenticated and authorized. -
Complaint exists and is within the authority's responsibility. -
Appropriate maintenance staff information is available.

**Main Flow:** 1. Authority opens the complaint management section. 2.
System displays complaints available for management. 3. Authority
selects a complaint. 4. System displays complaint details and current
status. 5. Authority selects an appropriate maintenance staff member. 6.
Authority confirms the assignment. 7. System records the assignment. 8.
System updates the complaint's assignment information. 9. System records
the significant action in complaint history. 10. System provides the
relevant notification/status update.

**Alternative/Exception Flows:** - If the complaint is already closed,
the system shall prevent normal assignment. - If no appropriate
maintenance staff member is available, the system shall not create an
invalid assignment. - If the authority lacks permission for the
complaint, the system shall deny the action.

**Postconditions:** - The complaint is associated with the selected
maintenance staff member. - Assignment information is stored. - Relevant
history/notification information is recorded.

------------------------------------------------------------------------

### UC-013 --- Track Complaint Status

**Primary Actor:** Student

**Preconditions:** - Student is authenticated. - Student has at least
one complaint submitted through the system.

**Main Flow:** 1. Student opens the complaint tracking section. 2.
System displays the student's complaints. 3. Student selects a
complaint. 4. System displays the current status and relevant complaint
information. 5. Student may view significant complaint history and
resolution/outcome information.

**Alternative/Exception Flows:** - If no complaints exist, the system
displays an appropriate message. - If the requested complaint does not
belong to the student, the system denies access. - If complaint details
cannot be retrieved, the system displays an appropriate error.

**Postconditions:** - Student has viewed the current authorized status
of the complaint. - No complaint information is modified by this use
case.

------------------------------------------------------------------------

## 9. User Stories

**US-001:** As a student, I want to log in so that I can securely access
the complaint management system.

**US-002:** As a student, I want to submit a hostel complaint so that my
problem can be formally reported.

**US-003:** As a student, I want to select a complaint category so that
my complaint can be routed and managed appropriately.

**US-004:** As a student, I want to receive a complaint reference after
submission so that I can identify and track my complaint.

**US-005:** As a student, I want to view my complaints so that I can
monitor the problems I have reported.

**US-006:** As a student, I want to track complaint status so that I
know whether my complaint is pending, being worked on or resolved.

**US-007:** As a student, I want to view complaint history so that I can
see important updates made to my complaint.

**US-008:** As a student, I want to receive status notifications so that
I know when there is important progress on my complaint.

**US-009:** As a hostel/warden authority, I want to view submitted
complaints so that I can manage hostel issues systematically.

**US-010:** As a hostel/warden authority, I want to prioritize
complaints so that important issues can be handled appropriately.

**US-011:** As a hostel/warden authority, I want to assign complaints to
maintenance staff so that the responsible person can work on them.

**US-012:** As maintenance staff, I want to view complaints assigned to
me so that I know which maintenance issues I need to handle.

**US-013:** As maintenance staff, I want to update complaint progress so
that students and hostel authorities can know the current situation.

**US-014:** As maintenance staff, I want to enter resolution information
so that the completed work is recorded.

**US-015:** As an administrator, I want to manage users and roles so
that system access is properly controlled.

**US-016:** As an authorized user, I want to view complaint reports so
that I can monitor pending and resolved complaints.

------------------------------------------------------------------------

## 10. Acceptance Criteria

### US-002 --- Submit a Hostel Complaint

  -----------------------------------------------------------------------
  ID                                  Acceptance Criterion
  ----------------------------------- -----------------------------------
  AC-001                              The student must be authenticated
                                      before submitting a complaint.

  AC-002                              Required complaint information must
                                      be provided before submission is
                                      accepted.

  AC-003                              A valid complaint must have a
                                      selected category.

  AC-004                              Successful submission must create a
                                      unique complaint record.

  AC-005                              The system must display a complaint
                                      reference/confirmation after
                                      successful submission.

  AC-006                              The submitted complaint must be
                                      available to the student for
                                      tracking.
  -----------------------------------------------------------------------

### US-006 --- Track Complaint Status

  -----------------------------------------------------------------------
  ID                                  Acceptance Criterion
  ----------------------------------- -----------------------------------
  AC-007                              The student must be authenticated.

  AC-008                              The student must only be able to
                                      view complaints submitted by that
                                      student.

  AC-009                              The system must display the current
                                      status of the selected complaint.

  AC-010                              The system should display relevant
                                      history/outcome information where
                                      available.

  AC-011                              The system must not allow status
                                      modification through the student
                                      tracking function.
  -----------------------------------------------------------------------

### US-011 --- Assign Complaint to Maintenance Staff

  -----------------------------------------------------------------------
  ID                                  Acceptance Criterion
  ----------------------------------- -----------------------------------
  AC-012                              The authority user must be
                                      authenticated and authorized.

  AC-013                              The selected complaint must exist
                                      and be within the authority's
                                      responsibility.

  AC-014                              The authority must select an
                                      appropriate maintenance staff
                                      member.

  AC-015                              Successful assignment must be
                                      stored against the complaint.

  AC-016                              The assignment action must be
                                      reflected in complaint history
                                      where applicable.

  AC-017                              Relevant notification/status
                                      information must be generated where
                                      notification functionality is
                                      enabled.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 11. Requirements Prioritization --- MoSCoW

### Must Have

-   Authentication and logout
-   Role-based access
-   Student complaint submission
-   Complaint categorization
-   Complaint record creation
-   Complaint viewing
-   Complaint status tracking
-   Complaint assignment
-   Maintenance staff complaint handling
-   Complaint progress/status updates
-   Complaint history
-   Basic complaint management

### Should Have

-   Complaint priority management
-   Status notifications
-   Resolution/closure information
-   Basic pending/resolved reports
-   Administrative dashboard
-   Detailed audit information

### Could Have

-   Advanced filtering and search
-   Richer dashboards and analytics
-   Additional notification channels
-   Exportable reports
-   Enhanced complaint history views

### Won't Have in Initial Release

-   Payment processing
-   Hostel admission management
-   Complete room-allocation management
-   Mess/food management
-   Complete college ERP
-   Automated physical repair
-   Hardware/IoT control
-   Advanced AI-based diagnosis/recommendation
-   Academic course registration
-   Online examinations

------------------------------------------------------------------------

## 12. Requirements Traceability

  Functional Requirement   User Story   Use Case   Testing
  ------------------------ ------------ ---------- ---------
  FR-001                   US-001       UC-001     TBD
  FR-005                   US-015       UC-002     TBD
  FR-006                   US-002       UC-003     TBD
  FR-008                   US-003       UC-004     TBD
  FR-011                   US-005       UC-005     TBD
  FR-014                   US-010       UC-007     TBD
  FR-017                   US-011       UC-008     TBD
  FR-018                   US-012       UC-009     TBD
  FR-021                   US-013       UC-010     TBD
  FR-022                   US-014       UC-011     TBD
  FR-016                   US-006       UC-013     TBD
  FR-025                   US-007       UC-014     TBD
  FR-029                   US-008       UC-015     TBD
  FR-032                   US-016       UC-016     TBD
  FR-035                   US-016       UC-017     TBD

**Note:** Testing references will be completed during the testing phase.

------------------------------------------------------------------------

## 13. Requirements Validation

  -----------------------------------------------------------------------
  Validation Aspect                   Review Result
  ----------------------------------- -----------------------------------
  Correctness                         Requirements are derived from the
                                      stakeholders, objectives and
                                      initial scope defined in Assignment
                                      1.

  Unambiguity                         Requirements use specific
                                      statements and the "shall" form
                                      wherever possible.

  Completeness                        Major functions, business rules,
                                      NFRs, data, use cases, stories and
                                      acceptance criteria are covered.

  Consistency                         Requirement IDs, user stories and
                                      use cases use consistent
                                      terminology and relationships.

  Verifiability                       Functional requirements and
                                      acceptance criteria are written so
                                      that their satisfaction can be
                                      checked.

  Feasibility                         Requirements are limited to a
                                      web-based prototype suitable for
                                      the available student development
                                      time and resources.

  Traceability                        Major functional requirements are
                                      mapped to user stories and use
                                      cases.

  Prioritization                      Major features are categorized
                                      using MoSCoW.

  Modifiability                       Requirements are uniquely
                                      identified and grouped into logical
                                      sections so individual requirements
                                      can be updated without rewriting
                                      the complete SRS.
  -----------------------------------------------------------------------

### Requirement Quality Example

**Poor:**\
"The system should be fast and easy to use."

**Better:**\
"The system shall provide consistent navigation across major user
interfaces."

The better requirement is more specific and can be reviewed/tested more
consistently.

------------------------------------------------------------------------

## 14. Complaint Lifecycle

The initial complaint workflow is:

``` text
Submitted
    |
    v
Under Review
    |
    +------------------+
    |                  |
    v                  v
Assigned           Rejected/Invalid
    |
    v
In Progress
    |
    v
Resolved
    |
    v
Closed
```

The exact statuses and transition permissions may be refined during
later design and implementation, provided they remain consistent with
this SRS baseline.

------------------------------------------------------------------------

## 15. Requirement Change Management

Because the project follows Agile + Incremental Development,
requirements may change during development.

The proposed change process is:

**Change Request → Impact Analysis → Requirement Update → Backlog Update
→ Prioritization → Design Change → Implementation → Testing → Release**

Any approved change affecting requirements shall also update the
relevant SRS sections and traceability information.

------------------------------------------------------------------------

## 16. SRS Baseline and Versioning

**Initial Baseline:** SRS v1.0

This version establishes the initial requirements baseline for the
Hostel Complaint Management System. It covers authentication, role-based
access, complaint submission, categorization, management, assignment,
status tracking, complaint history, notifications and basic
reporting/dashboard functionality.

Future changes shall be recorded through the project's
requirement/change-management process.

------------------------------------------------------------------------

## 17. AI Usage Declaration

**AI Tool(s) Used:** ChatGPT

**Purpose of AI Use:** Used for understanding the assignment guidelines,
structuring the Requirements Specification, brainstorming and drafting
initial requirements, use cases, user stories and validation content.
The generated suggestions shall be reviewed, verified and adapted by the
team.

**Team ID:** T042

**Team Representative:** Sanyam Humad

**Date:** 07/09/2026

**Team Declaration:**\
We confirm that the requirements in this document represent our team's
understanding of the Hostel Complaint Management System. We accept
responsibility for reviewing, verifying and adapting the requirements
before submission and for being able to explain them during
viva/discussion.

------------------------------------------------------------------------

## 18. GitHub Submission Structure

``` text
docs/
└── requirements/
    ├── SRS-v1.0.md
    └── diagrams/
        └── System-Context.png
```

### Suggested commits

``` text
docs: add initial requirements specification
docs: add system context diagram
docs: finalize SRS v1.0
```
