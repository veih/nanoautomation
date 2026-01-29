/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { corretivas_status } from "@prisma/client";
import { IncomingForm, File } from "formidable";
// Using local image storage instead of Cloudinary
import fs from "fs";

export const config = { api: { bodyParser: false } };

const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
      multiples: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "ID da corretiva é obrigatório." });

  switch (req.method) {
    case "GET":
      try {
        const corretiva = await prisma.corretivas.findUnique({
          where: { id },
          include: { fotocorretiva: true },
        });
        if (!corretiva) return res.status(404).json({ error: "Corretiva não encontrada." });
        return res.status(200).json(corretiva);
      } catch (error) {
        console.error("Erro GET /api/corretivas/[id]:", error);
        return res.status(500).json({ error: "Erro interno ao buscar corretiva." });
      }

    case "PUT":
      try {
        console.log("Received PUT request for corretiva ID:", id);
        
        const { fields, files } = await parseForm(req);
        console.log("Parsed fields:", Object.keys(fields));
        
        const getField = (f: any) => (Array.isArray(f) ? f[0] : f);

        const data = getField(fields.data);
        const descricao = getField(fields.descricao);
        const local = getField(fields.local);
        const colaborador = getField(fields.colaborador);
        const solicitacao = getField(fields.solicitacao);
        const solicitante = getField(fields.solicitante);
        const status = getField(fields.status) as corretivas_status;
        const sistema = getField(fields.sistema);
        const categoria = getField(fields.categoria);
        const formaCorrecao = getField(fields.formaCorrecao);
        const imagePaths = fields.imagePaths ? (Array.isArray(fields.imagePaths) ? fields.imagePaths : [fields.imagePaths]) : [];
        
        console.log("Field values:", { data, descricao, local, colaborador, solicitacao, solicitante, status, sistema, categoria, formaCorrecao });

        // Busca a corretiva atual para preservar valores
        const currentCorretiva = await prisma.corretivas.findUnique({
          where: { id },
          include: { fotocorretiva: true },
        });
        if (!currentCorretiva) return res.status(404).json({ error: "Corretiva não encontrada." });

        // Se o status for CONCLUIDO e dataConclusao não enviada, define dataAtual
        const dataConclusao =
          status === corretivas_status.CONCLUIDO
            ? new Date()
            : getField(fields.dataConclusao)
              ? new Date(getField(fields.dataConclusao))
              : currentCorretiva.dataConclusao;

        // Processa novas fotos
        let fotosArray: { url: string }[] = [];
        const fileArray = files.file ? (Array.isArray(files.file) ? files.file : [files.file as File]) : [];
        const fotosExistentes = currentCorretiva.fotocorretiva || [];

        if (fotosExistentes.length + fileArray.length > 4) {
          return res.status(400).json({ error: "Não é permitido mais que 4 imagens por corretiva." });
        }

        // Handle image paths from local storage (similar to access-control)
        let localImageUrls: { url: string }[] = [];
        if (imagePaths && imagePaths.length > 0) {
          // Convert local file paths to URLs using the general serve-image API
          localImageUrls = imagePaths.map((path: string) => ({
            url: `/api/serve-image?imagePath=${encodeURIComponent(path)}&module=corretivas`
          }));
        }

        if (fileArray.length > 0) {
          // Upload files to local storage
          const uploadPromises = fileArray.map(async (f: File) => {
            try {
              // Read file buffer
              const buffer = await fs.promises.readFile(f.filepath);
              
              // Save to local storage
              const fileName = `${crypto.randomUUID()}_${f.originalFilename || 'image.jpg'}`;
              const filePath = `C:/imagensCorretivas/${fileName}`;
              
              // Ensure directory exists
              const dir = 'C:/imagensCorretivas';
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              
              // Write file
              fs.writeFileSync(filePath, buffer);
              
              // Clean up temporary file
              try {
                await fs.promises.unlink(f.filepath);
              } catch (unlinkError) {
                console.warn("Erro ao deletar arquivo temporário:", unlinkError);
              }

              // Return the URL for local storage
              return { url: `/api/serve-image?imagePath=${encodeURIComponent(fileName)}&module=corretivas` };
            } catch (uploadError) {
              // Clean up temporary file even if upload fails
              try {
                await fs.promises.unlink(f.filepath);
              } catch (unlinkError) {
                console.warn("Erro ao deletar arquivo temporário:", unlinkError);
              }

              console.error("Erro ao fazer upload para armazenamento local:", uploadError);
              throw uploadError;
            }
          });

          try {
            fotosArray = await Promise.all(uploadPromises);
          } catch (uploadError) {
            return res.status(500).json({
              error: "Erro ao fazer upload das imagens",
              details: (uploadError as Error).message
            });
          }
        }

        // Combine local images and Cloudinary images
        const allImages = [...localImageUrls, ...fotosArray];

        const corretivaAtualizada = await prisma.corretivas.update({
          where: { id },
          data: {
            data: data ? new Date(data) : currentCorretiva.data,
            descricao: descricao ?? currentCorretiva.descricao,
            local: local ?? currentCorretiva.local,
            solicitacao: solicitacao ?? currentCorretiva.solicitacao,
            solicitante: solicitante ?? currentCorretiva.solicitante,
            status: status || currentCorretiva.status,
            colaborador: colaborador ?? currentCorretiva.colaborador, // mantém se não enviado
            dataConclusao,
            sistema: sistema ?? (currentCorretiva as any).sistema,
            categoria: categoria ?? (currentCorretiva as any).categoria,
            formaCorrecao: formaCorrecao ?? (currentCorretiva as any).formaCorrecao,
            ...(allImages.length > 0
              ? {
                fotocorretiva: {
                  deleteMany: {}, // opcional: se quiser substituir fotos antigas
                  create: allImages.map(foto => ({
                    url: foto.url
                  })),
                },
              }
              : {}),
          } as any, // Type assertion to bypass the TypeScript error
          include: { fotocorretiva: true },
        });

        return res.status(200).json(corretivaAtualizada);
      } catch (error) {
        console.error("Erro PUT /api/corretivas/[id]:", error);
        return res.status(500).json({ error: "Erro interno ao atualizar corretiva." });
      }

    case "DELETE":
      try {
        // Buscar fotos relacionadas
        const fotos = await prisma.fotocorretiva.findMany({
          where: { corretivaId: id },
        });

        // Log the fotos found
        if (process.env.NODE_ENV === 'development') {
          console.log("Found fotos to delete:", fotos);
          console.log("Number of fotos found:", fotos.length);
        }

        // Check if we found any fotos
        if (fotos.length === 0) {
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log("No fotos found for corretiva ID:", id);
          }
        }

        // Extract local file paths from URLs and prepare for deletion
        const localFilePaths = fotos
          .map((f) => {
            try {
              // Only log in development environment
              if (process.env.NODE_ENV === 'development') {
                console.log("Processing URL:", f.url);
              }

              // Handle local image URLs: /api/serve-image?imagePath=filename&module=corretivas
              const url = new URL(f.url, 'http://localhost');
              const imagePath = url.searchParams.get('imagePath');
              
              if (!imagePath) {
                console.warn("Could not extract imagePath from URL:", f.url);
                return null;
              }

              // Construct full file path
              const fullPath = `C:/imagensCorretivas/${imagePath}`;
              
              if (process.env.NODE_ENV === 'development') {
                console.log("Local file path:", fullPath);
              }

              return fullPath;
            } catch (error) {
              console.error("Error extracting file path from URL:", f.url, error);
              return null;
            }
          })
          .filter(Boolean) as string[];

        if (process.env.NODE_ENV === 'development') {
          console.log("Local file paths to delete:", localFilePaths);
          console.log("Number of files to delete:", localFilePaths.length);
        }

        // Delete local files
        let localDeletionSuccessful = true;
        for (const filePath of localFilePaths) {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              if (process.env.NODE_ENV === 'development') {
                console.log(`Deleted local file: ${filePath}`);
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.log(`File not found (already deleted): ${filePath}`);
              }
            }
          } catch (deleteError) {
            console.error(`Error deleting local file ${filePath}:`, deleteError);
            // Continue with other deletions but mark as unsuccessful
            localDeletionSuccessful = false;
          }
        }

        // Proceed with database deletion regardless of file deletion success
        if (localDeletionSuccessful || localFilePaths.length === 0) {
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log("Proceeding with database deletion");
          }

          // Deletar fotos do banco
          const deletedFotos = await prisma.fotocorretiva.deleteMany({
            where: { corretivaId: id },
          });

          if (process.env.NODE_ENV === 'development') {
            console.log("Deleted fotos count:", deletedFotos.count);
          }

          // Agora deletar a corretiva
          const deletedCorretiva = await prisma.corretivas.delete({ where: { id } });

          if (process.env.NODE_ENV === 'development') {
            console.log("Deleted corretiva:", deletedCorretiva.id);
          }

          return res.status(200).json({ success: true, message: 'Corretiva removida com sucesso.' });
        } else {
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log("Some local files could not be deleted, but proceeding with database deletion");
          }
          // Still proceed with database deletion even if some files couldn't be deleted
          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log("Proceeding with database deletion despite file deletion issues");
          }
        }
      } catch (error) {
        console.error("Erro DELETE /api/corretivas/[id]:", error);
        return res.status(500).json({ error: "Erro interno ao excluir corretiva." });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}