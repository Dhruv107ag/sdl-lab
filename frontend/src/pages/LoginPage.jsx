import React, { useState } from 'react';
import { api } from '../api/apiClient';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        
        {/* Login Card */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="nav-logo-badge" style={{ fontSize: '18px', padding: '8px 16px' }}>HCMS</span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '14px' }}>
              Hostel Complaint Management
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Academic Prototype — Secure Role-Based Authentication
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '18px' }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g., dhruv@lnmiit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
