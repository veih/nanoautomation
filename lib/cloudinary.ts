import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

// Convert buffer to stream for Cloudinary upload
const bufferToStream = (buffer: Buffer): Readable => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
};

// Upload a single file to Cloudinary
export const uploadToCloudinary = async (
    buffer: Buffer,
    filename?: string
): Promise<{ url: string; public_id: string }> => {
    // Check if Cloudinary is properly configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary não está configurado corretamente. Verifique as variáveis de ambiente.");
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "corretivas",
                public_id: filename,
                overwrite: false,
                resource_type: "image",
            },
            (error: Error | undefined, result: UploadApiResponse | undefined) => {
                if (error) {
                    reject(new Error(`Erro no upload para Cloudinary: ${error.message}`));
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                } else {
                    reject(new Error("Upload para Cloudinary falhou sem erro específico"));
                }
            }
        );

        bufferToStream(buffer).pipe(uploadStream);
    });
};

// Delete a file from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
    try {
        // Check if Cloudinary is properly configured
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
            !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
            !process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET) {
            console.error("Cloudinary não está configurado corretamente para deletar arquivos.");
            return { success: false, error: "Cloudinary não configurado" };
        }

        const result = await cloudinary.uploader.destroy(publicId);
        return { success: true, result };
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return { success: false, error };
    }
};

// Bulk delete files from Cloudinary
export const bulkDeleteFromCloudinary = async (publicIds: string[]) => {
    try {
        // Only log in development environment
        if (process.env.NODE_ENV === 'development') {
            console.log("Attempting to delete from Cloudinary:");
            console.log("Public IDs:", publicIds);
        }

        // Check if publicIds array is empty
        if (publicIds.length === 0) {
            console.log("No public IDs to delete from Cloudinary");
            return { success: true, result: { deleted: {}, deleted_counts: {} } };
        }

        // Check if Cloudinary is properly configured
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
            !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
            !process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET) {
            console.error("Cloudinary não está configurado corretamente para deletar arquivos em massa.");
            return { success: false, error: "Cloudinary não configurado" };
        }

        const result = await cloudinary.api.delete_resources(publicIds);

        // Only log result in development environment
        if (process.env.NODE_ENV === 'development') {
            console.log("Cloudinary deletion result:", result);
        }

        return { success: true, result };
    } catch (error) {
        // Log errors in all environments for debugging purposes
        console.error("Error bulk deleting from Cloudinary:", error);
        return { success: false, error };
    }
};

export default cloudinary;