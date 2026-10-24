import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';

export default function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newContact, setNewContact] = useState('+91-9876543299');
  const [newRole, setNewRole] = useState('Student');
  const [creating, setCreating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (targetUser) => {
    const nextStatus = targetUser.account_status === 'Active' ? 'Inactive' : 'Active';
    setError('');
    try {
      await api.toggleUserStatus(targetUser.user_id, nextStatus);
      setSuccess(`User ${targetUser.user_id} status changed to ${nextStatus}.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserId.trim() || !newName.trim() || !newEmail.trim() || !newPassword) {
      setError('All fields are required.');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await api.createUser({
        userId: newUserId.trim(),
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        contactNumber: newContact.trim(),
        role: newRole
      });
      setSuccess(`New account created successfully for '${newName.trim()}'.`);
      setShowAddModal(false);
      // Reset
      setNewUserId('');
      setNewName('');
      setNewEmail('');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">System Administration & Role Management</h2>
          <p className="dashboard-subtitle">
            Manage system accounts, allocate roles, and toggle user activation status (UC-002).
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add New User Account (UC-002)
        </button>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
            Registered Users ({users.length})
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={loadUsers}>
            🔄 Refresh List
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading accounts...</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.user_id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{u.user_id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.contact_number || 'N/A'}</td>
                    <td>
                      <span className="role-tag" style={{ backgroundColor: '#334155' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.account_status === 'Active' ? 'badge-resolved' : 'badge-rejected'}`}>
                        {u.account_status}
                      </span>
                    </td>
                    <td>
                      {u.user_id === user.userId ? (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Current User</span>
                      ) : (
                        <button
                          className={`btn btn-sm ${u.account_status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.account_status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New System Account (UC-002)</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">User ID * (e.g. S105, M09, A14)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., S105"
                      value={newUserId}
                      onChange={e => setNewUserId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-control"
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      required
                    >
                      <option value="Student">Student</option>
                      <option value="HostelAuthority">Hostel Authority</option>
                      <option value="MaintenanceStaff">Maintenance Staff</option>
                      <option value="Administrator">Administrator</option>
                      <option value="InstituteManagement">Institute Management</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Harshil Agrawal"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address * (Unique)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g., harshil@lnmiit.ac.in"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password * (Stored as bcrypt hash)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newContact}
                      onChange={e => setNewContact(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
