import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import cloudinary from '../../lib/cloudinary';
import { FotoCorretiva } from '../../types';

export const config = {
    api: {
        bodyParser: false, // Disable body parsing for this endpoint
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get all fotoCorretiva records from the database
        const allFotos = await prisma.fotocorretiva.findMany();

        if (allFotos.length === 0) {
            return res.status(200).json({
                message: 'No fotos found in database',
                processed: 0,
                deleted: 0
            });
        }

        console.log(`Found ${allFotos.length} fotos to check`);

        // Extract public IDs from URLs
        const publicIds = allFotos.map((foto: FotoCorretiva) => {
            try {
                // Handle different URL formats that Cloudinary might generate
                // Format 1: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
                // Format 2: https://res.cloudinary.com/cloud_name/image/upload/folder/filename.jpg
                const url = new URL(foto.url);
                const pathname = url.pathname;
                const parts = pathname.split('/');

                // Find the index of 'upload' in the path
                const uploadIndex = parts.indexOf('upload');
                if (uploadIndex === -1) {
                    console.warn("Could not find 'upload' in URL path:", foto.url);
                    return null;
                }

                // Get everything after 'upload/'
                const afterUpload = parts.slice(uploadIndex + 1);

                if (afterUpload.length === 0) {
                    console.warn("No path segments after 'upload' in URL:", foto.url);
                    return null;
                }

                // Check if the first part after 'upload' is a version (starts with 'v' followed by digits)
                let publicIdParts = afterUpload;
                if (afterUpload[0] && /^v\d+$/.test(afterUpload[0])) {
                    // Skip the version part
                    publicIdParts = afterUpload.slice(1);
                }

                if (publicIdParts.length === 0) {
                    console.warn("No path segments after version in URL:", foto.url);
                    return null;
                }

                // Join the parts and remove file extension
                const fullPath = publicIdParts.join('/');
                const publicId = fullPath.replace(/\.[^/.]+$/, ''); // Remove extension

                return {
                    id: foto.id,
                    url: foto.url,
                    publicId: publicId
                };
            } catch (error) {
                console.error("Error extracting public ID from URL:", foto.url, error);
                return null;
            }
        }).filter(Boolean) as { id: string; url: string; publicId: string }[];

        console.log(`Extracted ${publicIds.length} valid public IDs`);

        // Check which images exist in Cloudinary
        // Cloudinary's explicit API can be used to check if resources exist
        const fotosToDelete: string[] = [];

        // Process in batches to avoid rate limiting
        const batchSize = 10;
        for (let i = 0; i < publicIds.length; i += batchSize) {
            const batch = publicIds.slice(i, i + batchSize);

            // Check each image individually
            for (const foto of batch) {
                try {
                    // Try to get resource details - this will fail if the resource doesn't exist
                    await cloudinary.api.resource(foto.publicId);
                    console.log(`Image exists in Cloudinary: ${foto.publicId}`);
                } catch (error) {
                    // If the error is "Resource not found", mark for deletion
                    // Type the error object to avoid using 'any'
                    const cloudinaryError = error as { http_code?: number; message?: string; };
                    if (cloudinaryError.http_code === 404) {
                        console.log(`Image not found in Cloudinary, marking for deletion: ${foto.publicId}`);
                        fotosToDelete.push(foto.id);
                    } else {
                        console.error(`Error checking image ${foto.publicId}:`, error);
                    }
                }
            }

            // Add a small delay between batches to avoid rate limiting
            if (i + batchSize < publicIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`Found ${fotosToDelete.length} fotos to delete from database`);

        // Delete the database records for images that don't exist in Cloudinary
        let deletedCount = 0;
        if (fotosToDelete.length > 0) {
            const deleteResult = await prisma.fotocorretiva.deleteMany({
                where: {
                    id: {
                        in: fotosToDelete
                    }
                }
            });
            deletedCount = deleteResult.count;
            console.log(`Deleted ${deletedCount} foto records from database`);
        }

        return res.status(200).json({
            message: 'Database synchronization completed',
            processed: allFotos.length,
            checked: publicIds.length,
            deleted: deletedCount
        });
    } catch (error) {
        console.error('Error synchronizing database with Cloudinary:', error);
        return res.status(500).json({
            error: 'Failed to synchronize database with Cloudinary',
            details: (error as Error).message
        });
    }
}