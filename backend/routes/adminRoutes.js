const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('Administrator'));

/**
 * GET /api/admin/users (UC-002)
 * Lists all registered user accounts.
 */
router.get('/users', (req, res) => {
    try {
        const users = db.prepare(`
            SELECT user_id, name, email, contact_number, role, account_status, created_at
            FROM users
            ORDER BY created_at DESC
        `).all();
        return res.status(200).json({ users });
    } catch (err) {
        console.error('[Admin List Error]:', err);
        return res.status(500).json({ error: 'Failed to retrieve users.' });
    }
});

/**
 * POST /api/admin/users (UC-002)
 * Creates a new user account.
 */
router.post('/users', (req, res) => {
    const { userId, name, email, password, contactNumber, role } = req.body;

    if (!userId || !name || !email || !password || !role) {
        return res.status(400).json({ error: 'User ID, name, email, password, and role are required.' });
    }

    const validRoles = ['Student', 'HostelAuthority', 'MaintenanceStaff', 'Administrator', 'InstituteManagement'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Role must be one of: ${validRoles.join(', ')}` });
    }

    try {
        const passwordHash = bcrypt.hashSync(password, 10);
        db.prepare(`
            INSERT INTO users (user_id, name, email, password_hash, contact_number, role, account_status)
            VALUES (?, ?, ?, ?, ?, ?, 'Active')
        `).run(userId.trim(), name.trim(), email.trim().toLowerCase(), passwordHash, contactNumber ? contactNumber.trim() : null, role);

        return res.status(201).json({ message: `User account created successfully for '${name}'.` });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'User with this ID or Email already exists.' });
        }
        console.error('[Admin Create Error]:', err);
        return res.status(500).json({ error: 'Failed to create user account.' });
    }
});

/**
 * PATCH /api/admin/users/:id/status (UC-002)
 * Toggles account status between Active and Inactive.
 */
router.patch('/users/:id/status', (req, res) => {
    const targetUserId = req.params.id;
    const { accountStatus } = req.body;

    if (!['Active', 'Inactive'].includes(accountStatus)) {
        return res.status(400).json({ error: "accountStatus must be 'Active' or 'Inactive'." });
    }

    // Prevent administrator from deactivating themselves
    if (targetUserId === req.user.userId && accountStatus === 'Inactive') {
        return res.status(400).json({ error: 'Administrators cannot deactivate their own account.' });
    }

    try {
        const result = db.prepare('UPDATE users SET account_status = ? WHERE user_id = ?').run(accountStatus, targetUserId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.status(200).json({ message: `User status changed to ${accountStatus}.`, accountStatus });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update user status.' });
    }
});

module.exports = router;
