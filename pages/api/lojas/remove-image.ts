// pages/api/lojas/remove-image.ts
// API route for removing images for Lojas

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
        const { lojaId } = req.body;

        // Validate parameters
        if (!lojaId) {
            return res.status(400).json({ error: 'Missing required parameter: lojaId' });
        }

        // Check if loja exists
        const loja = await prisma.loja.findUnique({
            where: { id: lojaId }
        });

        if (!loja) {
            return res.status(404).json({ error: 'Loja not found' });
        }

        // Get the current image path from the database
        const currentImageUrl = loja.imagem;

        // If there's an image, remove it from the file system
        if (currentImageUrl) {
            // Extract the file name from the URL
            // The URL format is: /api/serve-image?module=lojas&imagePath=loja-{id}.jpg[&t=timestamp]
            const url = new URL(currentImageUrl, 'http://localhost');
            const fileName = url.searchParams.get('imagePath');

            if (fileName) {
                // Remove the image file from the file system
                const filePath = path.join('C:', 'imagensLayoutLojas', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        // Remove the image URL from the database
        await prisma.loja.update({
            where: { id: lojaId },
            data: { imagem: null }
        });

        res.status(200).json({
            success: true,
            message: 'Image removed successfully'
        });
    } catch (error: unknown) {
        console.error('Error removing image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}