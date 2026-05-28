import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR'] },
    { path: '/tasks', label: 'Tasks', icon: '📋', roles: ['ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR'] },
    { path: '/users', label: 'Users', icon: '👥', roles: ['ADMIN'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    if (role === 'ADMIN') return '#f87171';
    if (role === 'PROJECT_MANAGER') return '#60a5fa';
    return '#34d399';
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>✓</div>
        <div>
          <p style={styles.logoText}>TaskManager</p>
          <p style={styles.logoVersion}>v1.0.0</p>
        </div>
      </div>

      {/* User Profile */}
      <div style={styles.profileSection}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={styles.profileInfo}>
          <p style={styles.profileName}>{user?.name}</p>
          <span style={{
            ...styles.roleBadge,
            backgroundColor: getRoleColor(user?.role) + '20',
            color: getRoleColor(user?.role)
          }}>
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Navigation */}
      <p style={styles.navLabel}>MAIN MENU</p>
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
              <span style={styles.menuIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <div style={styles.activeIndicator} />
              )}
            </button>
          ))}
      </nav>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        <div style={styles.divider} />
        <button
          onClick={() => navigate('/reset-password')}
          style={styles.bottomBtn}
        >
          <span>🔐</span>
          <span>Change Password</span>
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1a1035 0%, #2d1b69 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed',
    left: 0,
    top: 0,
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: '#7c3aed',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: 'white',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  logoText: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
  },
  logoVersion: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    margin: 0,
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '20px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '16px',
    flexShrink: 0,
  },
  profileInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  profileName: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roleBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: '600',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    margin: '8px 0',
  },
  navLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    margin: '12px 0 8px 8px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    width: '100%',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  menuItemActive: {
    background: 'rgba(124,58,237,0.25)',
    color: 'white',
  },
  menuIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '60%',
    background: '#7c3aed',
    borderRadius: '3px 0 0 3px',
  },
  bottomSection: {
    marginTop: 'auto',
  },
  bottomBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
    marginBottom: '4px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'rgba(239,68,68,0.1)',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
    marginTop: '4px',
  },
};

export default Sidebar;