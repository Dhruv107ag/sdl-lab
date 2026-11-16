import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import { api } from './api/apiClient';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => api.getCurrentUser());

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const handleQuickSwitch = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setCurrentUser(res.user);
    } catch (err) {
      alert('Role switch failed: ' + err.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="app-container">
        <Navbar user={null} />
        <main className="main-content">
          <LoginPage onLoginSuccess={setCurrentUser} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar user={currentUser} onLogout={handleLogout} />

      {/* Floating Demo Role Switch Bar (Convenient for viva examination) */}
      <div style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
          ⚡ Viva Quick Switch:
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => handleQuickSwitch('dhruv@lnmiit.ac.in', 'student123')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            🎓 Student (Dhruv)
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => handleQuickSwitch('warden.sharma@lnmiit.ac.in', 'warden123')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            🛡️ Warden (A12)
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => handleQuickSwitch('ramesh.plumber@lnmiit.ac.in', 'staff123')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            🔧 Plumber (M07)
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => handleQuickSwitch('admin@lnmiit.ac.in', 'admin123')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            ⚙️ Admin (ADM01)
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => handleQuickSwitch('director@lnmiit.ac.in', 'director123')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            📊 Management (Director)
          </button>
        </div>
      </div>

      <main className="main-content">
        {currentUser.role === 'Student' && <StudentDashboard user={currentUser} />}
        {currentUser.role === 'HostelAuthority' && <AuthorityDashboard user={currentUser} />}
        {currentUser.role === 'MaintenanceStaff' && <StaffDashboard user={currentUser} />}
        {currentUser.role === 'Administrator' && <AdminDashboard user={currentUser} />}
        {currentUser.role === 'InstituteManagement' && <ManagementDashboard user={currentUser} />}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '12px',
        color: '#64748b',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#fff',
        marginTop: 'auto'
      }}>
        Hostel Complaint Management System • CS314 Software Development Lab • Team T042
      </footer>
    </div>
  );
}
