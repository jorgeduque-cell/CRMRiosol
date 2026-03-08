import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    email: z.string().email('Formato de correo inválido'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    role: z.enum(['ADMIN', 'USER']).optional(),
  })
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Formato de correo inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  })
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];
