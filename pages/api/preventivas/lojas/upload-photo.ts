// pages/api/preventivas/lojas/upload-photo.ts
// API endpoint for uploading preventive maintenance photos to C:\preventivas

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Increase size limit for images
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData, lojaLUC, itemId, tipoEquipamento } = req.body;

        // Validate required fields
        if (!imageData) {
            return res.status(400).json({
                error: 'Missing required field: imageData'
            });
        }

        if (!lojaLUC) {
            return res.status(400).json({
                error: 'Missing required field: lojaLUC'
            });
        }

        if (!itemId) {
            return res.status(400).json({
                error: 'Missing required field: itemId'
            });
        }

        // Validate image data format
        if (!imageData.startsWith('data:image/')) {
            return res.status(400).json({
                error: 'Invalid image data format'
            });
        }

        // Create preventivas directory if it doesn't exist
        const preventivasDir = 'C:\\preventivas';
        if (!fs.existsSync(preventivasDir)) {
            fs.mkdirSync(preventivasDir, { recursive: true });
        }

        // Create LUC-specific directory
        const lucDir = path.join(preventivasDir, lojaLUC);
        if (!fs.existsSync(lucDir)) {
            fs.mkdirSync(lucDir, { recursive: true });
        }

        // Create date-based directory (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        const dateDir = path.join(lucDir, today);
        if (!fs.existsSync(dateDir)) {
            fs.mkdirSync(dateDir, { recursive: true });
        }

        // Create equipment type directory
        const equipmentDir = path.join(dateDir, tipoEquipamento || 'outro');
        if (!fs.existsSync(equipmentDir)) {
            fs.mkdirSync(equipmentDir, { recursive: true });
        }

        // Decode base64 image data and extract MIME type
        const mimeTypeMatch = imageData.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate unique filename with better naming convention
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const cleanItemId = itemId.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${cleanItemId}_${timestamp}_${randomSuffix}.jpg`;
        const filepath = path.join(equipmentDir, filename);

        // Log the file path for debugging
        console.log(`Saving photo to: ${filepath}`);

        // Save file to disk with error handling
        try {
            fs.writeFileSync(filepath, buffer);
            console.log(`Photo successfully saved: ${filepath}`);
        } catch (writeError) {
            console.error('Error writing file to disk:', writeError);
            return res.status(500).json({
                error: 'Failed to write file to disk',
                details: writeError instanceof Error ? writeError.message : 'Unknown write error'
            });
        }

        // Return comprehensive file information
        res.status(200).json({
            success: true,
            data: {
                filename,
                filepath, // This is the Windows path that serve-photo API expects
                mimeType,
                fileSize: buffer.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error saving photo:', error);
        res.status(500).json({
            error: 'Failed to save photo',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}