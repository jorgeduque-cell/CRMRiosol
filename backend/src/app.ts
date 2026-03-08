import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { env } from './config/env';
import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
} from './utils/constants';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(','),
  credentials: true,
}));

// Global Rate Limiting
app.use(
  '/api/',
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
    message: { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
  })
);

// Stricter Rate Limiting for Auth endpoints (prevent brute-force)
app.use(
  '/api/v1/auth',
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: AUTH_RATE_LIMIT_MAX_REQUESTS,
    message: { error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.' },
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check (no auth, no rate limit — used by Docker/load balancers)
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1', routes);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
