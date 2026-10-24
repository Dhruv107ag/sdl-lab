const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const resolutionRoutes = require('./routes/resolutionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing for React client
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded image attachments statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Mount REST API Routers
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/resolutions', resolutionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/summary', summaryRoutes);

// System Health & Diagnostic Probe
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'Hostel Complaint Management System API',
        timestamp: new Date().toISOString(),
        sqlite: 'Connected'
    });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error('[Unhandled Error]:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'An unexpected server error occurred.'
    });
});

// Start Express HTTP Server
const server = app.listen(PORT, () => {
    console.log('===========================================================');
    console.log(` Hostel Complaint Management System API Running on Port ${PORT}`);
    console.log(` Health probe available at: http://localhost:${PORT}/api/health`);
    console.log(` Static uploads served at: http://localhost:${PORT}/uploads`);
    console.log('===========================================================');
});

module.exports = { app, server };
