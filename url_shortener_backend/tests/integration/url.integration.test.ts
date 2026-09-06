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

let accessToken: string;
let userId: string;

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'url_shortener_test';

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(`${mongoUri}/${dbName}`);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Url.deleteMany({});

  const registerResponse = await request(app).post('/api/auth/register').send({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });

  expect(registerResponse.status).toBe(201);

  const loginResponse = await request(app).post('/api/auth/login').send({
    email: 'test@example.com',
    password: 'password123',
  });

  expect(loginResponse.status).toBe(200);

  accessToken = loginResponse.body.data.accessToken;
  userId = loginResponse.body.data.user._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('URL Integration Tests', () => {
  describe('POST /api/url/create-url', () => {
    it('should create a short URL successfully', async () => {
      const response = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      expect(response.status).toBe(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Short url is created');

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.originalUrl).toBe('https://example.com');
      expect(response.body.data.shortCode).toHaveLength(6);
      expect(response.body.data.shortUrl).toContain(
        response.body.data.shortCode
      );

      const url = await Url.findOne({
        originalUrl: 'https://example.com',
        userId,
      });

      expect(url).not.toBeNull();
    });

    it('should return existing URL for the same user and original URL', async () => {
      const firstResponse = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      const secondResponse = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(201);

      expect(secondResponse.body.data.shortCode).toBe(
        firstResponse.body.data.shortCode
      );

      const urls = await Url.find({
        originalUrl: 'https://example.com',
        userId,
      });

      expect(urls).toHaveLength(1);
    });

    it('should reject invalid original URL', async () => {
      const response = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'not-a-valid-url',
        });

      expect(response.status).toBe(400);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).post('/api/url/create-url').send({
        originalUrl: 'https://example.com',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/url/me', () => {
    it('should return the authenticated user URLs', async () => {
      await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://google.com',
        });

      const response = await request(app)
        .get('/api/url/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User urls fetched');

      expect(response.body.data).toHaveLength(2);

      expect(response.body.data[0]).toHaveProperty('originalUrl');
      expect(response.body.data[0]).toHaveProperty('shortCode');
      expect(response.body.data[0]).toHaveProperty('shortUrl');
    });

    it('should return an empty array when user has no URLs', async () => {
      const response = await request(app)
        .get('/api/url/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).get('/api/url/me');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/url/:id/disable', () => {
    it('should disable an active URL successfully', async () => {
      const createResponse = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      const urlId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/url/${urlId}/disable`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Short URL disabled successfully');

      const url = await Url.findById(urlId);

      expect(url?.isActive).toBe(false);
    });

    it('should reject disabling an already disabled URL', async () => {
      const createResponse = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      const urlId = createResponse.body.data.id;

      await request(app)
        .patch(`/api/url/${urlId}/disable`)
        .set('Authorization', `Bearer ${accessToken}`);

      const response = await request(app)
        .patch(`/api/url/${urlId}/disable`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('URL is already disabled');
    });

    it('should return 404 for a URL that does not belong to the user', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: 'hashed-password',
      });

      const url = await Url.create({
        originalUrl: 'https://example.com',
        shortCode: 'ABC123',
        userId: otherUser._id,
      });

      const response = await request(app)
        .patch(`/api/url/${url._id}/disable`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('URL not found');
    });
  });

  describe('DELETE /api/url/:id', () => {
    it('should delete a URL successfully', async () => {
      const createResponse = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      const urlId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/url/${urlId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(204);

      const url = await Url.findById(urlId);

      expect(url).toBeNull();
    });

    it('should return 404 when deleting a URL that does not belong to the user', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: 'hashed-password',
      });

      const url = await Url.create({
        originalUrl: 'https://example.com',
        shortCode: 'XYZ789',
        userId: otherUser._id,
      });

      const response = await request(app)
        .delete(`/api/url/${url._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('URL not found');
    });
  });

  describe('GET /api/url/:shortCode', () => {
    it('should redirect to the original URL', async () => {
      const createResponse = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      const shortCode = createResponse.body.data.shortCode;

      const response = await request(app)
        .get(`/api/url/${shortCode}`)
        .redirects(0);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('https://example.com');

      const url = await Url.findOne({ shortCode });

      expect(url?.clickCount).toBe(1);
    });

    it('should return 404 for an unknown short code', async () => {
      const response = await request(app).get('/api/url/UNKNOWN').redirects(0);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Short URL not found');
    });

    it('should return 410 for a disabled short URL', async () => {
      const createResponse = await request(app)
        .post('/api/url/create-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          originalUrl: 'https://example.com',
        });

      const urlId = createResponse.body.data.id;
      const shortCode = createResponse.body.data.shortCode;

      await request(app)
        .patch(`/api/url/${urlId}/disable`)
        .set('Authorization', `Bearer ${accessToken}`);

      const response = await request(app)
        .get(`/api/url/${shortCode}`)
        .redirects(0);

      expect(response.status).toBe(410);
      expect(response.body.message).toBe('Short URL is disabled');
    });
  });
});
