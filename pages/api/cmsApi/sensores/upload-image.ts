/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/cmsApi/sensores/upload-image.ts
// Esta rota de API é usada para fazer upload de imagens de sensores com defeito.

import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Configuração do formidable para processar formulários multipart
export const config = {
    api: {
        bodyParser: false,
    },
};

// Inicializa o PrismaClient.
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!(global as any).prisma) {
        (global as any).prisma = new PrismaClient();
    }
    prisma = (global as any).prisma;
}

// Função para garantir que um diretório exista
const ensureDirectoryExistence = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Função para salvar imagem no sistema de arquivos
const saveImageFile = (file: any, sensorId: string, index: number): string => {
    // Define o diretório base para sensores
    const serviceDirectory = path.join('C:/imagensDefeitos', 'cms', 'sensores');
    ensureDirectoryExistence(serviceDirectory);

    // Gera um nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${sensorId}_${index}_${timestamp}${path.extname(file.originalFilename || '')}`;
    const filePath = path.join(serviceDirectory, fileName);

    // Move o arquivo do diretório temporário para o diretório de destino
    fs.renameSync(file.filepath, filePath);

    // Retorna o caminho relativo para armazenamento no banco de dados
    // Use forward slashes for URL compatibility
    return path.posix.join('cms', 'sensores', fileName);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Método ${req.method} não permitido.` });
    }

    try {
        // Parse do formulário usando formidable
        const form = formidable({
            multiples: true, // Permite múltiplos arquivos
            maxFileSize: 5 * 1024 * 1024, // Limite de 5MB por arquivo
            keepExtensions: true, // Mantém as extensões dos arquivos
        });

        const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        const sensorId = Array.isArray(fields.sensorId) ? fields.sensorId[0] : fields.sensorId;

        // Validação do ID do sensor
        if (!sensorId || typeof sensorId !== 'string') {
            return res.status(400).json({ message: 'ID do sensor é obrigatório.' });
        }

        // Verifica se o sensor existe
        const sensor: any = await prisma.$queryRaw`SELECT * FROM sensores WHERE id = ${sensorId}`;

        if (!sensor || sensor.length === 0) {
            return res.status(404).json({ message: 'Sensor não encontrado.' });
        }

        const sensorData = sensor[0];

        // Processa os arquivos
        const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images];

        const imagePaths: string[] = [];

        // Processa cada arquivo
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];

            // Verifica se é um arquivo válido
            if (!file || !file.filepath) {
                continue;
            }

            // Salva a imagem no sistema de arquivos
            const imagePath = saveImageFile(file, sensorId, i);
            imagePaths.push(imagePath);
        }

        // Atualiza o sensor com os caminhos das imagens
        const currentImagePaths = sensorData.imagePaths ? JSON.parse(sensorData.imagePaths) : [];
        const updatedImagePaths = [...currentImagePaths, ...imagePaths];

        await prisma.$executeRaw`UPDATE sensores SET imagePaths = ${JSON.stringify(updatedImagePaths)} WHERE id = ${sensorId}`;

        return res.status(200).json({
            message: 'Imagens enviadas com sucesso!',
            imagePaths: updatedImagePaths
        });
    } catch (error: any) {
        console.error('Erro ao fazer upload de imagens:', error);
        return res.status(500).json({
            message: 'Erro interno do servidor ao fazer upload de imagens.',
            error: error.message
        });
    }
}