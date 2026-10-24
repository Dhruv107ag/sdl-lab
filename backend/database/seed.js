const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

function initAndSeed() {
    console.log('[Seed] Initializing SQLite database schema...');
    
    // 1. Execute schema DDL
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schemaSql);
    console.log('[Seed] Schema created successfully.');

    // Use transaction for safe reproducible seeding
    const seedTx = db.transaction(() => {
        // Clear existing records to ensure idempotent reset
        db.prepare('DELETE FROM complaint_status_history').run();
        db.prepare('DELETE FROM complaint_assignments').run();
        db.prepare('DELETE FROM complaints').run();
        db.prepare('DELETE FROM complaint_categories').run();
        db.prepare('DELETE FROM users').run();

        console.log('[Seed] Cleared existing records.');

        // 2. Insert Complaint Categories
        const insertCategory = db.prepare(`
            INSERT INTO complaint_categories (category_id, category_name, description, is_active)
            VALUES (?, ?, ?, 1)
        `);

        const categories = [
            ['CAT-PLUMB', 'Plumbing', 'Water leaks, broken taps, flush repairs, and pipe blockages'],
            ['CAT-ELEC', 'Electrical', 'Lights, fans, power sockets, switchboards, and wiring issues'],
            ['CAT-CARP', 'Carpentry', 'Door handles, window latches, almirah, bed, and study table repairs'],
            ['CAT-LAN', 'Internet / LAN', 'LAN port connectivity, Wi-Fi router faults, and network cables'],
            ['CAT-HOUSE', 'Housekeeping', 'Room cleaning, washroom hygiene, waste disposal, and pest control'],
            ['CAT-OTHER', 'Other Maintenance', 'Civil works, painting, masonry, and miscellaneous hostel issues']
        ];

        for (const cat of categories) {
            insertCategory.run(cat[0], cat[1], cat[2]);
        }
        console.log(`[Seed] Seeded ${categories.length} complaint categories.`);

        // 3. Insert Demo Users (with bcrypt hashed passwords)
        const insertUser = db.prepare(`
            INSERT INTO users (user_id, name, email, password_hash, contact_number, role, account_status)
            VALUES (?, ?, ?, ?, ?, ?, 'Active')
        `);

        // Common hashed passwords
        const studentHash = bcrypt.hashSync('student123', 10);
        const wardenHash = bcrypt.hashSync('warden123', 10);
        const staffHash = bcrypt.hashSync('staff123', 10);
        const adminHash = bcrypt.hashSync('admin123', 10);
        const mgmtHash = bcrypt.hashSync('director123', 10);

        const users = [
            ['S101', 'Dhruv Agrawal (24UCS016)', 'dhruv@lnmiit.ac.in', studentHash, '+91-9876543210', 'Student'],
            ['S102', 'Sanyam Humad (24UCS017)', 'sanyam@lnmiit.ac.in', studentHash, '+91-9876543211', 'Student'],
            ['A12', 'Chief Warden Sharma', 'warden.sharma@lnmiit.ac.in', wardenHash, '+91-9876543220', 'HostelAuthority'],
            ['M07', 'Ramesh Kumar (Plumber)', 'ramesh.plumber@lnmiit.ac.in', staffHash, '+91-9876543230', 'MaintenanceStaff'],
            ['M08', 'Suresh Sharma (Electrician)', 'suresh.electric@lnmiit.ac.in', staffHash, '+91-9876543231', 'MaintenanceStaff'],
            ['ADM01', 'System Administrator', 'admin@lnmiit.ac.in', adminHash, '+91-9876543240', 'Administrator'],
            ['MGT01', 'Director Office (Management)', 'director@lnmiit.ac.in', mgmtHash, '+91-9876543250', 'InstituteManagement']
        ];

        for (const u of users) {
            insertUser.run(u[0], u[1], u[2], u[3], u[4], u[5]);
        }
        console.log(`[Seed] Seeded ${users.length} demo accounts across all 5 roles.`);

        // 4. Seed Demonstration Complaints with Full Lifecycle & Audit History
        const insertComplaint = db.prepare(`
            INSERT INTO complaints (
                complaint_id, student_id, category_id, title, description,
                hostel_block, room_number, priority, current_status, image_url,
                submission_date_time, assigned_staff_id, assigned_by, assignment_date_time,
                resolution_details, resolved_by, resolution_date_time, closed_date_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertAssignment = db.prepare(`
            INSERT INTO complaint_assignments (
                assignment_id, complaint_id, staff_id, assigned_by, assignment_status, assignment_date_time, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const insertHistory = db.prepare(`
            INSERT INTO complaint_status_history (
                history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        // Complaint 1: Fully Closed LifeCycle Demo
        insertComplaint.run(
            'CMP-101', 'S101', 'CAT-PLUMB',
            'Water tap continuously dripping in washroom',
            'The washbasin tap has a damaged washer resulting in continuous water loss and puddling on the floor.',
            'Hostel Block A', '204', 'High', 'Closed', null,
            '2026-10-20 09:15:00', 'M07', 'A12', '2026-10-20 10:30:00',
            'Replaced the worn rubber washer and tightened the gland nut. Pressure tested for 15 minutes with student present.',
            'M07', '2026-10-20 14:45:00', '2026-10-20 16:30:00'
        );

        insertAssignment.run('AS-501', 'CMP-101', 'M07', 'A12', 'Completed', '2026-10-20 10:30:00', 'Urgent tap repair needed.');

        insertHistory.run('H-901', 'CMP-101', null, 'Submitted', 'S101', '2026-10-20 09:15:00', 'Complaint submitted by student.');
        insertHistory.run('H-902', 'CMP-101', 'Submitted', 'Under Review', 'A12', '2026-10-20 10:00:00', 'Warden inspected and prioritized High.');
        insertHistory.run('H-903', 'CMP-101', 'Under Review', 'Assigned', 'A12', '2026-10-20 10:30:00', 'Assigned to Ramesh Kumar (Plumber).');
        insertHistory.run('H-904', 'CMP-101', 'Assigned', 'In Progress', 'M07', '2026-10-20 13:00:00', 'Staff started repair work and fetched replacement washer.');
        insertHistory.run('H-905', 'CMP-101', 'In Progress', 'Resolved', 'M07', '2026-10-20 14:45:00', 'Replaced washer, leak stopped.');
        insertHistory.run('H-906', 'CMP-101', 'Resolved', 'Closed', 'A12', '2026-10-20 16:30:00', 'Warden confirmed student satisfaction and closed complaint.');

        // Complaint 2: In-Progress Task for Staff M08
        insertComplaint.run(
            'CMP-102', 'S101', 'CAT-ELEC',
            'Ceiling fan regulator not working at speed 3 and 4',
            'The regulator knob is stuck and sparks slightly when rotated to speed 4.',
            'Hostel Block A', '204', 'Medium', 'In Progress', null,
            '2026-10-21 11:20:00', 'M08', 'A12', '2026-10-21 12:15:00',
            null, null, null, null
        );

        insertAssignment.run('AS-502', 'CMP-102', 'M08', 'A12', 'In Progress', '2026-10-21 12:15:00', 'Check capacitor and regulator switch.');
        insertHistory.run('H-907', 'CMP-102', null, 'Submitted', 'S101', '2026-10-21 11:20:00', 'Complaint submitted by student.');
        insertHistory.run('H-908', 'CMP-102', 'Submitted', 'Under Review', 'A12', '2026-10-21 11:50:00', 'Reviewed by Warden.');
        insertHistory.run('H-909', 'CMP-102', 'Under Review', 'Assigned', 'A12', '2026-10-21 12:15:00', 'Assigned to Suresh Sharma (Electrician).');
        insertHistory.run('H-910', 'CMP-102', 'Assigned', 'In Progress', 'M08', '2026-10-21 14:00:00', 'Electrician inspected switchboard, ordered new modular regulator.');

        // Complaint 3: Freshly Submitted Complaint
        insertComplaint.run(
            'CMP-103', 'S102', 'CAT-CARP',
            'Main room door latch broken from inside',
            'The door latch screw came off completely, door cannot be latched from inside at night.',
            'Hostel Block B', '105', 'High', 'Submitted', null,
            '2026-10-22 08:30:00', null, null, null,
            null, null, null, null
        );

        insertHistory.run('H-911', 'CMP-103', null, 'Submitted', 'S102', '2026-10-22 08:30:00', 'Complaint submitted by student.');

        console.log('[Seed] Seeded 3 demonstration complaints with full status history.');
    });

    seedTx();
    console.log('[Seed] Database initialization and seed completed successfully!');
}

// Allow standalone execution: node seed.js
if (require.main === module) {
    try {
        initAndSeed();
        process.exit(0);
    } catch (err) {
        console.error('[Seed Error]:', err);
        process.exit(1);
    }
}

module.exports = { initAndSeed };
