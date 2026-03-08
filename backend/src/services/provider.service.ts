import { PrismaClient, OilType } from '@prisma/client';
import { CreateProviderInput, UpdateProviderInput } from '../validators/crm.schema';
import { NotFoundError } from '../utils/errors';
import { buildPagination, paginatedResponse } from '../utils/pagination';

export class ProviderService {
  constructor(private prisma: PrismaClient) {}

  async getAll(query?: { page?: number; limit?: number }) {
    const { skip, take, page, limit } = buildPagination(query || {});

    const [providers, total] = await Promise.all([
      this.prisma.provider.findMany({
        include: { purchases: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.provider.count(),
    ]);

    return paginatedResponse(providers, total, page, limit);
  }

  async getById(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: { purchases: true },
    });
    if (!provider) throw new NotFoundError('Proveedor');
    return provider;
  }

  async create(data: CreateProviderInput) {
    return this.prisma.provider.create({
      data: {
        name: data.name,
        contact: data.contact,
        oilType: data.oilType as OilType,
      },
    });
  }

  async update(id: string, data: UpdateProviderInput) {
    await this.getById(id);
    return this.prisma.provider.update({
      where: { id },
      data: {
        name: data.name,
        contact: data.contact,
        oilType: data.oilType as OilType | undefined,
      },
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.provider.delete({ where: { id } });
  }
}
