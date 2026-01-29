// pages/api/preventivas/lojas/index.ts
// API endpoint for managing store preventive maintenance records

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        case 'PUT':
            return handlePut(req, res);
        case 'DELETE':
            return handleDelete(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

// GET /api/preventivas/lojas - List all store preventives
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { status, lojaLUC, dataInicio, dataFim, page = '1', limit = '10' } = req.query;

        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const skip = (pageNumber - 1) * limitNumber;

        // Build where clause
        // Build where clause dynamically
        const where = {} as {
            status?: import('@prisma/client').PreventivaStatus;
            lojaLUC?: { contains: string; mode: 'insensitive' };
            dataAgendada?: { gte?: Date; lte?: Date };
            [key: string]: unknown;
        };

        // Handle status parameter - extract first value if array, cast to enum
        if (status) {
            const statusValue = Array.isArray(status) ? status[0] : status;
            // Validate that status is a valid PreventivaStatus enum value
            const validStatuses = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'] as const;
            if ((validStatuses as readonly string[]).includes(statusValue)) {
                where.status = statusValue as import('@prisma/client').PreventivaStatus;
            }
        }

        if (lojaLUC) {
            where.lojaLUC = {
                contains: lojaLUC as string,
                mode: 'insensitive'
            };
        }

        if (dataInicio || dataFim) {
            where.dataAgendada = {};
            if (dataInicio) {
                where.dataAgendada.gte = new Date(dataInicio as string);
            }
            if (dataFim) {
                where.dataAgendada.lte = new Date(dataFim as string);
            }
        }

        const [preventivas, total] = await Promise.all([
            // NOTE: Prisma accepts dynamic where clauses in practice
            prisma.preventivaLoja.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    dataAgendada: 'desc'
                },
                include: {
                    loja: true,
                    fotos: true,
                    checklist: true
                }
            }),
            // NOTE: Prisma accepts dynamic where clauses in practice
            prisma.preventivaLoja.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: preventivas,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalItems: total,
                itemsPerPage: limitNumber
            }
        });

    } catch (error) {
        console.error('Error fetching preventives:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/preventivas/lojas - Create new store preventive
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const {
            lojaId,
            lojaLUC,
            lojaNome,
            dataAgendada,
            tecnico,
            checklist,
            observacoes
        } = req.body;

        // Validate required fields
        if (!lojaId || !lojaLUC || !dataAgendada) {
            return res.status(400).json({
                error: 'Missing required fields: lojaId, lojaLUC, and dataAgendada are required'
            });
        }

        // Create preventive record
        const preventiva = await prisma.preventivaLoja.create({
            data: {
                lojaId,
                lojaLUC,
                lojaNome: lojaNome || '',
                dataAgendada: new Date(dataAgendada),
                tecnico: tecnico || null,
                status: 'PENDENTE',
                observacoes: observacoes || null,
                checklist: {
                    create: checklist || []
                }
            },
            include: {
                checklist: true
            }
        });

        res.status(201).json({
            success: true,
            data: preventiva
        });

    } catch (error) {
        console.error('Error creating preventive:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PUT /api/preventivas/lojas - Update store preventive
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    console.log("=== PUT /api/preventivas/lojas/:id CALLED ===");
    console.log("Request query:", req.query);
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Full request body:", JSON.stringify(req.body, null, 2));

    try {
        const { id } = req.query;
        const {
            status,
            dataExecucao,
            tecnico,
            checklist,
            observacoes,
            fotos
        } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        // Check if preventive exists
        const existingPreventiva = await prisma.preventivaLoja.findUnique({
            where: { id: id as string }
        });

        if (!existingPreventiva) {
            return res.status(404).json({ error: 'Preventive not found' });
        }

        // Prepare update data
        // Prepare update data with proper typing
        const updateData = {} as {
            status?: import('@prisma/client').PreventivaStatus;
            dataExecucao?: Date;
            tecnico?: string;
            observacoes?: string;
            [key: string]: unknown;
        };

        // Handle status parameter for update - extract first value if array, cast to enum
        if (status) {
            const statusValue = Array.isArray(status) ? status[0] : status;
            // Validate that status is a valid PreventivaStatus enum value
            const validStatuses = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'] as const;
            if ((validStatuses as readonly string[]).includes(statusValue)) {
                updateData.status = statusValue as import('@prisma/client').PreventivaStatus;
            }
        }
        if (dataExecucao) updateData.dataExecucao = new Date(dataExecucao);
        if (tecnico) updateData.tecnico = tecnico;
        if (observacoes !== undefined) updateData.observacoes = observacoes;

        // Update preventive
        // NOTE: Prisma typing allows flexible updates in practice
        const preventiva = await prisma.preventivaLoja.update({
            where: { id: id as string },
            data: updateData,
            include: {
                checklist: true,
                fotos: true
            }
        });

        // Update checklist items if provided
        if (checklist && Array.isArray(checklist)) {
            for (const item of checklist) {
                if (item.id) {
                    await prisma.checklistItem.update({
                        where: { id: item.id },
                        data: {
                            concluido: item.concluido ?? false,
                            observacao: item.observacao,
                            fotoCapturada: item.fotoCapturada
                        }
                    });
                }
            }
        }

        // Add new photos if provided
        if (fotos && Array.isArray(fotos)) {
            console.log(`Processing ${fotos.length} photos for preventiva ${id}`);

            const createdPhotos = [];
            for (const foto of fotos) {
                try {
                    console.log("Creating photo record with data:", {
                        ...foto,
                        url: foto.url.substring(0, 50) + '...' // Truncate URL for logging
                    });

                    // Validate required fields
                    if (!foto.url || !foto.itemId || !foto.lojaLUC) {
                        console.warn("Skipping photo with missing required fields:", foto);
                        continue;
                    }

                    const createdPhoto = await prisma.fotoPreventiva.create({
                        data: {
                            preventivaLojaId: id as string,
                            itemId: foto.itemId,
                            lojaLUC: foto.lojaLUC,
                            tipoEquipamento: foto.tipoEquipamento || 'OUTRO',
                            url: foto.url,
                            descricao: foto.descricao || 'Foto de preventiva',
                            mimeType: foto.mimeType || 'image/jpeg',
                            fileSize: foto.fileSize || 0,
                            dataCaptura: new Date(foto.dataCaptura || new Date()),
                            tecnico: foto.tecnico || 'Técnico não especificado'
                        }
                    });

                    createdPhotos.push(createdPhoto);
                    console.log(`Successfully created photo record: ${createdPhoto.id}`);

                } catch (photoError) {
                    console.error(`Error creating photo record:`, photoError);
                    // Don't fail the entire operation for a single photo error
                    continue;
                }
            }

            console.log(`Successfully created ${createdPhotos.length} photo records`);
        } else {
            console.log("No fotos array received or not an array:", fotos);
        }

        res.status(200).json({
            success: true,
            data: preventiva
        });

    } catch (error) {
        console.error('Error updating preventive:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// DELETE /api/preventivas/lojas - Delete store preventive
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        // Check if preventive exists
        const existingPreventiva = await prisma.preventivaLoja.findUnique({
            where: { id: id as string }
        });

        if (!existingPreventiva) {
            return res.status(404).json({ error: 'Preventive not found' });
        }

        // Delete related records first (cascade delete)
        await prisma.fotoPreventiva.deleteMany({
            where: { preventivaLojaId: id as string }
        });

        await prisma.checklistItem.deleteMany({
            where: { preventivaLojaId: id as string }
        });

        // Delete main preventive record
        await prisma.preventivaLoja.delete({
            where: { id: id as string }
        });

        res.status(200).json({
            success: true,
            message: 'Preventive deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting preventive:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}