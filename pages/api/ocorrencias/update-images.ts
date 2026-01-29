// pages/api/ocorrencias/update-images.ts
// API route for updating images for Ocorrencias

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withMethodHandler, sendSuccess, validateData } from '@/lib/api-utils';
import { z } from "zod";

// Reutiliza a instância única do PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!(global as unknown as { prisma?: PrismaClient }).prisma) {
        (global as unknown as { prisma?: PrismaClient }).prisma = new PrismaClient();
    }
    prisma = (global as unknown as { prisma?: PrismaClient }).prisma as PrismaClient;
}

// Schema for updating occurrence images
const updateImagesSchema = z.object({
    imagePaths: z.array(z.string()).optional(),
});

// Handler para PUT - atualizar imagens de uma ocorrência
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: { message: 'ID é obrigatório' } });
        }

        const validation = validateData(updateImagesSchema, req.body);

        if (!validation.success) {
            return res.status(400).json({ success: false, error: { message: validation.errors.join(', ') } });
        }

        const { imagePaths } = validation.data;

        // Update the occurrence images using raw query since Prisma client might not recognize the field
        const imagePathString = imagePaths ? JSON.stringify(imagePaths) : null;

        await prisma.$executeRaw`
            UPDATE ocorrencias 
            SET imagePaths = ${imagePathString}, updatedAt = ${new Date()}
            WHERE id = ${id}
        `;

        // Fetch the updated occurrence to return it
        const updatedOcorrencia = await prisma.ocorrencia.findUnique({
            where: { id: id as string }
        });

        sendSuccess(res, { data: updatedOcorrencia });
    } catch (error: unknown) {
        console.error('Error updating occurrence images:', error);
        return res.status(500).json({ success: false, error: { message: 'Erro ao atualizar imagens da ocorrência' } });
    }
}

export default withMethodHandler({
    PUT: handlePut,
});