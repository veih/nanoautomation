/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/lojasApi/lojas/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withMethodHandler, sendSuccess, validateData } from '@/lib/api-utils';
import { lojaSchema } from '@/lib/validations';

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

// Handler para GET - buscar loja por ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    throw new Error('ID da loja inválido.');
  }

  const loja = await prisma.loja.findUnique({
    where: { id },
    include: {
      equipamentosLoja: {
        include: {
          atuadoresLoja: true,
          sensoresLoja: true,
        },
      },
      atuadores: true,
      sensores: true,
      fireDetectionEquipment: true,
    },
  });

  if (!loja) {
    throw new Error('Loja não encontrada.');
  }

  sendSuccess(res, loja);
}

// Handler para PUT - atualizar loja
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    throw new Error('ID da loja inválido.');
  }

  const validation = validateData(lojaSchema, req.body);

  if (!validation.success) {
    throw new Error(validation.errors.join(', '));
  }

  const { nome, LUC, localizacao, smart, idKron } = validation.data;

  try {
    const updatedLoja = await prisma.loja.update({
      where: { id },
      data: {
        nome,
        LUC,
        localizacao,
        smart,
        idKron,
      },
    });

    sendSuccess(res, updatedLoja);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('LUC')) {
      // Check if the LUC conflict is with a different loja (not the current one)
      const existingLoja = await prisma.loja.findFirst({
        where: {
          LUC,
          NOT: { id } // Exclude the current loja from the check
        }
      });

      if (existingLoja) {
        throw new Error('LUC já existe em outra loja. Por favor, use um LUC único.');
      }
      // If no conflict with other lojas, re-throw the original error
    }
    throw error;
  }
}

// Handler para DELETE - deletar loja
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    throw new Error('ID da loja inválido.');
  }

  try {
    // Check if the loja exists
    const loja = await prisma.loja.findUnique({
      where: { id },
    });

    if (!loja) {
      throw new Error('Loja não encontrada.');
    }

    // Delete the loja - cascade will handle dependencies automatically
    await prisma.loja.delete({
      where: { id },
    });

    sendSuccess(res, { message: 'Loja e todos os itens dependentes foram removidos com sucesso.' }, 200);
  } catch (error: any) {
    // Handle foreign key constraint violations (should not happen with cascade)
    if (error.code === 'P2003') {
      throw new Error(
        'Erro inesperado de dependência. Verifique se todas as relações estão configuradas corretamente.'
      );
    }

    // Re-throw other errors
    throw error;
  }
}

export default withMethodHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
});