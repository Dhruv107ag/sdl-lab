const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * GET /api/assignments/staff
 * Lists all active maintenance staff for assignment dropdown.
 * Restricted to HostelAuthority and Administrator.
 */
router.get('/staff', roleMiddleware(['HostelAuthority', 'Administrator']), (req, res) => {
    try {
        const staffList = db.prepare(`
            SELECT user_id, name, email, contact_number, account_status
            FROM users
            WHERE role = 'MaintenanceStaff' AND account_status = 'Active'
            ORDER BY name ASC
        `).all();

        return res.status(200).json({ staff: staffList });
    } catch (err) {
        console.error('[Staff List Error]:', err);
        return res.status(500).json({ error: 'Failed to retrieve maintenance staff list.' });
    }
});

/**
 * POST /api/assignments (UC-008)
 * Assigns or reassigns a complaint to a maintenance staff member.
 * Restricted strictly to HostelAuthority (BR-005).
 */
router.post('/', roleMiddleware('HostelAuthority'), (req, res) => {
    const { complaintId, staffId, priority, remarks } = req.body;
    const authorityId = req.user.userId;

    if (!complaintId || !staffId) {
        return res.status(400).json({ error: 'Complaint ID and Staff ID are required.' });
    }

    try {
        // 1. Verify complaint existence and status
        const complaint = db.prepare(`
            SELECT current_status, assigned_staff_id FROM complaints WHERE complaint_id = ?
        `).get(complaintId);

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        if (['Closed', 'Rejected / Invalid'].includes(complaint.current_status)) {
            return res.status(400).json({
                error: `Cannot assign a complaint that is already in '${complaint.current_status}' status (BR-009).`
            });
        }

        // 2. Verify selected maintenance staff member
        const staff = db.prepare(`
            SELECT user_id, name, role, account_status FROM users WHERE user_id = ?
        `).get(staffId);

        if (!staff || staff.role !== 'MaintenanceStaff' || staff.account_status !== 'Active') {
            return res.status(400).json({
                error: 'Selected staff member is invalid, not in Maintenance Staff role, or inactive.'
            });
        }

        const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
        const chosenPriority = validPriorities.includes(priority) ? priority : 'Medium';

        // 3. Execute atomic SQLite transaction
        const assignTx = db.transaction(() => {
            const assignmentId = `AS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
            const isReassignment = complaint.assigned_staff_id && complaint.assigned_staff_id !== staffId;

            // Mark previous active assignments as Reassigned if applicable
            if (isReassignment) {
                db.prepare(`
                    UPDATE complaint_assignments 
                    SET assignment_status = 'Reassigned' 
                    WHERE complaint_id = ? AND assignment_status IN ('Assigned', 'In Progress')
                `).run(complaintId);
            }

            // Record assignment record in complaint_assignments
            db.prepare(`
                INSERT INTO complaint_assignments (
                    assignment_id, complaint_id, staff_id, assigned_by, assignment_status, assignment_date_time, remarks
                ) VALUES (?, ?, ?, ?, 'Assigned', CURRENT_TIMESTAMP, ?)
            `).run(
                assignmentId, complaintId, staffId, authorityId, remarks ? remarks.trim() : null
            );

            // Update complaint record
            db.prepare(`
                UPDATE complaints SET
                    assigned_staff_id = ?,
                    assigned_by = ?,
                    assignment_date_time = CURRENT_TIMESTAMP,
                    priority = ?,
                    current_status = 'Assigned'
                WHERE complaint_id = ?
            `).run(staffId, authorityId, chosenPriority, complaintId);

            // Record status change in complaint_status_history
            const historyId = `H-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
            const actionText = isReassignment 
                ? `Reassigned to staff ${staff.name} (${staffId}) with priority ${chosenPriority}.`
                : `Assigned to maintenance technician ${staff.name} (${staffId}) with priority ${chosenPriority}.`;

            db.prepare(`
                INSERT INTO complaint_status_history (
                    history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
                ) VALUES (?, ?, ?, 'Assigned', ?, CURRENT_TIMESTAMP, ?)
            `).run(historyId, complaintId, complaint.current_status, authorityId, actionText);
        });

        assignTx();

        return res.status(200).json({
            message: 'Complaint assigned successfully.',
            complaintId: complaintId,
            assignedStaffId: staffId,
            newStatus: 'Assigned'
        });
    } catch (err) {
        console.error('[Assignment Error]:', err);
        return res.status(500).json({ error: 'Database transaction error occurred during assignment.' });
    }
});

module.exports = router;
