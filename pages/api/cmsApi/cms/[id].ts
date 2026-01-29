// pages/api/cms/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';
import prisma from '../../../../lib/prisma';
// Importa o tipo de erro conhecido do Prisma para tratamento específico

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  // Certifica-se de que 'id' é uma string, pois req.query pode retornar string ou array de strings
  const cmsId = Array.isArray(id) ? id[0] : id;

  if (!cmsId) {
    return res.status(400).json({ error: 'ID do CM é obrigatório.' });
  }

  if (req.method === 'GET') {
    try {
      // Buscar um CM específico, incluindo seus equipamentos relacionados, e os atuadores e sensores desses equipamentos
      const cm = await prisma.cM.findUnique({
        where: { id: String(cmsId) },
        include: {
          equipamentos: {
            include: {
              atuadores: true,
              sensores: true,
            },
          },
        },
      });

      if (!cm) {
        return res.status(404).json({ error: 'CM não encontrado.' });
      }
      res.status(200).json(cm);
    } catch (error: unknown) { // Explicitamente tipado como unknown
      console.error(`Erro ao buscar CM ${cmsId}:`, error);
      // Para acessar a mensagem do erro, verificamos se é uma instância de Error
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
      res.status(500).json({ error: `Erro interno do servidor ao buscar CM: ${errorMessage}` });
    }
  } else if (req.method === 'PUT') {
    // Tipagem para os dados do corpo da requisição
    // Usamos Partial<CM> para indicar que nem todos os campos são obrigatórios na atualização
    const { nome, localizacao }: { nome?: string; localizacao?: string } = req.body;

    // Verifica se pelo menos um campo foi fornecido para atualização
    if (nome === undefined && localizacao === undefined) {
      return res.status(400).json({ error: 'Nenhum campo válido fornecido para atualização.' });
    }

    try {
      const updatedCm = await prisma.cM.update({
        where: { id: String(cmsId) },
        data: {
          // Apenas inclui os campos se eles forem fornecidos na requisição
          ...(nome !== undefined && { nome }),
          ...(localizacao !== undefined && { localizacao }),
        },
      });
      res.status(200).json(updatedCm);
    } catch (error: unknown) { // Explicitamente tipado como unknown
      console.error(`Erro ao atualizar CM ${cmsId}:`, error);
      // Prisma pode lançar erros específicos, como P2025 para registro não encontrado
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'CM não encontrado para atualização.' });
        }
      }
      // Para outros erros, ou se não for um erro conhecido do Prisma
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
      res.status(500).json({ error: `Erro interno do servidor ao atualizar CM: ${errorMessage}` });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.cM.delete({
        where: { id: String(cmsId) },
      });
      res.status(200).json({ success: true, message: 'CM removido com sucesso.' }); // Return JSON instead of 204
    } catch (error: unknown) { // Explicitamente tipado como unknown
      console.error(`Erro ao deletar CM ${cmsId}:`, error);
      // Prisma pode lançar erros específicos, como P2025 para registro não encontrado
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'CM não encontrado para exclusão.' });
        }
      }
      // Para outros erros, ou se não for um erro conhecido do Prisma
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
      res.status(500).json({ error: `Erro interno do servidor ao excluir CM: ${errorMessage}` });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
