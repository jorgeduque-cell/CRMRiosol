import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskInput, UpdateTaskInput } from '../validators/finance.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { UnauthorizedError } from '../utils/errors';

export class TaskController {
  constructor(private taskService: TaskService) {}

  private getUserId(req: AuthRequest): string {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError();
    return userId;
  }

  getAll = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = this.getUserId(req);
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await this.taskService.getAll(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  });

  getWeekly = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = this.getUserId(req);
    const tasks = await this.taskService.getWeeklyTasks(userId);
    res.json(tasks);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = this.getUserId(req);
    const task = await this.taskService.getById(req.params.id, userId);
    res.json(task);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = this.getUserId(req);
    const task = await this.taskService.create(req.body as CreateTaskInput, userId);
    res.status(201).json({ message: 'Tarea creada exitosamente', task });
  });

  update = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = this.getUserId(req);
    const task = await this.taskService.update(req.params.id, userId, req.body as UpdateTaskInput);
    res.json({ message: 'Tarea actualizada', task });
  });

  toggleComplete = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = this.getUserId(req);
    const task = await this.taskService.toggleComplete(req.params.id, userId);
    res.json({ message: task.isCompleted ? 'Tarea completada' : 'Tarea reabierta', task });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = this.getUserId(req);
    await this.taskService.delete(req.params.id, userId);
    res.status(204).send();
  });
}
