import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Fetch all data from the database
        const [
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
        ] = await Promise.all([
            prisma.cM.findMany(),
            prisma.equipamento.findMany(),
            prisma.atuador.findMany(),
            prisma.sensor.findMany(),
            prisma.loja.findMany(),
            prisma.equipamentoLoja.findMany(),
            prisma.atuadorLoja.findMany(),
            prisma.sensorLoja.findMany(),
            prisma.corretivas.findMany({
                include: {
                    fotocorretiva: true
                }
            }),
            prisma.colaborador.findMany(),
            prisma.cvf.findMany()
        ]);

        // Create the export object
        const exportData = {
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
            cvfs,
            exportedAt: new Date().toISOString()
        };

        // Convert to JSON string
        const jsonData = JSON.stringify(exportData, null, 2);

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="DBJsonVeih.json"');
        res.setHeader('Content-Length', Buffer.byteLength(jsonData));

        // Send the JSON data as a file
        res.status(200).send(jsonData);
    } catch (error) {
        console.error('Error exporting data:', error);
        // More detailed error response
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Failed to export data',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            res.status(500).json({
                error: 'Failed to export data',
                message: 'Unknown error occurred'
            });
        }
    }
}