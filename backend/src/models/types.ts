/**
 * Shared type definitions for the backend.
 */
import { Request } from 'express';

/**
 * Authenticated request with verified user payload from JWT.
 * Re-exported from auth.middleware for convenience.
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Standard paginated query params from URL.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}
