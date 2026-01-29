// pages/api/lojasApi/sensores-loja/serve-image.ts
// API route for serving images for Sensores Loja devices

import type { NextApiRequest, NextApiResponse } from 'next';

// Redirect to the general serve-image API
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { imagePath } = req.query;
    const queryString = imagePath ? `?imagePath=${encodeURIComponent(imagePath as string)}&module=sensores-loja` : '?module=sensores-loja';

    res.redirect(307, `/api/serve-image${queryString}`);
}

// Disable default body parser for file serving
export const config = {
    api: {
        bodyParser: false
    }
};