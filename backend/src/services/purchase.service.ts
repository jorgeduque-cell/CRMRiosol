import { PrismaClient } from '@prisma/client';
import { CreatePurchaseInput } from '../validators/crm.schema';
import { NotFoundError } from '../utils/errors';
import { buildPagination, paginatedResponse } from '../utils/pagination';

export class PurchaseService {
  constructor(private prisma: PrismaClient) {}

  async getAll(query?: { page?: number; limit?: number }) {
    const { skip, take, page, limit } = buildPagination(query || {});

    const [purchases, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        include: { provider: true },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      this.prisma.purchaseOrder.count(),
    ]);

    return paginatedResponse(purchases, total, page, limit);
  }

  async getById(id: string) {
    const purchase = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { provider: true },
    });
    if (!purchase) throw new NotFoundError('Orden de compra');
    return purchase;
  }

  async create(data: CreatePurchaseInput) {
    const totalAmount = data.quantity * data.unitPrice;
    return this.prisma.purchaseOrder.create({
      data: {
        providerId: data.providerId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalAmount,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: { provider: true },
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }

  async getTotalsByProvider() {
    return this.prisma.purchaseOrder.groupBy({
      by: ['providerId'],
      _sum: { totalAmount: true, quantity: true },
      _count: true,
    });
  }
}
