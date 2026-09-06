process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/user.model.js';
import Session from '../../src/models/session.model.js';
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  afterAll,
} from '@jest/globals';

beforeAll(async () => {
  process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'url_shortener_test';

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(`${mongoUri}/${dbName}`);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Session.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

const registerTestUser = async () => {
  await request(app).post('/api/auth/register').send({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
};

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.status).toBe(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.username).toBe('testuser');
      expect(response.body.data.email).toBe('test@example.com');

      const user = await User.findOne({ email: 'test@example.com' });

      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser');
      expect(user?.passwordHash).not.toBe('password123');
    });

    it('should reject duplicate username', async () => {
      await User.create({
        username: 'testuser',
        email: 'first@example.com',
        passwordHash: 'hashed-password',
      });

      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'second@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username or email already exists');
    });

    it('should reject duplicate email', async () => {
      await User.create({
        username: 'firstuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });

      const response = await request(app).post('/api/auth/register').send({
        username: 'seconduser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username or email already exists');
    });

    it('should reject mismatched passwords', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid registration data', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'ab',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '123',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    it('should login successfully', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User logged in successfully');

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe('test@example.com');

      expect(response.body.data.user.passwordHash).toBeUndefined();

      expect(response.headers['set-cookie']).toBeDefined();

      const sessions = await Session.find({});

      expect(sessions).toHaveLength(1);
    });

    it('should reject wrong password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should reject non-existing user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'doesnotexist@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should reject invalid login data', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        password: '123',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    beforeEach(async () => {
      await registerTestUser();
    });

    it('should refresh access token successfully', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      const cookies = loginResponse.headers['set-cookie'];

      expect(cookies).toBeDefined();

      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', cookies);

      expect(refreshResponse.status).toBe(200);

      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.message).toBe('Token refreshed successfully');

      expect(refreshResponse.body.data).toHaveProperty('accessToken');
    });

    it('should reject refresh when cookie is missing', async () => {
      const response = await request(app).post('/api/auth/refresh-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Refresh token is missing');
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      await registerTestUser();
    });
    it('should logout successfully', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      const cookies = loginResponse.headers['set-cookie'];

      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);

      expect(logoutResponse.status).toBe(200);

      expect(logoutResponse.body.success).toBe(true);
      expect(logoutResponse.body.message).toBe('Logged out successfully');

      const session = await Session.findOne({});

      expect(session).not.toBeNull();
      expect(session?.revokedAt).not.toBeNull();
    });

    it('should reject logout when refresh cookie is missing', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Refresh token is missing');
    });
  });
});
