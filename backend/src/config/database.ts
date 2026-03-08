import { PrismaClient } from '@prisma/client';
import { env } from './env';

const isDevMode = env.NODE_ENV === 'development';

export const prisma = new PrismaClient({
  log: isDevMode ? ['query', 'warn', 'error'] : ['error'],
});

// Graceful shutdown — disconnect Prisma when the process exits
const gracefulShutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
