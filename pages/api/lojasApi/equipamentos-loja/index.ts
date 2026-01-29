// pages/api/equipamentos-loja/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { withMethodHandler, sendSuccess, NotFoundError } from '../../../../lib/api-utils';

// Handler para GET - buscar todos os equipamentos de loja
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // O 'lojaId' agora vem como um query parameter para filtrar a listagem
  const { lojaId } = req.query;
  const whereClause: { lojaId?: string } = {};

  if (lojaId && typeof lojaId === 'string') {
    // Se um lojaId for fornecido como query parameter, filtra por ele
    whereClause.lojaId = lojaId;

    // Opcional: Verificar se a loja realmente existe antes de buscar os equipamentos
    const lojaExiste = await prisma.loja.findUnique({
      where: { id: lojaId },
      select: { id: true },
    });
    if (!lojaExiste) {
      throw new NotFoundError(`Loja com ID ${lojaId} não encontrada.`);
    }
  }

  const equipamentos = await prisma.equipamentoLoja.findMany({
    where: whereClause,
    orderBy: {
      nome: 'asc' // Ordena os equipamentos pelo nome
    },
    include: {
      loja: true, // Include the loja relationship
    }
  });

  sendSuccess(res, {
    total_items: equipamentos.length,
    page: 1,
    limit: equipamentos.length,
    equipamentos: equipamentos,
  });
}

// Handler para POST - criar novo equipamento de loja
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { nome, descricao, descricaoDefeito, tipo, lojaId: newEquipamentoLojaId } = req.body; // Pega lojaId do corpo da requisição

  if (!nome || !newEquipamentoLojaId) {
    throw new Error('Nome do equipamento e ID da loja são obrigatórios.');
  }

  // Verifica se a loja existe antes de tentar conectar
  const lojaExiste = await prisma.loja.findUnique({
    where: { id: newEquipamentoLojaId },
    select: { id: true },
  });

  if (!lojaExiste) {
    throw new NotFoundError(`Loja com ID ${newEquipamentoLojaId} não encontrada. Não é possível adicionar equipamento.`);
  }

  // Prepare the data object - tipo will be set by default value in database
  const dataObject: {
    nome: string;
    descricao?: string | null;
    descricaoDefeito?: string | null;
    loja: { connect: { id: string } };
    tipo?: string;
  } = {
    nome,
    descricao: descricao || null,
    loja: {
      connect: { id: newEquipamentoLojaId },
    },
  };

  // Add descricaoDefeito if it exists
  if (descricaoDefeito !== undefined) {
    dataObject.descricaoDefeito = descricaoDefeito || null;
  }

  // Only add tipo if it's provided and not the default value
  // The tipo field has a default value of "KRON" in the database
  if (tipo && tipo !== 'KRON') {
    dataObject.tipo = tipo;
  }

  const newEquipamento = await prisma.equipamentoLoja.create({
    data: dataObject,
  });

  sendSuccess(res, newEquipamento, 201);
}

export default withMethodHandler({
  GET: handleGet,
  POST: handlePost,
});