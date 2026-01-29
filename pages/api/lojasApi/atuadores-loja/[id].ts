/* eslint-disable @typescript-eslint/no-explicit-any */

// pages/api/atuadores-loja/[id].ts
// Esta rota de API dinâmica é usada para interagir com um atuador de loja específico pelo seu ID.

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { withMethodHandler, sendSuccess, NotFoundError, ValidationError } from '../../../../lib/api-utils';

// Helper para validar ID
function validateId(id: string | string[] | undefined): string {
  if (typeof id !== 'string') {
    throw new ValidationError('ID do atuador inválido.');
  }
  return id;
}

// Handler para GET - buscar atuador por ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  const atuador = await prisma.atuadorLoja.findUnique({
    where: { id },
  });

  if (!atuador) {
    throw new NotFoundError('Atuador de loja não encontrado.');
  }

  sendSuccess(res, atuador);
}

// Handler para PUT - atualizar atuador
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  const { nome, tipo, estado, existe, motivoNaoExiste, descricaoDefeito, lojaId, equipamentoLojaId } = req.body;

  const dataToUpdate: any = {
    nome,
    tipo,
    estado,
    existe,
    motivoNaoExiste,
    lojaId,
    equipamentoLojaId,
  };

  // Add descricaoDefeito if it exists
  if (descricaoDefeito !== undefined) {
    dataToUpdate.descricaoDefeito = descricaoDefeito;
  }

  const updatedAtuador = await prisma.atuadorLoja.update({
    where: { id },
    data: dataToUpdate,
  });

  sendSuccess(res, updatedAtuador);
}

// Handler para DELETE - deletar atuador
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  try {
    await prisma.atuadorLoja.delete({
      where: { id },
    });

    sendSuccess(res, { message: 'Atuador removido com sucesso.' }, 200);
  } catch (error: any) {
    // If the atuador doesn't exist (P2025), it might have been deleted by cascade
    if (error.code === 'P2025') {
      sendSuccess(res, { message: 'Atuador já foi removido.' }, 200);
    } else {
      throw error;
    }
  }
}

export default withMethodHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
});
