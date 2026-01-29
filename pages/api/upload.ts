import { NextApiRequest, NextApiResponse } from "next";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { IncomingForm, File as FormidableFile } from "formidable";

export const config = {
    api: {
        bodyParser: false, // necessário para upload de arquivos
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end("Método não permitido");

    // Using local image storage - skipping Cloudinary validation

    try {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: "Erro ao parsear o formulário",
                    details: err.message
                });
            }

            // Check if files.file exists and handle undefined case
            const fileArray = files.file
                ? (Array.isArray(files.file) ? files.file : [files.file])
                : [];

            if (fileArray.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Nenhum arquivo enviado"
                });
            }

            try {
                const uploadPromises = fileArray.map(async (file: FormidableFile | FormidableFile[]) => {
                    // Handle case where file might be an array (though this shouldn't happen with the above logic)
                    if (Array.isArray(file)) {
                        throw new Error("Formato de arquivo inválido");
                    }

                    // Read file buffer
                    const fsPromises = (await import('fs')).promises;
                    const buffer = await fsPromises.readFile(file.filepath);

                    // Upload to Cloudinary
                    const result = await uploadToCloudinary(buffer, file.originalFilename || undefined);
                    return result;
                });

                const results = await Promise.all(uploadPromises);

                res.status(200).json({
                    success: true,
                    message: "Uploads realizados com sucesso",
                    files: results
                });
            } catch (uploadError: unknown) {
                console.error("Erro no upload para Cloudinary:", uploadError);
                res.status(500).json({
                    success: false,
                    error: "Erro no upload para Cloudinary",
                    details: (uploadError as Error).message
                });
            }
        });
    } catch (err: unknown) {
        console.error("Erro geral no upload:", err);
        res.status(500).json({
            success: false,
            error: "Erro geral no upload",
            details: (err as Error).message
        });
    }
}