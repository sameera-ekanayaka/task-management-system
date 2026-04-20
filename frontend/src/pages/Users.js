import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { getUsers, createUser, updateUser, deactivateUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    name: '', email: '', role: 'COLLABORATOR'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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
      toast.success(`User created! Temp password: ${response.data.tempPassword}`);
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
      await updateUser(selectedUser.id, {
        name: selectedUser.name,
        role: selectedUser.role
      });
      toast.success('User updated successfully!');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await deactivateUser(userId);
      toast.success('User deactivated!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const getRoleBadgeColor = (role) => {
    if (role === 'ADMIN') return { bg: '#fee2e2', color: '#dc2626' };
    if (role === 'PROJECT_MANAGER') return { bg: '#dbeafe', color: '#1d4ed8' };
    return { bg: '#dcfce7', color: '#16a34a' };
  };

  if (loading) return <div style={styles.loading}>Loading users...</div>;

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>User Management 👥</h1>
            <p style={styles.subtitle}>Manage system users and roles</p>
          </div>
          <div style={styles.headerRight}>
            <NotificationBell />
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={styles.createBtn}
              >
                + New User
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="COLLABORATOR">Collaborator</option>
          </select>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <strong>{users.length}</strong> Total Users
          </div>
          <div style={styles.statItem}>
            <strong>{users.filter(u => u.role === 'ADMIN').length}</strong> Admins
          </div>
          <div style={styles.statItem}>
            <strong>{users.filter(u => u.role === 'PROJECT_MANAGER').length}</strong> Project Managers
          </div>
          <div style={styles.statItem}>
            <strong>{users.filter(u => u.role === 'COLLABORATOR').length}</strong> Collaborators
          </div>
          <div style={styles.statItem}>
            <strong>{users.filter(u => u.isActive).length}</strong> Active
          </div>
        </div>

        {/* Users Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const roleColor = getRoleBadgeColor(u.role);
                return (
                  <tr key={u.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        backgroundColor: roleColor.bg,
                        color: roleColor.color
                      }}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: u.isActive ? '#dcfce7' : '#fee2e2',
                        color: u.isActive ? '#16a34a' : '#dc2626'
                      }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
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
            <div style={styles.emptyTable}>
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Create New User</h2>
              <form onSubmit={handleCreateUser}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    style={styles.input}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    style={styles.input}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={styles.input}
                  >
                    <option value="COLLABORATOR">Collaborator</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Edit User</h2>
              <form onSubmit={handleUpdateUser}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    style={{ ...styles.input, backgroundColor: '#f8fafc', color: '#999' }}
                    disabled
                  />
                  <small style={{ color: '#999' }}>Email cannot be changed</small>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    style={styles.input}
                  >
                    <option value="COLLABORATOR">Collaborator</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' },
  main: { marginLeft: '240px', flex: 1, padding: '32px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', color: '#1a1a2e' },
  subtitle: { margin: '4px 0 0 0', color: '#666' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  createBtn: { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  filters: { display: 'flex', gap: '12px', marginBottom: '20px' },
  searchInput: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '300px' },
  filterSelect: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '24px', backgroundColor: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statItem: { fontSize: '14px', color: '#666' },
  tableContainer: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f8fafc' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666', borderBottom: '1px solid #eee' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  nameCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' },
  roleBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
  statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
  actionButtons: { display: 'flex', gap: '8px' },
  editBtn: { padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  deactivateBtn: { padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  emptyTable: { textAlign: 'center', padding: '40px', color: '#aaa' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px' },
  modalTitle: { margin: '0 0 24px 0', color: '#1a1a2e' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  submitBtn: { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
};

export default Users;