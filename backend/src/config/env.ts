import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env before validation
dotenv.config();

/**
 * Validated environment configuration.
 * The app will crash at startup with a descriptive error
 * if any required variable is missing or invalid.
 */
const envSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL es requerida'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY es requerida'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Error de configuración de entorno:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
