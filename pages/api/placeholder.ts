// pages/api/placeholder.ts
// API route for serving placeholder images with query parameters

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { width = '400', height = '300', text = 'Imagem n達o encontrada' } = req.query;

        // Validate parameters
        const widthNum = parseInt(width as string);
        const heightNum = parseInt(height as string);

        if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
            return res.status(400).json({ error: 'Invalid dimensions' });
        }

        // Create SVG placeholder
        const svgContent = `
      <svg width="${widthNum}" height="${heightNum}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)" opacity="0.1"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6c757d" text-anchor="middle" dominant-baseline="middle">
          ${text}
        </text>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e9ecef"/>
            <stop offset="100%" stop-color="#dee2e6"/>
          </linearGradient>
        </defs>
      </svg>
    `.trim();

        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.status(200).send(svgContent);
    } catch (error) {
        console.error('Error generating placeholder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}