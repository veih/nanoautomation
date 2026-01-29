// pages/api/atuadores-loja/index.ts
// Esta rota de API é usada para listar todos os atuadores de loja
// e para criar novos atuadores de loja.

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { withMethodHandler, sendSuccess } from '../../../../lib/api-utils';

// Adicionando o enum para o status do Atuador, alinhado com o schema do Prisma.
export enum AtuadorStatus {
  OPERACIONAL = "OPERACIONAL",
  DEFEITO = "DEFEITO",
  MANUTENCAO = "MANUTENCAO",
  DESCONHECIDO = "DESCONHECIDO",
}

// Handler para GET - buscar todos os atuadores de loja
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // Check if there's a lojaId query parameter to filter by
  const { lojaId } = req.query;

  // Build the where clause for filtering
  const whereClause: { lojaId?: string } = {};
  if (lojaId && typeof lojaId === 'string') {
    whereClause.lojaId = lojaId;
  }

  const atuadores = await prisma.atuadorLoja.findMany({
    where: whereClause,
    orderBy: {
      nome: 'asc' // Ordena os atuadores pelo nome em ordem alfabética
    },
    // Inclui os dados do equipamento e loja associados
    include: {
      equipamentoLoja: true,
      loja: true,
    }
  });

  sendSuccess(res, {
    total_items: atuadores.length,
    page: 1,
    limit: atuadores.length,
    atuadores: atuadores,
  });
}

// Handler para POST - criar novo atuador de loja
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { nome, tipo, estado, existe, motivoNaoExiste, descricaoDefeito, lojaId, equipamentoLojaId } = req.body;

  // Validação dos dados de entrada
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    throw new Error('O nome do atuador é obrigatório e deve ser uma string não vazia.');
  }
  if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
    throw new Error('O tipo do atuador é obrigatório e deve ser uma string não vazia.');
  }
  if (!estado || typeof estado !== 'string' || estado.trim() === '') {
    throw new Error('O status do atuador é obrigatório e deve ser uma string não vazia.');
  }

  // Verificação de tipo seguro para o campo 'estado'
  if (!Object.values(AtuadorStatus).includes(estado as AtuadorStatus)) {
    throw new Error('Status do atuador inválido.');
  }

  // Cria um novo atuador de loja no banco de dados
  const dataObject: {
    nome: string;
    tipo: string;
    estado: AtuadorStatus;
    existe: boolean;
    motivoNaoExiste?: string | null;
    lojaId?: string | null;
    equipamentoLojaId?: string | null;
    descricaoDefeito?: string;
  } = {
    nome,
    tipo,
    estado: estado as AtuadorStatus,
    existe: existe ?? true,
    motivoNaoExiste: motivoNaoExiste || null,
    lojaId: lojaId || null,
    equipamentoLojaId: equipamentoLojaId || null,
  };

  // Add descricaoDefeito if it exists
  if (descricaoDefeito !== undefined) {
    dataObject.descricaoDefeito = descricaoDefeito;
  }

  const novoAtuador = await prisma.atuadorLoja.create({
    data: dataObject,
  });

  sendSuccess(res, novoAtuador, 201);
}

export default withMethodHandler({
  GET: handleGet,
  POST: handlePost,
});