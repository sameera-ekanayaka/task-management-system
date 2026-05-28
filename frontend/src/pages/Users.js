import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { getUsers, createUser, updateUser, deactivateUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Modal = ({ title, onClose, children }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modal}>
      <div style={styles.modalHeader}>
        <h2 style={styles.modalTitle}>{title}</h2>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'COLLABORATOR' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await createUser(newUser);
      toast.success(`✅ User created! Temp password: ${response.data.tempPassword}`);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', role: 'COLLABORATOR' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(selectedUser.id, { name: selectedUser.name, role: selectedUser.role });
      toast.success('User updated successfully!');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await deactivateUser(userId);
      toast.success('User deactivated!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const getRoleStyle = (role) => {
    if (role === 'ADMIN') return { bg: '#fee2e2', color: '#dc2626', icon: '👑' };
    if (role === 'PROJECT_MANAGER') return { bg: '#dbeafe', color: '#1d4ed8', icon: '🎯' };
    return { bg: '#dcfce7', color: '#16a34a', icon: '💼' };
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading users...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>User Management 👥</h1>
            <p style={styles.subtitle}>{users.length} total users</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationBell />
            {user?.role === 'ADMIN' && (
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                + New User
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Users', value: users.length, icon: '👥', color: '#7c3aed', bg: '#f3e8ff' },
            { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, icon: '👑', color: '#dc2626', bg: '#fee2e2' },
            { label: 'Project Managers', value: users.filter(u => u.role === 'PROJECT_MANAGER').length, icon: '🎯', color: '#1d4ed8', bg: '#dbeafe' },
            { label: 'Collaborators', value: users.filter(u => u.role === 'COLLABORATOR').length, icon: '💼', color: '#16a34a', bg: '#dcfce7' },
            { label: 'Active', value: users.filter(u => u.isActive).length, icon: '✅', color: '#10b981', bg: '#d1fae5' },
          ].map((stat, i) => (
            <div key={i} className="card-hover" style={styles.statCard}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' }}>
                {stat.icon}
              </div>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#1a1035', margin: '0 0 4px' }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-modern"
            style={{ width: '300px' }}
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input-modern"
            style={{ width: '180px' }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">👑 Admin</option>
            <option value="PROJECT_MANAGER">🎯 Project Manager</option>
            <option value="COLLABORATOR">💼 Collaborator</option>
          </select>
        </div>

        {/* Users Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const roleStyle = getRoleStyle(u.role);
                return (
                  <tr key={u.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: '700', fontSize: '14px'
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1035' }}>
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: '#6b7280', fontSize: '13px' }}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        background: roleStyle.bg, color: roleStyle.color,
                        padding: '4px 12px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: '600'
                      }}>
                        {roleStyle.icon} {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        background: u.isActive ? '#dcfce7' : '#fee2e2',
                        color: u.isActive ? '#16a34a' : '#dc2626',
                        padding: '4px 12px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: '600'
                      }}>
                        {u.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: '#6b7280', fontSize: '13px' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                          style={styles.editBtn}
                        >
                          ✏️ Edit
                        </button>
                        {u.isActive && u.id !== user?.id && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            style={styles.deactivateBtn}
                          >
                            🚫 Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
              <p style={{ fontSize: '40px' }}>👤</p>
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <Modal title="👤 Create New User" onClose={() => setShowCreateModal(false)}>
            <form onSubmit={handleCreateUser}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="input-modern"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-modern"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="input-modern"
                >
                  <option value="COLLABORATOR">💼 Collaborator</option>
                  <option value="PROJECT_MANAGER">🎯 Project Manager</option>
                  <option value="ADMIN">👑 Admin</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <Modal title="✏️ Edit User" onClose={() => setShowEditModal(false)}>
            <form onSubmit={handleUpdateUser}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="input-modern"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  className="input-modern"
                  style={{ background: '#f9fafb', color: '#9ca3af' }}
                  disabled
                />
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>
                  Email cannot be changed
                </p>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="input-modern"
                >
                  <option value="COLLABORATOR">💼 Collaborator</option>
                  <option value="PROJECT_MANAGER">🎯 Project Manager</option>
                  <option value="ADMIN">👑 Admin</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f5f6fa' },
  main: { marginLeft: '250px', flex: 1, padding: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#1a1035', margin: '0 0 4px' },
  subtitle: { color: '#6b7280', fontSize: '14px', margin: 0 },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
  statCard: { flex: 1, background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  filters: { display: 'flex', gap: '12px', marginBottom: '20px' },
  tableContainer: { background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeaderRow: { background: '#f9fafb', borderBottom: '1px solid #f3f4f6' },
  th: { padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableRow: { borderBottom: '1px solid #f9fafb', transition: 'background 0.15s' },
  td: { padding: '16px 20px' },
  editBtn: { padding: '6px 14px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  deactivateBtn: { padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1035', margin: 0 },
  closeBtn: { background: '#f3f4f6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  cancelBtn: { padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' },
};

export default Users;