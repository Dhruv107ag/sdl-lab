-- Hostel Complaint Management System
-- SQLite Schema DDL with Referential Integrity Constraints

PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    contact_number TEXT,
    role TEXT NOT NULL CHECK(role IN ('Student', 'HostelAuthority', 'MaintenanceStaff', 'Administrator', 'InstituteManagement')),
    account_status TEXT NOT NULL DEFAULT 'Active' CHECK(account_status IN ('Active', 'Inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complaint Categories Table
CREATE TABLE IF NOT EXISTS complaint_categories (
    category_id TEXT PRIMARY KEY,
    category_name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1))
);

-- 3. Complaints Table (7-State Lifecycle)
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL CHECK(length(title) >= 5 AND length(title) <= 100),
    description TEXT NOT NULL CHECK(length(description) >= 10 AND length(description) <= 1000),
    hostel_block TEXT NOT NULL,
    room_number TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')),
    current_status TEXT NOT NULL DEFAULT 'Submitted' CHECK(current_status IN (
        'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected / Invalid'
    )),
    image_url TEXT,
    submission_date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_staff_id TEXT,
    assigned_by TEXT,
    assignment_date_time DATETIME,
    resolution_details TEXT,
    resolved_by TEXT,
    resolution_date_time DATETIME,
    rejection_reason TEXT,
    closed_date_time DATETIME,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES complaint_categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_staff_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (resolved_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 4. Complaint Assignment History Table
CREATE TABLE IF NOT EXISTS complaint_assignments (
    assignment_id TEXT PRIMARY KEY,
    complaint_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    assigned_by TEXT NOT NULL,
    assignment_status TEXT NOT NULL DEFAULT 'Assigned' CHECK(assignment_status IN ('Assigned', 'In Progress', 'Completed', 'Reassigned', 'Cancelled')),
    assignment_date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 5. Complaint Status History (Audit Trail) Table
CREATE TABLE IF NOT EXISTS complaint_status_history (
    history_id TEXT PRIMARY KEY,
    complaint_id TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    change_date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    comments TEXT NOT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Performance & Indexing
CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(current_status);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_staff ON complaints(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_history_complaint ON complaint_status_history(complaint_id);
