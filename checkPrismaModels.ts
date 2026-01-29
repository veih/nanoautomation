import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List all available models
console.log('Available Prisma models:');
console.log(Object.keys(prisma));

process.exit(0);