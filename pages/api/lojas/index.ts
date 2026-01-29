// pages/api/lojas/index.ts
// Simple API endpoint to get basic store information (LUC and name)

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Reutiliza a instância única do PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get basic store information: id, nome, LUC
        const lojas = await prisma.loja.findMany({
            select: {
                id: true,
                nome: true,
                LUC: true
            },
            orderBy: {
                nome: 'asc'
            }
        });

        res.status(200).json({
            success: true,
            lojas: lojas
        });
    } catch (error) {
        console.error('Database error in Lojas API:', error);

        // Handle database connection errors
        // @ts-expect-error - error typing varies by database driver
        if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
            return res.status(503).json({
                error: 'Database connection failed',
                message: 'Please check your database configuration'
            });
        }

        res.status(500).json({
            error: 'Failed to fetch lojas data',
            // @ts-expect-error - error typing varies by database driver
            message: error.message
        });
    }
}