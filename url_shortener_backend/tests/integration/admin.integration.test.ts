import mongoose from 'mongoose';
import request from 'supertest';

import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  afterAll,
} from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

import app from '../../src/app.js';
import User from '../../src/models/user.model.js';
import Url from '../../src/models/url.model.js';

describe('Admin API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let urlId: string;

  const adminUser = {
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'AdminPassword123',
    confirmPassword: 'AdminPassword123',
  };

  const normalUser = {
    username: 'normaluser',
    email: 'user@example.com',
    password: 'UserPassword123',
    confirmPassword: 'UserPassword123',
  };

  beforeAll(async () => {
    await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Url.deleteMany({});

    // Create admin
    await request(app).post('/api/auth/register').send(adminUser);

    await User.findOneAndUpdate({ email: adminUser.email }, { role: 'admin' });

    // Create normal user
    await request(app).post('/api/auth/register').send(normalUser);

    // Login admin
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });

    adminToken = adminLogin.body.data.accessToken;

    // Login normal user
    const userLogin = await request(app).post('/api/auth/login').send({
      email: normalUser.email,
      password: normalUser.password,
    });

    userToken = userLogin.body.data.accessToken;

    // Create URL for testing admin URL operations
    const urlResponse = await request(app)
      .post('/api/url/create-url')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        originalUrl: 'https://example.com/admin-test',
      });

    urlId = urlResponse.body.data.id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // ─────────────────────────────────────
  // Authorization
  // ─────────────────────────────────────

  describe('Authorization', () => {
    it('should allow admin to access admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject normal user with 403', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      console.log('NORMAL USER:', response.status, response.body);
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/admin/users');

      console.log('UNAUTH:', response.status, response.body);
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ─────────────────────────────────────
  // GET ALL USERS
  // ─────────────────────────────────────

  describe('GET /api/admin/users', () => {
    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');

      expect(response.body.data.users).toHaveLength(2);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].role).toBe('admin');
    });

    it('should search users by username or email', async () => {
      const response = await request(app)
        .get('/api/admin/users?search=normaluser')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].username).toBe('normaluser');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
      expect(response.body.data.pagination.total).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should return 404 when no users match the filter', async () => {
      const response = await request(app)
        .get('/api/admin/users?search=doesnotexist')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ─────────────────────────────────────
  // GET ALL URLS
  // ─────────────────────────────────────

  describe('GET /api/admin/urls', () => {
    it('should get all URLs', async () => {
      const response = await request(app)
        .get('/api/admin/urls')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveProperty('urls');
      expect(response.body.data).toHaveProperty('pagination');

      expect(response.body.data.urls).toHaveLength(1);
    });

    it('should filter URLs by active status', async () => {
      const response = await request(app)
        .get('/api/admin/urls?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.urls).toHaveLength(1);
      expect(response.body.data.urls[0].isActive).toBe(true);
    });

    it('should search URLs', async () => {
      const response = await request(app)
        .get('/api/admin/urls?search=admin-test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.urls).toHaveLength(1);
    });

    it('should support URL pagination', async () => {
      const response = await request(app)
        .get('/api/admin/urls?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.urls).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });
  });

  // ─────────────────────────────────────
  // DISABLE URL
  // ─────────────────────────────────────

  describe('PATCH /api/admin/urls/:id/disable', () => {
    it('should allow admin to disable a URL', async () => {
      const response = await request(app)
        .patch(`/api/admin/urls/${urlId}/disable`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.isActive).toBe(false);

      const url = await Url.findById(urlId);

      expect(url?.isActive).toBe(false);
    });

    it('should return 404 when URL does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .patch(`/api/admin/urls/${fakeId}/disable`)
        .set('Authorization', `Bearer ${adminToken}`);

      console.log('FAKE URL:', response.status, response.body);
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject normal user from disabling a URL', async () => {
      const response = await request(app)
        .patch(`/api/admin/urls/${urlId}/disable`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  // ─────────────────────────────────────
  // DELETE URL
  // ─────────────────────────────────────

  describe('DELETE /api/admin/urls/:id', () => {
    it('should allow admin to delete a URL', async () => {
      const response = await request(app)
        .delete(`/api/admin/urls/${urlId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const url = await Url.findById(urlId);

      expect(url).toBeNull();
    });

    it('should return 404 when URL does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/admin/urls/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject normal user from deleting a URL', async () => {
      const response = await request(app)
        .delete(`/api/admin/urls/${urlId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
