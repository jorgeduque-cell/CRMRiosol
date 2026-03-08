import { PrismaClient, Priority } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput } from '../validators/finance.schema';
import { NotFoundError } from '../utils/errors';
import { buildPagination, paginatedResponse } from '../utils/pagination';

export class TaskService {
  constructor(private prisma: PrismaClient) {}

  async getAll(userId: string, query?: { page?: number; limit?: number }) {
    const { skip, take, page, limit } = buildPagination(query || {});

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId },
        orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }],
        skip,
        take,
      }),
      this.prisma.task.count({ where: { userId } }),
    ]);

    return paginatedResponse(tasks, total, page, limit);
  }

  async getWeeklyTasks(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: [{ isCompleted: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async getById(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) throw new NotFoundError('Tarea');
    return task;
  }

  async create(data: CreateTaskInput, userId: string) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        priority: (data.priority as Priority) || 'MEDIUM',
        userId,
      },
    });
  }

  async update(id: string, userId: string, data: UpdateTaskInput) {
    await this.getById(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        isCompleted: data.isCompleted,
        priority: data.priority as Priority | undefined,
      },
    });
  }

  async toggleComplete(id: string, userId: string) {
    const task = await this.getById(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: { isCompleted: !task.isCompleted },
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return this.prisma.task.delete({ where: { id } });
  }
}
