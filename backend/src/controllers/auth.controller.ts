import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginUserInput } from '../validators/user.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = asyncHandler(async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
  ) => {
    const result = await this.authService.login(req.body as LoginUserInput);
    res.status(200).json(result);
  });
}
