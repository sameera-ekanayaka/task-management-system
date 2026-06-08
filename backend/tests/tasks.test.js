const request = require('supertest');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Setup Socket.io mock for task controller
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const connectedUsers = {};
app.set('io', io);
app.set('connectedUsers', connectedUsers);

const authRoutes = require('../routes/authRoutes');
const taskRoutes = require('../routes/taskRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Helper to get admin token
const getAdminToken = async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password' });
  return response.body.token;
};

describe('Task Management API', () => {

  // Test 1: Get all tasks
  test('Should get all tasks', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tasks');
    expect(Array.isArray(response.body.tasks)).toBe(true);
  });

  // Test 2: Cannot get tasks without token
  test('Should reject tasks request without token', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(401);
  });

  // Test 3: Create task as admin
  test('Should create task as admin', async () => {
    const token = await getAdminToken();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'Test task description',
        priority: 'HIGH',
        dueDate: futureDate.toISOString()
      });

    expect(response.status).toBe(201);
    expect(response.body.task.title).toBe('Test Task');
    expect(response.body.task.priority).toBe('HIGH');
  });

  // Test 4: Cannot create task without title
  test('Should reject task without title', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'No title task',
        priority: 'LOW'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Title is required');
  });

  // Test 5: Cannot create task with past due date
  test('Should reject task with past due date', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Past Due Task',
        dueDate: '2020-01-01'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Due date cannot be in the past');
  });

  // Test 6: Update task status
  test('Should update task status', async () => {
    const token = await getAdminToken();

    // First create a task
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Status Test Task', dueDate: futureDate.toISOString() });

    const taskId = createRes.body.task.id;

    // Update its status
    const response = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });

    expect(response.status).toBe(200);
    expect(response.body.task.status).toBe('IN_PROGRESS');
  });

  // Test 7: Invalid status value
  test('Should reject invalid status value', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .patch('/api/tasks/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'INVALID_STATUS' });

    expect(response.status).toBe(400);
  });

  // Test 8: Get task by ID
  test('Should get task by ID', async () => {
    const token = await getAdminToken();

    // Create task first
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Get By ID Task', dueDate: futureDate.toISOString() });

    const taskId = createRes.body.task.id;

    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.task.id).toBe(taskId);
  });

});