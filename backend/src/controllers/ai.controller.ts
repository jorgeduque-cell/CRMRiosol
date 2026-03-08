import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { asyncHandler } from '../utils/asyncHandler';

export class AIController {
  constructor(private aiService: AIService) {}

  analyze = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { query } = req.body as { query?: string };
    const result = await this.aiService.analyzeFinances(query);
    res.json(result);
  });
}
