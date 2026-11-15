import { Router } from 'express'
import taskController from '../controller/task.controller.js'
import { protect } from '../middleware/auth.middleware.js';
const router = Router();

router.use(protect);
router.get('/', taskController.getAllTasks)
router.post('/', taskController.createTask);
router.get('/project/:projectId', taskController.getTasksByProject);
router.get('/summary/projects', taskController.getProjectsSummary);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);


export default router;