import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { getTasks, createTask, updateTaskStatus, deleteTask, addComment, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// ─── Kanban Column ───────────────────────────────────────────
const KanbanColumn = ({ title, status, tasks, color, onStatusChange, onDelete, onComment, userRole }) => (
  <div style={styles.column}>
    <div style={{ ...styles.columnHeader, borderTop: `4px solid ${color}` }}>
      <h3 style={styles.columnTitle}>{title}</h3>
      <span style={{ ...styles.badge, backgroundColor: color }}>{tasks.length}</span>
    </div>

    {tasks.map(task => (
      <div key={task.id} style={styles.card}>
        {/* Priority Badge */}
        <span style={{
          ...styles.priority,
          backgroundColor:
            task.priority === 'HIGH' ? '#fee2e2' :
            task.priority === 'MEDIUM' ? '#fef9c3' : '#dcfce7',
          color:
            task.priority === 'HIGH' ? '#dc2626' :
            task.priority === 'MEDIUM' ? '#ca8a04' : '#16a34a',
        }}>
          {task.priority}
        </span>

        {/* Task Title */}
        <h4 style={styles.cardTitle}>{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p style={styles.cardDesc}>{task.description}</p>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <p style={styles.dueDate}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}

        {/* Assigned Users */}
        {task.assignments?.length > 0 && (
          <div style={styles.assignees}>
            👤 {task.assignments.map(a => a.user.name).join(', ')}
          </div>
        )}

        {/* Comments Count */}
        {task.comments?.length > 0 && (
          <p style={styles.comments}>
            💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}
          </p>
        )}

        {/* Action Buttons */}
        <div style={styles.cardActions}>
          {/* Status Change Buttons */}
          {status !== 'TODO' && (
            <button
              onClick={() => onStatusChange(task.id, 'TODO')}
              style={{ ...styles.actionBtn, backgroundColor: '#f1f5f9' }}
            >
              ← To Do
            </button>
          )}
          {status !== 'IN_PROGRESS' && (
            <button
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              style={{ ...styles.actionBtn, backgroundColor: '#dbeafe' }}
            >
              ⚡ In Progress
            </button>
          )}
          {status !== 'COMPLETED' && (
            <button
              onClick={() => onStatusChange(task.id, 'COMPLETED')}
              style={{ ...styles.actionBtn, backgroundColor: '#dcfce7' }}
            >
              ✅ Done
            </button>
          )}

          {/* Comment Button */}
          <button
            onClick={() => onComment(task)}
            style={{ ...styles.actionBtn, backgroundColor: '#f3e8ff' }}
          >
            💬 Comment
          </button>

          {/* Delete Button - Only for Admin/PM */}
          {(userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER') && (
            <button
              onClick={() => onDelete(task.id)}
              style={{ ...styles.actionBtn, backgroundColor: '#fee2e2', color: '#dc2626' }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    ))}

    {tasks.length === 0 && (
      <div style={styles.emptyColumn}>
        <p>No tasks here</p>
      </div>
    )}
  </div>
);

// ─── Main Tasks Page ─────────────────────────────────────────
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

  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'MEDIUM',
    dueDate: '', assignedUserIds: []
  });

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') {
      fetchUsers();
    }
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
      await createTask({
        ...newTask,
        assignedUserIds: newTask.assignedUserIds.map(Number)
      });
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
    if (!window.confirm('Are you sure you want to delete this task?')) return;
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

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority ? task.priority === filterPriority : true;
    return matchSearch && matchPriority;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');

  if (loading) return <div style={styles.loading}>Loading tasks...</div>;

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Task Board 📋</h1>
            <p style={styles.subtitle}>Manage and track all tasks</p>
          </div>
          <div style={styles.headerRight}>
            <NotificationBell />
            {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={styles.createBtn}
              >
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
            style={styles.searchInput}
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Kanban Board */}
        <div style={styles.board}>
          <KanbanColumn
            title="📝 To Do"
            status="TODO"
            tasks={todoTasks}
            color="#f39c12"
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onComment={handleComment}
            userRole={user?.role}
          />
          <KanbanColumn
            title="⚡ In Progress"
            status="IN_PROGRESS"
            tasks={inProgressTasks}
            color="#3498db"
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onComment={handleComment}
            userRole={user?.role}
          />
          <KanbanColumn
            title="✅ Completed"
            status="COMPLETED"
            tasks={completedTasks}
            color="#2ecc71"
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onComment={handleComment}
            userRole={user?.role}
          />
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    style={styles.input}
                    placeholder="Task title"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                    placeholder="Task description"
                  />
                </div>
                <div style={styles.formRow}>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      style={styles.input}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign To</label>
                  <select
                    multiple
                    value={newTask.assignedUserIds}
                    onChange={(e) => setNewTask({
                      ...newTask,
                      assignedUserIds: Array.from(e.target.selectedOptions, o => o.value)
                    })}
                    style={{ ...styles.input, height: '100px' }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <small style={{ color: '#666' }}>Hold Ctrl to select multiple users</small>
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
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>
                Add Comment to "{selectedTask?.title}"
              </h2>

              {/* Existing Comments */}
              {selectedTask?.comments?.length > 0 && (
                <div style={styles.commentsList}>
                  {selectedTask.comments.map(c => (
                    <div key={c.id} style={styles.commentItem}>
                      <strong style={{ fontSize: '13px' }}>{c.user.name}</strong>
                      <p style={styles.commentText}>{c.content}</p>
                      <span style={styles.commentTime}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmitComment}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Your Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                    placeholder="Write your comment..."
                    required
                  />
                </div>
                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowCommentModal(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    Add Comment
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
  filters: { display: 'flex', gap: '12px', marginBottom: '24px' },
  searchInput: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '300px' },
  filterSelect: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  board: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' },
  column: { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', minHeight: '400px' },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '8px' },
  columnTitle: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2e' },
  badge: { color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  priority: { display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', marginBottom: '8px' },
  cardTitle: { margin: '0 0 8px 0', fontSize: '15px', color: '#1a1a2e' },
  cardDesc: { margin: '0 0 8px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' },
  dueDate: { margin: '0 0 8px 0', fontSize: '12px', color: '#666' },
  assignees: { fontSize: '12px', color: '#666', marginBottom: '8px' },
  comments: { fontSize: '12px', color: '#666', margin: '0 0 8px 0' },
  cardActions: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' },
  actionBtn: { padding: '4px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  emptyColumn: { textAlign: 'center', color: '#aaa', padding: '40px 0' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { margin: '0 0 24px 0', color: '#1a1a2e' },
  formGroup: { marginBottom: '16px' },
  formRow: { display: 'flex', gap: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  submitBtn: { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  commentsList: { marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' },
  commentItem: { padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '8px' },
  commentText: { margin: '4px 0', fontSize: '13px', color: '#444' },
  commentTime: { fontSize: '11px', color: '#999' },
};

export default Tasks;