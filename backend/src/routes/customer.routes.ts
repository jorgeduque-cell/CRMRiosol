import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { CustomerService } from '../services/customer.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema, updateCustomerStatusSchema } from '../validators/crm.schema';
import { prisma } from '../config/database';

const router = Router();
const customerService = new CustomerService(prisma);
const customerController = new CustomerController(customerService);

router.get('/', authenticate, customerController.getAll);
router.get('/kanban', authenticate, customerController.getKanban);
router.get('/:id', authenticate, customerController.getById);
router.post('/', authenticate, validate(createCustomerSchema), customerController.create);
router.put('/:id', authenticate, validate(updateCustomerSchema), customerController.update);
router.patch('/:id/status', authenticate, validate(updateCustomerStatusSchema), customerController.updateStatus);
router.delete('/:id', authenticate, customerController.delete);

export default router;
