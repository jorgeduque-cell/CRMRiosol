import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Structured error logging
  logger.error(err.message, err);

  // 1. Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // 2. Our custom AppError (operational — safe to expose message)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // 3. Prisma known request errors (unique constraint, not found, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'El registro ya existe (conflicto de unicidad)',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro no encontrado',
      });
    }
  }

  // 4. JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token inválido o expirado',
    });
  }

  // 5. Unknown/unhandled errors — NEVER expose internal details
  const message = env.NODE_ENV === 'development'
    ? err.message
    : 'Error interno del servidor';

  res.status(500).json({
    error: message,
  });
};
