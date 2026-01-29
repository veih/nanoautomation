// pages/api/preventivas/upload-foto.ts
// API route for uploading photos from preventive maintenance to C:\preventivas

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from "formidable";
import fs from 'fs';
import path from 'path';

// Disable default body parser for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Create base directory in C:\preventivas
        const baseDir = 'C:\\preventivas';
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }

        // Parse form data using formidable v3 API
        const form = formidable({
            multiples: false,
            uploadDir: baseDir,
            keepExtensions: true,
        });

        // Parse the form using Promise-based API
        const [fields, files] = await form.parse(req);

        // Extract fields
        const itemId = Array.isArray(fields.itemId) ? fields.itemId[0] : fields.itemId;
        const lojaLUC = Array.isArray(fields.lojaLUC) ? fields.lojaLUC[0] : fields.lojaLUC;
        const tipoEquipamento = Array.isArray(fields.tipoEquipamento) ? fields.tipoEquipamento[0] : fields.tipoEquipamento;
        const descricao = Array.isArray(fields.descricao) ? fields.descricao[0] : fields.descricao;
        const tecnico = Array.isArray(fields.tecnico) ? fields.tecnico[0] : fields.tecnico;

        // Create folder structure
        const lucDir = path.join(baseDir, lojaLUC || 'SEM_LUC');
        const tipoDir = path.join(lucDir, tipoEquipamento || 'OUTRO');

        // Ensure directories exist
        if (!fs.existsSync(lucDir)) {
            fs.mkdirSync(lucDir, { recursive: true });
        }
        if (!fs.existsSync(tipoDir)) {
            fs.mkdirSync(tipoDir, { recursive: true });
        }

        const fileArray = files.foto;
        if (!fileArray) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Handle both single file and array of files
        const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
        if (!file || !file.filepath) {
            return res.status(400).json({ error: 'No valid file uploaded' });
        }

        // Move file to final destination with proper naming
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 19).replace(/[:T]/g, '');
        const finalFilename = `${dateStr}_${random}${path.extname(file.originalFilename || '')}`;
        const finalPath = path.join(tipoDir, finalFilename);

        // Move file from temp location to final destination
        fs.renameSync(file.filepath, finalPath);

        // Create relative path for database storage
        const relativePath = `C:\\preventivas\\${lojaLUC || 'SEM_LUC'}\\${tipoEquipamento || 'OUTRO'}\\${finalFilename}`;

        // Log the file save location
        console.log(`Photo saved to: ${relativePath}`);

        // Return success response
        res.status(200).json({
            success: true,
            foto: {
                id: `foto_${timestamp}`,
                itemId: itemId || '',
                lojaLUC: lojaLUC || '',
                tipoEquipamento: tipoEquipamento || 'OUTRO',
                url: relativePath, // Full Windows path
                descricao: descricao || '',
                dataCaptura: new Date().toISOString(),
                tecnico: tecnico || '',
                tamanho: file.size,
                tipo: file.mimetype
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}