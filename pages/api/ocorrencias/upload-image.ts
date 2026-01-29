// pages/api/ocorrencias/upload-image.ts
// API route for uploading images for Ocorrencias

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ocorrenciaId, imageData, imageIndex } = req.body;

        // Validate parameters
        if (!ocorrenciaId || !imageData || imageIndex === undefined) {
            return res.status(400).json({ error: 'Missing required parameters: ocorrenciaId, imageData, and imageIndex' });
        }

        // Check if ocorrencia exists
        const ocorrencia = await prisma.ocorrencia.findUnique({
            where: { id: ocorrenciaId }
        });

        if (!ocorrencia) {
            return res.status(404).json({ error: 'Ocorrencia not found' });
        }

        // Decode base64 image data
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Check image size (limit to 10MB)
        if (buffer.length > 10 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image too large. Please use an image smaller than 10MB.' });
        }

        // Create directory if it doesn't exist (C:/imagensOcorrencia)
        const uploadDir = path.join('C:', 'imagensOcorrencia');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileName = `ocorrencia-${ocorrenciaId}-${imageIndex}.jpg`;
        const filePath = path.join(uploadDir, fileName);

        // Save image to file system
        fs.writeFileSync(filePath, buffer);

        // Generate the image URL with a timestamp to prevent browser caching issues
        const timestamp = Date.now();
        const imageUrl = `/api/serve-image?module=ocorrencias&imagePath=${fileName}&t=${timestamp}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });
    } catch (error: unknown) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Increase body parser limit for this endpoint
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb' // Increase limit to 10MB
        }
    }
};