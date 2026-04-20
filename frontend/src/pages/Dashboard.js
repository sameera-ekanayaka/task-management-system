import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { getTasks } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0, todo: 0, inProgress: 0, completed: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getTasks();
      const tasks = response.data.tasks;
      setStats({
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'TODO').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
      });
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.welcome}>Welcome back, {user?.name}! 👋</h1>
            <p style={styles.date}>{new Date().toDateString()}</p>
          </div>
          <NotificationBell />
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderTop: '4px solid #1a73e8' }}>
            <h3 style={styles.statNumber}>{stats.total}</h3>
            <p style={styles.statLabel}>Total Tasks</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #f39c12' }}>
            <h3 style={styles.statNumber}>{stats.todo}</h3>
            <p style={styles.statLabel}>To Do</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #3498db' }}>
            <h3 style={styles.statNumber}>{stats.inProgress}</h3>
            <p style={styles.statLabel}>In Progress</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #2ecc71' }}>
            <h3 style={styles.statNumber}>{stats.completed}</h3>
            <p style={styles.statLabel}>Completed</p>
          </div>
        </div>

        {/* Role Info */}
        <div style={styles.roleCard}>
          <h2 style={styles.roleTitle}>Your Role: {user?.role}</h2>
          <p style={styles.roleDesc}>
            {user?.role === 'ADMIN' && 'You have full access to all features including user management.'}
            {user?.role === 'PROJECT_MANAGER' && 'You can create and manage tasks, assign them to collaborators.'}
            {user?.role === 'COLLABORATOR' && 'You can view and update status of tasks assigned to you.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  welcome: {
    margin: 0,
    fontSize: '28px',
    color: '#1a1a2e',
  },
  date: {
    margin: '4px 0 0 0',
    color: '#666',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  statNumber: {
    fontSize: '36px',
    margin: '0 0 8px 0',
    color: '#1a1a2e',
  },
  statLabel: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  roleCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  roleTitle: {
    margin: '0 0 12px 0',
    color: '#1a73e8',
  },
  roleDesc: {
    margin: 0,
    color: '#666',
    lineHeight: '1.6',
  },
};

export default Dashboard;