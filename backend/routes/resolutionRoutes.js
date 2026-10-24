const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * Helper: Validates that the caller is authorized to modify the complaint's resolution/progress.
 * Staff can only modify complaints assigned to them (BR-006). Authorities can also manage issues.
 */
function verifyStaffOrAuthorityAccess(req, complaint) {
    if (req.user.role === 'HostelAuthority') return true;
    if (req.user.role === 'MaintenanceStaff' && complaint.assigned_staff_id === req.user.userId) return true;
    return false;
}

/**
 * POST /api/resolutions/start-work
 * Transitions complaint status from 'Assigned' to 'In Progress'.
 */
router.post('/start-work', roleMiddleware(['MaintenanceStaff', 'HostelAuthority']), (req, res) => {
    const { complaintId } = req.body;
    const actorId = req.user.userId;

    if (!complaintId) {
        return res.status(400).json({ error: 'Complaint ID is required.' });
    }

    try {
        const complaint = db.prepare('SELECT current_status, assigned_staff_id FROM complaints WHERE complaint_id = ?').get(complaintId);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        if (!verifyStaffOrAuthorityAccess(req, complaint)) {
            return res.status(403).json({ error: 'You are only authorized to start work on complaints assigned to you (BR-006).' });
        }

        if (complaint.current_status !== 'Assigned') {
            return res.status(400).json({ error: `Cannot start work from current status '${complaint.current_status}'. Must be 'Assigned'.` });
        }

        const startTx = db.transaction(() => {
            db.prepare(`
                UPDATE complaints SET current_status = 'In Progress' WHERE complaint_id = ?
            `).run(complaintId);

            db.prepare(`
                UPDATE complaint_assignments SET assignment_status = 'In Progress' 
                WHERE complaint_id = ? AND assignment_status = 'Assigned'
            `).run(complaintId);

            const historyId = `H-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
            db.prepare(`
                INSERT INTO complaint_status_history (
                    history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
                ) VALUES (?, ?, 'Assigned', 'In Progress', ?, CURRENT_TIMESTAMP, 'Technician began physical inspection/repair work.')
            `).run(historyId, complaintId, actorId);
        });

        startTx();
        return res.status(200).json({ message: 'Status updated to In Progress.', newStatus: 'In Progress' });
    } catch (err) {
        console.error('[Start Work Error]:', err);
        return res.status(500).json({ error: 'Failed to update work status.' });
    }
});

/**
 * POST /api/resolutions/progress (UC-010)
 * Logs intermediate progress remarks without altering status from 'In Progress'.
 */
router.post('/progress', roleMiddleware(['MaintenanceStaff', 'HostelAuthority']), (req, res) => {
    const { complaintId, remarks } = req.body;
    const actorId = req.user.userId;

    if (!complaintId || !remarks || typeof remarks !== 'string' || remarks.trim().length < 5) {
        return res.status(400).json({ error: 'A progress remark (at least 5 characters) is required.' });
    }

    try {
        const complaint = db.prepare('SELECT current_status, assigned_staff_id FROM complaints WHERE complaint_id = ?').get(complaintId);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        if (!verifyStaffOrAuthorityAccess(req, complaint)) {
            return res.status(403).json({ error: 'You are only authorized to log progress on complaints assigned to you.' });
        }

        if (!['Assigned', 'In Progress'].includes(complaint.current_status)) {
            return res.status(400).json({ error: `Cannot log progress on complaint in '${complaint.current_status}' status.` });
        }

        const historyId = `H-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
        db.prepare(`
            INSERT INTO complaint_status_history (
                history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
            ) VALUES (?, ?, ?, 'In Progress', ?, CURRENT_TIMESTAMP, ?)
        `).run(historyId, complaintId, complaint.current_status, actorId, `Work update: ${remarks.trim()}`);

        // Ensure complaint is marked In Progress if it was still Assigned
        if (complaint.current_status === 'Assigned') {
            db.prepare("UPDATE complaints SET current_status = 'In Progress' WHERE complaint_id = ?").run(complaintId);
        }

        return res.status(200).json({ message: 'Progress update logged in timeline successfully.' });
    } catch (err) {
        console.error('[Progress Error]:', err);
        return res.status(500).json({ error: 'Failed to record progress remark.' });
    }
});

/**
 * POST /api/resolutions/resolve (UC-011)
 * Records formal resolution report and transitions status to 'Resolved'.
 */
router.post('/resolve', roleMiddleware(['MaintenanceStaff', 'HostelAuthority']), (req, res) => {
    const { complaintId, resolutionDetails } = req.body;
    const actorId = req.user.userId;

    if (!complaintId || !resolutionDetails || typeof resolutionDetails !== 'string' || resolutionDetails.trim().length < 10) {
        return res.status(400).json({ error: 'Detailed resolution explanation (minimum 10 characters) is required before resolving (BR-008).' });
    }

    try {
        const complaint = db.prepare('SELECT current_status, assigned_staff_id FROM complaints WHERE complaint_id = ?').get(complaintId);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        if (!verifyStaffOrAuthorityAccess(req, complaint)) {
            return res.status(403).json({ error: 'You are only authorized to resolve complaints assigned to you.' });
        }

        if (!['Assigned', 'In Progress'].includes(complaint.current_status)) {
            return res.status(400).json({ error: `Cannot resolve a complaint in '${complaint.current_status}' status.` });
        }

        const resolveTx = db.transaction(() => {
            db.prepare(`
                UPDATE complaints SET
                    current_status = 'Resolved',
                    resolution_details = ?,
                    resolved_by = ?,
                    resolution_date_time = CURRENT_TIMESTAMP
                WHERE complaint_id = ?
            `).run(resolutionDetails.trim(), actorId, complaintId);

            db.prepare(`
                UPDATE complaint_assignments SET assignment_status = 'Completed'
                WHERE complaint_id = ? AND assignment_status IN ('Assigned', 'In Progress')
            `).run(complaintId);

            const historyId = `H-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
            db.prepare(`
                INSERT INTO complaint_status_history (
                    history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
                ) VALUES (?, ?, ?, 'Resolved', ?, CURRENT_TIMESTAMP, ?)
            `).run(historyId, complaintId, complaint.current_status, actorId, `Resolved: ${resolutionDetails.trim()}`);
        });

        resolveTx();
        return res.status(200).json({ message: 'Complaint resolved successfully.', newStatus: 'Resolved' });
    } catch (err) {
        console.error('[Resolve Error]:', err);
        return res.status(500).json({ error: 'Failed to record resolution.' });
    }
});

/**
 * POST /api/resolutions/close (UC-012)
 * Formally closes a complaint.
 * Permitted STRICTLY for HostelAuthority (BR-008, BR-009).
 */
router.post('/close', roleMiddleware('HostelAuthority'), (req, res) => {
    const { complaintId } = req.body;
    const authorityId = req.user.userId;

    if (!complaintId) {
        return res.status(400).json({ error: 'Complaint ID is required.' });
    }

    try {
        const complaint = db.prepare('SELECT current_status, resolution_details FROM complaints WHERE complaint_id = ?').get(complaintId);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        // BR-008: A complaint cannot be closed without recorded resolution information
        if (complaint.current_status !== 'Resolved' || !complaint.resolution_details) {
            return res.status(400).json({
                error: 'A complaint cannot be closed without being in Resolved status with recorded resolution details (BR-008).'
            });
        }

        const closeTx = db.transaction(() => {
            db.prepare(`
                UPDATE complaints SET
                    current_status = 'Closed',
                    closed_date_time = CURRENT_TIMESTAMP
                WHERE complaint_id = ?
            `).run(complaintId);

            const historyId = `H-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
            db.prepare(`
                INSERT INTO complaint_status_history (
                    history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
                ) VALUES (?, ?, 'Resolved', 'Closed', ?, CURRENT_TIMESTAMP, 'Hostel Warden reviewed resolution outcome and formally closed complaint.')
            `).run(historyId, complaintId, authorityId);
        });

        closeTx();
        return res.status(200).json({ message: 'Complaint formally closed.', newStatus: 'Closed' });
    } catch (err) {
        console.error('[Close Error]:', err);
        return res.status(500).json({ error: 'Failed to close complaint.' });
    }
});

module.exports = router;
