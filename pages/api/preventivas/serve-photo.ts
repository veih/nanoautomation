// pages/api/preventivas/serve-photo.ts
// API endpoint to serve photos from C:\preventivas folder

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { filepath } = req.query;

        if (!filepath || typeof filepath !== 'string') {
            return res.status(400).json({ error: 'File path is required' });
        }

        // Security: Ensure the path is within C:\preventivas
        const fullPath = path.resolve(filepath);
        const baseDir = path.resolve('C:\\preventivas');

        if (!fullPath.startsWith(baseDir)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Check if it's actually a file (not a directory)
        const stat = fs.statSync(fullPath);
        if (!stat.isFile()) {
            return res.status(400).json({ error: 'Path is not a file' });
        }

        // Get file extension to determine content type
        const ext = path.extname(fullPath).toLowerCase();
        const contentTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';

        // Set headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

        // Stream the file
        const fileStream = fs.createReadStream(fullPath);

        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error reading file' });
            }
        });

    } catch (error) {
        console.error('Error serving photo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}