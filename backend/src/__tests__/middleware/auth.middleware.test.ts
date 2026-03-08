import { authenticate, requireRole, AuthRequest } from '../../middleware/auth.middleware';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import jwt from 'jsonwebtoken';

// Mock env config
jest.mock('../../config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-must-be-at-least-32-chars-long',
    NODE_ENV: 'test',
  },
}));

const TEST_SECRET = 'test-secret-key-must-be-at-least-32-chars-long';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('debería pasar con un token JWT válido', () => {
      const token = jwt.sign({ userId: 'user-1', role: 'ADMIN' }, TEST_SECRET);
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toEqual(
        expect.objectContaining({ userId: 'user-1', role: 'ADMIN' })
      );
    });

    it('debería rechazar si falta el header Authorization', () => {
      mockReq.headers = {};

      authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('debería rechazar si el header no empieza con Bearer', () => {
      mockReq.headers = { authorization: 'Basic abc123' };

      authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('debería rechazar un token expirado', () => {
      const token = jwt.sign({ userId: 'user-1', role: 'USER' }, TEST_SECRET, {
        expiresIn: '-1s',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('debería rechazar un token con firma inválida', () => {
      const token = jwt.sign({ userId: 'user-1' }, 'wrong-secret-that-is-definitely-not-right');
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('requireRole', () => {
    it('debería pasar si el usuario tiene el rol requerido', () => {
      mockReq.user = { userId: 'user-1', role: 'ADMIN' };
      const middleware = requireRole('ADMIN');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('debería pasar si el usuario tiene uno de los roles permitidos', () => {
      mockReq.user = { userId: 'user-1', role: 'USER' };
      const middleware = requireRole('ADMIN', 'USER');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('debería rechazar si el usuario no tiene el rol', () => {
      mockReq.user = { userId: 'user-1', role: 'USER' };
      const middleware = requireRole('ADMIN');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('debería rechazar si no hay usuario autenticado', () => {
      const middleware = requireRole('ADMIN');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});
