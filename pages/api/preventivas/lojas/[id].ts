// pages/api/preventivas/lojas/[id].ts
// API endpoint for individual store preventive operations

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Valid ID is required' });
    }

    switch (req.method) {
        case 'GET':
            return handleGet(req, res, id);
        case 'PUT':
            return handlePut(req, res, id);
        case 'DELETE':
            return handleDelete(req, res, id);
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

// GET /api/preventivas/lojas/[id] - Get specific store preventive
async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
    try {
        const preventiva = await prisma.preventivaLoja.findUnique({
            where: { id },
            include: {
                loja: true,
                checklist: {
                    orderBy: {
                        id: 'asc'
                    }
                },
                fotos: {
                    orderBy: {
                        dataCaptura: 'desc'
                    }
                }
            }
        });

        if (!preventiva) {
            return res.status(404).json({ error: 'Preventive not found' });
        }

        // Calculate completion percentage
        const totalItens = preventiva.checklist.length;
        const itensConcluidos = preventiva.checklist.filter((item: { concluido: boolean }) => item.concluido).length;
        const percentualConclusao = totalItens > 0 ? (itensConcluidos / totalItens) * 100 : 0;

        // Group photos by equipment type
        const fotosPorTipo = preventiva.fotos.reduce((acc: Record<string, unknown[]>, foto: { tipoEquipamento: string }) => {
            if (!acc[foto.tipoEquipamento]) {
                acc[foto.tipoEquipamento] = [];
            }
            acc[foto.tipoEquipamento].push(foto);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                ...preventiva,
                estatisticas: {
                    totalItens,
                    itensConcluidos,
                    percentualConclusao,
                    fotosPorTipo
                }
            }
        });

    } catch (error) {
        console.error('Error fetching preventive:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PUT /api/preventivas/lojas/[id] - Update specific store preventive
async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
    try {
        const {
            status,
            dataExecucao,
            tecnico,
            checklistUpdates,
            observacoes
        } = req.body;

        // Check if preventive exists
        const existingPreventiva = await prisma.preventivaLoja.findUnique({
            where: { id }
        });

        if (!existingPreventiva) {
            return res.status(404).json({ error: 'Preventive not found' });
        }

        // Prepare update data
        const updateData: {
            status?: import('@prisma/client').PreventivaStatus;
            dataExecucao?: Date | null;
            tecnico?: string;
            observacoes?: string;
        } = {};

        if (status !== undefined) {
            // Validate that status is a valid PreventivaStatus enum value
            const validStatuses = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'] as const;
            if (typeof status === 'string' && (validStatuses as readonly string[]).includes(status)) {
                updateData.status = status as import('@prisma/client').PreventivaStatus;
            }
        }
        if (dataExecucao !== undefined) {
            updateData.dataExecucao = dataExecucao ? new Date(dataExecucao) : null;
        }
        if (tecnico !== undefined) updateData.tecnico = tecnico;
        if (observacoes !== undefined) updateData.observacoes = observacoes;

        // Update preventive
        const updatedPreventiva = await prisma.preventivaLoja.update({
            where: { id },
            // Use proper typing for update data
            data: updateData,
            include: {
                checklist: true,
                fotos: true
            }
        });

        // Update checklist items if provided
        if (checklistUpdates && Array.isArray(checklistUpdates)) {
            for (const update of checklistUpdates) {
                await prisma.checklistItem.update({
                    where: { id: update.id },
                    data: {
                        concluido: update.concluido ?? false,
                        observacao: update.observacao,
                        fotoCapturada: update.fotoCapturada ?? false
                    }
                });
            }
        }

        res.status(200).json({
            success: true,
            data: updatedPreventiva,
            message: 'Preventive updated successfully'
        });

    } catch (error) {
        console.error('Error updating preventive:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// DELETE /api/preventivas/lojas/[id] - Delete specific store preventive
async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
    try {
        // Check if preventive exists
        const existingPreventiva = await prisma.preventivaLoja.findUnique({
            where: { id }
        });

        if (!existingPreventiva) {
            return res.status(404).json({ error: 'Preventive not found' });
        }

        // Delete related records (photos and checklist items)
        await prisma.$transaction([
            prisma.fotoPreventiva.deleteMany({
                where: { preventivaLojaId: id }
            }),
            prisma.checklistItem.deleteMany({
                where: { preventivaLojaId: id }
            }),
            prisma.preventivaLoja.delete({
                where: { id }
            })
        ]);

        res.status(200).json({
            success: true,
            message: 'Preventive deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting preventive:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}