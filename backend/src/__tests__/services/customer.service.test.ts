import { CustomerService } from '../../services/customer.service';
import { NotFoundError } from '../../utils/errors';

const mockPrisma = {
  customer: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as any;

describe('CustomerService', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    customerService = new CustomerService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getAll (with pagination)', () => {
    it('debería retornar resultados paginados', async () => {
      const mockCustomers = [
        { id: '1', name: 'Client A', status: 'PROSPECT' },
        { id: '2', name: 'Client B', status: 'NEGOTIATION' },
      ];
      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);
      mockPrisma.customer.count.mockResolvedValue(50);

      const result = await customerService.getAll({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.totalPages).toBe(25);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('getKanbanBoard', () => {
    it('debería agrupar clientes por estado en una sola query', async () => {
      const mockCustomers = [
        { id: '1', name: 'A', status: 'PROSPECT', sales: [] },
        { id: '2', name: 'B', status: 'NEGOTIATION', sales: [] },
        { id: '3', name: 'C', status: 'PROSPECT', sales: [] },
        { id: '4', name: 'D', status: 'CLOSED_WON', sales: [] },
      ];
      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);

      const board = await customerService.getKanbanBoard();

      expect(board['PROSPECT']).toHaveLength(2);
      expect(board['NEGOTIATION']).toHaveLength(1);
      expect(board['CLOSED_WON']).toHaveLength(1);
      expect(board['CLOSED_LOST']).toHaveLength(0);

      // Verify single query (N+1 fix)
      expect(mockPrisma.customer.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('debería lanzar NotFoundError si el cliente no existe', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(customerService.getById('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('debería retornar el cliente si existe', async () => {
      const mockCustomer = { id: '1', name: 'Test', status: 'PROSPECT', sales: [] };
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await customerService.getById('1');
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('updateStatus', () => {
    it('debería actualizar el estado del cliente', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ id: '1', name: 'Test' });
      mockPrisma.customer.update.mockResolvedValue({ id: '1', status: 'CLOSED_WON' });

      const result = await customerService.updateStatus('1', 'CLOSED_WON' as any);
      expect(result.status).toBe('CLOSED_WON');
    });
  });
});
