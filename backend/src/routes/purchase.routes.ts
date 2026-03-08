import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { PurchaseService } from '../services/purchase.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPurchaseSchema } from '../validators/crm.schema';
import { prisma } from '../config/database';

const router = Router();
const purchaseService = new PurchaseService(prisma);
const purchaseController = new PurchaseController(purchaseService);

router.get('/', authenticate, purchaseController.getAll);
router.get('/totals', authenticate, purchaseController.getTotals);
router.get('/:id', authenticate, purchaseController.getById);
router.post('/', authenticate, validate(createPurchaseSchema), purchaseController.create);
router.delete('/:id', authenticate, purchaseController.delete);

export default router;
