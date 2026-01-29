/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/cvf/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { randomUUID } from 'crypto';

// Handler para GET - buscar todos os CVFs
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const cvfs = await prisma.cvf.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Return the CVFs in the format expected by the frontend
        return res.status(200).json({
            total_items: cvfs.length,
            page: 1,
            limit: cvfs.length,
            cvfs: Array.isArray(cvfs) ? cvfs : [],
        });
    } catch (error: any) {
        console.error('Database error in CVF API:', error);

        // Handle database connection errors specifically
        if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
            return res.status(503).json({
                error: true,
                message: 'Database connection failed. Please check your database configuration.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }

        // Handle Prisma errors
        if (error.code) {
            return res.status(500).json({
                error: true,
                message: `Database error: ${error.message}`,
                code: error.code,
                details: error.meta
            });
        }

        // Generic error
        return res.status(500).json({
            error: true,
            message: 'Failed to fetch CVFs data',
            code: 'INTERNAL_ERROR',
            details: error.message
        });
    }
}

// Handler para POST - criar novo CVF
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const {
            vigaFria,
            piso,
            sensorTemperatura,
            sensorUmidade,
            localizacaoQuadro,
            localizacaoValvula,
            atuador,
            observacoes
        } = req.body;

        const novoCvf = await prisma.cvf.create({
            data: {
                id: randomUUID(), // Use the imported function
                vigaFria: vigaFria || null,
                piso: piso || null,
                sensorTemperatura: sensorTemperatura || null,
                sensorUmidade: sensorUmidade || null,
                localizacaoQuadro: localizacaoQuadro || null,
                localizacaoValvula: localizacaoValvula || null,
                atuador: atuador || null,
                observacoes: observacoes || null,
            },
        });

        return res.status(201).json(novoCvf);
    } catch (error: any) {
        console.error('Error creating CVF:', error);

        // Handle database connection errors
        if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
            return res.status(503).json({
                error: true,
                message: 'Database connection failed. Please check your database configuration.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }

        // Generic error
        return res.status(500).json({
            error: true,
            message: 'Failed to create CVF',
            code: 'INTERNAL_ERROR',
            details: error.message
        });
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({
                error: true,
                message: `Method ${req.method} Not Allowed`
            });
    }
}