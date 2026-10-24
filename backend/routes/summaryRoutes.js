const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['HostelAuthority', 'Administrator', 'InstituteManagement']));

/**
 * GET /api/summary/kpis (UC-016 / FR-032)
 * Returns aggregated metrics, complaint distributions, and recent audit activity.
 */
router.get('/kpis', (req, res) => {
    try {
        // Overall total
        const totalComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;

        // Count by status
        const statusRows = db.prepare(`
            SELECT current_status, COUNT(*) as count
            FROM complaints
            GROUP BY current_status
        `).all();

        const statusCounts = {
            'Submitted': 0,
            'Under Review': 0,
            'Assigned': 0,
            'In Progress': 0,
            'Resolved': 0,
            'Closed': 0,
            'Rejected / Invalid': 0
        };

        statusRows.forEach(row => {
            statusCounts[row.current_status] = row.count;
        });

        // Count by category
        const categoryCounts = db.prepare(`
            SELECT cat.category_name, COUNT(c.complaint_id) as count
            FROM complaint_categories cat
            LEFT JOIN complaints c ON cat.category_id = c.category_id
            GROUP BY cat.category_name
            ORDER BY count DESC
        `).all();

        // Recent audit events
        const recentActivity = db.prepare(`
            SELECT 
                h.history_id, h.complaint_id, h.previous_status, h.new_status, h.change_date_time, h.comments,
                u.name AS actor_name, u.role AS actor_role
            FROM complaint_status_history h
            JOIN users u ON h.changed_by = u.user_id
            ORDER BY h.change_date_time DESC
            LIMIT 6
        `).all();

        return res.status(200).json({
            kpis: {
                total: totalComplaints,
                pending: (statusCounts['Submitted'] + statusCounts['Under Review']),
                assignedOrActive: (statusCounts['Assigned'] + statusCounts['In Progress']),
                resolved: statusCounts['Resolved'],
                closed: statusCounts['Closed'],
                rejected: statusCounts['Rejected / Invalid']
            },
            statusBreakdown: statusCounts,
            categoryDistribution: categoryCounts,
            recentActivity
        });
    } catch (err) {
        console.error('[Summary KPI Error]:', err);
        return res.status(500).json({ error: 'Failed to compute executive summary statistics.' });
    }
});

module.exports = router;
