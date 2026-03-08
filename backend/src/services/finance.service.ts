import { PrismaClient } from '@prisma/client';

export class FinanceService {
  constructor(private prisma: PrismaClient) {}

  async getFullReport(startDate?: string, endDate?: string) {
    const dateFilter = startDate && endDate
      ? {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
      : {};

    // Total purchases (costs)
    const purchases = await this.prisma.purchaseOrder.aggregate({
      where: dateFilter,
      _sum: { totalAmount: true },
      _count: true,
    });

    // Total sales (revenue)
    const sales = await this.prisma.saleInvoice.aggregate({
      where: dateFilter,
      _sum: { salePrice: true, utilityCalculated: true, quantity: true },
      _count: true,
    });

    // Per-customer breakdown
    const customerBreakdown = await this.prisma.saleInvoice.groupBy({
      by: ['customerId'],
      where: dateFilter,
      _sum: { salePrice: true, utilityCalculated: true },
      _count: true,
    });

    // FIX: _sum.salePrice IS the total revenue (sum of all sale prices).
    // Previously it was incorrectly multiplied by _sum.quantity.
    const totalRevenue = sales._sum.salePrice || 0;
    const totalCost = purchases._sum.totalAmount || 0;
    const netProfit = totalRevenue - totalCost;

    return {
      period: {
        start: startDate || 'All time',
        end: endDate || 'All time',
      },
      totalRevenue,
      totalCost,
      netProfit,
      profitMargin:
        totalRevenue > 0
          ? ((netProfit / totalRevenue) * 100).toFixed(2) + '%'
          : '0%',
      totalPurchaseOrders: purchases._count,
      totalSaleInvoices: sales._count,
      totalUtility: sales._sum.utilityCalculated || 0,
      totalQuantitySold: sales._sum.quantity || 0,
      customerBreakdown,
    };
  }
}
