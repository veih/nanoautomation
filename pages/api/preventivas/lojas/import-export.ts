// pages/api/preventivas/lojas/import-export.ts
// API endpoint for importing and exporting store preventive data

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import { parse } from 'csv-parse/sync';



const prisma = new PrismaClient();

interface CsvRecord {
    lojaId?: string;
    lojaLUC: string;
    lojaNome?: string;
    dataAgendada: string;
    tecnico?: string;
    status?: string;
    observacoes?: string;
}

// Disable body parser for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            return handleImport(req, res);
        case 'GET':
            return handleExport(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

// POST /api/preventivas/lojas/import-export - Import preventives from CSV
async function handleImport(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Parse form data
        const form = formidable({});

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(500).json({ error: 'Error processing upload' });
            }

            const fileArray = files.file;
            if (!fileArray) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Read and parse CSV file
            const csvContent = fs.readFileSync(file.filepath, 'utf-8');
            const records = parse(csvContent, {
                columns: true,
                skip_empty_lines: true,
                delimiter: ';'
            });

            const resultados = {
                importados: 0,
                erros: 0,
                detalhes: [] as string[]
            };

            // Process each record
            for (const record of records as CsvRecord[]) {
                try {
                    // Validate required fields
                    if (!record.lojaLUC || !record.dataAgendada) {
                        resultados.erros++;
                        resultados.detalhes.push(`Linha inválida: LUC ou data ausente`);
                        continue;
                    }

                    // Create preventive
                    await prisma.preventivaLoja.create({
                        data: {
                            lojaId: record.lojaId || '',
                            lojaLUC: record.lojaLUC,
                            lojaNome: record.lojaNome || '',
                            dataAgendada: new Date(record.dataAgendada),
                            tecnico: record.tecnico || null,
                            // @ts-expect-error - Status validation handled by Prisma schema
                            status: record.status?.toUpperCase() || 'PENDENTE',
                            observacoes: record.observacoes || null
                        }
                    });

                    resultados.importados++;
                } catch (error) {
                    resultados.erros++;
                    resultados.detalhes.push(`Erro ao importar ${record.lojaLUC}: ${(error as Error).message}`);
                }
            }

            res.status(200).json({
                success: true,
                data: resultados
            });
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/preventivas/lojas/import-export - Export preventives to CSV
async function handleExport(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Extract query parameters and ensure they're strings (take first element if array)
        const dataInicio = Array.isArray(req.query.dataInicio) ? req.query.dataInicio[0] : req.query.dataInicio;
        const dataFim = Array.isArray(req.query.dataFim) ? req.query.dataFim[0] : req.query.dataFim;
        const status = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;
        const lojaLUC = Array.isArray(req.query.lojaLUC) ? req.query.lojaLUC[0] : req.query.lojaLUC;

        // Build where clause
        const where: {
            dataAgendada?: { gte?: Date; lte?: Date };
            status?: import('@prisma/client').PreventivaStatus;
            lojaLUC?: { contains: string };
        } = {};

        if (dataInicio && typeof dataInicio === 'string') {
            where.dataAgendada = { gte: new Date(dataInicio) };
        }
        if (dataFim && typeof dataFim === 'string') {
            where.dataAgendada = {
                ...(where.dataAgendada || {}),
                lte: new Date(dataFim)
            };
        }
        if (status && typeof status === 'string') {
            // Validate that status is a valid PreventivaStatus enum value
            const validStatuses = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'] as const;
            if ((validStatuses as readonly string[]).includes(status)) {
                where.status = status as import('@prisma/client').PreventivaStatus;
            }
        }
        if (lojaLUC && typeof lojaLUC === 'string') {
            where.lojaLUC = { contains: lojaLUC };
        }

        // Fetch data with proper relations
        const preventivas = await prisma.preventivaLoja.findMany({
            where,
            include: {
                checklist: true,
                fotos: true
            },
            orderBy: {
                dataAgendada: 'desc'
            }
        });

        // Generate CSV content
        const headers = [
            'ID',
            'Loja LUC',
            'Loja Nome',
            'Data Agendada',
            'Data Execução',
            'Status',
            'Técnico',
            'Itens Checklist',
            'Fotos Registradas',
            'Observações'
        ];

        const csvRows = [
            headers.join(';'),
            ...preventivas.map(prev => [
                prev.id,
                prev.lojaLUC,
                prev.lojaNome,
                prev.dataAgendada.toISOString().split('T')[0],
                prev.dataExecucao ? prev.dataExecucao.toISOString().split('T')[0] : '',
                prev.status,
                prev.tecnico || '',
                // NOTE: Relations are included in query
                prev.checklist.length.toString(),
                // NOTE: Relations are included in query
                prev.fotos.length.toString(),
                `"${prev.observacoes || ''}"` // Escape quotes
            ].join(';'))
        ];

        const csvContent = csvRows.join('\n');

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=preventivas_lojas.csv');

        res.status(200).send(csvContent);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}