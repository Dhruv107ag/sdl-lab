import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

export default function AuthorityDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);

  // Assign Modal State
  const [assignTarget, setAssignTarget] = useState(null);
  const [chosenStaffId, setChosenStaffId] = useState('');
  const [chosenPriority, setChosenPriority] = useState('High');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Reject Modal State
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, staffRes] = await Promise.all([
        api.getComplaints(),
        api.getStaffList()
      ]);
      setComplaints(compRes.complaints || []);
      setStaffList(staffRes.staff || []);
      if (staffRes.staff && staffRes.staff.length > 0 && !chosenStaffId) {
        setChosenStaffId(staffRes.staff[0].user_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load authority records.');
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
      setError(err.message || 'Failed to fetch details.');
    }
  };

  const handleMarkReview = async (id) => {
    setError('');
    try {
      await api.reviewComplaint(id);
      setSuccess(`Complaint ${id} marked as Under Review.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to mark under review.');
    }
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!chosenStaffId || !assignTarget) return;

    setAssigning(true);
    setError('');
    try {
      await api.assignComplaint({
        complaintId: assignTarget.complaint_id,
        staffId: chosenStaffId,
        priority: chosenPriority,
        remarks: assignRemarks
      });
      setSuccess(`Complaint ${assignTarget.complaint_id} assigned to staff ${chosenStaffId}.`);
      setAssignTarget(null);
      setAssignRemarks('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to assign complaint.');
    } finally {
      setAssigning(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim() || !rejectTarget) return;

    setRejecting(true);
    setError('');
    try {
      await api.rejectComplaint(rejectTarget.complaint_id, rejectReason.trim());
      setSuccess(`Complaint ${rejectTarget.complaint_id} has been Rejected.`);
      setRejectTarget(null);
      setRejectReason('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to reject complaint.');
    } finally {
      setRejecting(false);
    }
  };

  const handleCloseComplaint = async (id) => {
    if (!window.confirm(`Are you sure you want to formally close complaint ${id}? This action is final.`)) {
      return;
    }

    setError('');
    try {
      await api.closeComplaint(id);
      setSuccess(`Complaint ${id} formally closed.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to close complaint.');
    }
  };

  // Filter complaints
  const filteredComplaints = filterStatus === 'All'
    ? complaints
    : complaints.filter(c => c.current_status === filterStatus);

  // Status counts
  const total = complaints.length;
  const submittedCount = complaints.filter(c => c.current_status === 'Submitted').length;
  const underReviewCount = complaints.filter(c => c.current_status === 'Under Review').length;
  const assignedCount = complaints.filter(c => ['Assigned', 'In Progress'].includes(c.current_status)).length;
  const resolvedCount = complaints.filter(c => c.current_status === 'Resolved').length;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Hostel Warden & Authority Portal</h2>
          <p className="dashboard-subtitle">
            Welcome, <strong>{user?.name || 'Hostel Authority'}</strong>. Review, prioritize, assign, and close hostel maintenance requests across blocks.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Received</span>
          <span className="kpi-value">{total}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">New Submitted</span>
          <span className="kpi-value" style={{ color: '#d97706' }}>{submittedCount}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Under Review</span>
          <span className="kpi-value" style={{ color: '#b45309' }}>{underReviewCount}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Assigned / In Progress</span>
          <span className="kpi-value" style={{ color: '#2563eb' }}>{assignedCount}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pending Closure</span>
          <span className="kpi-value" style={{ color: '#16a34a' }}>{resolvedCount}</span>
        </div>
      </div>

      {/* Table Card with Filter Tabs */}
      <div className="card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
            Complaint Management Table
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Filter Status:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All Complaints ({total})</option>
              <option value="Submitted">Submitted ({submittedCount})</option>
              <option value="Under Review">Under Review ({underReviewCount})</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved ({resolvedCount})</option>
              <option value="Closed">Closed</option>
              <option value="Rejected / Invalid">Rejected / Invalid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading records...</p>
        ) : filteredComplaints.length === 0 ? (
          <p style={{ color: '#64748b', padding: '20px 0' }}>No complaints found matching this filter.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student & Location</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => (
                  <tr key={c.complaint_id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{c.complaint_id}</td>
                    <td>
                      <div><strong>{c.student_name}</strong></div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{c.hostel_block}, {c.room_number}</div>
                    </td>
                    <td>
                      <strong>{c.title}</strong>
                      {c.image_url && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#059669' }}>📷 Photo</span>}
                    </td>
                    <td>{c.category_name}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.current_status} /></td>
                    <td>{c.staff_name || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {c.current_status === 'Submitted' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleMarkReview(c.complaint_id)}
                            title="Mark as Under Review"
                          >
                            👁️ Review
                          </button>
                        )}

                        {['Submitted', 'Under Review', 'Assigned'].includes(c.current_status) && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setAssignTarget(c);
                              setChosenPriority(c.priority || 'High');
                            }}
                          >
                            ⚙️ Assign (UC-008)
                          </button>
                        )}

                        {['Submitted', 'Under Review'].includes(c.current_status) && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setRejectTarget(c)}
                          >
                            ❌ Reject
                          </button>
                        )}

                        {c.current_status === 'Resolved' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleCloseComplaint(c.complaint_id)}
                          >
                            ✅ Close (UC-012)
                          </button>
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

      {/* Assign Maintenance Staff Modal (UC-008) */}
      {assignTarget && (
        <div className="modal-backdrop" onClick={() => setAssignTarget(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Maintenance Technician (UC-008)</h3>
              <button className="btn-close" onClick={() => setAssignTarget(null)}>&times;</button>
            </div>
            <form onSubmit={handleConfirmAssign}>
              <div className="modal-body">
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <p><strong>Complaint:</strong> {assignTarget.complaint_id} — {assignTarget.title}</p>
                  <p><strong>Category:</strong> {assignTarget.category_name} | <strong>Location:</strong> {assignTarget.hostel_block}, {assignTarget.room_number}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Active Maintenance Staff *</label>
                  <select
                    className="form-control"
                    value={chosenStaffId}
                    onChange={e => setChosenStaffId(e.target.value)}
                    required
                  >
                    {staffList.map(s => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.name} ({s.user_id}) — {s.contact_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Set Priority Level *</label>
                  <select
                    className="form-control"
                    value={chosenPriority}
                    onChange={e => setChosenPriority(e.target.value)}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Instructions / Remarks (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Specific instructions for the technician..."
                    value={assignRemarks}
                    onChange={e => setAssignRemarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssignTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assigning}
                >
                  {assigning ? 'Assigning...' : 'Confirm & Assign Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Complaint Dialog */}
      {rejectTarget && (
        <div className="modal-backdrop" onClick={() => setRejectTarget(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Complaint ({rejectTarget.complaint_id})</h3>
              <button className="btn-close" onClick={() => setRejectTarget(null)}>&times;</button>
            </div>
            <form onSubmit={handleConfirmReject}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                  A valid rejection reason is required and will be permanently recorded in the audit trail.
                </p>
                <div className="form-group">
                  <label className="form-label">Reason for Rejection * (min 5 chars)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g., Not a valid hostel maintenance issue; please contact academic office."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRejectTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={rejecting}>
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
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
