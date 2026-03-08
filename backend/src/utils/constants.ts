/**
 * Centralized constants — eliminates magic numbers and strings.
 */

// Authentication
export const SALT_ROUNDS = 10;
export const TOKEN_EXPIRY = '24h';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 10; // Stricter for auth endpoints

// Customer Statuses (Kanban board columns)
export const CUSTOMER_STATUSES = [
  'PROSPECT',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
] as const;

// Task Priorities
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

// User Roles
export const USER_ROLES = ['ADMIN', 'USER'] as const;

// Oil Types
export const OIL_TYPES = ['SOY', 'PALM'] as const;
