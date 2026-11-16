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
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        {/* Login Card */}
        <div className="card" style={{ padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="nav-logo-badge" style={{ fontSize: '16px', padding: '6px 14px' }}>HCMS</span>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2d3748', marginTop: '14px' }}>
              Hostel Complaint Management
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Hostel Services & Facility Management Portal
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '18px' }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Institutional Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@lnmiit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px 16px', marginTop: '8px' }}
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
