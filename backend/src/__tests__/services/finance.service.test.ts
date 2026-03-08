import { FinanceService } from '../../services/finance.service';

const mockPrisma = {
  purchaseOrder: {
    aggregate: jest.fn(),
  },
  saleInvoice: {
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
} as any;

describe('FinanceService', () => {
  let financeService: FinanceService;

  beforeEach(() => {
    financeService = new FinanceService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getFullReport', () => {
    it('debería calcular totalRevenue correctamente usando _sum.salePrice', async () => {
      mockPrisma.purchaseOrder.aggregate.mockResolvedValue({
        _sum: { totalAmount: 5000 },
        _count: 10,
      });
      mockPrisma.saleInvoice.aggregate.mockResolvedValue({
        _sum: { salePrice: 8000, utilityCalculated: 3000, quantity: 100 },
        _count: 20,
      });
      mockPrisma.saleInvoice.groupBy.mockResolvedValue([]);

      const report = await financeService.getFullReport();

      // THE FIX: totalRevenue should be 8000, NOT 8000 * 100 = 800000
      expect(report.totalRevenue).toBe(8000);
      expect(report.totalCost).toBe(5000);
      expect(report.netProfit).toBe(3000);
      expect(report.profitMargin).toBe('37.50%');
    });

    it('debería manejar el caso sin datos (todo cero)', async () => {
      mockPrisma.purchaseOrder.aggregate.mockResolvedValue({
        _sum: { totalAmount: null },
        _count: 0,
      });
      mockPrisma.saleInvoice.aggregate.mockResolvedValue({
        _sum: { salePrice: null, utilityCalculated: null, quantity: null },
        _count: 0,
      });
      mockPrisma.saleInvoice.groupBy.mockResolvedValue([]);

      const report = await financeService.getFullReport();

      expect(report.totalRevenue).toBe(0);
      expect(report.totalCost).toBe(0);
      expect(report.netProfit).toBe(0);
      expect(report.profitMargin).toBe('0%');
    });

    it('debería filtrar por rango de fechas cuando se proporcionan', async () => {
      mockPrisma.purchaseOrder.aggregate.mockResolvedValue({
        _sum: { totalAmount: 1000 },
        _count: 5,
      });
      mockPrisma.saleInvoice.aggregate.mockResolvedValue({
        _sum: { salePrice: 2000, utilityCalculated: 1000, quantity: 50 },
        _count: 10,
      });
      mockPrisma.saleInvoice.groupBy.mockResolvedValue([]);

      const report = await financeService.getFullReport('2026-01-01T00:00:00.000Z', '2026-03-01T00:00:00.000Z');

      expect(report.period.start).toBe('2026-01-01T00:00:00.000Z');
      expect(report.period.end).toBe('2026-03-01T00:00:00.000Z');

      // Verify date filters were passed to Prisma
      expect(mockPrisma.purchaseOrder.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('debería calcular margen negativo correctamente', async () => {
      mockPrisma.purchaseOrder.aggregate.mockResolvedValue({
        _sum: { totalAmount: 10000 },
        _count: 5,
      });
      mockPrisma.saleInvoice.aggregate.mockResolvedValue({
        _sum: { salePrice: 7000, utilityCalculated: -3000, quantity: 50 },
        _count: 10,
      });
      mockPrisma.saleInvoice.groupBy.mockResolvedValue([]);

      const report = await financeService.getFullReport();

      expect(report.netProfit).toBe(-3000);
      expect(report.profitMargin).toBe('-42.86%');
    });
  });
});
