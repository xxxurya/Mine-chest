const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock the dependencies
jest.mock('../src/modules/users/user.service', () => ({
  createUser: jest.fn(),
  getUserByUsername: jest.fn(),
  getUserById: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

const { createUser, getUserByUsername, getUserById } = require('../src/modules/users/user.service');
const authRoutes = require('../src/modules/auth/auth.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Test data setup
const testUsers = {
  valid: {
    id: 'test-uuid-1',
    username: 'testuser',
    password: 'hashedpassword',
    role: 'WORKER'
  },
  manager: {
    id: 'test-uuid-2',
    username: 'manager',
    password: 'hashedpassword',
    role: 'MANAGER'
  },
  admin: {
    id: 'test-uuid-3',
    username: 'admin',
    password: 'hashedpassword',
    role: 'ADMIN'
  }
};

describe('Auth Routes', () => {
  beforeAll(() => {
    // Global test setup
    process.env.JWT_SECRET = 'test-secret-key';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset test data before each test
    bcrypt.hash.mockResolvedValue('hashedpassword');
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocktoken');
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Global test cleanup
    delete process.env.JWT_SECRET;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      createUser.mockResolvedValue(testUsers.valid.id);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsers.valid.username,
          password: 'password123',
          role: 'WORKER'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('userId', testUsers.valid.id);
    });

    it('should register a MANAGER user successfully', async () => {
      createUser.mockResolvedValue(testUsers.manager.id);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsers.manager.username,
          password: 'password123',
          role: 'MANAGER'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
    });

    it('should register an ADMIN user successfully', async () => {
      createUser.mockResolvedValue(testUsers.admin.id);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsers.admin.username,
          password: 'password123',
          role: 'ADMIN'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          role: 'WORKER'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          role: 'WORKER'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 400 if role is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 400 if role is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          role: 'INVALID_ROLE'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid role');
    });

    it('should return 500 if database error during registration', async () => {
      createUser.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          role: 'WORKER'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      getUserByUsername.mockResolvedValue(testUsers.valid);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsers.valid.username,
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mocktoken');
      expect(response.body.user).toEqual({
        id: testUsers.valid.id,
        username: testUsers.valid.username,
        role: testUsers.valid.role
      });
    });

    it('should return 401 if user not found', async () => {
      getUserByUsername.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 if password is invalid', async () => {
      getUserByUsername.mockResolvedValue(testUsers.valid);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsers.valid.username,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 500 if database error during login', async () => {
      getUserByUsername.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
