/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/colaboradores/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { withMethodHandler, sendSuccess, validateData } from '@/lib/api-utils';
import { colaboradorSchema } from '@/lib/validations';

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

// Handler para GET - buscar colaborador por ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const colaborador = await prisma.colaborador.findUnique({
    where: { id: String(id) },
  });

  if (!colaborador) {
    throw new Error('Colaborador não encontrado');
  }

  sendSuccess(res, { data: colaborador });
}

// Handler para PUT - atualizar colaborador
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const validation = validateData(colaboradorSchema, req.body);

  if (!validation.success) {
    throw new Error(validation.errors.join(', '));
  }

  const { nome, funcao } = validation.data;

  const colaborador = await prisma.colaborador.update({
    where: { id: String(id) },
    data: { nome, funcao },
  });

  sendSuccess(res, { data: colaborador });
}

// Handler para DELETE - deletar colaborador
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  await prisma.colaborador.delete({
    where: { id: String(id) },
  });

  sendSuccess(res, { message: 'Colaborador deletado com sucesso' }, 200);
}

export default withMethodHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
});
