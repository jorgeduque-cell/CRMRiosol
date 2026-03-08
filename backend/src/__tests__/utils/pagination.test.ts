import { buildPagination, paginatedResponse } from '../../utils/pagination';

describe('Pagination Utils', () => {
  describe('buildPagination', () => {
    it('debería usar defaults cuando no se proporcionan parámetros', () => {
      const result = buildPagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
    });

    it('debería calcular skip correctamente para página 3', () => {
      const result = buildPagination({ page: 3, limit: 10 });
      expect(result.skip).toBe(20); // (3 - 1) * 10
      expect(result.take).toBe(10);
    });
  });

  describe('paginatedResponse', () => {
    it('debería calcular totalPages correctamente', () => {
      const result = paginatedResponse(['a', 'b'], 50, 1, 20);
      expect(result.pagination.totalPages).toBe(3); // ceil(50/20)
    });

    it('debería manejar 0 total correctamente', () => {
      const result = paginatedResponse([], 0, 1, 20);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });
});
