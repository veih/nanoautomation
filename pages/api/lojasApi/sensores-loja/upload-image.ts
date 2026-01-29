// pages/api/lojasApi/sensores-loja/upload-image.ts
// API route for uploading images for sensors in stores

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
const saveBase64Image = (base64Data: string, sensorId: string, index: number): string => {
    // Remove header if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Create buffer from base64
    const buffer = Buffer.from(base64Image, 'base64');

    // Define directory and file path for store sensors
    const serviceDirectory = path.join('C:/imagensDefeitos', 'sensores-loja');
    ensureDirectoryExists(serviceDirectory);

    // Use a placeholder for new sensors until they get an ID
    const effectiveSensorId = sensorId || 'new_sensor_temp';
    const fileName = `${effectiveSensorId}_${index}_${Date.now()}.png`;
    const filePath = path.join(serviceDirectory, fileName);

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Return the file name for database storage (relative to the main directory)
    // Use forward slashes for URL compatibility
    return path.posix.join('sensores-loja', fileName);
};

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { sensorId, images } = req.body;

        // Validate required fields
        if (!images || !Array.isArray(images)) {
            return sendError(res, {
                message: "images array is required",
                statusCode: 400
            });
        }

        // sensorId is optional for new sensors, but if provided, validate it
        if (sensorId !== undefined && !sensorId) {
            return sendError(res, {
                message: "sensorId cannot be empty if provided",
                statusCode: 400
            });
        }

        // Save images to file system
        const imagePaths: string[] = [];
        for (let i = 0; i < images.length; i++) {
            const imagePath = saveBase64Image(images[i], sensorId || 'new_sensor', i);
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