import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.warn('PrismaClient init warning:', error);
  prisma = new PrismaClient();
}

export { prisma };
