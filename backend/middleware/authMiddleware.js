const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'cs314-hostel-prototype-secret-key-2026';

/**
 * Authentication Middleware
 * Validates JWT from Authorization: Bearer <token>
 * Verifies that the user exists in SQLite and has an Active account status.
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Lookup user in SQLite to ensure active account status and current role
        const user = db.prepare(`
            SELECT user_id, name, email, role, contact_number, account_status
            FROM users WHERE user_id = ?
        `).get(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User record not found.' });
        }

        if (user.account_status !== 'Active') {
            return res.status(403).json({ error: 'Account has been deactivated. Please contact an administrator.' });
        }

        // Attach authenticated user identity to request object
        req.user = {
            userId: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            contactNumber: user.contact_number
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
    }
}

module.exports = { authMiddleware, JWT_SECRET };
