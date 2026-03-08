import { PrismaClient } from '@prisma/client';
import { CreateSaleInput } from '../validators/finance.schema';
import { NotFoundError } from '../utils/errors';
import { buildPagination, paginatedResponse } from '../utils/pagination';

export class SaleService {
  constructor(private prisma: PrismaClient) {}

  async getAll(query?: { page?: number; limit?: number }) {
    const { skip, take, page, limit } = buildPagination(query || {});

    const [sales, total] = await Promise.all([
      this.prisma.saleInvoice.findMany({
        include: { customer: true },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      this.prisma.saleInvoice.count(),
    ]);

    return paginatedResponse(sales, total, page, limit);
  }

  async getById(id: string) {
    const sale = await this.prisma.saleInvoice.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!sale) throw new NotFoundError('Factura de venta');
    return sale;
  }

  async create(data: CreateSaleInput) {
    // Issue #9 FIX: Calculate utility based on per-provider average cost
    // instead of a global average across all providers
    const customer = await this.prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) throw new NotFoundError('Cliente');

    // Get the most recent purchase to identify the relevant provider
    const recentPurchase = await this.prisma.purchaseOrder.findFirst({
      orderBy: { date: 'desc' },
    });

    let costBasis = 0;
    if (recentPurchase) {
      // Use the average unit price from that provider
      const providerAvg = await this.prisma.purchaseOrder.aggregate({
        where: { providerId: recentPurchase.providerId },
        _avg: { unitPrice: true },
      });
      costBasis = providerAvg._avg.unitPrice || 0;
    }

    const utilityCalculated = (data.salePrice - costBasis) * data.quantity;

    return this.prisma.saleInvoice.create({
      data: {
        customerId: data.customerId,
        quantity: data.quantity,
        salePrice: data.salePrice,
        utilityCalculated,
        accountsInvolved: data.accountsInvolved,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: { customer: true },
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.saleInvoice.delete({ where: { id } });
  }

  async getSalesSummary() {
    const totals = await this.prisma.saleInvoice.aggregate({
      _sum: { salePrice: true, utilityCalculated: true, quantity: true },
      _count: true,
    });
    return {
      totalRevenue: totals._sum.salePrice || 0,
      totalUtility: totals._sum.utilityCalculated || 0,
      totalQuantitySold: totals._sum.quantity || 0,
      totalInvoices: totals._count,
    };
  }
}
