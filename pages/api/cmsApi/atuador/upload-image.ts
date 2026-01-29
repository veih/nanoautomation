// pages/api/cmsApi/atuador/upload-image.ts
// API route for uploading images for actuators

import type { NextApiRequest, NextApiResponse } from 'next';
import { withMethodHandler, sendSuccess, sendError } from '../../../../lib/api-utils';
import fs from 'fs';
import path from 'path';

// Ensure the directory exists
const ensureDirectoryExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Save base64 image to file system
const saveBase64Image = (base64Data: string, atuadorId: string, index: number): string => {
    // Remove header if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Create buffer from base64
    const buffer = Buffer.from(base64Image, 'base64');

    // Define directory and file path for actuators
    const serviceDirectory = path.join('C:/imagensDefeitos', 'atuadores');
    ensureDirectoryExists(serviceDirectory);

    const fileName = `${atuadorId}_${index}_${Date.now()}.png`;
    const filePath = path.join(serviceDirectory, fileName);

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Return the file name for database storage (relative to the main directory)
    // Use forward slashes for URL compatibility
    return path.posix.join('atuadores', fileName);
};

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { atuadorId, images } = req.body;

        if (!atuadorId || !images || !Array.isArray(images)) {
            return sendError(res, {
                message: "atuadorId and images array are required",
                statusCode: 400
            });
        }

        // Save images to file system
        const imagePaths: string[] = [];
        for (let i = 0; i < images.length; i++) {
            const imagePath = saveBase64Image(images[i], atuadorId, i);
            imagePaths.push(imagePath);
        }

        // Save image paths to database would happen in the main API
        // For now, we just return the paths
        sendSuccess(res, { imagePaths });
    } catch (error) {
        console.error("Error uploading images:", error);
        sendError(res, {
            message: "Failed to upload images",
            statusCode: 500
        });
    }
}

export default withMethodHandler({
    POST: handlePost
});

// Disable default body parser for file uploads
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb' // Set desired value here
        }
    }
};