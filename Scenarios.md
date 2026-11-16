# Assignment 3 — Scenarios
## Hostel Complaint Management System | Team T042

### UC-003 — Submit Complaint
**Actors:** Student and Hostel Complaint Management System

**Starting condition:** The student is registered and authenticated and the complaint submission facility is available.

**Main sequence**
1. Student selects Submit Complaint.
2. System displays the complaint form.
3. Student enters complaint title, description, category, and hostel/block/room/location details where applicable.
4. Student submits the form.
5. System validates mandatory information.
6. System generates a unique complaint ID.
7. System records submission date and time.
8. System creates the complaint record.
9. System sets status to Submitted.
10. System displays confirmation and complaint ID.

**Alternative/exception:** Missing or invalid information is highlighted and the student is asked to correct it. If a system error occurs, the complaint is not treated as successfully submitted and no false confirmation is shown.

**Expected outcome:** A valid complaint record exists with a unique ID, complaint details, submission date/time, and initial status Submitted.

### UC-006 — Assign Complaint
**Actors:** Hostel/Warden Authority, Maintenance Staff, and System

**Starting condition:** The authority is authenticated, the complaint exists and has been reviewed, and the complaint is eligible for assignment.

**Main sequence**
1. Authority opens complaint management.
2. Authority selects a complaint.
3. System displays complaint details.
4. Authority selects appropriate maintenance staff.
5. System verifies authority permission.
6. System verifies that the selected maintenance staff member is valid and active.
7. System records the assignment and assignment date/time.
8. System changes complaint status to Assigned.
9. System records the assignment in complaint history.
10. System makes the assignment visible to the selected maintenance staff member.

**Alternative/exception:** Unauthorized users are rejected. If no suitable active staff member is available, the complaint remains unassigned. A closed complaint cannot be assigned. An inactive/invalid staff member causes the authority to select another staff member.

**Expected outcome:** The complaint is assigned to valid maintenance staff and its status becomes Assigned.

### UC-008 — Resolve Complaint
**Actors:** Maintenance Staff, optionally authorized Hostel/Warden Authority, and System

**Starting condition:** The user is authenticated and authorized and the complaint is Assigned or In Progress.

**Main sequence**
1. Maintenance Staff opens the assigned complaint.
2. System displays complaint details.
3. Maintenance Staff performs or coordinates maintenance work.
4. Maintenance Staff enters progress or resolution details.
5. Maintenance Staff marks the issue as resolved.
6. System validates the resolution information.
7. System records resolution details and resolved date/time.
8. System changes complaint status to Resolved.
9. System records the status change in complaint history.
10. System makes the outcome visible to the concerned student and authority.

**Alternative/exception:** Unauthorized users are rejected. Missing resolution information is rejected and the staff member is asked to complete it. If the issue is not solved, progress is recorded and the status remains In Progress.

**Expected outcome:** Resolution information is stored and the complaint status becomes Resolved.

**Important:** UC-008 does not close the complaint. Closure is handled separately.
