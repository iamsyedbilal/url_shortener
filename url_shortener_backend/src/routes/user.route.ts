import express, { RequestHandler } from 'express';
import { getMe } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/me').get(authMiddleware, getMe);

export default router;
