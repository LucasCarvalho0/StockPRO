import { PrismaClient } from '../../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient;
  pgPool: Pool;
};

let prismaInstance: PrismaClient;

if (typeof window === 'undefined') {
  const connectionString = process.env.DATABASE_URL;
  
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({ connectionString });
  }
  
  const adapter = new PrismaPg(globalForPrisma.pgPool);
  
  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
} else {
  prismaInstance = new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
