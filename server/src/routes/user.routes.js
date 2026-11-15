import { Router } from 'express';
import userController from '../controller/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all user routes
router.use(protect);

router.get('/', userController.getAllUsers);

export default router;
