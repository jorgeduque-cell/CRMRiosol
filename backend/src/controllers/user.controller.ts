import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { RegisterUserInput } from '../validators/user.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { UnauthorizedError } from '../utils/errors';

export class UserController {
  constructor(private userService: UserService) {}

  register = asyncHandler(async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ) => {
    const user = await this.userService.createUser(req.body as RegisterUserInput);
    res.status(201).json({ message: 'Usuario creado exitosamente', user });
  });

  getProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ) => {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError();

    const user = await this.userService.getUserById(userId);
    res.json(user);
  });
}
