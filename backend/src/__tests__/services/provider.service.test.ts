import { ProviderService } from '../../services/provider.service';
import { NotFoundError } from '../../utils/errors';

const mockPrisma = {
  provider: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as any;

describe('ProviderService', () => {
  let providerService: ProviderService;

  beforeEach(() => {
    providerService = new ProviderService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getAll (with pagination)', () => {
    it('debería retornar resultados paginados con total correcto', async () => {
      mockPrisma.provider.findMany.mockResolvedValue([{ id: '1', name: 'Proveedor A' }]);
      mockPrisma.provider.count.mockResolvedValue(1);

      const result = await providerService.getAll({ page: 1, limit: 10 });

      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('getById', () => {
    it('debería lanzar NotFoundError si el proveedor no existe', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      await expect(providerService.getById('invalid')).rejects.toThrow(NotFoundError);
      await expect(providerService.getById('invalid')).rejects.toThrow('Proveedor no encontrado');
    });
  });

  describe('create', () => {
    it('debería crear un proveedor con tipo de aceite', async () => {
      const data = { name: 'Aceites S.A.', contact: '555-1234', oilType: 'SOY' as const };
      mockPrisma.provider.create.mockResolvedValue({ id: '1', ...data });

      const result = await providerService.create(data);
      expect(result.oilType).toBe('SOY');
      expect(mockPrisma.provider.create).toHaveBeenCalledWith({
        data: { name: 'Aceites S.A.', contact: '555-1234', oilType: 'SOY' },
      });
    });
  });

  describe('delete', () => {
    it('debería verificar existencia antes de eliminar', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      await expect(providerService.delete('invalid')).rejects.toThrow(NotFoundError);
      expect(mockPrisma.provider.delete).not.toHaveBeenCalled();
    });
  });
});
