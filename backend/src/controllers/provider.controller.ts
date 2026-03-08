import { Request, Response, NextFunction } from 'express';
import { ProviderService } from '../services/provider.service';
import { CreateProviderInput, UpdateProviderInput } from '../validators/crm.schema';
import { asyncHandler } from '../utils/asyncHandler';

export class ProviderController {
  constructor(private providerService: ProviderService) {}

  getAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await this.providerService.getAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  });

  getById = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    const provider = await this.providerService.getById(req.params.id);
    res.json(provider);
  });

  create = asyncHandler(async (req: Request<{}, {}, CreateProviderInput>, res: Response, _next: NextFunction) => {
    const provider = await this.providerService.create(req.body);
    res.status(201).json({ message: 'Proveedor creado exitosamente', provider });
  });

  update = asyncHandler(async (req: Request<{ id: string }, {}, UpdateProviderInput>, res: Response, _next: NextFunction) => {
    const provider = await this.providerService.update(req.params.id, req.body);
    res.json({ message: 'Proveedor actualizado', provider });
  });

  delete = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    await this.providerService.delete(req.params.id);
    res.status(204).send();
  });
}
