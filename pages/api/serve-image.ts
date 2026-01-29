// pages/api/serve-image.ts
// API route for serving images for all modules

import type { NextApiRequest, NextApiResponse } from 'next';

import path from 'path';
import fs from 'fs';

// Map of modules to their image directories
const MODULE_PATHS: Record<string, string> = {
  'access-control': path.join(process.cwd(), 'public', 'images', 'access-control'),
  'lojas': path.join('C:', 'imagensLayoutLojas'),
  'atuadores-loja': path.join(process.cwd(), 'public', 'images', 'lojas'),
  'sensores-loja': path.join('C:', 'imagensDefeitos', 'sensores-loja'),
  'cms': path.join(process.cwd(), 'public', 'images', 'cms'),
  'cvf': path.join(process.cwd(), 'public', 'images', 'cvf'),
  'corretivas': path.join('C:', 'imagensCorretivas'),
  'colaboradores': path.join(process.cwd(), 'public', 'images', 'colaboradores'),
  'ocorrencias': path.join('C:', 'imagensOcorrencia'),
  'default': path.join(process.cwd(), 'public', 'images', 'default')
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { imagePath, module } = req.query;

    // Validate parameters
    if (!imagePath || Array.isArray(imagePath)) {
      return res.status(400).json({ error: 'Invalid image path' });
    }

    if (!module || Array.isArray(module)) {
      return res.status(400).json({ error: 'Invalid module' });
    }

    // Get the base directory for the module
    const baseDir = MODULE_PATHS[module as string] || MODULE_PATHS['default'];

    // Normalize imagePath to handle both forward and backward slashes
    const normalizedImagePath = (imagePath as string).replace(/\\/g, '/');

    // Construct the full file path
    const fullPath = path.join(baseDir, normalizedImagePath);

    // Security check: ensure the file is within the allowed directory
    if (!fullPath.startsWith(baseDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      // Try default image
      const defaultPath = path.join(MODULE_PATHS['default'], 'default.png');
      if (fs.existsSync(defaultPath)) {

        const imageBuffer = fs.readFileSync(defaultPath);

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.status(200).send(imageBuffer);
        return;
      }

      return res.status(404).json({ error: 'Image not found' });
    }

    // Read and serve the image
    const imageBuffer = fs.readFileSync(fullPath);

    // Set appropriate headers
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = getContentType(ext);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to get content type based on file extension
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };

  return contentTypes[ext] || 'image/png';
}

// Increase body parser limit for this endpoint
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};