// pages/api/lojas/get-images.ts
// API route for getting images for Lojas

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

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
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get all lojas with their image URLs from the database
        const lojas = await prisma.loja.findMany({
            select: {
                id: true,
                imagem: true
            }
        });

        // Create a map of loja IDs to image URLs
        const imageMap: Record<string, string> = {};

        lojas.forEach(loja => {
            // Only include lojas that have an image URL
            if (loja.imagem) {
                imageMap[loja.id] = loja.imagem;
            }
        });

        res.status(200).json({ images: imageMap });
    } catch (error: unknown) {
        console.error('Error getting images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Increase body parser limit (even though this is a GET request, it's good to have consistent config)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};