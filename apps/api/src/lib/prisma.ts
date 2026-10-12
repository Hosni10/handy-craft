import { PrismaClient } from '@prisma/client';

// Singleton Prisma client — avoids creating multiple connections during hot-reload in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const devLogLevels =
  process.env.PRISMA_LOG_QUERIES === '1' ? (['query', 'warn', 'error'] as const) : (['warn', 'error'] as const);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? [...devLogLevels] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
