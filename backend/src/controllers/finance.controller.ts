import { Request, Response, NextFunction } from 'express';
import { FinanceService } from '../services/finance.service';
import { asyncHandler } from '../utils/asyncHandler';

export class FinanceController {
  constructor(private financeService: FinanceService) {}

  getReport = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const report = await this.financeService.getFullReport(startDate, endDate);
    res.json(report);
  });
}
