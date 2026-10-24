import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

export default function StudentDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [hostelBlock, setHostelBlock] = useState('Hostel Block A');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, catRes] = await Promise.all([
        api.getComplaints(),
        api.getCategories()
      ]);
      setComplaints(compRes.complaints || []);
      setCategories(catRes.categories || []);
      if (catRes.categories && catRes.categories.length > 0 && !categoryId) {
        setCategoryId(catRes.categories[0].category_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
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

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setFormError('');

    if (title.trim().length < 5 || title.trim().length > 100) {
      setFormError('Title must be between 5 and 100 characters.');
      return;
    }
    if (description.trim().length < 10 || description.trim().length > 1000) {
      setFormError('Description must be between 10 and 1000 characters.');
      return;
    }
    if (!roomNumber.trim()) {
      setFormError('Room / Location is required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('categoryId', categoryId);
    formData.append('hostelBlock', hostelBlock);
    formData.append('roomNumber', roomNumber.trim());
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    setSubmitting(true);
    try {
      const res = await api.submitComplaint(formData);
      setSuccess(`Complaint ${res.complaintId} submitted successfully!`);
      setShowSubmitModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      setRoomNumber('');
      setSelectedFile(null);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  // KPI counts
  const total = complaints.length;
  const inProgress = complaints.filter(c => ['Assigned', 'In Progress'].includes(c.current_status)).length;
  const resolved = complaints.filter(c => ['Resolved', 'Closed'].includes(c.current_status)).length;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Student Complaint Portal</h2>
          <p className="dashboard-subtitle">
            Welcome, {user.name} ({user.userId}). Submit and track your hostel maintenance issues.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowSubmitModal(true)}
        >
          ➕ Submit New Complaint (UC-003)
        </button>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">My Total Complaints</span>
          <span className="kpi-value">{total}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Active / In Progress</span>
          <span className="kpi-value" style={{ color: '#0284c7' }}>{inProgress}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Resolved / Closed</span>
          <span className="kpi-value" style={{ color: '#16a34a' }}>{resolved}</span>
        </div>
      </div>

      {/* Complaints List Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
            My Submitted Complaints (Isolated to Your Account)
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={loadData}>
            🔄 Refresh List
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No complaints submitted yet.</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              Click the "Submit New Complaint" button above to report an issue.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Current Status</th>
                  <th>Assigned Staff</th>
                  <th>Submitted At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.complaint_id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{c.complaint_id}</td>
                    <td>
                      <strong>{c.title}</strong>
                      {c.image_url && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#059669' }}>📷 Photo</span>}
                    </td>
                    <td>{c.category_name}</td>
                    <td>{c.hostel_block}, {c.room_number}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.current_status} /></td>
                    <td>{c.staff_name || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(c.submission_date_time).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDetails(c.complaint_id)}
                      >
                        🔍 View Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Complaint Modal (UC-003) */}
      {showSubmitModal && (
        <div className="modal-backdrop" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Submit a New Hostel Complaint (UC-003)</h3>
              <button className="btn-close" onClick={() => setShowSubmitModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitComplaint}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">⚠️ {formError}</div>}

                <div className="form-group">
                  <label className="form-label">Complaint Title * (5–100 chars)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Washroom water tap leaking continuously"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control"
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hostel Block *</label>
                    <select
                      className="form-control"
                      value={hostelBlock}
                      onChange={e => setHostelBlock(e.target.value)}
                      required
                    >
                      <option value="Hostel Block A">Hostel Block A</option>
                      <option value="Hostel Block B">Hostel Block B</option>
                      <option value="Hostel Block C">Hostel Block C</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Room / Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Room 204 or Common Washroom"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Optional Photo Evidence (JPEG/PNG max 2MB)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e => setSelectedFile(e.target.files[0] || null)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Description * (10–1000 chars)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Provide specific details about the issue to help maintenance staff prepare the correct equipment..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
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
