/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/lojasApi/lojas/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withMethodHandler, sendSuccess, sendError } from '@/lib/api-utils';
// lojaSchema import removed as it's not being used in this file

// Reutiliza a instância única do PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// Handler para GET - buscar todas as lojas
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // First, try to get lojas with all relations using the standard Prisma method
    let lojas;
    try {
      lojas = await prisma.loja.findMany({
        orderBy: {
          nome: 'asc'
        },
        include: {
          equipamentosLoja: {
            include: {
              atuadoresLoja: true,
              sensoresLoja: true,
            },
          },
          atuadores: true,
          sensores: true,
        }
      });
    } catch (prismaError) {
      // If there's an error with the standard method, try a more defensive approach
      console.warn('Standard Prisma query failed, trying defensive approach:', prismaError);

      // Use raw query to get basic loja data without potential problematic fields
      const lojasRaw: any[] = await prisma.$queryRaw`
        SELECT id, nome, LUC, localizacao, smart, idKron, imagem
        FROM lojas
        ORDER BY nome ASC
      `;

      // Process the results to match the expected structure
      lojas = await Promise.all(lojasRaw.map(async (lojaRaw: any) => {
        const equipamentosLoja = await prisma.equipamentoLoja.findMany({
          where: { lojaId: lojaRaw.id },
          include: {
            atuadoresLoja: true,
            sensoresLoja: true,
          }
        });

        const atuadores = await prisma.atuadorLoja.findMany({
          where: { lojaId: lojaRaw.id }
        });

        const sensores = await prisma.sensorLoja.findMany({
          where: { lojaId: lojaRaw.id }
        });

        return {
          ...lojaRaw,
          equipamentosLoja,
          atuadores,
          sensores
        };
      }));
    }

    sendSuccess(res, {
      total_items: lojas.length,
      page: 1,
      limit: lojas.length,
      lojas: lojas,
    });
  } catch (error: any) {
    console.error('Database error in Lojas API:', error);

    // Handle database connection errors specifically
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
      return sendError(res, {
        message: 'Database connection failed. Please check your database configuration.',
        statusCode: 503,
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    // Handle Prisma errors
    if (error.code) {
      return sendError(res, {
        message: `Database error: ${error.message}`,
        statusCode: 500,
        code: error.code,
        details: error.meta
      });
    }

    // Generic error
    return sendError(res, {
      message: 'Failed to fetch lojas data',
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
}

// Handler para POST - criar nova loja
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Simple validation - in a real app, you'd use the validation schema
    const { nome, LUC, localizacao, smart, idKron } = req.body;

    if (!nome || !LUC) {
      return sendError(res, {
        message: 'Nome and LUC are required',
        statusCode: 400,
        code: 'VALIDATION_ERROR'
      });
    }

    const novaLoja = await prisma.loja.create({
      data: {
        nome,
        LUC,
        localizacao: localizacao || null,
        smart: smart || null,
        idKron: idKron || null,
      },
    });

    sendSuccess(res, novaLoja, 201);
  } catch (error: any) {
    console.error('Error creating loja:', error);

    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
      return sendError(res, {
        message: 'Database connection failed. Please check your database configuration.',
        statusCode: 503,
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    // Handle unique constraint errors
    if (error.code === 'P2002') {
      return sendError(res, {
        message: 'A loja with this LUC already exists',
        statusCode: 409,
        code: 'DUPLICATE_ENTRY',
        details: error.meta
      });
    }

    // Generic error
    return sendError(res, {
      message: 'Failed to create loja',
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
}

export default withMethodHandler({
  GET: handleGet,
  POST: handlePost,
});