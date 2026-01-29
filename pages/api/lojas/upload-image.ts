// pages/api/lojas/upload-image.ts
// API route for uploading images for Lojas

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
        const { lojaId, imageData } = req.body;

        // Validate parameters
        if (!lojaId || !imageData) {
            return res.status(400).json({ error: 'Missing required parameters: lojaId and imageData' });
        }

        // Check if loja exists
        const loja = await prisma.loja.findUnique({
            where: { id: lojaId }
        });

        if (!loja) {
            return res.status(404).json({ error: 'Loja not found' });
        }

        // Decode base64 image data
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Compress the image if it's too large (resize to max 1920px width)
        // Note: In a production environment, you might want to use a library like sharp for this
        // For now, we'll just check the size and reject if too large
        if (buffer.length > 5 * 1024 * 1024) { // 5MB limit
            return res.status(400).json({ error: 'Image too large. Please use an image smaller than 5MB.' });
        }

        // Create directory if it doesn't exist (C:/imagensLayoutLojas)
        const uploadDir = path.join('C:', 'imagensLayoutLojas');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename (simpler format)
        // This ensures that new captures always overwrite the previous image
        const fileName = `loja-${lojaId}.jpg`;
        const filePath = path.join(uploadDir, fileName);

        // Save image to file system (this will overwrite any existing file with the same name)
        fs.writeFileSync(filePath, buffer);

        // Generate the image URL with a timestamp to prevent browser caching issues
        const timestamp = Date.now();
        const imageUrl = `/api/serve-image?module=lojas&imagePath=${fileName}&t=${timestamp}`;

        // Save the image URL to the database (this will overwrite any existing URL)
        await prisma.loja.update({
            where: { id: lojaId },
            data: { imagem: imageUrl }
        });

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