import { PurchaseService } from '../../services/purchase.service';
import { NotFoundError } from '../../utils/errors';

const mockPrisma = {
  purchaseOrder: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
} as any;

describe('PurchaseService', () => {
  let purchaseService: PurchaseService;

  beforeEach(() => {
    purchaseService = new PurchaseService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería calcular totalAmount = quantity * unitPrice', async () => {
      const data = { providerId: 'provider-1', quantity: 100, unitPrice: 25 };
      mockPrisma.purchaseOrder.create.mockResolvedValue({
        id: '1', ...data, totalAmount: 2500,
      });

      await purchaseService.create(data);

      expect(mockPrisma.purchaseOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 2500, // 100 * 25
          }),
        })
      );
    });

    it('debería manejar decimales en precio unitario', async () => {
      const data = { providerId: 'provider-1', quantity: 50, unitPrice: 33.99 };
      mockPrisma.purchaseOrder.create.mockResolvedValue({
        id: '1', totalAmount: 1699.5,
      });

      await purchaseService.create(data);

      const callData = mockPrisma.purchaseOrder.create.mock.calls[0][0].data;
      expect(callData.totalAmount).toBeCloseTo(1699.5);
    });
  });

  describe('getById', () => {
    it('debería lanzar NotFoundError si la orden no existe', async () => {
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue(null);
      await expect(purchaseService.getById('invalid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAll (with pagination)', () => {
    it('debería retornar resultados paginados', async () => {
      mockPrisma.purchaseOrder.findMany.mockResolvedValue([]);
      mockPrisma.purchaseOrder.count.mockResolvedValue(0);

      const result = await purchaseService.getAll({ page: 1, limit: 10 });
      expect(result.pagination.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });
});
