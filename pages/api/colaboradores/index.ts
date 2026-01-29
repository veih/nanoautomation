/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/colaboradores/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { withMethodHandler, sendSuccess, validateData } from '@/lib/api-utils';
import { colaboradorSchema } from '@/lib/validations';

// Reutiliza a instância única do PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// Handler para GET - buscar todos os colaboradores
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  const colaboradores = await prisma.colaborador.findMany({
    orderBy: { nome: "asc" },
  });

  sendSuccess(res, { data: colaboradores });
}

// Handler para POST - criar novo colaborador
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  const validation = validateData(colaboradorSchema, req.body);

  if (!validation.success) {
    throw new Error(validation.errors.join(', '));
  }

  const { nome, funcao } = validation.data;

  const colaborador = await prisma.colaborador.create({
    data: { nome, funcao },
  });

  sendSuccess(res, { data: colaborador }, 201);
}

// Handler for OPTIONS requests (preflight)
async function handleOptions(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.status(200).end();
}

export default withMethodHandler({
  GET: handleGet,
  POST: handlePost,
  OPTIONS: handleOptions,
});