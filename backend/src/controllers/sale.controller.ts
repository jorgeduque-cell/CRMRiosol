import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { CreateSaleInput } from '../validators/finance.schema';
import { asyncHandler } from '../utils/asyncHandler';

export class SaleController {
  constructor(private saleService: SaleService) {}

  getAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await this.saleService.getAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  });

  getById = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    const sale = await this.saleService.getById(req.params.id);
    res.json(sale);
  });

  create = asyncHandler(async (req: Request<{}, {}, CreateSaleInput>, res: Response, _next: NextFunction) => {
    const sale = await this.saleService.create(req.body);
    res.status(201).json({ message: 'Venta registrada exitosamente', sale });
  });

  delete = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    await this.saleService.delete(req.params.id);
    res.status(204).send();
  });

  getSummary = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const summary = await this.saleService.getSalesSummary();
    res.json(summary);
  });
}
