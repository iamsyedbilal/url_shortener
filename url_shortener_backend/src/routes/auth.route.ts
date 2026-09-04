import express from 'express';
import {
  login,
  logout,
  RefreshToken,
  register,
} from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.route('/register').post(authRateLimiter, register);

router.route('/login').post(authRateLimiter, login);

router.route('/logout').post(authRateLimiter, logout);

router.route('/refresh-token').post(authRateLimiter, RefreshToken);

export default router;
