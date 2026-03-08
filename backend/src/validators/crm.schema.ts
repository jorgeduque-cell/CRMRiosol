import { z } from 'zod';
import { CUSTOMER_STATUSES, OIL_TYPES } from '../utils/constants';

// ---------- PROVIDER ----------
export const createProviderSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    contact: z.string().min(5, 'El contacto debe tener al menos 5 caracteres'),
    oilType: z.enum(OIL_TYPES, {
      errorMap: () => ({ message: 'Tipo de aceite debe ser SOY o PALM' }),
    }),
  }),
});

export const updateProviderSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    contact: z.string().min(5).optional(),
    oilType: z.enum(OIL_TYPES).optional(),
  }),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>['body'];
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>['body'];

// ---------- CUSTOMER ----------
export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    contact: z.string().min(5, 'El contacto debe tener al menos 5 caracteres'),
    status: z.enum(CUSTOMER_STATUSES).optional(),
    creditHistory: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    contact: z.string().min(5).optional(),
    status: z.enum(CUSTOMER_STATUSES).optional(),
    creditHistory: z.string().optional(),
  }),
});

export const updateCustomerStatusSchema = z.object({
  body: z.object({
    status: z.enum(CUSTOMER_STATUSES, {
      errorMap: () => ({
        message: 'Estado inválido. Debe ser: PROSPECT, NEGOTIATION, CLOSED_WON o CLOSED_LOST',
      }),
    }),
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>['body'];
export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>['body'];

// ---------- PURCHASE ORDER ----------
export const createPurchaseSchema = z.object({
  body: z.object({
    providerId: z.string().uuid('ID de proveedor inválido'),
    quantity: z.number().positive('La cantidad debe ser mayor a 0'),
    unitPrice: z.number().positive('El precio unitario debe ser mayor a 0'),
    date: z.string().datetime().optional(),
  }),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>['body'];
