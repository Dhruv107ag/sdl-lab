import React from 'react';
import { StatusBadge } from './StatusBadge';

export default function HistoryTimeline({ history }) {
  if (!history || history.length === 0) {
    return <p style={{ fontSize: '13px', color: '#64748b' }}>No status changes recorded yet.</p>;
  }

  const formatTimestamp = (ts) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="timeline">
      {history.map((item, idx) => (
        <div className="timeline-item" key={item.history_id || idx}>
          <div className="timeline-point" />
          <div className="timeline-content">
            <div className="timeline-meta">
              <span>
                <strong>{item.changed_by_name}</strong>{' '}
                <span style={{ fontSize: '11px', color: '#64748b' }}>({item.changed_by_role})</span>
              </span>
              <span>{formatTimestamp(item.change_date_time)}</span>
            </div>
            <div style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {item.previous_status && (
                <>
                  <StatusBadge status={item.previous_status} />
                  <span style={{ color: '#94a3b8' }}>&rarr;</span>
                </>
              )}
              <StatusBadge status={item.new_status} />
            </div>
            <div className="timeline-comments">{item.comments}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
