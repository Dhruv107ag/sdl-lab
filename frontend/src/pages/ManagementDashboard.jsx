import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { StatusBadge } from '../components/StatusBadge';

export default function ManagementDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadKPIs = async () => {
    setLoading(true);
    try {
      const res = await api.getKPIs();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load executive summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKPIs();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: '#64748b' }}>Generating executive dashboard metrics...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">⚠️ {error}</div>;
  }

  const { kpis, statusBreakdown, categoryDistribution, recentActivity } = data;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Institute Management Executive Dashboard</h2>
          <p className="dashboard-subtitle">
            Welcome, <strong>{user?.name || 'Director'}</strong>. Executive oversight, resolution statistics, and facility metrics (UC-016 / FR-032).
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadKPIs}>
          🔄 Refresh Metrics
        </button>
      </div>

      {/* Top Level Metric Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Reported</span>
          <span className="kpi-value">{kpis.total}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pending Review</span>
          <span className="kpi-value" style={{ color: '#d97706' }}>{kpis.pending}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Active / In Progress</span>
          <span className="kpi-value" style={{ color: '#0284c7' }}>{kpis.assignedOrActive}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Resolved & Closed</span>
          <span className="kpi-value" style={{ color: '#16a34a' }}>{kpis.resolved + kpis.closed}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Resolution Rate</span>
          <span className="kpi-value" style={{ color: '#7c3aed' }}>
            {kpis.total > 0 ? Math.round(((kpis.resolved + kpis.closed) / kpis.total) * 100) : 0}%
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Category Distribution Card */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
            Complaints by Maintenance Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryDistribution.map((item, idx) => {
              const pct = kpis.total > 0 ? Math.round((item.count / kpis.total) * 100) : 0;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{item.category_name}</span>
                    <span style={{ color: '#64748b' }}>{item.count} issues ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: '#2563eb',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution Card */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
            Lifecycle Status Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                <StatusBadge status={status} />
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{count} complaints</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent System-Wide Activity Log */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
          Recent Maintenance Activity Log (Real-time Audit Stream)
        </h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint</th>
                <th>Actor</th>
                <th>Transition</th>
                <th>Remarks</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((act, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{act.complaint_id}</td>
                  <td>
                    <strong>{act.actor_name}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{act.actor_role}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {act.previous_status && (
                        <>
                          <StatusBadge status={act.previous_status} />
                          <span>&rarr;</span>
                        </>
                      )}
                      <StatusBadge status={act.new_status} />
                    </div>
                  </td>
                  <td>{act.comments}</td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(act.change_date_time).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
