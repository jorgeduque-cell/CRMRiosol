import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { FinanceService } from '../services/finance.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { financeReportQuerySchema } from '../validators/finance.schema';
import { prisma } from '../config/database';

const router = Router();
const financeService = new FinanceService(prisma);
const financeController = new FinanceController(financeService);

// GET /api/v1/finance/report?startDate=...&endDate=...
router.get('/report', authenticate, validate(financeReportQuerySchema), financeController.getReport);

export default router;
