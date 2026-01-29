import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import {
    Cm,
    Equipamento,
    Atuador,
    Sensor,
    Loja,
    EquipamentoLoja,
    AtuadorLoja,
    SensorLoja,
    Colaborador,
    FotoCorretiva,
    Cvf
} from '../../types';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Increase the size limit for large imports
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            cms,
            equipamentos,
            atuadores,
            sensores,
            lojas,
            equipamentosLoja,
            atuadoresLoja,
            sensoresLoja,
            corretivas,
            colaboradores,
            cvfs
        } = req.body;

        // Start a transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
            // Clear existing data in the correct order to avoid foreign key constraints
            await tx.fotocorretiva.deleteMany();
            await tx.corretivas.deleteMany();
            await tx.colaborador.deleteMany();
            await tx.sensorLoja.deleteMany();
            await tx.atuadorLoja.deleteMany();
            await tx.equipamentoLoja.deleteMany();
            await tx.loja.deleteMany();
            await tx.sensor.deleteMany();
            await tx.atuador.deleteMany();
            await tx.equipamento.deleteMany();
            await tx.cM.deleteMany();
            await tx.cvf.deleteMany();

            // Import CMS data
            if (cms && cms.length > 0) {
                await tx.cM.createMany({
                    data: cms.map((cm: Cm) => ({
                        id: cm.id,
                        nome: cm.nome,
                        localizacao: cm.localizacao,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Equipamentos data
            if (equipamentos && equipamentos.length > 0) {
                await tx.equipamento.createMany({
                    data: equipamentos.map((eq: Equipamento) => ({
                        id: eq.id,
                        nome: eq.nome,
                        descricao: eq.descricao,
                        cmId: eq.cmId,
                        status: eq.status,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Atuadores data
            if (atuadores && atuadores.length > 0) {
                await tx.atuador.createMany({
                    data: atuadores.map((at: Atuador) => ({
                        id: at.id,
                        nome: at.nome,
                        tipo: at.tipo,
                        equipamentoId: at.equipamentoId,
                        valorAtual: at.valorAtual,
                        descricaoDefeito: at.descricaoDefeito,
                        estado: at.estado,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Sensores data
            if (sensores && sensores.length > 0) {
                await tx.sensor.createMany({
                    data: sensores.map((sn: Sensor) => ({
                        id: sn.id,
                        nome: sn.nome,
                        tipo: sn.tipo,
                        equipamentoId: sn.equipamentoId,
                        valorAtual: sn.valorAtual,
                        descricaoDefeito: sn.descricaoDefeito,
                        estado: sn.estado,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Lojas data
            if (lojas && lojas.length > 0) {
                await tx.loja.createMany({
                    data: lojas.map((lj: Loja) => ({
                        id: lj.id,
                        nome: lj.nome,
                        LUC: lj.LUC,
                        localizacao: lj.localizacao,
                        smart: lj.smart,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Equipamentos Loja data
            if (equipamentosLoja && equipamentosLoja.length > 0) {
                await tx.equipamentoLoja.createMany({
                    data: equipamentosLoja.map((eq: EquipamentoLoja) => ({
                        id: eq.id,
                        nome: eq.nome,
                        descricao: eq.descricao,
                        lojaId: eq.lojaId,
                        smart: eq.smart,
                        status: eq.status,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Atuadores Loja data
            if (atuadoresLoja && atuadoresLoja.length > 0) {
                await tx.atuadorLoja.createMany({
                    data: atuadoresLoja.map((at: AtuadorLoja) => ({
                        id: at.id,
                        nome: at.nome,
                        tipo: at.tipo,
                        equipamentoLojaId: at.equipamentoLojaId,
                        lojaId: at.lojaId,
                        valorAtual: at.valorAtual,
                        estado: at.estado,
                        descricaoDefeito: at.descricaoDefeito,
                        existe: at.existe,
                        motivoNaoExiste: at.motivoNaoExiste,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Sensores Loja data
            if (sensoresLoja && sensoresLoja.length > 0) {
                await tx.sensorLoja.createMany({
                    data: sensoresLoja.map((sn: SensorLoja) => ({
                        id: sn.id,
                        nome: sn.nome,
                        tipo: sn.tipo,
                        equipamentoLojaId: sn.equipamentoLojaId,
                        lojaId: sn.lojaId,
                        valorAtual: sn.valorAtual,
                        estado: sn.estado,
                        ultimaAtivacao: sn.ultimaAtivacao,
                        existe: sn.existe,
                        motivoNaoExiste: sn.motivoNaoExiste,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Colaboradores data
            if (colaboradores && colaboradores.length > 0) {
                await tx.colaborador.createMany({
                    data: colaboradores.map((col: Colaborador) => ({
                        id: col.id,
                        nome: col.nome,
                        funcao: col.funcao,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import CVFs data
            if (cvfs && cvfs.length > 0) {
                await tx.cvf.createMany({
                    data: cvfs.map((cvf: Cvf) => ({
                        id: cvf.id,
                        vigaFria: cvf.vigaFria,
                        piso: cvf.piso,
                        sensorTemperatura: cvf.sensorTemperatura,
                        sensorUmidade: cvf.sensorUmidade,
                        localizacaoQuadro: cvf.localizacaoQuadro,
                        localizacaoValvula: cvf.localizacaoValvula,
                        atuador: cvf.atuador,
                        observacoes: cvf.observacoes,
                    })),
                    skipDuplicates: true,
                });
            }

            // Import Corretivas data
            if (corretivas && corretivas.length > 0) {
                for (const corr of corretivas) {
                    await tx.corretivas.create({
                        data: {
                            id: corr.id,
                            data: corr.data,
                            descricao: corr.descricao,
                            local: corr.local,
                            colaborador: corr.colaborador,
                            solicitacao: corr.solicitacao,
                            solicitante: corr.solicitante,
                            status: corr.status,
                            dataConclusao: corr.dataConclusao,
                            fotocorretiva: corr.fotos ? {
                                create: corr.fotos.map((foto: FotoCorretiva) => ({
                                    url: foto.url,
                                }))
                            } : undefined,
                        },
                    });
                }
            }
        });

        res.status(200).json({ message: 'Data imported successfully' });
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ error: 'Failed to import data', details: (error as Error).message });
    }
}