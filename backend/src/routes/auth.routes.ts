import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { validate } from '../middleware/validate.middleware';
import { loginUserSchema } from '../validators/user.schema';
import { prisma } from '../config/database';

const router = Router();
const authService = new AuthService(prisma);
const authController = new AuthController(authService);

router.post('/login', validate(loginUserSchema), authController.login);

export default router;
