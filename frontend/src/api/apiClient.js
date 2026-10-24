/**
 * Centralized API Client
 * Wraps Fetch API, manages auth tokens, and handles JSON responses consistently.
 */

const BASE_URL = ''; // Relative path leverages Vite proxy (/api)

function getHeaders(isMultipart = false) {
    const token = localStorage.getItem('hcms_token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
}

async function request(endpoint, options = {}) {
    const isMultipart = options.body instanceof FormData;
    const config = {
        method: options.method || 'GET',
        headers: { ...getHeaders(isMultipart), ...(options.headers || {}) },
        body: isMultipart ? options.body : (options.body ? JSON.stringify(options.body) : null)
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const errorMsg = data.error || `Request failed with status ${res.status}`;
        throw new Error(errorMsg);
    }
    return data;
}

export const api = {
    // Auth
    login: async (email, password) => {
        const data = await request('/api/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        if (data.token) {
            localStorage.setItem('hcms_token', data.token);
            localStorage.setItem('hcms_user', JSON.stringify(data.user));
        }
        return data;
    },
    logout: async () => {
        try {
            await request('/api/auth/logout', { method: 'POST' });
        } finally {
            localStorage.removeItem('hcms_token');
            localStorage.removeItem('hcms_user');
        }
    },
    getCurrentUser: () => {
        const u = localStorage.getItem('hcms_user');
        return u ? JSON.parse(u) : null;
    },
    getDemoAccounts: () => request('/api/auth/demo-users'),

    // Complaints
    getCategories: () => request('/api/complaints/categories'),
    getComplaints: () => request('/api/complaints'),
    getComplaintDetails: (id) => request(`/api/complaints/${id}`),
    submitComplaint: (formData) => request('/api/complaints', { method: 'POST', body: formData }),
    reviewComplaint: (id) => request(`/api/complaints/${id}/review`, { method: 'PATCH' }),
    setPriority: (id, priority) => request(`/api/complaints/${id}/priority`, { method: 'PATCH', body: { priority } }),
    rejectComplaint: (id, reason) => request(`/api/complaints/${id}/reject`, { method: 'POST', body: { reason } }),

    // Assignments
    getStaffList: () => request('/api/assignments/staff'),
    assignComplaint: (payload) => request('/api/assignments', { method: 'POST', body: payload }),

    // Resolutions & Closure
    startWork: (complaintId) => request('/api/resolutions/start-work', { method: 'POST', body: { complaintId } }),
    logProgress: (complaintId, remarks) => request('/api/resolutions/progress', { method: 'POST', body: { complaintId, remarks } }),
    resolveComplaint: (complaintId, resolutionDetails) => request('/api/resolutions/resolve', { method: 'POST', body: { complaintId, resolutionDetails } }),
    closeComplaint: (complaintId) => request('/api/resolutions/close', { method: 'POST', body: { complaintId } }),

    // Admin & Management
    getUsers: () => request('/api/admin/users'),
    createUser: (userData) => request('/api/admin/users', { method: 'POST', body: userData }),
    toggleUserStatus: (userId, accountStatus) => request(`/api/admin/users/${userId}/status`, { method: 'PATCH', body: { accountStatus } }),
    getKPIs: () => request('/api/summary/kpis')
};
