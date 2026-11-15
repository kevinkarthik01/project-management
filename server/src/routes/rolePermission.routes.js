import { Router } from 'express';
import rolePermissionController from '../controller/rolePermission.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

// View roles permissions (accessible by logged in users or admins)
router.get('/', rolePermissionController.getAll);

// Only admins can modify roles and permissions
router.put('/:role', restrictTo('admin'), rolePermissionController.updateByRole);

export default router;
