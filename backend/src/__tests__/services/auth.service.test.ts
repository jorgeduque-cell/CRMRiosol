import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../services/auth.service';
import { UnauthorizedError } from '../../utils/errors';

// Mock dependencies
jest.mock('../../config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-must-be-at-least-32-chars-long',
    NODE_ENV: 'test',
  },
}));

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
} as any;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginData = { email: 'test@test.com', password: 'password123' };

    it('debería retornar token y usuario para credenciales válidas', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'ADMIN',
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('token');
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'ADMIN',
      });
      expect(result.user).not.toHaveProperty('password');

      // Verify JWT token is valid
      const decoded = jwt.verify(result.token, 'test-secret-key-must-be-at-least-32-chars-long') as any;
      expect(decoded.userId).toBe('user-1');
      expect(decoded.role).toBe('ADMIN');
    });

    it('debería lanzar UnauthorizedError si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginData)).rejects.toThrow('Credenciales inválidas');
    });

    it('debería lanzar UnauthorizedError si la contraseña es incorrecta', async () => {
      const hashedPassword = await bcrypt.hash('different-password', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: hashedPassword,
      });

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('no debería exponer la contraseña en la respuesta', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        password: hashedPassword,
        role: 'USER',
      });

      const result = await authService.login(loginData);
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
