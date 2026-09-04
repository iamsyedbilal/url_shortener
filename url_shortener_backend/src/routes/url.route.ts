import express from 'express';
import {
  createShortUrl,
  deleteUrl,
  disableUrl,
  getUrls,
  redirectUrl,
} from '../controllers/url.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createUrlRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

// POST   /urls ✅
// GET    /urls/me ✅
// PATCH  /urls/:id/disable ✅
// DELETE /urls/:id  ✅
// GET    /:shortCode ✅

router
  .route('/create-url')
  .post(authMiddleware, createUrlRateLimiter, createShortUrl);

router.route('/me').get(authMiddleware, getUrls);

router.route('/:id/disable').patch(authMiddleware, disableUrl);

router.route('/:id').delete(authMiddleware, deleteUrl);

router.route('/:shortCode').get(redirectUrl);

export default router;
