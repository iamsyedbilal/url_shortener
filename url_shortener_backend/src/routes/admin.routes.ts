import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import {
  deleteAdminUrl,
  disableAdminUrl,
  getAllUrls,
  getAllUsers,
} from '../controllers/admin.controller.js';

// GET    /admin/users ✅
// GET    /admin/urls ✅
// PATCH  /admin/urls/:id/disable ✅
// DELETE /admin/urls/:id ✅

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin') as express.RequestHandler);

router.get('/users', getAllUsers);
router.get('/urls', getAllUrls);
router.patch('/urls/:id/disable', disableAdminUrl);
router.delete('/urls/:id', deleteAdminUrl);

export default router;
