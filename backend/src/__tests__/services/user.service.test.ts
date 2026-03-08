import bcrypt from 'bcrypt';
import { UserService } from '../../services/user.service';
import { NotFoundError, ConflictError } from '../../utils/errors';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as any;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const registerData = {
      email: 'nuevo@test.com',
      name: 'Nuevo Usuario',
      password: 'securepassword123',
    };

    it('debería crear un usuario exitosamente', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-new',
        email: 'nuevo@test.com',
        name: 'Nuevo Usuario',
        role: 'USER',
        createdAt: new Date(),
      });

      const result = await userService.createUser(registerData);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('nuevo@test.com');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);

      // Verify password was hashed (not stored as plaintext)
      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe('securepassword123');
    });

    it('debería lanzar ConflictError si el email ya existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(userService.createUser(registerData)).rejects.toThrow(ConflictError);
      await expect(userService.createUser(registerData)).rejects.toThrow('El usuario ya existe');
    });
  });

  describe('getUserById', () => {
    it('debería retornar el usuario si existe', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com', name: 'Test', role: 'ADMIN', createdAt: new Date() };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-1');
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar NotFoundError si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getUserById('nonexistent')).rejects.toThrow(NotFoundError);
      await expect(userService.getUserById('nonexistent')).rejects.toThrow('Usuario no encontrado');
    });
  });
});
