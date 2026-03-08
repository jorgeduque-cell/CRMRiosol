import { Request, Response, NextFunction } from 'express';
import { PurchaseService } from '../services/purchase.service';
import { CreatePurchaseInput } from '../validators/crm.schema';
import { asyncHandler } from '../utils/asyncHandler';

export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  getAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await this.purchaseService.getAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  });

  getById = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    const purchase = await this.purchaseService.getById(req.params.id);
    res.json(purchase);
  });

  create = asyncHandler(async (req: Request<{}, {}, CreatePurchaseInput>, res: Response, _next: NextFunction) => {
    const purchase = await this.purchaseService.create(req.body);
    res.status(201).json({ message: 'Compra registrada exitosamente', purchase });
  });

  delete = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    await this.purchaseService.delete(req.params.id);
    res.status(204).send();
  });

  getTotals = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const totals = await this.purchaseService.getTotalsByProvider();
    res.json(totals);
  });
}
