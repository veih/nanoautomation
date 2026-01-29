// pages/api/lojasApi/fire-detection-equipment/[id].ts
// This API route handles operations on a specific fire detection equipment by ID

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { withMethodHandler, sendSuccess, sendError, NotFoundError } from '@/lib/api-utils';

// Handler for GET - get a specific fire detection equipment by ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return sendError(res, {
                message: 'ID is required',
                statusCode: 400,
                code: 'VALIDATION_ERROR'
            });
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TypeScript is not recognizing the fireDetectionEquipmentLoja model
        const equipment = await prisma.fireDetectionEquipmentLoja.findUnique({
            where: {
                id,
            },
            include: {
                loja: true,
            },
        });

        if (!equipment) {
            throw new NotFoundError('Fire detection equipment not found');
        }

        sendSuccess(res, equipment);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return sendError(res, {
                message: 'Fire detection equipment not found',
                statusCode: 404,
                code: 'NOT_FOUND'
            });
        }

        console.error('Error fetching fire detection equipment:', error);
        sendError(res, {
            message: 'Failed to fetch fire detection equipment',
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Handler for PUT - update a specific fire detection equipment by ID
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return sendError(res, {
                message: 'ID is required',
                statusCode: 400,
                code: 'VALIDATION_ERROR'
            });
        }

        const {
            nome,
            tipo,
            modelo,
            existe,
            comissionada,
            tipoLoja,
            lacoDetec,
            v24Dc2,
            stGas,
            cmdAlarme,
            stAlarme,
            stFalha,
        }: {
            nome?: string;
            tipo?: string;
            modelo?: string | null;
            existe?: boolean;
            comissionada?: boolean;
            tipoLoja?: string;
            lacoDetec?: string;
            v24Dc2?: boolean;
            stGas?: boolean;
            cmdAlarme?: boolean;
            stAlarme?: boolean;
            stFalha?: boolean;
        } = req.body;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TypeScript is not recognizing the fireDetectionEquipmentLoja model
        const updatedEquipment = await prisma.fireDetectionEquipmentLoja.update({
            where: {
                id,
            },
            data: {
                nome,
                tipo,
                modelo,
                existe,
                comissionada,
                tipoLoja,
                lacoDetec,
                v24Dc2,
                stGas,
                cmdAlarme,
                stAlarme,
                stFalha,
            },
            include: {
                loja: true,
            },
        });

        sendSuccess(res, updatedEquipment);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return sendError(res, {
                message: 'Fire detection equipment not found',
                statusCode: 404,
                code: 'NOT_FOUND'
            });
        }

        // Type assertion to access the code property
        const prismaError = error as Error & { code?: string };
        if (prismaError.code === 'P2025') {
            return sendError(res, {
                message: 'Fire detection equipment not found',
                statusCode: 404,
                code: 'NOT_FOUND'
            });
        }

        console.error('Error updating fire detection equipment:', error);
        sendError(res, {
            message: 'Failed to update fire detection equipment',
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Handler for DELETE - delete a specific fire detection equipment by ID
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return sendError(res, {
                message: 'ID is required',
                statusCode: 400,
                code: 'VALIDATION_ERROR'
            });
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TypeScript is not recognizing the fireDetectionEquipmentLoja model
        const deletedEquipment = await prisma.fireDetectionEquipmentLoja.delete({
            where: {
                id,
            },
        });

        sendSuccess(res, deletedEquipment);
    } catch (error) {
        // Type assertion to access the code property
        const prismaError = error as Error & { code?: string };
        if (prismaError.code === 'P2025') {
            return sendError(res, {
                message: 'Fire detection equipment not found',
                statusCode: 404,
                code: 'NOT_FOUND'
            });
        }

        console.error('Error deleting fire detection equipment:', error);
        sendError(res, {
            message: 'Failed to delete fire detection equipment',
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

export default withMethodHandler({
    GET: handleGet,
    PUT: handlePut,
    DELETE: handleDelete,
});