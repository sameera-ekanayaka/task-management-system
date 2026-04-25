import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});
// Automatically add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Required for ngrok
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Users
export const getUsers = (params) => API.get('/users', { params });
export const getUserById = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post('/users', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deactivateUser = (id) => API.patch(`/users/${id}/deactivate`);

// Tasks
export const getTasks = (params) => API.get('/tasks', { params });
export const getTaskById = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, data) => API.patch(`/tasks/${id}/status`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const addComment = (id, data) => API.post(`/tasks/${id}/comments`, data);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => API.patch('/notifications/read-all');