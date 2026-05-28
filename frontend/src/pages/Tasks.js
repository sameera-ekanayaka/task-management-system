import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { getTasks, createTask, updateTaskStatus, deleteTask, addComment, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// ─── Task Card ────────────────────────────────────────────────
const TaskCard = ({ task, onStatusChange, onDelete, onComment, userRole }) => {
  const getPriorityStyle = (priority) => {
    if (priority === 'HIGH') return { bg: '#fee2e2', color: '#dc2626', dot: '#dc2626' };
    if (priority === 'MEDIUM') return { bg: '#fef9c3', color: '#ca8a04', dot: '#f59e0b' };
    return { bg: '#dcfce7', color: '#16a34a', dot: '#10b981' };
  };

  const p = getPriorityStyle(task.priority);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <div className="card-hover" style={styles.taskCard}>
      {/* Priority & Due Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ ...styles.priorityBadge, background: p.bg, color: p.color }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.dot, display: 'inline-block', marginRight: '4px' }} />
          {task.priority}
        </span>
        {task.dueDate && (
          <span style={{ fontSize: '11px', color: isOverdue ? '#dc2626' : '#9ca3af', fontWeight: isOverdue ? '600' : '400' }}>
            {isOverdue ? '⚠️ ' : '📅 '}
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1035', margin: '0 0 6px' }}>
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px', lineHeight: '1.5' }}>
          {task.description.length > 80 ? task.description.substring(0, 80) + '...' : task.description}
        </p>
      )}

      {/* Assignees */}
      {task.assignments?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          {task.assignments.slice(0, 3).map((a, i) => (
            <div key={i} style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: '#7c3aed', color: 'white', fontSize: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '600', border: '2px solid white',
              marginLeft: i > 0 ? '-8px' : '0'
            }}>
              {a.user.name.charAt(0)}
            </div>
          ))}
          <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>
            {task.assignments.map(a => a.user.name).join(', ')}
          </span>
        </div>
      )}

      {/* Comments count */}
      {task.comments?.length > 0 && (
        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '10px' }}>
          💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: '#f3f4f6', margin: '10px 0' }} />

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {task.status !== 'TODO' && (
          <button onClick={() => onStatusChange(task.id, 'TODO')} style={styles.actionBtn}>
            📝 To Do
          </button>
        )}
        {task.status !== 'IN_PROGRESS' && (
          <button onClick={() => onStatusChange(task.id, 'IN_PROGRESS')} style={{ ...styles.actionBtn, background: '#dbeafe', color: '#1d4ed8' }}>
            ⚡ Progress
          </button>
        )}
        {task.status !== 'COMPLETED' && (
          <button onClick={() => onStatusChange(task.id, 'COMPLETED')} style={{ ...styles.actionBtn, background: '#dcfce7', color: '#16a34a' }}>
            ✅ Done
          </button>
        )}
        <button onClick={() => onComment(task)} style={{ ...styles.actionBtn, background: '#f3e8ff', color: '#7c3aed' }}>
          💬
        </button>
        {(userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER') && (
          <button onClick={() => onDelete(task.id)} style={{ ...styles.actionBtn, background: '#fee2e2', color: '#dc2626' }}>
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Kanban Column ────────────────────────────────────────────
const KanbanColumn = ({ title, status, tasks, color, bgColor, icon, onStatusChange, onDelete, onComment, userRole }) => (
  <div style={{ ...styles.column, '--col-color': color }}>
    <div style={{ ...styles.columnHeader, borderBottom: `2px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1a1035' }}>{title}</h3>
      </div>
      <span style={{ background: color, color: 'white', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>
        {tasks.length}
      </span>
    </div>
    <div style={{ padding: '12px', minHeight: '200px' }}>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onComment={onComment}
          userRole={userRole}
        />
      ))}
      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#d1d5db' }}>
          <p style={{ fontSize: '32px' }}>📭</p>
          <p style={{ fontSize: '13px' }}>No tasks here</p>
        </div>
      )}
    </div>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────
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

// ─── Main Tasks Page ──────────────────────────────────────────
const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'MEDIUM',
    dueDate: '', assignedUserIds: []
  });

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({ ...newTask, assignedUserIds: newTask.assignedUserIds.map(Number) });
      toast.success('Task created successfully!');
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedUserIds: [] });
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, { status });
      toast.success('Status updated!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      toast.success('Task deleted!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleComment = (task) => {
    setSelectedTask(task);
    setShowCommentModal(true);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      await addComment(selectedTask.id, { content: comment });
      toast.success('Comment added!');
      setShowCommentModal(false);
      setComment('');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority ? task.priority === filterPriority : true;
    return matchSearch && matchPriority;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading tasks...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Task Board 📋</h1>
            <p style={styles.subtitle}>{tasks.length} total tasks</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationBell />
            {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                + New Task
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-modern"
            style={{ width: '280px' }}
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-modern"
            style={{ width: '160px' }}
          >
            <option value="">All Priorities</option>
            <option value="HIGH">🔴 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>
          <div style={styles.taskStats}>
            <span style={{ color: '#f59e0b' }}>📝 {todoTasks.length} To Do</span>
            <span style={{ color: '#3b82f6' }}>⚡ {inProgressTasks.length} In Progress</span>
            <span style={{ color: '#10b981' }}>✅ {completedTasks.length} Completed</span>
          </div>
        </div>

        {/* Kanban Board */}
        <div style={styles.board}>
          <KanbanColumn
            title="To Do" status="TODO" tasks={todoTasks}
            color="#f59e0b" bgColor="#fef9c3" icon="📝"
            onStatusChange={handleStatusChange}
            onDelete={handleDelete} onComment={handleComment}
            userRole={user?.role}
          />
          <KanbanColumn
            title="In Progress" status="IN_PROGRESS" tasks={inProgressTasks}
            color="#3b82f6" bgColor="#dbeafe" icon="⚡"
            onStatusChange={handleStatusChange}
            onDelete={handleDelete} onComment={handleComment}
            userRole={user?.role}
          />
          <KanbanColumn
            title="Completed" status="COMPLETED" tasks={completedTasks}
            color="#10b981" bgColor="#dcfce7" icon="✅"
            onStatusChange={handleStatusChange}
            onDelete={handleDelete} onComment={handleComment}
            userRole={user?.role}
          />
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <Modal title="✨ Create New Task" onClose={() => setShowCreateModal(false)}>
            <form onSubmit={handleCreateTask}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-modern"
                  placeholder="Task title"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-modern"
                  style={{ height: '80px', resize: 'vertical' }}
                  placeholder="Task description"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input-modern"
                  >
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HIGH">🔴 High</option>
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="input-modern"
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Assign To (Hold Ctrl for multiple)</label>
                <select
                  multiple
                  value={newTask.assignedUserIds}
                  onChange={(e) => setNewTask({
                    ...newTask,
                    assignedUserIds: Array.from(e.target.selectedOptions, o => o.value)
                  })}
                  className="input-modern"
                  style={{ height: '100px' }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} — {u.role}</option>
                  ))}
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Comment Modal */}
        {showCommentModal && (
          <Modal title={`💬 Comments — ${selectedTask?.title}`} onClose={() => setShowCommentModal(false)}>
            {selectedTask?.comments?.length > 0 && (
              <div style={styles.commentsList}>
                {selectedTask.comments.map(c => (
                  <div key={c.id} style={styles.commentItem}>
                    <div style={styles.commentAvatar}>
                      {c.user.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1035', margin: '0 0 4px' }}>
                        {c.user.name}
                      </p>
                      <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>{c.content}</p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmitComment}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Add Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input-modern"
                  style={{ height: '100px', resize: 'vertical' }}
                  placeholder="Write your comment..."
                  required
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCommentModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Comment
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
  filters: { display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' },
  taskStats: { display: 'flex', gap: '16px', marginLeft: 'auto', fontSize: '13px', fontWeight: '600' },
  board: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' },
  column: { background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'white' },
  taskCard: { background: '#f9fafb', borderRadius: '12px', padding: '14px', marginBottom: '10px', cursor: 'pointer' },
  priorityBadge: { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  actionBtn: { padding: '4px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500', background: '#f3f4f6', color: '#374151' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1035', margin: 0 },
  closeBtn: { background: '#f3f4f6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  cancelBtn: { padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' },
  commentsList: { marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' },
  commentItem: { display: 'flex', gap: '10px', padding: '12px', background: '#f9fafb', borderRadius: '10px', marginBottom: '8px' },
  commentAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#7c3aed', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
};

export default Tasks;