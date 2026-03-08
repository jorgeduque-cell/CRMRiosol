import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { RegisterUserInput } from '../validators/user.schema';
import { NotFoundError, ConflictError } from '../utils/errors';
import { SALT_ROUNDS } from '../utils/constants';

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async createUser(data: RegisterUserInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role || 'USER',
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) throw new NotFoundError('Usuario');
    return user;
  }
}
