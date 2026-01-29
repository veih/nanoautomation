// pages/api/preventivas/lojas/fotos.ts
// API endpoint for fetching preventiva lojas photos

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const { lojaLUC, tipoEquipamento, dataInicio, dataFim, limit = '50' } = req.query;

        const limitNumber = parseInt(limit as string);

        // Build where clause
        const where = {} as {
            lojaLUC?: string;
            tipoEquipamento?: string;
            dataCaptura?: { gte?: Date; lte?: Date };
        };

        if (lojaLUC) {
            where.lojaLUC = lojaLUC as string;
        }

        if (tipoEquipamento) {
            where.tipoEquipamento = tipoEquipamento as string;
        }

        if (dataInicio || dataFim) {
            where.dataCaptura = {};
            if (dataInicio) {
                where.dataCaptura.gte = new Date(dataInicio as string);
            }
            if (dataFim) {
                where.dataCaptura.lte = new Date(dataFim as string);
            }
        }

        // Fetch photos with related preventiva data
        const fotos = await prisma.fotoPreventiva.findMany({
            where,
            take: limitNumber,
            orderBy: {
                dataCaptura: 'desc'
            },
            include: {
                preventivaLoja: {
                    select: {
                        lojaNome: true,
                        status: true,
                        tecnico: true
                    }
                }
            }
        });

        // Transform data to match frontend interface
        const fotosFormatadas = fotos.map(foto => ({
            id: foto.id,
            itemId: foto.itemId,
            lojaLUC: foto.lojaLUC,
            lojaNome: foto.preventivaLoja?.lojaNome || 'Loja Desconhecida',
            tipoEquipamento: foto.tipoEquipamento,
            url: foto.url,
            descricao: foto.descricao,
            dataCaptura: foto.dataCaptura.toISOString().split('T')[0],
            tecnico: foto.tecnico
        }));

        res.status(200).json({
            success: true,
            data: fotosFormatadas,
            total: fotos.length
        });

    } catch (error) {
        console.error('Error fetching preventiva photos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}