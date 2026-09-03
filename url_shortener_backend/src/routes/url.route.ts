import express from 'express';
import {
  createShortUrl,
  deleteUrl,
  disableUrl,
  getUrls,
  redirectUrl,
} from '../controllers/url.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST   /urls ✅
// GET    /urls/me ✅
// PATCH  /urls/:id/disable ✅
// DELETE /urls/:id  ✅
// GET    /:shortCode ✅
// GET    /admin/users
// GET    /admin/urls
// PATCH  /admin/urls/:id/disable
// DELETE /admin/urls/:id

router.route('/create-url').post(authMiddleware, createShortUrl);

router.route('/me').get(authMiddleware, getUrls);

router.route('/:id/disable').patch(authMiddleware, disableUrl);

router.route('/:id').delete(authMiddleware, deleteUrl);

router.route('/:shortCode').get(redirectUrl);

export default router;
