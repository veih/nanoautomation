/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/ocorrencias/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { withMethodHandler, sendSuccess, validateData } from '@/lib/api-utils';
import { z } from "zod";

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

// Schema for updating occurrence (solution can be updated)
const updateOcorrenciaSchema = z.object({
    solucao: z.string().min(1, "Solução é obrigatória"),
});

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

        const { solucao } = validation.data;

        // When updating solution, mark as CONCLUIDO
        const ocorrencia = await prisma.ocorrencia.update({
            where: { id },
            data: {
                solucao: solucao || "Concluído", // Default solution text
                status: "CONCLUIDO",
                updatedAt: new Date()
            },
        });

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
    PUT: handlePut,
});