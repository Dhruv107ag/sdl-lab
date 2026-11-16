import React from 'react';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import HistoryTimeline from './HistoryTimeline';

export default function ComplaintDetailsModal({ complaint, history, onClose }) {
  if (!complaint) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
              {complaint.complaint_id}
            </span>
            <h2 className="modal-title" style={{ marginTop: '2px' }}>
              {complaint.title}
            </h2>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Key metadata grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            backgroundColor: '#f8fafc',
            padding: '14px',
            borderRadius: '8px',
            marginBottom: '18px',
            fontSize: '13px'
          }}>
            <div>
              <span style={{ color: '#64748b' }}>Current Status:</span>
              <div style={{ marginTop: '4px' }}><StatusBadge status={complaint.current_status} /></div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Priority:</span>
              <div style={{ marginTop: '4px' }}><PriorityBadge priority={complaint.priority} /></div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Category:</span>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{complaint.category_name}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Location:</span>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{complaint.hostel_block}, {complaint.room_number}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Student:</span>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{complaint.student_name}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Assigned Staff:</span>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{complaint.staff_name || 'Unassigned'}</div>
            </div>
          </div>

          {/* Problem Description */}
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
              Problem Description
            </h3>
            <p style={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#1e293b'
            }}>
              {complaint.description}
            </p>
          </div>

          {/* Image Attachment preview if available */}
          {complaint.image_url && (
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                Attached Photographic Evidence
              </h3>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', display: 'inline-block' }}>
                <img
                  src={complaint.image_url}
                  alt="Complaint Evidence"
                  style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '4px', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* Rejection notice if status is Rejected */}
          {complaint.current_status === 'Rejected / Invalid' && complaint.rejection_reason && (
            <div className="alert alert-danger" style={{ marginBottom: '18px' }}>
              <div>
                <strong>Rejection Reason:</strong> {complaint.rejection_reason}
              </div>
            </div>
          )}

          {/* Resolution info if resolved or closed */}
          {complaint.resolution_details && (
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                Resolution Report
              </h3>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#14532d'
              }}>
                <p><strong>Work Done:</strong> {complaint.resolution_details}</p>
                {complaint.resolution_date_time && (
                  <p style={{ fontSize: '12px', marginTop: '4px', color: '#166534' }}>
                    Resolved at: {new Date(complaint.resolution_date_time).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status History Timeline */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
              Status Lifecycle & History Timeline (Audit Trail)
            </h3>
            <HistoryTimeline history={history} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
