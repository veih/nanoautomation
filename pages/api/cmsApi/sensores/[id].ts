/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/cmsApi/sensores/[id].ts
// Esta rota de API é usada para buscar, atualizar e deletar um sensor específico por ID.

import { PrismaClient, SensorStatus } from '@prisma/client'; // Importa SensorStatus
import type { NextApiRequest, NextApiResponse } from 'next';

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
  const { id } = req.query; // Pega o ID do sensor da URL

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID do sensor inválido. O ID deve ser uma string.' });
  }

  // Lida com requisições GET para buscar um sensor específico por ID
  if (req.method === 'GET') {
    try {
      const sensor = await prisma.sensor.findUnique({ // CORRIGIDO: Usa o modelo Sensor
        where: { id: String(id) },
        include: {
          equipamento: {
            include: {
              cm: true,
            },
          },
        },
      });

      if (sensor) {
        return res.status(200).json(sensor);
      } else {
        return res.status(404).json({ message: 'Sensor não encontrado.' });
      }
    } catch (error: any) {
      console.error(`Erro ao buscar sensor ${id}:`, error);
      return res.status(500).json({ message: 'Erro interno do servidor ao buscar sensor.', error: error.message });
    }
  }
  // Lida com requisições PUT para atualizar um sensor existente
  else if (req.method === 'PUT') {
    // ATUALIZADO: Inclui 'estado' e 'imagePaths' na desestruturação
    const { nome, tipo, estado, descricaoDefeito, equipamentoId, imagePaths } = req.body;

    const updateData: {
      nome?: string;
      tipo?: string;
      estado?: SensorStatus; // ATUALIZADO: Usa SensorStatus enum
      descricaoDefeito?: string | null;
      equipamento?: {
        connect: { id: string };
      };
      imagePaths?: string; // NOVO: Adiciona imagePaths
    } = {};

    // Validação e atribuição de 'nome'
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ message: 'O nome do sensor deve ser uma string não vazia.' });
      }
      updateData.nome = nome;
    }

    // Validação e atribuição de 'tipo'
    if (tipo !== undefined) {
      if (typeof tipo !== 'string' || tipo.trim() === '') {
        return res.status(400).json({ message: 'O tipo do sensor deve ser uma string não vazia.' });
      }
      updateData.tipo = tipo;
    }

    // NOVO: Validação e atribuição de 'estado'
    if (estado !== undefined) {
      if (!Object.values(SensorStatus).includes(estado)) {
        return res.status(400).json({ message: 'Status fornecido inválido. Valores permitidos: OPERACIONAL, DEFEITO, MANUTENCAO, DESCONHECIDO.' });
      }
      updateData.estado = estado;
    }

    // NOVO: Atribuição de 'descricaoDefeito' baseada no estado
    // Se o estado for DEFEITO, usa a descricaoDefeito fornecida ou um padrão.
    // Se o estado NÃO for DEFEITO, define descricaoDefeito como null para limpar.
    if (estado !== undefined) { // Só aplica essa lógica se o estado estiver sendo atualizado
      updateData.descricaoDefeito = estado === SensorStatus.DEFEITO ? (descricaoDefeito || "Defeito não especificado.") : null;
    } else if (descricaoDefeito !== undefined) { // Se estado não for fornecido, mas descricaoDefeito for
      // Se o estado não foi alterado para DEFEITO, mas uma descricaoDefeito foi enviada,
      // precisamos saber o estado atual do sensor para decidir se a descrição deve ser mantida.
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
        return res.status(404).json({ message: 'Equipamento associado não encontrado. Não é possível atualizar o sensor.' });
      }
      // Usa a sintaxe de 'connect' para atualizar a relação
      updateData.equipamento = {
        connect: { id: equipamentoId },
      };
    }

    // NOVO: Atribuição de 'imagePaths'
    if (imagePaths !== undefined) {
      updateData.imagePaths = imagePaths;
    }

    // Verifica se updateData está vazio (nenhum campo válido para atualização)
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Nenhum dado válido fornecido para atualização.' });
    }

    try {
      const sensorAtualizado = await prisma.sensor.update({ // CORRIGIDO: Usa o modelo Sensor
        where: { id: String(id) },
        data: updateData,
      });
      return res.status(200).json(sensorAtualizado);
    } catch (error: any) {
      console.error(`Erro ao atualizar sensor ${id}:`, error);
      if (error.code === 'P2025') { // Código de erro do Prisma para registro não encontrado
        return res.status(404).json({ message: 'Sensor não encontrado para atualização.' });
      } else if (error.code === 'P2003') { // Foreign key constraint failed (se o equipamentoId fornecido não existir)
        return res.status(400).json({ message: 'Equipamento associado inválido.', error: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao atualizar sensor.', error: error.message });
    }
  }
  // Lida com requisições DELETE para excluir um sensor
  else if (req.method === 'DELETE') {
    try {
      await prisma.sensor.delete({ // CORRIGIDO: Usa o modelo Sensor
        where: { id: String(id) },
      });
      return res.status(200).json({ success: true, message: 'Sensor removido com sucesso.' }); // Return JSON instead of 204
    } catch (error: any) {
      console.error(`Erro ao deletar sensor ${id}:`, error);
      if (error.code === 'P2025') { // Código de erro do Prisma para registro não encontrado
        return res.status(404).json({ message: 'Sensor não encontrado para exclusão.' });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao deletar sensor.', error: error.message });
    }
  }
  // Retorna 405 Method Not Allowed para outros métodos HTTP
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}