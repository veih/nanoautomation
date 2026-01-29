/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/cmsApi/equipamento/[id].ts
// Esta rota de API é usada para buscar, atualizar e deletar um equipamento específico por ID.

import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EquipamentoStatus } from '@prisma/client'; // Importa o enum do Prisma Client (CORRIGIDO: Named Export)

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
  const { id } = req.query; // Pega o ID do equipamento da URL

  // Garante que o ID é uma string válida antes de prosseguir
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID do equipamento inválido. O ID deve ser uma string.' });
  }

  // Lida com requisições GET para buscar um equipamento específico por ID
  if (req.method === 'GET') {
    try {
      // Busca um equipamento pelo ID, incluindo os dados da CM, atuadores e sensores relacionados
      const equipamento = await prisma.equipamento.findUnique({
        where: { id: String(id) },
        include: {
          cm: true,
          atuadores: true,
          sensores: true,
        },
      });

      if (equipamento) {
        return res.status(200).json(equipamento);
      } else {
        return res.status(404).json({ message: 'Equipamento não encontrado.' });
      }
    } catch (error: any) {
      console.error(`Erro ao buscar equipamento ${id}:`, error);
      return res.status(500).json({ message: 'Erro interno do servidor ao buscar equipamento.', error: (error as Error).message });
    }
  }
  // Lida com requisições PUT para atualizar um equipamento existente
  else if (req.method === 'PUT') {
    const { nome, descricao, cmId, status } = req.body; // Campos para atualização

    const updateData: {
      nome?: string;
      descricao?: string | null;
      cm?: {
        connect: { id: string };
      };
      status?: EquipamentoStatus; // CORRIGIDO: Tipagem para EquipamentoStatus
    } = {};

    // Validação e atribuição de 'nome'
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ message: 'O nome do equipamento deve ser uma string não vazia.' });
      }
      updateData.nome = nome;
    }

    // Atribuição de 'descricao' (pode ser nulo)
    if (descricao !== undefined) {
      updateData.descricao = descricao === '' ? null : descricao;
    }

    // Validação e atribuição de 'cmId' usando connect
    if (cmId !== undefined) {
      if (typeof cmId !== 'string' || cmId.trim() === '') {
        return res.status(400).json({ message: 'O ID da Casa de Máquinas deve ser uma string não vazia.' });
      }
      // Verifica se a nova CM existe antes de tentar conectar
      const cmExistente = await prisma.cM.findUnique({
        where: { id: cmId },
      });
      if (!cmExistente) {
        return res.status(404).json({ message: 'Casa de Máquinas associada não encontrada. Não é possível atualizar o equipamento.' });
      }
      updateData.cm = {
        connect: { id: cmId },
      };
    }

    // Validação e atribuição de 'status'
    if (status !== undefined) {
      // CORRIGIDO: Inclui 'DEFEITO' na mensagem de erro se o status for inválido
      if (!Object.values(EquipamentoStatus).includes(status)) {
        return res.status(400).json({ message: 'Status fornecido inválido. Valores permitidos: OPERACIONAL, DEFEITO, MANUTENCAO, DESATIVADO, DESCONHECIDO.' });
      }
      updateData.status = status;
    }

    // Verifica se updateData está vazio (nenhum campo válido para atualização)
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Nenhum dado válido fornecido para atualização.' });
    }

    try {
      const equipamentoAtualizado = await prisma.equipamento.update({
        where: { id: String(id) },
        data: updateData,
      });
      return res.status(200).json(equipamentoAtualizado);
    } catch (error: any) {
      console.error(`Erro ao atualizar equipamento ${id}:`, error);
      if (error.code === 'P2025') { // Código de erro do Prisma para registro não encontrado
        return res.status(404).json({ message: 'Equipamento não encontrado para atualização.' });
      } else if (error.code === 'P2003') { // Foreign key constraint failed (se o cmId fornecido não existir)
        return res.status(400).json({ message: 'Casa de Máquinas associada inválida.', error: (error as Error).message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao atualizar equipamento.', error: (error as Error).message });
    }
  }
  // Lida com requisições DELETE para excluir um equipamento
  else if (req.method === 'DELETE') {
    try {
      await prisma.equipamento.delete({
        where: { id: String(id) },
      });
      return res.status(200).json({ success: true, message: 'Equipamento removido com sucesso.' }); // Return JSON instead of 204
    } catch (error: any) {
      console.error(`Erro ao deletar equipamento ${id}:`, error);
      if (error.code === 'P2025') { // Código de erro do Prisma para registro não encontrado
        return res.status(404).json({ message: 'Equipamento não encontrado para exclusão.' });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao deletar equipamento.', error: (error as Error).message });
    }
  }
  // Retorna 405 Method Not Allowed para outros métodos HTTP
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
