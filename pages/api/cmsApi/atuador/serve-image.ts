// pages/api/cmsApi/atuador/serve-image.ts
// API route for serving images for actuators

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { imagePath } = req.query;

        // Validate imagePath parameter
        if (!imagePath || Array.isArray(imagePath)) {
            return res.status(400).json({ message: 'Invalid image path' });
        }

        // Security check: Ensure the path is within the allowed directory
        const fullPath = path.join('C:/imagensDefeitos', imagePath);

        // Additional security: Ensure the path is within the imagensDefeitos directory
        const normalizedPath = path.normalize(fullPath);
        const allowedBasePath = path.normalize('C:/imagensDefeitos');

        if (!normalizedPath.startsWith(allowedBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if file exists
        if (!fs.existsSync(normalizedPath)) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Set appropriate headers
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year cache

        // Stream the file
        const stream = fs.createReadStream(normalizedPath);
        stream.pipe(res);

        // Handle stream errors
        stream.on('error', (err) => {
            console.error('Error serving image:', err);
            res.status(500).json({ message: 'Error serving image' });
        });
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}