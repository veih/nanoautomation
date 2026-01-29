/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/equipamentos-loja/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { EquipamentoLojaStatus } from '@prisma/client';
import { withMethodHandler, sendSuccess, NotFoundError, ValidationError } from '../../../../lib/api-utils';

// Helper para validar ID
function validateId(id: string | string[] | undefined): string {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('ID do equipamento inválido ou ausente.');
  }
  return id;
}

// Handler para GET - buscar equipamento por ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  const equipamento = await prisma.equipamentoLoja.findUnique({
    where: { id: id },
    // include: {
    //   loja: true, // Inclui os dados da loja se precisar
    //   atuadoresLoja: true, // Inclui os atuadores se precisar
    //   sensoresLoja: true, // Inclui os sensores se precisar
    // },
  });

  if (!equipamento) {
    throw new NotFoundError('Equipamento não encontrado.');
  }

  sendSuccess(res, equipamento);
}

// Handler para PUT - atualizar equipamento
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  // Adicionamos 'status' e 'descricaoDefeito' ao desestruturar o req.body
  const { nome, descricao, descricaoDefeito, lojaId, status } = req.body;

  if (!nome) {
    throw new ValidationError('O nome do equipamento é obrigatório para atualização.');
  }

  // Validação para o status
  if (status && !Object.values(EquipamentoLojaStatus).includes(status)) {
    throw new ValidationError('Status fornecido inválido. Valores permitidos: OPERACIONAL, MANUTENCAO, DESATIVADO, DESCONHECIDO.');
  }

  // Se `lojaId` for enviado no body para PUT, é importante verificar se a nova loja existe
  if (lojaId) {
    const novaLojaExiste = await prisma.loja.findUnique({
      where: { id: lojaId },
      select: { id: true },
    });
    if (!novaLojaExiste) {
      throw new NotFoundError(`Loja com ID ${lojaId} fornecido para atualização não encontrada.`);
    }
  }

  const dataToUpdate: any = {
    nome,
    descricao,
    // Adiciona o status ao objeto de dados, se ele for fornecido no body
    status: status as EquipamentoLojaStatus | undefined, // Cast para o tipo do enum, pode ser undefined se não vier
    // Se `lojaId` puder ser alterado e vir no body:
    // loja: lojaId ? { connect: { id: lojaId } } : undefined,
  };

  // Add descricaoDefeito if it exists
  if (descricaoDefeito !== undefined) {
    dataToUpdate.descricaoDefeito = descricaoDefeito;
  }

  const updatedEquipamento = await prisma.equipamentoLoja.update({
    where: { id: id },
    data: dataToUpdate,
  });

  sendSuccess(res, updatedEquipamento);
}

// Handler para DELETE - deletar equipamento
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  try {
    // Try to delete the equipment directly
    await prisma.equipamentoLoja.delete({
      where: { id: id },
    });

    // Use sendSuccess instead of 204 to provide proper JSON response
    sendSuccess(res, { message: 'Equipamento removido com sucesso.' }, 200);
  } catch (error: any) {
    // If the equipment doesn't exist (P2025), it might have been deleted by cascade
    if (error.code === 'P2025') {
      // Equipment was already deleted (possibly by cascade), consider it successful
      sendSuccess(res, { message: 'Equipamento já foi removido.' }, 200);
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

export default withMethodHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
});