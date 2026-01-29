// pages/api/access-control/serve-image.ts
// API route for serving images for access control devices
// This is now a wrapper for the general serve-image API

import type { NextApiRequest, NextApiResponse } from 'next';

// Simple redirect to the general serve-image API
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Redirect to the general serve-image API with module parameter
    const { imagePath } = req.query;
    const queryString = imagePath ? `?imagePath=${encodeURIComponent(imagePath as string)}&module=access-control` : '?module=access-control';

    res.redirect(307, `/api/serve-image${queryString}`);
}

// Disable default body parser for file serving
export const config = {
    api: {
        bodyParser: false
    }
};