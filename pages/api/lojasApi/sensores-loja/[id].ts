// pages/api/sensores-loja/[id].ts
// Esta rota de API dinâmica é usada para interagir com um sensor de loja específico pelo seu ID.

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { withMethodHandler, sendSuccess, NotFoundError, ValidationError } from '../../../../lib/api-utils';
import { SensorStatus } from '../../../../types';

// Helper para validar ID
function validateId(id: string | string[] | undefined): string {
  if (typeof id !== 'string') {
    throw new ValidationError('ID do sensor inválido.');
  }
  return id;
}

// Handler para GET - buscar sensor por ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  const sensor = await prisma.sensorLoja.findUnique({
    where: { id },
    include: { // Inclui relacionamentos para exibir informações completas
      loja: true,
      equipamentoLoja: true,
    },
  });

  if (!sensor) {
    throw new NotFoundError('Sensor de loja não encontrado.');
  }

  sendSuccess(res, sensor);
}

// Handler para PUT - atualizar sensor
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  // Recebe os dados do corpo da requisição, que podem ser parciais.
  const { nome, tipo, estado, ultimaAtivacao, existe, motivoNaoExiste, descricaoDefeito, lojaId, equipamentoLojaId } = req.body;

  // Cria um objeto de dados para atualização, incluindo apenas os campos que foram fornecidos.
  const dataToUpdate: Record<string, unknown> = {};
  if (nome !== undefined) dataToUpdate.nome = nome;
  if (tipo !== undefined) dataToUpdate.tipo = tipo;

  // Convert string estado to SensorStatus enum if provided
  if (estado !== undefined) {
    if (estado === null) {
      dataToUpdate.estado = undefined;
    } else if (Object.values(SensorStatus).includes(estado as SensorStatus)) {
      dataToUpdate.estado = estado as SensorStatus;
    } else {
      // Handle invalid estado values gracefully
      console.warn(`Invalid estado value received: ${estado}. Ignoring this field.`);
    }
  }

  if (ultimaAtivacao !== undefined) dataToUpdate.ultimaAtivacao = ultimaAtivacao ? new Date(ultimaAtivacao).toISOString() : undefined;
  if (existe !== undefined) dataToUpdate.existe = existe;
  if (motivoNaoExiste !== undefined) dataToUpdate.motivoNaoExiste = motivoNaoExiste;
  if (descricaoDefeito !== undefined) dataToUpdate.descricaoDefeito = descricaoDefeito;
  if (lojaId !== undefined) dataToUpdate.lojaId = lojaId;
  if (equipamentoLojaId !== undefined) dataToUpdate.equipamentoLojaId = equipamentoLojaId;

  // Se nenhum dado for fornecido, retorna um erro.
  if (Object.keys(dataToUpdate).length === 0) {
    throw new ValidationError('Nenhum dado fornecido para atualização.');
  }

  const updatedSensor = await prisma.sensorLoja.update({
    where: { id },
    data: dataToUpdate,
  });

  sendSuccess(res, updatedSensor);
}

// Handler para DELETE - deletar sensor
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const id = validateId(req.query.id);

  try {
    await prisma.sensorLoja.delete({
      where: { id },
    });

    sendSuccess(res, { message: 'Sensor removido com sucesso.' }, 200);
  } catch (error: unknown) {
    // If the sensor doesn't exist (P2025), it might have been deleted by cascade
    if (error instanceof Error && 'code' in error && (error as Error & { code?: string }).code === 'P2025') {
      sendSuccess(res, { message: 'Sensor já foi removido.' }, 200);
    } else {
      throw error;
    }
  }
}

export default withMethodHandler({
  GET: handleGet,
  PUT: handlePut,
  DELETE: handleDelete,
});