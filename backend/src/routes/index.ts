import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import providerRoutes from './provider.routes';
import customerRoutes from './customer.routes';
import purchaseRoutes from './purchase.routes';
import saleRoutes from './sale.routes';
import taskRoutes from './task.routes';
import financeRoutes from './finance.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/providers', providerRoutes);
router.use('/customers', customerRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/sales', saleRoutes);
router.use('/tasks', taskRoutes);
router.use('/finance', financeRoutes);
router.use('/ai', aiRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

export default router;
