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
