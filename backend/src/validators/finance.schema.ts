import { z } from 'zod';
import { TASK_PRIORITIES } from '../utils/constants';

// ---------- SALE INVOICE ----------
export const createSaleSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('ID de cliente inválido'),
    quantity: z.number().positive('La cantidad debe ser mayor a 0'),
    salePrice: z.number().positive('El precio de venta debe ser mayor a 0'),
    accountsInvolved: z.array(
      z.object({
        name: z.string().min(1, 'El nombre de la cuenta es requerido'),
        amount: z.number().optional(),
      })
    ).min(1, 'Debe incluir al menos una cuenta'),
    date: z.string().datetime().optional(),
  })
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>['body'];

// ---------- TASK (Weekly) ----------
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    dueDate: z.string().datetime('Fecha de vencimiento inválida'),
    priority: z.enum(TASK_PRIORITIES).optional(),
  })
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    isCompleted: z.boolean().optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
  })
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];

// ---------- FINANCE REPORT QUERY ----------
export const financeReportQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
});

// ---------- AI ANALYSIS ----------
export const aiAnalysisSchema = z.object({
  body: z.object({
    query: z
      .string()
      .max(500, 'La consulta no puede exceder 500 caracteres')
      .optional(),
  }),
});

export type AIAnalysisInput = z.infer<typeof aiAnalysisSchema>['body'];
