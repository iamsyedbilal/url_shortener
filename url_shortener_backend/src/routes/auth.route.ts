import express from 'express';
import {
  login,
  logout,
  RefreshToken,
  register,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/logout').post(logout);

router.route('/refresh-token').post(RefreshToken);

export default router;
