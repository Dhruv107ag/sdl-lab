const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All complaint routes require authentication
router.use(authMiddleware);

/**
 * GET /api/complaints/categories
 * Returns active complaint categories for dropdown selection.
 */
router.get('/categories', (req, res) => {
    try {
        const categories = db.prepare(`
            SELECT category_id, category_name, description
            FROM complaint_categories
            WHERE is_active = 1
            ORDER BY category_name ASC
        `).all();
        return res.status(200).json({ categories });
    } catch (err) {
        console.error('[Category Error]:', err);
        return res.status(500).json({ error: 'Failed to retrieve categories.' });
    }
});

/**
 * POST /api/complaints (UC-003)
 * Submits a new hostel complaint.
 * Restricted strictly to authenticated Students (BR-002).
 */
router.post('/', roleMiddleware('Student'), (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || 'File upload error.' });
        }

        const { title, description, categoryId, hostelBlock, roomNumber } = req.body;
        const studentId = req.user.userId;

        // Field validations
        if (!title || typeof title !== 'string' || title.trim().length < 5 || title.trim().length > 100) {
            return res.status(400).json({ error: 'Title must be between 5 and 100 characters.' });
        }

        if (!description || typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 1000) {
            return res.status(400).json({ error: 'Description must be between 10 and 1000 characters.' });
        }

        if (!categoryId) {
            return res.status(400).json({ error: 'Please select a valid complaint category.' });
        }

        if (!hostelBlock || !roomNumber) {
            return res.status(400).json({ error: 'Hostel block and room number are required.' });
        }

        // Verify category exists and is active
        const category = db.prepare(`
            SELECT category_id FROM complaint_categories WHERE category_id = ? AND is_active = 1
        `).get(categoryId);

        if (!category) {
            return res.status(400).json({ error: 'Selected category is invalid or inactive.' });
        }

        // Image relative path if uploaded
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Generate unique complaint ID: CMP-XXX
        const maxRow = db.prepare("SELECT MAX(CAST(SUBSTR(complaint_id, 5) AS INTEGER)) as maxId FROM complaints WHERE complaint_id LIKE 'CMP-%'").get();
        const nextNum = (maxRow && maxRow.maxId) ? (maxRow.maxId + 1) : 101;
        const complaintId = `CMP-${nextNum}`;

        try {
            // Atomic transaction for Complaint creation + initial Status History logging
            const submitTx = db.transaction(() => {
                db.prepare(`
                    INSERT INTO complaints (
                        complaint_id, student_id, category_id, title, description,
                        hostel_block, room_number, priority, current_status, image_url,
                        submission_date_time
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Medium', 'Submitted', ?, CURRENT_TIMESTAMP)
                `).run(
                    complaintId, studentId, categoryId, title.trim(), description.trim(),
                    hostelBlock.trim(), roomNumber.trim(), imageUrl
                );

                const historyId = `H-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
                db.prepare(`
                    INSERT INTO complaint_status_history (
                        history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
                    ) VALUES (?, ?, NULL, 'Submitted', ?, CURRENT_TIMESTAMP, ?)
                `).run(
                    historyId, complaintId, studentId, 'Complaint registered by resident student.'
                );
            });

            submitTx();

            return res.status(201).json({
                message: 'Complaint submitted successfully.',
                complaintId: complaintId,
                status: 'Submitted'
            });
        } catch (dbErr) {
            console.error('[Complaint Submission Error]:', dbErr);
            return res.status(500).json({ error: 'Database error occurred while recording complaint.' });
        }
    });
});

/**
 * GET /api/complaints (UC-005, UC-009, UC-013)
 * Retrieves complaints filtered according to the user's role (BR-012).
 */
router.get('/', (req, res) => {
    try {
        const { role, userId } = req.user;
        let query = `
            SELECT 
                c.complaint_id, c.student_id, c.category_id, c.title, c.description,
                c.hostel_block, c.room_number, c.priority, c.current_status, c.image_url,
                c.submission_date_time, c.assigned_staff_id, c.assignment_date_time,
                c.resolution_details, c.resolution_date_time, c.rejection_reason, c.closed_date_time,
                cat.category_name,
                u_student.name AS student_name,
                u_staff.name AS staff_name
            FROM complaints c
            JOIN complaint_categories cat ON c.category_id = cat.category_id
            JOIN users u_student ON c.student_id = u_student.user_id
            LEFT JOIN users u_staff ON c.assigned_staff_id = u_staff.user_id
        `;

        let params = [];

        if (role === 'Student') {
            // Student isolation: only view own complaints (BR-002, BR-012)
            query += ` WHERE c.student_id = ? ORDER BY c.submission_date_time DESC`;
            params = [userId];
        } else if (role === 'MaintenanceStaff') {
            // Staff isolation: only view assigned complaints (BR-006, BR-012)
            query += ` WHERE c.assigned_staff_id = ? ORDER BY c.submission_date_time DESC`;
            params = [userId];
        } else {
            // HostelAuthority, Administrator, InstituteManagement can view all complaints
            query += ` ORDER BY c.submission_date_time DESC`;
        }

        const complaints = db.prepare(query).all(...params);
        return res.status(200).json({ complaints });
    } catch (err) {
        console.error('[List Complaints Error]:', err);
        return res.status(500).json({ error: 'Failed to retrieve complaints.' });
    }
});

/**
 * GET /api/complaints/:id (UC-012, UC-014)
 * Returns full complaint details along with audit history timeline.
 */
router.get('/:id', (req, res) => {
    try {
        const complaintId = req.params.id;
        const { role, userId } = req.user;

        const complaint = db.prepare(`
            SELECT 
                c.*,
                cat.category_name,
                u_student.name AS student_name,
                u_student.contact_number AS student_contact,
                u_staff.name AS staff_name,
                u_staff.contact_number AS staff_contact
            FROM complaints c
            JOIN complaint_categories cat ON c.category_id = cat.category_id
            JOIN users u_student ON c.student_id = u_student.user_id
            LEFT JOIN users u_staff ON c.assigned_staff_id = u_staff.user_id
            WHERE c.complaint_id = ?
        `).get(complaintId);

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        // Enforce role-based access to individual complaint
        if (role === 'Student' && complaint.student_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to view this complaint.' });
        }
        if (role === 'MaintenanceStaff' && complaint.assigned_staff_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to view complaints not assigned to you.' });
        }

        // Fetch chronological status history timeline
        const history = db.prepare(`
            SELECT 
                h.history_id, h.previous_status, h.new_status, h.change_date_time, h.comments,
                u.name AS changed_by_name, u.role AS changed_by_role
            FROM complaint_status_history h
            JOIN users u ON h.changed_by = u.user_id
            WHERE h.complaint_id = ?
            ORDER BY h.change_date_time ASC
        `).all(complaintId);

        return res.status(200).json({ complaint, history });
    } catch (err) {
        console.error('[Get Complaint Error]:', err);
        return res.status(500).json({ error: 'Failed to retrieve complaint details.' });
    }
});

/**
 * PATCH /api/complaints/:id/review (UC-006)
 * Transitions complaint status from 'Submitted' to 'Under Review'.
 * Permitted only for HostelAuthority.
 */
router.patch('/:id/review', roleMiddleware('HostelAuthority'), (req, res) => {
    const complaintId = req.params.id;
    const authorityId = req.user.userId;

    try {
        const complaint = db.prepare('SELECT current_status FROM complaints WHERE complaint_id = ?').get(complaintId);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        if (complaint.current_status !== 'Submitted') {
            return res.status(400).json({ error: `Cannot mark under review from status '${complaint.current_status}'.` });
        }

        const reviewTx = db.transaction(() => {
            db.prepare(`
                UPDATE complaints SET current_status = 'Under Review' WHERE complaint_id = ?
            `).run(complaintId);

            const historyId = `H-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
            db.prepare(`
                INSERT INTO complaint_status_history (
                    history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
                ) VALUES (?, ?, 'Submitted', 'Under Review', ?, CURRENT_TIMESTAMP, 'Warden opened and reviewed complaint.')
            `).run(historyId, complaintId, authorityId);
        });

        reviewTx();
        return res.status(200).json({ message: 'Complaint status updated to Under Review.', newStatus: 'Under Review' });
    } catch (err) {
        console.error('[Review Error]:', err);
        return res.status(500).json({ error: 'Failed to update review status.' });
    }
});

/**
 * PATCH /api/complaints/:id/priority (UC-007)
 * Updates priority level.
 * Permitted only for HostelAuthority.
 */
router.patch('/:id/priority', roleMiddleware('HostelAuthority'), (req, res) => {
    const complaintId = req.params.id;
    const { priority } = req.body;

    const allowedPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (!priority || !allowedPriorities.includes(priority)) {
        return res.status(400).json({ error: `Priority must be one of: ${allowedPriorities.join(', ')}` });
    }

    try {
        const result = db.prepare(`
            UPDATE complaints SET priority = ? WHERE complaint_id = ?
        `).run(priority, complaintId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        return res.status(200).json({ message: `Priority updated to ${priority}.`, priority });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update priority.' });
    }
});

/**
 * POST /api/complaints/:id/reject (UC-006, SRS §14)
 * Marks a complaint as 'Rejected / Invalid' with required rejection reason.
 * Permitted only for HostelAuthority.
 */
router.post('/:id/reject', roleMiddleware('HostelAuthority'), (req, res) => {
    const complaintId = req.params.id;
    const { reason } = req.body;
    const authorityId = req.user.userId;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
        return res.status(400).json({ error: 'A valid rejection reason (minimum 5 characters) must be provided.' });
    }

    try {
        const complaint = db.prepare('SELECT current_status FROM complaints WHERE complaint_id = ?').get(complaintId);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        if (['Closed', 'Rejected / Invalid'].includes(complaint.current_status)) {
            return res.status(400).json({ error: `Cannot reject a complaint that is already in '${complaint.current_status}' status.` });
        }

        const rejectTx = db.transaction(() => {
            db.prepare(`
                UPDATE complaints 
                SET current_status = 'Rejected / Invalid', rejection_reason = ? 
                WHERE complaint_id = ?
            `).run(reason.trim(), complaintId);

            const historyId = `H-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
            db.prepare(`
                INSERT INTO complaint_status_history (
                    history_id, complaint_id, previous_status, new_status, changed_by, change_date_time, comments
                ) VALUES (?, ?, ?, 'Rejected / Invalid', ?, CURRENT_TIMESTAMP, ?)
            `).run(historyId, complaintId, complaint.current_status, authorityId, `Rejected by Authority: ${reason.trim()}`);
        });

        rejectTx();
        return res.status(200).json({ message: 'Complaint marked as Rejected / Invalid.', newStatus: 'Rejected / Invalid' });
    } catch (err) {
        console.error('[Reject Error]:', err);
        return res.status(500).json({ error: 'Failed to reject complaint.' });
    }
});

module.exports = router;
