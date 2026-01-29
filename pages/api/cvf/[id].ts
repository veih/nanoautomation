/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/cvf/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// Handler para GET - buscar CVF por ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({
        error: true,
        message: 'ID do CVF inválido.',
        code: 'INVALID_ID'
      });
    }

    const cvf = await prisma.cvf.findUnique({
      where: { id },
    });

    if (!cvf) {
      return res.status(404).json({
        error: true,
        message: 'CVF não encontrado.',
        code: 'NOT_FOUND'
      });
    }

    return res.status(200).json(cvf);
  } catch (error: any) {
    console.error('Database error in CVF API:', error);

    // Handle database connection errors specifically
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
      return res.status(503).json({
        error: true,
        message: 'Database connection failed. Please check your database configuration.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    // Handle Prisma errors
    if (error.code) {
      return res.status(500).json({
        error: true,
        message: `Database error: ${error.message}`,
        code: error.code,
        details: error.meta
      });
    }

    // Generic error
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch CVF data',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
}

// Handler para PUT - atualizar CVF
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({
        error: true,
        message: 'ID do CVF inválido.',
        code: 'INVALID_ID'
      });
    }

    const {
      vigaFria,
      piso,
      sensorTemperatura,
      sensorUmidade,
      localizacaoQuadro,
      localizacaoValvula,
      atuador,
      observacoes
    } = req.body;

    // Validate enum values
    const validSensorTemperaturaValues = ['OPERACIONAL', 'DEFEITO', 'N_A'];
    const validSensorUmidadeValues = ['OPERACIONAL', 'DEFEITO', 'N_A'];

    if (sensorTemperatura && !validSensorTemperaturaValues.includes(sensorTemperatura)) {
      return res.status(400).json({
        error: true,
        message: `Valor inválido para sensorTemperatura: ${sensorTemperatura}. Valores válidos: ${validSensorTemperaturaValues.join(', ')}`,
        code: 'INVALID_ENUM_VALUE'
      });
    }

    if (sensorUmidade && !validSensorUmidadeValues.includes(sensorUmidade)) {
      return res.status(400).json({
        error: true,
        message: `Valor inválido para sensorUmidade: ${sensorUmidade}. Valores válidos: ${validSensorUmidadeValues.join(', ')}`,
        code: 'INVALID_ENUM_VALUE'
      });
    }

    const updateData: any = {
      vigaFria: vigaFria || null,
      piso: piso || null,
      localizacaoQuadro: localizacaoQuadro || null,
      localizacaoValvula: localizacaoValvula || null,
      atuador: atuador || null,
      observacoes: observacoes || null,
    };

    // Only add enum values if they are valid
    if (sensorTemperatura) {
      updateData.sensorTemperatura = sensorTemperatura;
    }
    if (sensorUmidade) {
      updateData.sensorUmidade = sensorUmidade;
    }

    const updatedCvf = await prisma.cvf.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(updatedCvf);
  } catch (error: any) {
    console.error('Error updating CVF:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack
    });

    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
      return res.status(503).json({
        error: true,
        message: 'Database connection failed. Please check your database configuration.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    // Handle Prisma errors (especially record not found)
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: true,
        message: 'CVF não encontrado.',
        code: 'NOT_FOUND'
      });
    }

    if (error.code) {
      return res.status(500).json({
        error: true,
        message: `Database error: ${error.message}`,
        code: error.code,
        details: error.meta
      });
    }

    // Generic error
    return res.status(500).json({
      error: true,
      message: 'Failed to update CVF',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
}

// Handler para DELETE - deletar CVF
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({
        error: true,
        message: 'ID do CVF inválido.',
        code: 'INVALID_ID'
      });
    }

    // Delete the CVF
    const deletedCvf = await prisma.cvf.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'CVF removido com sucesso.', deletedCvf });
  } catch (error: any) {
    console.error('Error deleting CVF:', error);

    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
      return res.status(503).json({
        error: true,
        message: 'Database connection failed. Please check your database configuration.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    // Handle Prisma errors (especially record not found)
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: true,
        message: 'CVF não encontrado.',
        code: 'NOT_FOUND'
      });
    }

    if (error.code) {
      return res.status(500).json({
        error: true,
        message: `Database error: ${error.message}`,
        code: error.code,
        details: error.meta
      });
    }

    // Generic error
    return res.status(500).json({
      error: true,
      message: 'Failed to delete CVF',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({
        error: true,
        message: `Method ${req.method} Not Allowed`
      });
  }
}