import React from 'react';

export default function Navbar({ user, onLogout }) {
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'HostelAuthority': return 'Hostel Warden / Authority';
      case 'MaintenanceStaff': return 'Maintenance Staff';
      case 'Administrator': return 'Administrator';
      case 'InstituteManagement': return 'Institute Management';
      default: return 'Student';
    }
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <span className="nav-logo-badge">HCMS</span>
        <div>
          <h1 className="nav-title" style={{ fontSize: '16px', margin: 0 }}>Hostel Complaint Management System</h1>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Academic Prototype | Team T042</span>
        </div>
      </div>

      <div className="nav-user-panel">
        {user ? (
          <>
            <div className="user-badge">
              <span>{user.name}</span>
              <span className="role-tag">{getRoleDisplayName(user.role)}</span>
            </div>
            <button className="btn-logout" onClick={onLogout} title="Terminate active session">
              Logout
            </button>
          </>
        ) : (
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Please Sign In</span>
        )}
      </div>
    </header>
  );
}
