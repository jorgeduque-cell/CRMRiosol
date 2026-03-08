import { Router } from 'express';
import { ProviderController } from '../controllers/provider.controller';
import { ProviderService } from '../services/provider.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProviderSchema, updateProviderSchema } from '../validators/crm.schema';
import { prisma } from '../config/database';

const router = Router();
const providerService = new ProviderService(prisma);
const providerController = new ProviderController(providerService);

router.get('/', authenticate, providerController.getAll);
router.get('/:id', authenticate, providerController.getById);
router.post('/', authenticate, validate(createProviderSchema), providerController.create);
router.put('/:id', authenticate, validate(updateProviderSchema), providerController.update);
router.delete('/:id', authenticate, providerController.delete);

export default router;
