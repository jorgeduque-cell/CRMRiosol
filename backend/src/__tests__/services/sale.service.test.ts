import { SaleService } from '../../services/sale.service';
import { NotFoundError } from '../../utils/errors';

const mockPrisma = {
  saleInvoice: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  customer: {
    findUnique: jest.fn(),
  },
  purchaseOrder: {
    findFirst: jest.fn(),
    aggregate: jest.fn(),
  },
} as any;

describe('SaleService', () => {
  let saleService: SaleService;

  beforeEach(() => {
    saleService = new SaleService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debería retornar ventas paginadas', async () => {
      const mockSales = [{ id: 'sale-1', salePrice: 100 }];
      mockPrisma.saleInvoice.findMany.mockResolvedValue(mockSales);
      mockPrisma.saleInvoice.count.mockResolvedValue(1);

      const result = await saleService.getAll();

      expect(result.data).toEqual(mockSales);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('debería retornar la venta si existe', async () => {
      const mockSale = { id: 'sale-1', salePrice: 50 };
      mockPrisma.saleInvoice.findUnique.mockResolvedValue(mockSale);

      const result = await saleService.getById('sale-1');
      expect(result).toEqual(mockSale);
    });

    it('debería lanzar NotFoundError si no existe', async () => {
      mockPrisma.saleInvoice.findUnique.mockResolvedValue(null);

      await expect(saleService.getById('bad-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    const saleData = {
      customerId: 'cust-1',
      quantity: 10,
      salePrice: 50,
      accountsInvolved: [{ name: 'Cuenta A' }],
    };

    it('debería calcular utilidad con costo del proveedor más reciente', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 'cust-1' });
      mockPrisma.purchaseOrder.findFirst.mockResolvedValue({
        providerId: 'prov-1',
      });
      mockPrisma.purchaseOrder.aggregate.mockResolvedValue({
        _avg: { unitPrice: 30 },
      });
      const expectedUtility = (50 - 30) * 10; // 200
      mockPrisma.saleInvoice.create.mockResolvedValue({
        ...saleData,
        utilityCalculated: expectedUtility,
      });

      const result = await saleService.create(saleData);

      expect(mockPrisma.purchaseOrder.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { providerId: 'prov-1' } })
      );
      expect(result.utilityCalculated).toBe(200);
    });

    it('debería usar costBasis 0 si no hay compras previas', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 'cust-1' });
      mockPrisma.purchaseOrder.findFirst.mockResolvedValue(null);
      mockPrisma.saleInvoice.create.mockResolvedValue({
        ...saleData,
        utilityCalculated: 500,
      });

      await saleService.create(saleData);

      expect(mockPrisma.purchaseOrder.aggregate).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundError si el cliente no existe', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(saleService.create(saleData)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getSalesSummary', () => {
    it('debería retornar totales agregados', async () => {
      mockPrisma.saleInvoice.aggregate.mockResolvedValue({
        _sum: { salePrice: 1000, utilityCalculated: 300, quantity: 50 },
        _count: 5,
      });

      const summary = await saleService.getSalesSummary();

      expect(summary.totalRevenue).toBe(1000);
      expect(summary.totalUtility).toBe(300);
      expect(summary.totalQuantitySold).toBe(50);
      expect(summary.totalInvoices).toBe(5);
    });

    it('debería manejar valores nulos con defaults a 0', async () => {
      mockPrisma.saleInvoice.aggregate.mockResolvedValue({
        _sum: { salePrice: null, utilityCalculated: null, quantity: null },
        _count: 0,
      });

      const summary = await saleService.getSalesSummary();

      expect(summary.totalRevenue).toBe(0);
      expect(summary.totalUtility).toBe(0);
      expect(summary.totalQuantitySold).toBe(0);
    });
  });
});
