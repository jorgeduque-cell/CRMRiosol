import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../validators/finance.schema';
import { prisma } from '../config/database';

const router = Router();
const taskService = new TaskService(prisma);
const taskController = new TaskController(taskService);

router.get('/', authenticate, taskController.getAll);
router.get('/weekly', authenticate, taskController.getWeekly);
router.get('/:id', authenticate, taskController.getById);
router.post('/', authenticate, validate(createTaskSchema), taskController.create);
router.put('/:id', authenticate, validate(updateTaskSchema), taskController.update);
router.patch('/:id/toggle', authenticate, taskController.toggleComplete);
router.delete('/:id', authenticate, taskController.delete);

export default router;
