import { TaskService } from '../../services/task.service';
import { NotFoundError } from '../../utils/errors';

const mockPrisma = {
  task: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as any;

describe('TaskService', () => {
  let taskService: TaskService;
  const userId = 'user-123';
  const otherUserId = 'user-456';

  beforeEach(() => {
    taskService = new TaskService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debería filtrar tareas por userId', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);

      await taskService.getAll(userId);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId } })
      );
      expect(mockPrisma.task.count).toHaveBeenCalledWith({ where: { userId } });
    });
  });

  describe('getWeeklyTasks', () => {
    it('debería filtrar por userId y rango de la semana', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await taskService.getWeeklyTasks(userId);

      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.userId).toBe(userId);
      expect(callArgs.where.dueDate).toHaveProperty('gte');
      expect(callArgs.where.dueDate).toHaveProperty('lte');
    });
  });

  describe('getById (IDOR Protection)', () => {
    it('debería retornar la tarea si pertenece al usuario', async () => {
      const mockTask = { id: 'task-1', title: 'Test', userId };
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      const result = await taskService.getById('task-1', userId);

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: 'task-1', userId },
      });
    });

    it('debería lanzar NotFoundError si la tarea no pertenece al usuario (IDOR)', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(taskService.getById('task-1', otherUserId))
        .rejects.toThrow(NotFoundError);
    });

    it('debería lanzar NotFoundError si la tarea no existe', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(taskService.getById('nonexistent', userId))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debería crear la tarea con el userId del creador', async () => {
      const taskData = {
        title: 'Nueva tarea',
        description: 'Descripción',
        dueDate: '2026-03-10T00:00:00.000Z',
        priority: 'HIGH' as const,
      };
      mockPrisma.task.create.mockResolvedValue({ id: 'task-new', ...taskData, userId });

      await taskService.create(taskData, userId);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId }),
      });
    });

    it('debería usar MEDIUM como prioridad por defecto', async () => {
      const taskData = {
        title: 'Sin prioridad',
        dueDate: '2026-03-10T00:00:00.000Z',
      };
      mockPrisma.task.create.mockResolvedValue({ id: 'task-new', ...taskData, priority: 'MEDIUM' });

      await taskService.create(taskData, userId);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ priority: 'MEDIUM' }),
      });
    });
  });

  describe('toggleComplete', () => {
    it('debería alternar isCompleted de false a true', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({ id: 'task-1', isCompleted: false, userId });
      mockPrisma.task.update.mockResolvedValue({ id: 'task-1', isCompleted: true });

      const result = await taskService.toggleComplete('task-1', userId);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { isCompleted: true },
      });
    });

    it('debería alternar isCompleted de true a false', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({ id: 'task-1', isCompleted: true, userId });
      mockPrisma.task.update.mockResolvedValue({ id: 'task-1', isCompleted: false });

      await taskService.toggleComplete('task-1', userId);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { isCompleted: false },
      });
    });
  });

  describe('delete', () => {
    it('debería borrar solo si la tarea pertenece al usuario', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({ id: 'task-1', userId });
      mockPrisma.task.delete.mockResolvedValue({ id: 'task-1' });

      await taskService.delete('task-1', userId);

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });

    it('debería rechazar borrado si no pertenece al usuario', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(taskService.delete('task-1', otherUserId))
        .rejects.toThrow(NotFoundError);
    });
  });
});
