// pages/api/lojasApi/fire-detection-equipment/index.ts
// This API route handles listing all fire detection equipment and creating new equipment

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { withMethodHandler, sendSuccess, sendError } from '@/lib/api-utils';

// Handler for GET - list all fire detection equipment with optional filtering
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { lojaId } = req.query;

        // Build where clause for filtering
        const where: Record<string, unknown> = {};
        if (lojaId && typeof lojaId === 'string') {
            where.lojaId = lojaId;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TypeScript is not recognizing the fireDetectionEquipmentLoja model
        const equipment = await prisma.fireDetectionEquipmentLoja.findMany({
            where,
            include: {
                loja: true,
            },
        });

        sendSuccess(res, { equipment });
    } catch (error) {
        console.error('Error fetching fire detection equipment:', error);
        sendError(res, {
            message: 'Failed to fetch fire detection equipment',
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Handler for POST - create new fire detection equipment
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const {
            nome,
            tipo,
            modelo,
            existe,
            lojaId,
            comissionada,
            tipoLoja,
            lacoDetec,
            v24Dc2,
            stGas,
            cmdAlarme,
            stAlarme,
            stFalha,
        }: {
            nome: string;
            tipo: string;
            modelo?: string;
            existe?: boolean;
            lojaId: string;
            comissionada?: boolean;
            tipoLoja?: string;
            lacoDetec?: string;
            v24Dc2?: boolean;
            stGas?: boolean;
            cmdAlarme?: boolean;
            stAlarme?: boolean;
            stFalha?: boolean;
        } = req.body;

        // Validate required fields
        if (!nome || !tipo || !lojaId) {
            return sendError(res, {
                message: 'Nome, tipo, and lojaId are required',
                statusCode: 400,
                code: 'VALIDATION_ERROR'
            });
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TypeScript is not recognizing the fireDetectionEquipmentLoja model
        const newEquipment = await prisma.fireDetectionEquipmentLoja.create({
            data: {
                nome,
                tipo,
                modelo: modelo || null,
                existe: existe !== undefined ? existe : true,
                lojaId,
                comissionada: comissionada !== undefined ? comissionada : false,
                tipoLoja: tipoLoja || '',
                lacoDetec: lacoDetec || '',
                v24Dc2: v24Dc2 !== undefined ? v24Dc2 : false,
                stGas: stGas !== undefined ? stGas : false,
                cmdAlarme: cmdAlarme !== undefined ? cmdAlarme : false,
                stAlarme: stAlarme !== undefined ? stAlarme : false,
                stFalha: stFalha !== undefined ? stFalha : false,
            },
            include: {
                loja: true,
            },
        });

        sendSuccess(res, newEquipment, 201);
    } catch (error) {
        console.error('Error creating fire detection equipment:', error);
        sendError(res, {
            message: 'Failed to create fire detection equipment',
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

export default withMethodHandler({
    GET: handleGet,
    POST: handlePost,
});