import mongoose from 'mongoose';
import request from 'supertest';

import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
} from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

import app from '../../src/app.js';
import User from '../../src/models/user.model.js';
import { generateAccessToken } from '../../src/utils/jwt.js';

describe('User API Integration Tests', () => {
  let accessToken: string;

  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  };

  beforeAll(async () => {
    await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
  });

  beforeEach(async () => {
    await User.deleteMany({});

    await request(app).post('/api/auth/register').send(userData);

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/user/me', () => {
    it('should return authenticated user', async () => {
      const response = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/user/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when authenticated user does not exist', async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();

      const fakeToken = generateAccessToken(fakeUserId, 'user');

      const response = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
