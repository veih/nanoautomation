// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Extend the global object to include the PrismaClient instance
// This is necessary for TypeScript to know that `global.prisma` exists
// and is of type PrismaClient, avoiding the "implicitly has type 'any'" error.
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient; // Declare the 'prisma' variable with the PrismaClient type

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use the global instance to avoid multiple connections
  // during Next.js hot-reloading.
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;