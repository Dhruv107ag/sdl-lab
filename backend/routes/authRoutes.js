const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authMiddleware, JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/login (UC-001)
 * Authenticates user credentials against SQLite and issues a signed JWT token.
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = db.prepare(`
            SELECT user_id, name, email, password_hash, contact_number, role, account_status
            FROM users WHERE LOWER(email) = LOWER(?)
        `).get(email.trim());

        if (!user) {
            // Avoid revealing whether the email exists
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (user.account_status !== 'Active') {
            return res.status(403).json({ error: 'Your account is deactivated. Contact an administrator.' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate signed JWT token
        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: 'Authentication successful.',
            token: token,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                contactNumber: user.contact_number
            }
        });
    } catch (err) {
        console.error('[Auth Error]:', err);
        return res.status(500).json({ error: 'Internal server error during authentication.' });
    }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile.
 */
router.get('/me', authMiddleware, (req, res) => {
    return res.status(200).json({ user: req.user });
});

/**
 * POST /api/auth/logout (UC-001)
 * Informs client to discard session token.
 */
router.post('/logout', (req, res) => {
    return res.status(200).json({ message: 'Session terminated successfully.' });
});

/**
 * GET /api/auth/demo-users
 * Returns list of seeded demo accounts for convenient one-click demonstration in UI.
 */
router.get('/demo-users', (req, res) => {
    try {
        const demoAccounts = [
            { role: 'Student', email: 'dhruv@lnmiit.ac.in', name: 'Dhruv Agrawal (24UCS016)', defaultPass: 'student123' },
            { role: 'Student', email: 'sanyam@lnmiit.ac.in', name: 'Sanyam Humad (24UCS017)', defaultPass: 'student123' },
            { role: 'HostelAuthority', email: 'warden.sharma@lnmiit.ac.in', name: 'Chief Warden Sharma', defaultPass: 'warden123' },
            { role: 'MaintenanceStaff', email: 'ramesh.plumber@lnmiit.ac.in', name: 'Ramesh Kumar (Plumber)', defaultPass: 'staff123' },
            { role: 'MaintenanceStaff', email: 'suresh.electric@lnmiit.ac.in', name: 'Suresh Sharma (Electrician)', defaultPass: 'staff123' },
            { role: 'Administrator', email: 'admin@lnmiit.ac.in', name: 'System Administrator', defaultPass: 'admin123' },
            { role: 'InstituteManagement', email: 'director@lnmiit.ac.in', name: 'Director Office', defaultPass: 'director123' }
        ];
        return res.status(200).json({ demoAccounts });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to retrieve demo accounts.' });
    }
});

module.exports = router;
