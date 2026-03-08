import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from '../../utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('debería crear un error con statusCode y isOperational por defecto', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('debería aceptar statusCode personalizado', () => {
      const error = new AppError('Server error', 500, false);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('NotFoundError', () => {
    it('debería tener statusCode 404 y mensaje con recurso', () => {
      const error = new NotFoundError('Usuario');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Usuario no encontrado');
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('UnauthorizedError', () => {
    it('debería tener statusCode 401', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('No autorizado');
    });
  });

  describe('ForbiddenError', () => {
    it('debería tener statusCode 403', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ConflictError', () => {
    it('debería tener statusCode 409', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
    });
  });
});
