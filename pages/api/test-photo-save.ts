// pages/api/test-photo-save.ts
// Simple test endpoint to verify photo saving works

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log("Testing photo save...");

        // Create a test photo record
        const testPhoto = await prisma.fotoPreventiva.create({
            data: {
                preventivaLojaId: 'test-preventiva-id',
                itemId: 'test-item-id',
                lojaLUC: 'TEST001',
                tipoEquipamento: 'SENSOR_TEMPERATURA',
                url: 'C:\\preventivas\\TEST001\\2024-01-09\\SENSOR_TEMPERATURA\\test.jpg',
                descricao: 'Test photo for debugging',
                mimeType: 'image/jpeg',
                fileSize: 1024,
                dataCaptura: new Date(),
                tecnico: 'Test Technician'
            }
        });

        console.log("Test photo created:", testPhoto);

        res.status(200).json({
            success: true,
            data: testPhoto
        });

    } catch (error) {
        console.error('Error testing photo save:', error);
        res.status(500).json({
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}