import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { SaleService } from '../services/sale.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createSaleSchema } from '../validators/finance.schema';
import { prisma } from '../config/database';

const router = Router();
const saleService = new SaleService(prisma);
const saleController = new SaleController(saleService);

router.get('/', authenticate, saleController.getAll);
router.get('/summary', authenticate, saleController.getSummary);
router.get('/:id', authenticate, saleController.getById);
router.post('/', authenticate, validate(createSaleSchema), saleController.create);
router.delete('/:id', authenticate, saleController.delete);

export default router;
