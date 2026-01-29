/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/ocorrencias/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { withMethodHandler, sendSuccess, validateData } from '@/lib/api-utils';
import { z } from "zod";
import { randomUUID } from "crypto";

// Reutiliza a instância única do PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// Schema for occurrence validation
const ocorrenciaSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  solucao: z.string().min(1, "Solução é obrigatória"),
  colaborador: z.string().min(1, "Colaborador é obrigatório"),
  imagePaths: z.array(z.string()).optional(), // Add imagePaths validation
});

// Schema for updating occurrence (solution can be updated)
const updateOcorrenciaSchema = z.object({
  solucao: z.string().min(1, "Solução é obrigatória"),
  imagePaths: z.array(z.string()).optional(), // Add imagePaths validation
});

// Handler para GET - buscar todas as ocorrências
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ocorrencias = await prisma.$queryRaw`
      SELECT * FROM ocorrencias
      ORDER BY createdAt DESC
    ` as any[];

    sendSuccess(res, { data: ocorrencias });
  } catch (error) {
    console.error('Error fetching occurrences:', error);
    return res.status(500).json({ success: false, error: { message: 'Erro ao buscar ocorrências' } });
  }
}

// Handler para POST - criar nova ocorrência
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validation = validateData(ocorrenciaSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({ success: false, error: { message: validation.errors.join(', ') } });
    }

    const { descricao, solucao, colaborador, imagePaths } = validation.data;

    // Create occurrence with image paths using raw query
    const imagePathString = imagePaths ? JSON.stringify(imagePaths) : null;
    const id = randomUUID();

    await prisma.$executeRaw`
        INSERT INTO ocorrencias (id, descricao, solucao, colaborador, status, createdAt, updatedAt, imagePaths)
        VALUES (
            ${id}, 
            ${descricao}, 
            ${solucao}, 
            ${colaborador}, 
            'ANDAMENTO', 
            ${new Date()}, 
            ${new Date()}, 
            ${imagePathString}
        )
    `;

    // Fetch the created occurrence to return it
    const [ocorrencia] = await prisma.$queryRaw`
        SELECT * FROM ocorrencias WHERE id = ${id}
    ` as any[];

    sendSuccess(res, { data: ocorrencia }, 201);
  } catch (error) {
    console.error('Error creating occurrence:', error);
    return res.status(500).json({ success: false, error: { message: 'Erro ao criar ocorrência' } });
  }
}

// Handler para PUT - atualizar uma ocorrência
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'ID é obrigatório' } });
    }

    const validation = validateData(updateOcorrenciaSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({ success: false, error: { message: validation.errors.join(', ') } });
    }

    const { solucao, imagePaths } = validation.data;

    // Update the occurrence using raw query to handle image paths
    const imagePathString = imagePaths ? JSON.stringify(imagePaths) : null;

    await prisma.$executeRaw`
        UPDATE ocorrencias 
        SET solucao = ${solucao}, 
            status = 'CONCLUIDO', 
            updatedAt = ${new Date()},
            imagePaths = ${imagePathString}
        WHERE id = ${id}
    `;

    // Fetch the updated occurrence to return it
    const [ocorrencia] = await prisma.$queryRaw`
        SELECT * FROM ocorrencias WHERE id = ${id}
    ` as any[];

    sendSuccess(res, { data: ocorrencia });
  } catch (error: any) {
    console.error('Error updating occurrence:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: { message: 'Ocorrência não encontrada' } });
    }
    return res.status(500).json({ success: false, error: { message: 'Erro ao atualizar ocorrência' } });
  }
}

export default withMethodHandler({
  GET: handleGet,
  POST: handlePost,
  PUT: handlePut,
});