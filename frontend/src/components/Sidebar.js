import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: '📊 Dashboard', roles: ['ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR'] },
    { path: '/tasks', label: '📋 Tasks', roles: ['ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR'] },
    { path: '/users', label: '👥 Users', roles: ['ADMIN'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <h2 style={styles.logoText}>TaskManager</h2>
        <p style={styles.userInfo}>{user?.name}</p>
        <span style={styles.role}>{user?.role}</span>
      </div>

      {/* Menu Items */}
      <nav style={styles.nav}>
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={location.pathname === item.path
                ? { ...styles.menuItem, ...styles.menuItemActive }
                : styles.menuItem
              }
            >
              {item.label}
            </button>
          ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutButton}>
        🚪 Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#1a1a2e',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    position: 'fixed',
    left: 0,
    top: 0,
  },
  logo: {
    padding: '20px',
    borderBottom: '1px solid #333',
    marginBottom: '20px',
  },
  logoText: {
    color: '#1a73e8',
    margin: '0 0 8px 0',
    fontSize: '20px',
  },
  userInfo: {
    color: 'white',
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '500',
  },
  role: {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 12px',
    gap: '4px',
  },
  menuItem: {
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: '#aaa',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    width: '100%',
  },
  menuItemActive: {
    backgroundColor: '#1a73e8',
    color: 'white',
  },
  logoutButton: {
    margin: '12px',
    padding: '12px',
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Sidebar;