// pages/api/cmsApi/atuadores/[id].ts
// Esta rota de API é usada para buscar, atualizar e deletar um atuador específico por ID.

import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

// NOVO: Enum para o status do Atuador, alinhado com o frontend e schema.prisma
enum AtuadorStatus {
  OPERACIONAL = "OPERACIONAL",
  DEFEITO = "DEFEITO",
  MANUTENCAO = "MANUTENCAO",
  DESCONHECIDO = "DESCONHECIDO",
}

// Inicializa o PrismaClient.
// Isso garante que apenas uma instância do PrismaClient seja criada e reutilizada,
// o que é uma boa prática para evitar problemas de conexão em hot-reloading no Next.js.
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as unknown as { prisma: PrismaClient }).prisma) {
    (global as unknown as { prisma: PrismaClient }).prisma = new PrismaClient();
  }
  prisma = (global as unknown as { prisma: PrismaClient }).prisma;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Pega o ID do atuador da URL (e.g., /api/cmsApi/atuadores/123)

  // Garante que o ID é uma string válida antes de prosseguir
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID do atuador inválido. O ID deve ser uma string.' });
  }

  // Lida com requisições GET para buscar um atuador específico por ID
  if (req.method === 'GET') {
    try {
      // Busca um atuador pelo ID, incluindo os dados do equipamento e da CM relacionados
      const atuador = await prisma.atuador.findUnique({
        where: { id: String(id) }, // Garante que o ID é uma string
        include: {
          equipamento: {
            include: {
              cm: true, // Inclui os dados da Casa de Máquinas
            },
          },
        },
      });

      if (atuador) {
        return res.status(200).json(atuador);
      } else {
        return res.status(404).json({ message: 'Atuador não encontrado.' });
      }
    } catch (error) {
      console.error(`Erro ao buscar atuador ${id}:`, error);
      return res.status(500).json({ message: 'Erro interno do servidor ao buscar atuador.', error: (error as Error).message });
    }
  }
  // Lida com requisições PUT para atualizar um atuador existente
  else if (req.method === 'PUT') {
    // NOVO: Inclui 'estado' na desestruturação, REMOVIDO 'valorAtual'
    const { nome, tipo, descricaoDefeito, equipamentoId, estado, imagePaths } = req.body;

    // Prepara os dados para atualização, garantindo que apenas campos fornecidos sejam atualizados
    const updateData: Record<string, unknown> = {};

    // Validação e atribuição de 'nome'
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ message: 'O nome do atuador deve ser uma string não vazia.' });
      }
      updateData.nome = nome;
    }

    // Validação e atribuição de 'tipo'
    if (tipo !== undefined) {
      if (typeof tipo !== 'string' || tipo.trim() === '') {
        return res.status(400).json({ message: 'O tipo do atuador deve ser uma string não vazia.' });
      }
      updateData.tipo = tipo;
    }

    // REMOVIDO: Lógica de validação e atribuição de 'valorAtual'

    // NOVO: Validação e atribuição de 'estado'
    if (estado !== undefined) {
      if (!Object.values(AtuadorStatus).includes(estado)) {
        return res.status(400).json({ message: 'Status fornecido inválido. Valores permitidos: OPERACIONAL, DEFEITO, MANUTENCAO, DESCONHECIDO.' });
      }
      updateData.estado = estado;
    }

    // NOVO: Atribuição de 'descricaoDefeito' baseada no estado
    // Se o estado for DEFEITO, usa a descricaoDefeito fornecida ou um padrão.
    // Se o estado NÃO for DEFEITO, define descricaoDefeito como null para limpar.
    if (estado !== undefined) { // Só aplica essa lógica se o estado estiver sendo atualizado
      updateData.descricaoDefeito = estado === AtuadorStatus.DEFEITO ? (descricaoDefeito || "Defeito não especificado.") : null;
    } else if (descricaoDefeito !== undefined) { // Se estado não for fornecido, mas descricaoDefeito for
      // Se o estado não foi alterado para DEFEITO, mas uma descricaoDefeito foi enviada,
      // precisamos saber o estado atual do atuador para decidir se a descrição deve ser mantida.
      // Para simplificar, se o estado não está no payload, a 'descricaoDefeito' é tratada como null.
      updateData.descricaoDefeito = null;
    }

    // Validação e atribuição de 'equipamentoId' usando connect
    if (equipamentoId !== undefined) {
      if (typeof equipamentoId !== 'string' || equipamentoId.trim() === '') {
        return res.status(400).json({ message: 'O ID do equipamento deve ser uma string não vazia.' });
      }
      // Verifica se o novo equipamento existe antes de tentar conectar
      const equipamentoExistente = await prisma.equipamento.findUnique({
        where: { id: equipamentoId },
      });
      if (!equipamentoExistente) {
        return res.status(404).json({ message: 'Equipamento associado não encontrado. Não é possível atualizar o atuador.' });
      }
      // Usa a sintaxe de 'connect' para atualizar a relação
      updateData.equipamento = {
        connect: { id: equipamentoId },
      };
    }

    // Verifica se updateData está vazio (nenhum campo válido para atualização)
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Nenhum dado válido fornecido para atualização.' });
    }

    try {
      // Adiciona imagePaths aos dados de atualização, se fornecido
      if (imagePaths !== undefined) {
        updateData.imagePaths = imagePaths;
      }

      // Atualiza o atuador no banco de dados
      await prisma.atuador.update({
        where: { id: String(id) },
        data: updateData,
      });

      // Retorna o atuador atualizado
      const atuadorFinal = await prisma.atuador.findUnique({
        where: { id: String(id) },
        include: {
          equipamento: {
            include: {
              cm: true,
            },
          },
        },
      });

      return res.status(200).json(atuadorFinal);
    } catch (error) {
      console.error(`Erro ao atualizar atuador ${id}:`, error);
      if ((error as { code?: string }).code === 'P2025') { // Código de erro do Prisma para registro não encontrado
        return res.status(404).json({ message: 'Atuador não encontrado para atualização.' });
      } else if ((error as { code?: string }).code === 'P2003') { // Foreign key constraint failed (se o equipamentoId fornecido não existir)
        return res.status(400).json({ message: 'Equipamento associado inválido.', error: (error as Error).message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao atualizar atuador.', error: (error as Error).message });
    }
  }
  // Lida com requisições DELETE para excluir um atuador
  else if (req.method === 'DELETE') {
    try {
      await prisma.atuador.delete({
        where: { id: String(id) },
      });
      return res.status(200).json({ success: true, message: 'Atuador removido com sucesso.' }); // Return JSON instead of 204
    } catch (error) {
      console.error(`Erro ao deletar atuador ${id}:`, error);
      if ((error as { code?: string }).code === 'P2025') { // Código de erro do Prisma para registro não encontrado
        return res.status(404).json({ message: 'Atuador não encontrado para exclusão.' });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao deletar atuador.', error: (error as Error).message });
    }
  }
  // Retorna 405 Method Not Allowed para outros métodos HTTP
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}