/**
 * Comprehensive API Verification Test Suite
 * Tests full end-to-end backend workflows across all 5 user roles,
 * verifying status transitions, role-based security, input validations, and database integrity.
 */

const http = require('http');
const { server } = require('../server');

const BASE_URL = 'http://localhost:5000';

function request(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const reqOptions = {
            method: options.method || 'GET',
            headers: options.headers || {},
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search
        };

        const req = http.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ status: res.statusCode, data: parsed, headers: res.headers });
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('===========================================================');
    console.log(' Starting Automated API Integration & Security Test Suite');
    console.log('===========================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(name, condition, details = '') {
        if (condition) {
            console.log(` [PASS] ${name}`);
            passed++;
        } else {
            console.error(` [FAIL] ${name} ${details ? '--> ' + details : ''}`);
            failed++;
        }
    }

    try {
        // 1. Health Probe
        const health = await request('/api/health');
        assert('TC-HEALTH-01: Health probe reports UP', health.status === 200 && health.data.status === 'UP');

        // 2. Authentication: Invalid Login
        const badLogin = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: 'dhruv@lnmiit.ac.in', password: 'wrongpassword' }
        });
        assert('TC-AUTH-02: Invalid credentials rejected with 401', badLogin.status === 401);

        // 3. Authentication: Student Login
        const studentLogin = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: 'dhruv@lnmiit.ac.in', password: 'student123' }
        });
        assert('TC-AUTH-01: Student login returns 200 and token', studentLogin.status === 200 && studentLogin.data.token);
        const studentToken = studentLogin.data.token;

        // 4. Authentication: Profile Inspection
        const me = await request('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        assert('TC-AUTH-03: /api/auth/me returns student profile', me.status === 200 && me.data.user.role === 'Student');

        // 5. Authority Login
        const authLogin = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: 'warden.sharma@lnmiit.ac.in', password: 'warden123' }
        });
        assert('TC-AUTH-04: Authority login succeeds', authLogin.status === 200 && authLogin.data.user.role === 'HostelAuthority');
        const authToken = authLogin.data.token;

        // 6. Maintenance Staff Login
        const staffLogin = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: 'ramesh.plumber@lnmiit.ac.in', password: 'staff123' }
        });
        assert('TC-AUTH-05: Maintenance Staff login succeeds', staffLogin.status === 200 && staffLogin.data.user.role === 'MaintenanceStaff');
        const staffToken = staffLogin.data.token;

        // 7. Student Submits Complaint (UC-003)
        const newComplaint = await request('/api/complaints', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${studentToken}`,
                'Content-Type': 'application/json'
            },
            body: {
                title: 'Study room chair armrest broken',
                description: 'The right wooden armrest on the chair is cracked and has exposed nails.',
                categoryId: 'CAT-CARP',
                hostelBlock: 'Hostel Block A',
                roomNumber: '204'
            }
        });
        assert('TC-SUBMIT-01: Student submits valid complaint -> 201 Created', newComplaint.status === 201 && newComplaint.data.complaintId);
        const createdId = newComplaint.data.complaintId;

        // 8. Student Complaint Details & History
        const compDetail = await request(`/api/complaints/${createdId}`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        assert('TC-SUBMIT-02: Complaint details fetched with initial history', compDetail.status === 200 && compDetail.data.history.length === 1);

        // 9. Cross-Role Student Isolation (Student S102 cannot view S101's complaint)
        const student2Login = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: 'sanyam@lnmiit.ac.in', password: 'student123' }
        });
        const student2Token = student2Login.data.token;
        const crossCheck = await request(`/api/complaints/${createdId}`, {
            headers: { 'Authorization': `Bearer ${student2Token}` }
        });
        assert('TC-ISOLATE-01: Student S102 denied access to S101 complaint -> 403 Forbidden', crossCheck.status === 403);

        // 10. Authority Reviews Complaint (UC-006)
        const reviewRes = await request(`/api/complaints/${createdId}/review`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        assert('TC-REVIEW-01: Authority transitions status to Under Review', reviewRes.status === 200 && reviewRes.data.newStatus === 'Under Review');

        // 11. Authority Assigns Staff (UC-008)
        const assignRes = await request('/api/assignments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: {
                complaintId: createdId,
                staffId: 'M07',
                priority: 'High',
                remarks: 'Replace wooden armrest before study hours.'
            }
        });
        assert('TC-ASSIGN-01: Authority assigns complaint to staff M07 -> 200 OK', assignRes.status === 200 && assignRes.data.newStatus === 'Assigned');

        // 12. Staff Starts Work (Assigned -> In Progress)
        const startRes = await request('/api/resolutions/start-work', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${staffToken}`,
                'Content-Type': 'application/json'
            },
            body: { complaintId: createdId }
        });
        assert('TC-WORK-01: Staff marks complaint In Progress', startRes.status === 200 && startRes.data.newStatus === 'In Progress');

        // 13. Staff Logs Intermediate Progress (UC-010)
        const progRes = await request('/api/resolutions/progress', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${staffToken}`,
                'Content-Type': 'application/json'
            },
            body: {
                complaintId: createdId,
                remarks: 'Dismantled cracked armrest, sanding wood replacement.'
            }
        });
        assert('TC-PROG-01: Staff posts work progress remark', progRes.status === 200);

        // 14. Non-Authorized User Cannot Resolve (Student attempts to resolve -> 403)
        const studentResolve = await request('/api/resolutions/resolve', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${studentToken}`,
                'Content-Type': 'application/json'
            },
            body: { complaintId: createdId, resolutionDetails: 'Fixed by student myself.' }
        });
        assert('TC-SEC-01: Student cannot resolve complaint -> 403 Forbidden', studentResolve.status === 403);

        // 15. Staff Resolves Complaint (UC-011)
        const resolveRes = await request('/api/resolutions/resolve', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${staffToken}`,
                'Content-Type': 'application/json'
            },
            body: {
                complaintId: createdId,
                resolutionDetails: 'Replaced broken wooden armrest with seasoned teak wood armrest and secured with countersunk brass screws.'
            }
        });
        assert('TC-RESOLVE-01: Staff resolves complaint with valid report -> 200 OK', resolveRes.status === 200 && resolveRes.data.newStatus === 'Resolved');

        // 16. Staff Cannot Close Complaint (Strictly Authority permission, BR-008)
        const staffClose = await request('/api/resolutions/close', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${staffToken}`,
                'Content-Type': 'application/json'
            },
            body: { complaintId: createdId }
        });
        assert('TC-SEC-02: Staff cannot close complaint -> 403 Forbidden', staffClose.status === 403);

        // 17. Authority Closes Complaint (UC-012)
        const closeRes = await request('/api/resolutions/close', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: { complaintId: createdId }
        });
        assert('TC-CLOSE-01: Authority formally closes resolved complaint', closeRes.status === 200 && closeRes.data.newStatus === 'Closed');

        // 18. Closed Complaint Cannot Be Re-assigned (BR-009)
        const reassignClosed = await request('/api/assignments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: { complaintId: createdId, staffId: 'M07' }
        });
        assert('TC-RULE-01: Closed complaint cannot be reassigned (BR-009) -> 400 Bad Request', reassignClosed.status === 400);

        // 19. Administrator User Management (UC-002)
        const adminLogin = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: 'admin@lnmiit.ac.in', password: 'admin123' }
        });
        const adminToken = adminLogin.data.token;

        const usersList = await request('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        assert('TC-ADMIN-01: Administrator retrieves users list -> 200 OK', usersList.status === 200 && usersList.data.users.length >= 7);

        // 20. Institute Management KPI Summary (UC-016 / FR-032)
        const mgmtLogin = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: 'director@lnmiit.ac.in', password: 'director123' }
        });
        const mgmtToken = mgmtLogin.data.token;

        const kpis = await request('/api/summary/kpis', {
            headers: { 'Authorization': `Bearer ${mgmtToken}` }
        });
        assert('TC-MGMT-01: Institute Management fetches aggregate KPI counts', kpis.status === 200 && kpis.data.kpis.total >= 4);

        console.log('\n===========================================================');
        console.log(` Test Execution Summary: ${passed} Passed, ${failed} Failed`);
        console.log('===========================================================');

        if (server && server.close) {
            server.close();
        }

        if (failed > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (err) {
        console.error('Fatal Test Suite Error:', err);
        if (server && server.close) {
            server.close();
        }
        process.exit(1);
    }
}

// Allow test execution
runTests();
