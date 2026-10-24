import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

export default function StaffDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);

  // Progress Modal State
  const [progressTarget, setProgressTarget] = useState(null);
  const [progressRemarks, setProgressRemarks] = useState('');
  const [loggingProgress, setLoggingProgress] = useState(false);

  // Resolution Modal State
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [resolving, setResolving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      setComplaints(res.complaints || []);
    } catch (err) {
      setError(err.message || 'Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetails = async (id) => {
    try {
      const res = await api.getComplaintDetails(id);
      setSelectedComplaint(res.complaint);
      setSelectedHistory(res.history);
    } catch (err) {
      setError(err.message || 'Failed to load details.');
    }
  };

  const handleStartWork = async (id) => {
    setError('');
    try {
      await api.startWork(id);
      setSuccess(`Work started on complaint ${id}. Status changed to In Progress.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to start work.');
    }
  };

  const handleConfirmProgress = async (e) => {
    e.preventDefault();
    if (!progressTarget || !progressRemarks.trim()) return;

    setLoggingProgress(true);
    setError('');
    try {
      await api.logProgress(progressTarget.complaint_id, progressRemarks.trim());
      setSuccess(`Progress remark added to complaint ${progressTarget.complaint_id}.`);
      setProgressTarget(null);
      setProgressRemarks('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to log progress.');
    } finally {
      setLoggingProgress(false);
    }
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolveTarget || !resolutionDetails.trim()) return;

    if (resolutionDetails.trim().length < 10) {
      setError('Resolution report must contain at least 10 characters explaining work done.');
      return;
    }

    setResolving(true);
    setError('');
    try {
      await api.resolveComplaint(resolveTarget.complaint_id, resolutionDetails.trim());
      setSuccess(`Complaint ${resolveTarget.complaint_id} marked as Resolved!`);
      setResolveTarget(null);
      setResolutionDetails('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to resolve complaint.');
    } finally {
      setResolving(false);
    }
  };

  // KPI counts
  const total = complaints.length;
  const assignedNew = complaints.filter(c => c.current_status === 'Assigned').length;
  const inProgress = complaints.filter(c => c.current_status === 'In Progress').length;
  const resolved = complaints.filter(c => ['Resolved', 'Closed'].includes(c.current_status)).length;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Maintenance Technician Work Queue</h2>
          <p className="dashboard-subtitle">
            Welcome, {user.name} ({user.userId}). Manage your assigned repairs and record work completion.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Assigned Tasks</span>
          <span className="kpi-value">{total}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Needs Start</span>
          <span className="kpi-value" style={{ color: '#d97706' }}>{assignedNew}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">In Progress</span>
          <span className="kpi-value" style={{ color: '#0284c7' }}>{inProgress}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Completed / Resolved</span>
          <span className="kpi-value" style={{ color: '#16a34a' }}>{resolved}</span>
        </div>
      </div>

      {/* Assigned Tasks Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
          My Assigned Work Orders (Isolated to Staff ID {user.userId})
        </h3>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading work orders...</p>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No tasks currently assigned to you.</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              Check back when hostel authorities allocate new maintenance tasks.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>Issue Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Current Status</th>
                  <th>Student Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.complaint_id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{c.complaint_id}</td>
                    <td>
                      <div><strong>{c.hostel_block}</strong></div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Room {c.room_number}</div>
                    </td>
                    <td>
                      <strong>{c.title}</strong>
                      {c.image_url && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#059669' }}>📷 Photo</span>}
                    </td>
                    <td>{c.category_name}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.current_status} /></td>
                    <td>{c.student_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {c.current_status === 'Assigned' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStartWork(c.complaint_id)}
                          >
                            ▶️ Start Work
                          </button>
                        )}

                        {c.current_status === 'In Progress' && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setProgressTarget(c)}
                            >
                              📝 Remark (UC-010)
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => setResolveTarget(c)}
                            >
                              ✅ Resolve (UC-011)
                            </button>
                          </>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetails(c.complaint_id)}
                        >
                          🔍 Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Intermediate Progress Log Modal (UC-010) */}
      {progressTarget && (
        <div className="modal-backdrop" onClick={() => setProgressTarget(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Log Work Progress Update (UC-010)</h3>
              <button className="btn-close" onClick={() => setProgressTarget(null)}>&times;</button>
            </div>
            <form onSubmit={handleConfirmProgress}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                  Log intermediate inspection notes or repair milestones. The status will remain <strong>In Progress</strong>.
                </p>
                <div className="form-group">
                  <label className="form-label">Progress Remarks * (min 5 chars)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g., Inspected switchboard, cracked wire found. Replacing with 2.5sq mm cable..."
                    value={progressRemarks}
                    onChange={e => setProgressRemarks(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setProgressTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loggingProgress}>
                  {loggingProgress ? 'Saving...' : 'Add Progress Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Details Modal (UC-011) */}
      {resolveTarget && (
        <div className="modal-backdrop" onClick={() => setResolveTarget(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Resolution Details (UC-011)</h3>
              <button className="btn-close" onClick={() => setResolveTarget(null)}>&times;</button>
            </div>
            <form onSubmit={handleConfirmResolve}>
              <div className="modal-body">
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <p><strong>Work Order:</strong> {resolveTarget.complaint_id} — {resolveTarget.title}</p>
                  <p><strong>Location:</strong> {resolveTarget.hostel_block}, Room {resolveTarget.room_number}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Resolution Explanation Report * (Required, minimum 10 characters)
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Describe parts replaced, tests performed, and confirmation of issue resolution..."
                    value={resolutionDetails}
                    onChange={e => setResolutionDetails(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    This official report is permanently stored and reviewed by Hostel Authorities before final closure.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setResolveTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={resolving}>
                  {resolving ? 'Submitting...' : 'Mark Issue as Resolved (UC-011)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details & Timeline Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          history={selectedHistory}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
}
