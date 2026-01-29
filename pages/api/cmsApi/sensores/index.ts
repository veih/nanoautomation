/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/cmsApi/sensores/index.ts
// Esta rota de API é usada para listar todos os sensores
// e para criar novos sensores.

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
  // Lida com requisições GET para buscar todos os sensores
  if (req.method === 'GET') {
    try {
      // Busca todos os sensores, incluindo os dados do equipamento e da CM relacionados
      const sensores = await prisma.sensor.findMany({
        include: {
          equipamento: {
            include: {
              cm: true, // Inclui os dados da Casa de Máquinas
            },
          },
        },
        orderBy: {
          nome: 'asc', // Ordena os sensores pelo nome em ordem alfabética
        },
      });
      return res.status(200).json(sensores);
    } catch (error: any) {
      console.error('Erro ao buscar sensores:', error);
      return res.status(500).json({ message: 'Erro interno do servidor ao buscar sensores.', error: error.message });
    }
  }
  // Lida com requisições POST para criar um novo sensor
  else if (req.method === 'POST') {
    const { nome, tipo, estado, descricaoDefeito, equipamentoId, imagePaths } = req.body; // ATUALIZADO: Recebe 'estado' e 'imagePaths'

    // Validação básica dos dados de entrada
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({ message: 'O nome do sensor é obrigatório e deve ser uma string não vazia.' });
    }
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
      return res.status(400).json({ message: 'O tipo do sensor é obrigatório e deve ser uma string não vazia.' });
    }
    if (!equipamentoId || typeof equipamentoId !== 'string' || equipamentoId.trim() === '') {
      return res.status(400).json({ message: 'O ID do equipamento é obrigatório e deve ser uma string não vazia.' });
    }

    // NOVO: Validação para o campo 'estado'
    if (!estado || !Object.values(SensorStatus).includes(estado)) {
      return res.status(400).json({ message: 'Status fornecido inválido. Valores permitidos: OPERACIONAL, DEFEITO, MANUTENCAO, DESCONHECIDO.' });
    }

    // `descricaoDefeito` pode ser string ou null
    const parsedDescricaoDefeito = typeof descricaoDefeito === 'string' && descricaoDefeito.trim() !== '' ? descricaoDefeito : null;

    try {
      // Verifica se o equipamento existe antes de tentar conectar
      const equipamentoExistente = await prisma.equipamento.findUnique({
        where: { id: equipamentoId },
      });

      if (!equipamentoExistente) {
        return res.status(404).json({ message: 'Equipamento não encontrado. Não é possível criar o sensor.' });
      }

      // Prepara os dados para criação
      const createData: any = {
        nome,
        tipo,
        estado: estado, // ATUALIZADO: Usa 'estado'
        descricaoDefeito: parsedDescricaoDefeito,
        equipamento: {
          connect: { id: equipamentoId }, // Conecta o sensor ao equipamento existente
        },
      };

      // Adiciona imagePaths se fornecido
      if (imagePaths) {
        createData.imagePaths = imagePaths;
      }

      // Cria o novo sensor no banco de dados
      const novoSensor = await prisma.sensor.create({
        data: createData,
      });
      return res.status(201).json(novoSensor); // 201 Created
    } catch (error: any) {
      console.error('Erro ao criar sensor:', error);
      if (error.code === 'P2003') { // Foreign key constraint failed
        return res.status(400).json({ message: 'Equipamento associado não encontrado ou inválido.', error: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao criar sensor.', error: error.message });
    }
  }
  // Retorna 405 Method Not Allowed para outros métodos HTTP
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}