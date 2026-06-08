const request = require('supertest');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Helper to get admin token
const getAdminToken = async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password' });
  return response.body.token;
};

describe('User Management API', () => {

  // Test 1: Get all users as admin
  test('Should get all users as admin', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  // Test 2: Cannot get users without token
  test('Should reject request without token', async () => {
    const response = await request(app)
      .get('/api/users');

    expect(response.status).toBe(401);
  });

  // Test 3: Create user as admin
  test('Should create new user as admin', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test User',
        email: `testuser${Date.now()}@test.com`,
        role: 'COLLABORATOR'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('tempPassword');
    expect(response.body.user.role).toBe('COLLABORATOR');
  });

  // Test 4: Cannot create user with invalid role
  test('Should reject user creation with invalid role', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test User',
        email: 'testinvalid@test.com',
        role: 'INVALID_ROLE'
      });

    expect(response.status).toBe(400);
  });

  // Test 5: Cannot create user with duplicate email
  test('Should reject duplicate email', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Duplicate User',
        email: 'admin@test.com',
        role: 'COLLABORATOR'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email already in use');
  });

  // Test 6: Get user by ID
  test('Should get user by ID', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .get('/api/users/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(1);
  });

  // Test 7: Get non-existent user
  test('Should return 404 for non-existent user', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .get('/api/users/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

});