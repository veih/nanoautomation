// pages/api/cmsApi/cms/index.ts
// Esta rota de API é usada para listar todas as Casas de Máquinas (CMs)
// e para criar novas CMs.

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { withMethodHandler, sendSuccess, validateData } from '../../../../lib/api-utils';
import { cmSchema } from '../../../../lib/validations';

// Handler para GET - buscar todas as CMs
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // Buscar todos os CMs, incluindo seus Equipamentos, Atuadores e Sensores relacionados.
  const cms = await prisma.cM.findMany({
    include: {
      equipamentos: {
        include: {
          atuadores: true,
          sensores: true,
        },
      },
    },
    orderBy: {
      nome: 'asc'
    }
  });

  sendSuccess(res, cms);
}

// Handler para POST - criar nova CM
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const validation = validateData(cmSchema, req.body);

  if (!validation.success) {
    throw new Error(validation.errors.join(', '));
  }

  const { nome, localizacao } = validation.data;

  const novoCm = await prisma.cM.create({
    data: {
      nome,
      localizacao,
    },
  });

  sendSuccess(res, novoCm, 201);
}

export default withMethodHandler({
  GET: handleGet,
  POST: handlePost,
});
