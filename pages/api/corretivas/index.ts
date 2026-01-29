/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { corretivas_status } from "@prisma/client";
import { IncomingForm, File } from "formidable";
// Using local image storage instead of Cloudinary
import * as fs from "fs";
import { randomUUID } from "crypto";

export const config = { api: { bodyParser: false } };

// Helper para parsear o formulário
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

// Helper to test database connectivity
const testDatabaseConnection = async () => {
  try {
    // Try a simple query to test connectivity
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test database connectivity
    const isDatabaseConnected = await testDatabaseConnection();
    if (!isDatabaseConnected) {
      return res.status(500).json({
        success: false,
        error: "Não foi possível conectar ao banco de dados.",
        details: "Verifique as configurações de conexão com o banco de dados."
      });
    }

    switch (req.method) {
      case "GET":
        try {
          // Fetch all corretivas with their fotos
          const corretivas = await prisma.corretivas.findMany({
            orderBy: { data: "desc" },
            include: {
              fotocorretiva: {
                select: {
                  id: true,
                  url: true,
                  createdAt: true
                }
              }
            }
          });

          return res.status(200).json({
            success: true,
            data: corretivas
          });
        } catch (error: any) {
          console.error("Erro GET /api/corretivas:", error);
          return res.status(500).json({
            success: false,
            error: "Erro interno do servidor ao buscar corretivas.",
            details: error.message || error.toString()
          });
        }

      case "POST":
        try {
          // Using local image storage - skipping Cloudinary validation

          const { fields, files } = await parseForm(req);

          const getField = (f: any) => (Array.isArray(f) ? f[0] : f);
          const data = getField(fields.data);
          const descricao = getField(fields.descricao);
          const local = getField(fields.local);
          const colaborador = getField(fields.colaborador);
          const solicitacao = getField(fields.solicitacao);
          const solicitante = getField(fields.solicitante);
          const status = getField(fields.status);
          const dataConclusao = getField(fields.dataConclusao);
          const sistema = getField(fields.sistema);
          const categoria = getField(fields.categoria);
          const formaCorrecao = getField(fields.formaCorrecao);
          const imagePaths = fields.imagePaths ? (Array.isArray(fields.imagePaths) ? fields.imagePaths : [fields.imagePaths]) : [];

          // Validação de campos obrigatórios
          const requiredFields = { data, descricao, local, solicitacao, solicitante, status };
          for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) return res.status(400).json({
              success: false,
              error: `O campo '${key}' é obrigatório.`
            });
          }

          if (!Object.values(corretivas_status).includes(status as corretivas_status)) {
            return res.status(400).json({
              success: false,
              error: `Status inválido. Deve ser um dos seguintes: ${Object.values(corretivas_status).join(", ")}.`,
            });
          }

          if (colaborador && status === corretivas_status.ESPERA) {
            return res.status(400).json({
              success: false,
              error: "Não é possível atribuir colaborador se o status for 'ESPERA'."
            });
          }

          // Handle image paths from local storage (similar to access-control)
          let localImageUrls: { url: string }[] = [];
          if (imagePaths && imagePaths.length > 0) {
            // Convert local file paths to URLs using the general serve-image API
            localImageUrls = imagePaths.map((path: string) => ({
              url: `/api/serve-image?imagePath=${encodeURIComponent(path)}&module=corretivas`
            }));
          }

          // Processa fotos
          let fotosArray: { url: string }[] = [];
          if (files.file) {
            const fileArray = Array.isArray(files.file) ? files.file : [files.file as File];

            if (fileArray.length + localImageUrls.length > 4) {
              return res.status(400).json({
                success: false,
                error: "Máximo de 4 imagens por corretiva"
              });
            }

            // Upload files to local storage
            const uploadPromises = fileArray.map(async (f: File) => {
              try {
                // Read file buffer
                const buffer = await fs.promises.readFile(f.filepath);
                
                // Save to local storage
                const fileName = `${randomUUID()}_${f.originalFilename || 'image.jpg'}`;
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
                throw new Error(`Falha no upload da imagem: ${(uploadError as Error).message}`);
              }
            });

            try {
              fotosArray = await Promise.all(uploadPromises);
            } catch (uploadError) {
              return res.status(500).json({
                success: false,
                error: "Erro ao fazer upload das imagens",
                details: (uploadError as Error).message
              });
            }
          }

          // Combine local images and Cloudinary images
          const allImages = [...localImageUrls, ...fotosArray];

          const novaCorretiva = await prisma.corretivas.create({
            data: {
              data: new Date(data),
              descricao,
              local,
              solicitacao,
              solicitante,
              status: status as corretivas_status,
              colaborador: colaborador || null,
              dataConclusao: dataConclusao ? new Date(dataConclusao) : null,
              sistema: sistema || null,
              categoria: categoria || null,
              formaCorrecao: formaCorrecao || null,
              fotocorretiva: {
                create: allImages.map(foto => ({
                  url: foto.url
                }))
              },
            } as any, // Type assertion to bypass the TypeScript error
            include: { fotocorretiva: true },
          });

          return res.status(201).json({
            success: true,
            data: novaCorretiva
          });
        } catch (error: any) {
          console.error("Erro POST /api/corretivas:", error);
          return res.status(500).json({
            success: false,
            error: "Erro interno do servidor ao criar corretiva.",
            details: error.message || error.toString()
          });
        }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });
    }
  } catch (error) {
    console.error("Unhandled error in /api/corretivas:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor.",
      details: (error as Error).message || "Erro desconhecido ocorreu durante o processamento."
    });
  }
}