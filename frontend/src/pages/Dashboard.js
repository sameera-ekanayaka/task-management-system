import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { getTasks, getUsers } from '../services/api';

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <div className="card-hover" style={{
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    borderTop: `4px solid ${color}`,
    flex: 1,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px', fontWeight: '500' }}>{title}</p>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#1a1035', margin: 0 }}>{value}</h2>
      </div>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '22px'
      }}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0 });
  const [tasks, setTasks] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const taskRes = await getTasks();
      const allTasks = taskRes.data.tasks;
      setTasks(allTasks.slice(0, 5));
      setStats({
        total: allTasks.length,
        todo: allTasks.filter(t => t.status === 'TODO').length,
        inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
        completed: allTasks.filter(t => t.status === 'COMPLETED').length,
      });

      if (user?.role === 'ADMIN') {
        const userRes = await getUsers();
        setUserCount(userRes.data.users.length);
      }
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const getPriorityColor = (priority) => {
    if (priority === 'HIGH') return { bg: '#fee2e2', color: '#dc2626' };
    if (priority === 'MEDIUM') return { bg: '#fef9c3', color: '#ca8a04' };
    return { bg: '#dcfce7', color: '#16a34a' };
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return { bg: '#dcfce7', color: '#16a34a' };
    if (status === 'IN_PROGRESS') return { bg: '#dbeafe', color: '#1d4ed8' };
    return { bg: '#f3f4f6', color: '#6b7280' };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={styles.subtitle}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <NotificationBell />
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <StatCard title="Total Tasks" value={stats.total} icon="📋" color="#7c3aed" bgColor="#f3e8ff" />
          <StatCard title="To Do" value={stats.todo} icon="📝" color="#f59e0b" bgColor="#fef9c3" />
          <StatCard title="In Progress" value={stats.inProgress} icon="⚡" color="#3b82f6" bgColor="#dbeafe" />
          <StatCard title="Completed" value={stats.completed} icon="✅" color="#10b981" bgColor="#dcfce7" />
          {user?.role === 'ADMIN' && (
            <StatCard title="Total Users" value={userCount} icon="👥" color="#ec4899" bgColor="#fce7f3" />
          )}
        </div>

        {/* Content Grid */}
        <div style={styles.contentGrid}>

          {/* Progress Section */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📊 Task Progress</h3>

            {/* Completion Rate */}
            <div style={styles.completionSection}>
              <div style={styles.completionCircle}>
                <svg viewBox="0 0 100 100" style={{ width: '120px', height: '120px' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f3e8ff" strokeWidth="10"/>
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#7c3aed" strokeWidth="10"
                    strokeDasharray={`${completionRate * 2.51} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="45" textAnchor="middle" fill="#1a1035" fontSize="18" fontWeight="bold">{completionRate}%</text>
                  <text x="50" y="62" textAnchor="middle" fill="#6b7280" fontSize="9">Complete</text>
                </svg>
              </div>
            </div>

            {/* Progress Bars */}
            {[
              { label: 'Completed', value: stats.completed, total: stats.total, color: '#10b981' },
              { label: 'In Progress', value: stats.inProgress, total: stats.total, color: '#3b82f6' },
              { label: 'To Do', value: stats.todo, total: stats.total, color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1035' }}>
                    {item.value} / {item.total}
                  </span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '6px', height: '8px' }}>
                  <div style={{
                    width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`,
                    background: item.color,
                    borderRadius: '6px',
                    height: '8px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Tasks */}
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={styles.cardTitle}>🕐 Recent Tasks</h3>
              <button
                onClick={() => window.location.href = '/tasks'}
                style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                View all →
              </button>
            </div>

            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <p style={{ fontSize: '32px' }}>📭</p>
                <p>No tasks yet</p>
              </div>
            ) : (
              tasks.map(task => {
                const priorityColor = getPriorityColor(task.priority);
                const statusColor = getStatusColor(task.status);
                return (
                  <div key={task.id} className="card-hover" style={styles.taskItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1035', margin: 0, flex: 1 }}>
                        {task.title}
                      </p>
                      <span style={{
                        ...styles.badge,
                        background: priorityColor.bg,
                        color: priorityColor.color,
                        marginLeft: '8px'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        ...styles.badge,
                        background: statusColor.bg,
                        color: statusColor.color,
                      }}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.dueDate && (
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Role Card */}
          <div style={{ ...styles.card, background: 'linear-gradient(135deg, #1a1035, #2d1b69)' }}>
            <h3 style={{ ...styles.cardTitle, color: 'white' }}>🎯 Your Role</h3>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '20px',
                background: 'rgba(124,58,237,0.3)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', margin: '0 auto 16px'
              }}>
                {user?.role === 'ADMIN' ? '👑' : user?.role === 'PROJECT_MANAGER' ? '🎯' : '💼'}
              </div>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }}>
                {user?.role?.replace('_', ' ')}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.5' }}>
                {user?.role === 'ADMIN' && 'Full system access including user management'}
                {user?.role === 'PROJECT_MANAGER' && 'Create & manage tasks, assign to collaborators'}
                {user?.role === 'COLLABORATOR' && 'View & update status of assigned tasks'}
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <p style={{ color: 'white', fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>{stats.total}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>Tasks</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <p style={{ color: 'white', fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>{completionRate}%</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>Done</p>
              </div>
              {user?.role === 'ADMIN' && (
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ color: 'white', fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>{userCount}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>Users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f5f6fa' },
  main: { marginLeft: '250px', flex: 1, padding: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#1a1035', margin: '0 0 4px' },
  subtitle: { color: '#6b7280', fontSize: '14px', margin: 0 },
  statsGrid: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1035', margin: '0 0 20px' },
  completionSection: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  completionCircle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  taskItem: { background: '#f9fafb', borderRadius: '10px', padding: '14px', marginBottom: '10px', cursor: 'pointer' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
};

export default Dashboard;