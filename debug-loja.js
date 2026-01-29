const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugLoja() {
    try {
        // Replace with the actual loja ID you want to debug
        const lojaId = 'e9a9b0c8-802f-402a-84fa-54b95d95786d';

        console.log(`Debugging loja with ID: ${lojaId}`);

        // Fetch the loja with all related entities
        const loja = await prisma.loja.findUnique({
            where: { id: lojaId },
            include: {
                equipamentosLoja: {
                    include: {
                        atuadoresLoja: true,
                        sensoresLoja: true,
                    },
                },
                atuadores: true,
                sensores: true,
                fireDetectionEquipment: true,
            },
        });

        console.log('Loja data:', JSON.stringify(loja, null, 2));

        // Also check individual counts
        const equipamentosCount = await prisma.equipamentoLoja.count({
            where: { lojaId: lojaId }
        });

        const atuadoresCount = await prisma.atuadorLoja.count({
            where: { lojaId: lojaId }
        });

        const sensoresCount = await prisma.sensorLoja.count({
            where: { lojaId: lojaId }
        });

        console.log(`Counts - Equipamentos: ${equipamentosCount}, Atuadores: ${atuadoresCount}, Sensores: ${sensoresCount}`);

    } catch (error) {
        console.error('Error debugging loja:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLoja();