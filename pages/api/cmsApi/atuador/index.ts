/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/cmsApi/atuadores/index.ts
// Esta rota de API é usada para listar todos os atuadores
// e para criar novos atuadores.

import { PrismaClient, AtuadorStatus } from '@prisma/client'; // Importa o enum AtuadorStatus do Prisma Client
import type { NextApiRequest, NextApiResponse } from 'next';

// Inicializa o PrismaClient.
// Isso garante que apenas uma instância do PrismaClient seja criada e reutilizada,
// o que é uma boa prática para evitar problemas de conexão em hot-reloading no Next.js.
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
      // Busca todos os atuadores, incluindo os dados do equipamento e da CM relacionados
      const atuadores = await prisma.atuador.findMany({
        include: {
          equipamento: { // Inclui o objeto equipamento
            include: {
              cm: true, // Inclui os dados da Casa de Máquinas
            },
          },
        },
        orderBy: {
          nome: 'asc', // Ordena os atuadores pelo nome em ordem alfabética
        },
      });
      return res.status(200).json(atuadores);
    } catch (error: any) {
      console.error('Erro ao buscar atuadores:', error);
      return res.status(500).json({ message: 'Erro interno do servidor ao buscar atuadores.', error: (error as Error).message });
    }
  }
  // Lida com requisições POST para criar um novo atuador
  else if (req.method === 'POST') {
    // Desestrutura os campos do corpo da requisição
    const { nome, tipo, estado, descricaoDefeito, equipamentoId, imagePaths } = req.body;

    // --- Validação dos dados de entrada ---
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({ message: 'O nome do atuador é obrigatório e deve ser uma string não vazia.' });
    }
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
      return res.status(400).json({ message: 'O tipo do atuador é obrigatório e deve ser uma string não vazia.' });
    }
    if (!equipamentoId || typeof equipamentoId !== 'string' || equipamentoId.trim() === '') {
      return res.status(400).json({ message: 'O ID do equipamento é obrigatório e deve ser uma string não vazia.' });
    }

    // Validação para o campo 'estado' usando o enum do Prisma
    if (!estado || !Object.values(AtuadorStatus).includes(estado)) {
      return res.status(400).json({ message: 'Status fornecido inválido. Valores permitidos: OPERACIONAL, DEFEITO, MANUTENCAO, DESCONHECIDO.' });
    }

    // Define a descrição do defeito com base no estado
    let finalDescricaoDefeito: string | null = null;
    if (estado === AtuadorStatus.DEFEITO) {
      finalDescricaoDefeito = (descricaoDefeito && descricaoDefeito.trim() !== '') ? descricaoDefeito : "Defeito não especificado.";
    }

    try {
      // Verifica se o equipamento existe antes de tentar conectar
      const equipamentoExistente = await prisma.equipamento.findUnique({
        where: { id: equipamentoId },
      });

      if (!equipamentoExistente) {
        return res.status(404).json({ message: 'Equipamento não encontrado. Não é possível criar o atuador.' });
      }

      // Prepara os dados para criação
      const createData: any = {
        nome,
        tipo,
        estado, // Usa o estado validado
        descricaoDefeito: finalDescricaoDefeito, // Usa a descrição do defeito processada
        equipamento: {
          connect: { id: equipamentoId }, // Conecta o atuador ao equipamento existente
        },
      };

      // Adiciona imagePaths se fornecido
      if (imagePaths) {
        createData.imagePaths = imagePaths;
      }

      // Cria o novo atuador no banco de dados
      const novoAtuador = await prisma.atuador.create({
        data: createData,
      });
      return res.status(201).json(novoAtuador); // Retorna o atuador criado com status 201 Created

    } catch (error: any) {
      console.error('Erro ao criar atuador:', error);
      // Lida com erros específicos do Prisma, como violação de chave estrangeira
      if (error.code === 'P2003') { // Foreign key constraint failed
        return res.status(400).json({ message: 'Equipamento associado não encontrado ou inválido.', error: (error as Error).message });
      }
      // Retorna um erro genérico do servidor para outros tipos de erros
      return res.status(500).json({ message: 'Erro interno do servidor ao criar atuador.', error: (error as Error).message });
    }
  }
  // Retorna 405 Method Not Allowed para outros métodos HTTP
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}