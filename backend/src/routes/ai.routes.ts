import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { AIService } from '../services/ai.service';
import { FinanceService } from '../services/finance.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiAnalysisSchema } from '../validators/finance.schema';
import { prisma } from '../config/database';

const router = Router();
const financeService = new FinanceService(prisma);
const aiService = new AIService(prisma, financeService);
const aiController = new AIController(aiService);

// POST /api/v1/ai/analyze  body: { query?: "¿Cómo puedo mejorar mis márgenes?" }
router.post('/analyze', authenticate, validate(aiAnalysisSchema), aiController.analyze);

export default router;
