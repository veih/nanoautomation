// pages/api/preventivas/lojas/estatisticas.ts
// API endpoint for store preventive statistics and reports

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Define proper types for reduce accumulators
interface StatusCount {
    [key: string]: number;
}

interface MonthlyStats {
    [key: string]: number;
}

interface StoreStats {
    [key: string]: number;
}

interface EquipmentStats {
    [key: string]: number;
}

interface TechnicianStats {
    [key: string]: number;
}

// Prisma where clause types
interface PreventivaWhereClause {
    dataAgendada: {
        gte: Date;
        lte: Date;
    };
    lojaLUC?: string;
}

interface FotoWhereClause {
    preventivaLoja: {
        dataAgendada: {
            gte: Date;
            lte: Date;
        };
        lojaLUC?: string;
    };
}

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const { periodo, lojaLUC } = req.query;

        // Calculate date range
        const hoje = new Date();
        let dataInicio: Date;
        const dataFim: Date = hoje;

        switch (periodo) {
            case '7dias':
                dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30dias':
                dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90dias':
                dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'ano':
                dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
                break;
            default:
                dataInicio = new Date(hoje.getFullYear(), 0, 1); // Current year
        }

        // Build where clause for preventives
        const wherePreventiva: PreventivaWhereClause = {
            dataAgendada: {
                gte: dataInicio,
                lte: dataFim
            }
        };

        if (lojaLUC) {
            wherePreventiva.lojaLUC = lojaLUC as string;
        }

        // Simplified queries to avoid circular reference issues
        const totalPreventivas = await prisma.preventivaLoja.count({
            where: wherePreventiva
        });

        // Get preventives grouped by status using findMany + manual grouping
        const allPreventivas = await prisma.preventivaLoja.findMany({
            where: wherePreventiva,
            select: {
                status: true
            }
        });

        const preventivasPorStatus = allPreventivas.reduce((acc: StatusCount, preventiva: { status: string }) => {
            const status = preventiva.status;
            if (!acc[status]) {
                acc[status] = 0;
            }
            acc[status]++;
            return acc;
        }, {});

        // Get preventives by month
        const preventivasPorMes = await prisma.preventivaLoja.findMany({
            where: wherePreventiva,
            select: {
                dataAgendada: true
            }
        });

        const preventivasMensais = preventivasPorMes.reduce((acc: MonthlyStats, preventiva: { dataAgendada: Date }) => {
            const mes = new Date(preventiva.dataAgendada).toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
            if (!acc[mes]) {
                acc[mes] = 0;
            }
            acc[mes]++;
            return acc;
        }, {});

        // Get top stores
        const allPreventivasLojas = await prisma.preventivaLoja.findMany({
            where: wherePreventiva,
            select: {
                lojaLUC: true
            }
        });

        const topLojasMap = allPreventivasLojas.reduce((acc: StoreStats, preventiva: { lojaLUC: string }) => {
            const luc = preventiva.lojaLUC;
            if (!acc[luc]) {
                acc[luc] = 0;
            }
            acc[luc]++;
            return acc;
        }, {});

        const topLojas = Object.entries(topLojasMap)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([lojaLUC, quantidade]) => ({
                lojaLUC,
                quantidade
            }));

        // Get total photos
        const whereFoto: FotoWhereClause = {
            preventivaLoja: {
                dataAgendada: {
                    gte: dataInicio,
                    lte: dataFim
                }
            }
        };

        if (lojaLUC) {
            whereFoto.preventivaLoja.lojaLUC = lojaLUC as string;
        }

        const fotosRegistradas = await prisma.fotoPreventiva.count({
            where: whereFoto
        });

        // Get photos by equipment type
        const allFotos = await prisma.fotoPreventiva.findMany({
            where: whereFoto,
            select: {
                tipoEquipamento: true
            }
        });

        const fotosPorTipo = allFotos.reduce((acc: EquipmentStats, foto: { tipoEquipamento: string }) => {
            const tipo = foto.tipoEquipamento;
            if (!acc[tipo]) {
                acc[tipo] = 0;
            }
            acc[tipo]++;
            return acc;
        }, {});

        // Get technician performance
        const tecnicosConcluidos = await prisma.preventivaLoja.findMany({
            where: {
                ...wherePreventiva,
                status: 'CONCLUIDA',
                tecnico: {
                    not: null
                }
            },
            select: {
                tecnico: true
            }
        });

        const tecnicosPerformance = tecnicosConcluidos.reduce((acc: TechnicianStats, preventiva: { tecnico: string | null }) => {
            const tecnico = preventiva.tecnico;
            if (tecnico && !acc[tecnico]) {
                acc[tecnico] = 0;
            }
            if (tecnico) {
                acc[tecnico]++;
            }
            return acc;
        }, {});

        // Calculate completion rate
        const concluidas = preventivasPorStatus['CONCLUIDA'] || 0;
        const taxaConclusao = totalPreventivas > 0 ? (concluidas / totalPreventivas) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                periodo: {
                    inicio: dataInicio.toISOString().split('T')[0],
                    fim: dataFim.toISOString().split('T')[0]
                },
                resumo: {
                    totalPreventivas,
                    taxaConclusao: taxaConclusao.toFixed(1),
                    fotosRegistradas,
                    lojasAtendidas: Object.keys(topLojasMap).length
                },
                porStatus: Object.entries(preventivasPorStatus).map(([status, quantidade]) => ({
                    status,
                    quantidade,
                    percentual: totalPreventivas > 0 ? ((quantidade as number / totalPreventivas) * 100).toFixed(1) : '0'
                })),
                evolucaoMensal: preventivasMensais,
                topLojas,
                fotosPorTipo: Object.entries(fotosPorTipo).map(([tipoEquipamento, quantidade]) => ({
                    tipoEquipamento,
                    quantidade
                })),
                tecnicosPerformance: Object.entries(tecnicosPerformance).map(([tecnico, preventivasConcluidas]) => ({
                    tecnico,
                    preventivasConcluidas
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}