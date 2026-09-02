import express, { RequestHandler } from 'express';
import { getAllUsers, getMe } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';

const router = express.Router();

router.route('/me').get(authMiddleware, getMe);

router
  .route('/all-user')
  .get(authMiddleware, authorize('admin') as RequestHandler, getAllUsers);

export default router;
