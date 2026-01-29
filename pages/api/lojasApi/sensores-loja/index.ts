// pages/api/sensores-loja/index.ts
// Esta rota de API é usada para listar todos os sensores de loja
// e para criar novos sensores de loja.

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { withMethodHandler, sendSuccess } from '../../../../lib/api-utils';
import { SensorStatus } from '../../../../types';

// Handler para GET - buscar todos os sensores de loja
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // Check if there's a lojaId query parameter to filter by
  const { lojaId } = req.query;

  // Build the where clause for filtering
  const whereClause: { lojaId?: string } = {};
  if (lojaId && typeof lojaId === 'string') {
    whereClause.lojaId = lojaId;
  }

  const sensores = await prisma.sensorLoja.findMany({
    where: whereClause,
    orderBy: {
      nome: 'asc' // Ordena os sensores pelo nome em ordem alfabética
    },
    // Inclui relacionamentos para que os dados da loja e do equipamento associado
    // sejam retornados junto com o sensor. Isso é útil para exibir informações completas.
    include: {
      loja: true,
      equipamentoLoja: true,
    }
  });

  sendSuccess(res, {
    total_items: sensores.length,
    page: 1, // Exemplo, se você for implementar paginação, ajuste aqui
    limit: sensores.length, // Exemplo, se for implementar paginação
    sensores: sensores,
  });
}

// Handler para POST - criar novo sensor de loja
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // Agora esperamos 'nome', 'tipo', 'estado' e outros campos opcionais do corpo da requisição.
  const { nome, tipo, estado, ultimaAtivacao, existe, motivoNaoExiste, descricaoDefeito, lojaId, equipamentoLojaId } = req.body;

  // Validação dos dados de entrada
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    throw new Error('O nome do sensor é obrigatório e deve ser uma string não vazia.');
  }
  if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
    throw new Error('O tipo do sensor é obrigatório e deve ser uma string não vazia.');
  }
  if (!estado || typeof estado !== 'string' || estado.trim() === '') {
    throw new Error('O status do sensor é obrigatório e deve ser uma string não vazia.');
  }

  // Convert string estado to SensorStatus enum
  let sensorEstado: SensorStatus | undefined;
  if (Object.values(SensorStatus).includes(estado as SensorStatus)) {
    sensorEstado = estado as SensorStatus;
  } else {
    // Handle invalid estado values gracefully
    console.warn(`Invalid estado value received: ${estado}. Setting to undefined.`);
    sensorEstado = undefined;
  }

  // Cria um novo sensor de loja no banco de dados
  const dataObject: {
    nome: string;
    tipo: string;
    estado?: SensorStatus;
    ultimaAtivacao?: Date | null;
    existe: boolean;
    motivoNaoExiste?: string | null;
    lojaId?: string | null;
    equipamentoLojaId?: string | null;
    descricaoDefeito?: string;
  } = {
    nome,
    tipo,
    estado: sensorEstado,
    ultimaAtivacao: ultimaAtivacao ? new Date(ultimaAtivacao) : null,
    existe: existe ?? true,
    motivoNaoExiste: motivoNaoExiste || null,
    lojaId: lojaId || null,
    equipamentoLojaId: equipamentoLojaId || null,
  };

  // Add descricaoDefeito if it exists
  if (descricaoDefeito !== undefined) {
    dataObject.descricaoDefeito = descricaoDefeito;
  }

  const novoSensor = await prisma.sensorLoja.create({
    data: dataObject,
  });

  sendSuccess(res, novoSensor, 201);
}

export default withMethodHandler({
  GET: handleGet,
  POST: handlePost,
});