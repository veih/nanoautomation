/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/cmsApi/equipamento/index.ts
// Esta rota de API é usada para listar todos os equipamentos
// e para criar novos equipamentos.

import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EquipamentoStatus } from '@prisma/client'; // Importa o enum do Prisma Client

// Inicializa o PrismaClient.
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Lida com requisições GET para buscar todos os atuadores
  if (req.method === 'GET') {
    try {
      // Busca todos os equipamentos, incluindo os dados da CM relacionados
      const equipamentos = await prisma.equipamento.findMany({
        include: {
          cm: true, // Inclui os dados da Casa de Máquinas
          atuadores: true, // Inclui atuadores
          sensores: true,  // Inclui sensores
        },
        orderBy: {
          nome: 'asc', // Ordena os equipamentos pelo nome em ordem alfabética
        },
      });
      return res.status(200).json(equipamentos);
    } catch (error: any) {
      console.error('Erro ao buscar equipamentos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor ao buscar equipamentos.', error: error.message });
    }
  }
  // Lida com requisições POST para criar um novo equipamento
  else if (req.method === 'POST') {
    const { nome, descricao, cmId, status } = req.body;

    // Validação básica dos dados de entrada
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({ message: 'O nome do equipamento é obrigatório e deve ser uma string não vazia.' });
    }
    if (!cmId || typeof cmId !== 'string' || cmId.trim() === '') {
      return res.status(400).json({ message: 'O ID da Casa de Máquinas é obrigatório e deve ser uma string não vazia.' });
    }
    // Validação para o status
    // ATUALIZADO: Inclui 'DEFEITO' na mensagem de erro se o status for inválido
    if (status && !Object.values(EquipamentoStatus).includes(status)) {
      return res.status(400).json({ message: 'Status fornecido inválido. Valores permitidos: OPERACIONAL, DEFEITO, MANUTENCAO, DESATIVADO, DESCONHECIDO.' });
    }

    try {
      // Verifica se a CM existe antes de tentar conectar
      const cmExistente = await prisma.cM.findUnique({
        where: { id: cmId },
      });

      if (!cmExistente) {
        return res.status(404).json({ message: 'Casa de Máquinas não encontrada. Não é possível criar o equipamento.' });
      }

      const novoEquipamento = await prisma.equipamento.create({
        data: {
          nome,
          descricao: descricao || null, // Se a descrição for vazia, armazena null
          status: status || EquipamentoStatus.OPERACIONAL, // Define o status, com OPERACIONAL como fallback
          cm: {
            connect: { id: cmId }, // Conecta o equipamento à CM existente
          },
        },
      });
      return res.status(201).json(novoEquipamento); // 201 Created
    } catch (error: any) {
      console.error('Erro ao criar equipamento:', error);
      if (error.code === 'P2003') { // Foreign key constraint failed
        return res.status(400).json({ message: 'Casa de Máquinas associada não encontrada ou inválida.', error: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao criar equipamento.', error: (error as Error).message });
    }
  }
  // Retorna 405 Method Not Allowed para outros métodos HTTP
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
