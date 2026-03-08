import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerUserSchema } from '../validators/user.schema';
import { prisma } from '../config/database';

const router = Router();
const userService = new UserService(prisma);
const userController = new UserController(userService);

// Protected: only ADMIN can register new users
router.post('/register', authenticate, requireRole('ADMIN'), validate(registerUserSchema), userController.register);
router.get('/profile', authenticate, userController.getProfile);

export default router;
