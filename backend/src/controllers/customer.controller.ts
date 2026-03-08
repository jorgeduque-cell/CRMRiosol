import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerInput, UpdateCustomerInput } from '../validators/crm.schema';
import { asyncHandler } from '../utils/asyncHandler';

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  getAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await this.customerService.getAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  });

  getKanban = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const board = await this.customerService.getKanbanBoard();
    res.json(board);
  });

  getById = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    const customer = await this.customerService.getById(req.params.id);
    res.json(customer);
  });

  create = asyncHandler(async (req: Request<{}, {}, CreateCustomerInput>, res: Response, _next: NextFunction) => {
    const customer = await this.customerService.create(req.body);
    res.status(201).json({ message: 'Cliente creado exitosamente', customer });
  });

  update = asyncHandler(async (req: Request<{ id: string }, {}, UpdateCustomerInput>, res: Response, _next: NextFunction) => {
    const customer = await this.customerService.update(req.params.id, req.body);
    res.json({ message: 'Cliente actualizado', customer });
  });

  updateStatus = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    const { status } = req.body;
    const customer = await this.customerService.updateStatus(req.params.id, status);
    res.json({ message: 'Estado del cliente actualizado', customer });
  });

  delete = asyncHandler(async (req: Request<{ id: string }>, res: Response, _next: NextFunction) => {
    await this.customerService.delete(req.params.id);
    res.status(204).send();
  });
}
