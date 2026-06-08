const request = require('supertest');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create test app
const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('../routes/authRoutes');
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {

  // Test 1: Login with valid credentials
  test('Should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('admin@test.com');
    expect(response.body.user.role).toBe('ADMIN');
  });

  // Test 2: Login with invalid password
  test('Should fail login with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  // Test 3: Login with non-existent email
  test('Should fail login with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'notexist@test.com',
        password: 'password'
      });

    expect(response.status).toBe(401);
  });

  // Test 4: Login with missing fields
  test('Should fail login with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  // Test 5: Login returns JWT token
  test('Should return valid JWT token structure', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password'
      });

    expect(response.status).toBe(200);
    const token = response.body.token;
    // JWT has 3 parts separated by dots
    expect(token.split('.').length).toBe(3);
  });

});