// pages/api/ocorrencias/complete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/lib/prisma';
import { withMethodHandler, sendSuccess, validateData } from '@/lib/api-utils';
import { z } from "zod";

// Schema for completing occurrence
const completeOcorrenciaSchema = z.object({
    id: z.string().min(1, "ID é obrigatório"),
    solucao: z.string().min(1, "Solução é obrigatória"),
});

// Handler para POST - completar uma ocorrência
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const validation = validateData(completeOcorrenciaSchema, req.body);

    if (!validation.success) {
        return res.status(400).json({ success: false, error: { message: validation.errors.join(', ') } });
    }

    const { id, solucao } = validation.data;

    try {
        // Update the occurrence to mark as CONCLUIDO
        const ocorrencia = await prisma.ocorrencia.update({
            where: { id },
            data: {
                solucao: solucao || "Concluído", // Default solution text
                status: "CONCLUIDO",
                updatedAt: new Date()
            },
        });

        sendSuccess(res, { data: ocorrencia });
    } catch (error) {
        console.error('Error completing occurrence:', error);
        return res.status(500).json({ success: false, error: { message: 'Erro ao completar ocorrência' } });
    }
}

export default withMethodHandler({
    POST: handlePost,
});