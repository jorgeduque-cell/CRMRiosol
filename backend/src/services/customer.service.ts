import { PrismaClient, CustomerStatus } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput } from '../validators/crm.schema';
import { NotFoundError } from '../utils/errors';
import { CUSTOMER_STATUSES } from '../utils/constants';
import { buildPagination, paginatedResponse, PaginatedResult } from '../utils/pagination';

export class CustomerService {
  constructor(private prisma: PrismaClient) {}

  async getAll(query?: { page?: number; limit?: number }) {
    const { skip, take, page, limit } = buildPagination(query || {});

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        include: { sales: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.customer.count(),
    ]);

    return paginatedResponse(customers, total, page, limit);
  }

  async getByStatus(status: CustomerStatus) {
    return this.prisma.customer.findMany({
      where: { status },
      include: { sales: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getKanbanBoard() {
    // Single query — eliminates N+1 (was 4 separate queries before)
    const customers = await this.prisma.customer.findMany({
      include: { sales: true },
      orderBy: { updatedAt: 'desc' },
    });

    const board: Record<string, typeof customers> = {};
    for (const status of CUSTOMER_STATUSES) {
      board[status] = customers.filter(c => c.status === status);
    }

    return board;
  }

  async getById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { sales: true },
    });
    if (!customer) throw new NotFoundError('Cliente');
    return customer;
  }

  async create(data: CreateCustomerInput) {
    return this.prisma.customer.create({
      data: {
        name: data.name,
        contact: data.contact,
        status: data.status as CustomerStatus | undefined,
        creditHistory: data.creditHistory,
      },
    });
  }

  async update(id: string, data: UpdateCustomerInput) {
    await this.getById(id);
    return this.prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        contact: data.contact,
        status: data.status as CustomerStatus | undefined,
        creditHistory: data.creditHistory,
      },
    });
  }

  async updateStatus(id: string, status: CustomerStatus) {
    await this.getById(id);
    return this.prisma.customer.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
