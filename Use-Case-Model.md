# Assignment 3 — Use Case Model
## Hostel Complaint Management System | Team T042

### Detailed use cases
| ID | Use Case | Primary Actor |
|---|---|---|
| UC-003 | Submit Complaint | Student |
| UC-006 | Assign Complaint | Hostel/Warden Authority |
| UC-008 | Resolve Complaint | Maintenance Staff |

### Actors
- Student
- Hostel/Warden Authority
- Maintenance Staff
- Administrator
- Institute Management

### Use cases inside the system boundary
- Login
- Logout
- Manage Users and Roles
- Submit Complaint
- View Complaint Status
- View Complaint History
- Review Complaint
- Categorize/Prioritize Complaint
- Assign Complaint
- View Assigned Complaints
- Update Complaint Progress
- Resolve Complaint
- Close Complaint
- View Notification
- Generate Complaint Reports

### Actor associations
**Student:** Login, Logout, Submit Complaint, View Complaint Status, View Complaint History, View Notification.

**Hostel/Warden Authority:** Login, Logout, Review Complaint, Categorize/Prioritize Complaint, Assign Complaint, Update Complaint Status, Resolve Complaint where authorized, Close Complaint, View Complaint History, View Notification, Generate Complaint Reports.

**Maintenance Staff:** Login, Logout, View Assigned Complaints, Update Complaint Progress, Resolve Complaint, View Complaint History, View Notification.

**Administrator:** Login, Logout, Manage Users and Roles, Generate Complaint Reports.

**Institute Management:** Login, Logout, Generate Complaint Reports.

### Include / extend relationships
- Assign Complaint `<<include>>` Verify Authorization
- Resolve Complaint `<<include>>` Validate Resolution Information
- Close Complaint `<<include>>` Check Resolution Recorded
- Optional: View Notification `<<extend>>` View Complaint Status

### Status lifecycle
**Submitted → Under Review → Assigned → In Progress → Resolved → Closed**

UC-008 ends at **Resolved**. Closing is a separate use case.

### Diagram-to-use-case mapping
- `Activity-Diagram-UC01.png` = UC-003 Submit Complaint
- `Activity-Diagram-UC02.png` = UC-006 Assign Complaint
- `Activity-Diagram-UC03.png` = UC-008 Resolve Complaint
