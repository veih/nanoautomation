// Loja repository implementation

import { BaseRepository } from './BaseRepository';
import { Loja } from '@prisma/client';

export interface LojaWithRelations extends Loja {
  atuadores?: any[];
  equipamentosLoja?: any[];
  fireDetectionEquipment?: any[];
  sensores?: any[];
  preventivas?: any[];
}

export class LojaRepository extends BaseRepository<LojaWithRelations> {
  constructor() {
    super('loja');
  }

  // Get loja with all relations
  async findByIdWithRelations(id: string): Promise<LojaWithRelations | null> {
    return this.findById(id, {
      atuadores: true,
      equipamentosLoja: {
        include: {
          atuadoresLoja: true,
          sensoresLoja: true,
        },
      },
      fireDetectionEquipment: true,
      sensores: true,
      preventivas: {
        include: {
          checklist: true,
          fotos: true,
        },
      },
    });
  }

  // Get loja by LUC (unique identifier)
  async findByLUC(luc: string): Promise<LojaWithRelations | null> {
    return this.findOne(
      { LUC: luc },
      {
        atuadores: true,
        equipamentosLoja: true,
        fireDetectionEquipment: true,
        sensores: true,
      }
    );
  }

  // Get lojas with defect counts
  async getLojasWithDefectStats(): Promise<any[]> {
    try {
      const lojas = await this.findAll({}, {
        include: {
          equipamentosLoja: {
            where: {
              status: 'DEFEITO',
            },
          },
          sensores: {
            where: {
              estado: 'DEFEITO',
            },
          },
          atuadores: {
            where: {
              estado: 'DEFEITO',
            },
          },
        },
      });

      return lojas.map(loja => ({
        ...loja,
        totalDefeitos: 
          (loja.equipamentosLoja?.length || 0) +
          (loja.sensores?.length || 0) +
          (loja.atuadores?.length || 0),
        equipamentosDefeituosos: loja.equipamentosLoja?.length || 0,
        sensoresDefeituosos: loja.sensores?.length || 0,
        atuadoresDefeituosos: loja.atuadores?.length || 0,
      }));
    } catch (error: any) {
      throw this.handleError(error, 'getLojasWithDefectStats');
    }
  }

  // Search lojas by name or LUC
  async search(searchTerm: string, page: number = 1, limit: number = 10): Promise<any> {
    const where = {
      OR: [
        {
          nome: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          LUC: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    };

    return this.findPaginated(page, limit, where, {
      orderBy: {
        nome: 'asc',
      },
    });
  }

  // Get lojas statistics
  async getStatistics(): Promise<any> {
    try {
      const [
        totalLojas,
        lojasComDefeitos,
        lojasSemDefeitos,
      ] = await Promise.all([
        this.count(),
        this.count({
          OR: [
            {
              equipamentosLoja: {
                some: {
                  status: 'DEFEITO',
                },
              },
            },
            {
              sensores: {
                some: {
                  estado: 'DEFEITO',
                },
              },
            },
            {
              atuadores: {
                some: {
                  estado: 'DEFEITO',
                },
              },
            },
          ],
        }),
        this.count({
          equipamentosLoja: {
            none: {
              status: 'DEFEITO',
            },
          },
          sensores: {
            none: {
              estado: 'DEFEITO',
            },
          },
          atuadores: {
            none: {
              estado: 'DEFEITO',
            },
          },
        }),
      ]);

      return {
        total: totalLojas,
        comDefeitos: lojasComDefeitos,
        semDefeitos: lojasSemDefeitos,
        taxaDefeitos: totalLojas > 0 ? (lojasComDefeitos / totalLojas) * 100 : 0,
      };
    } catch (error: any) {
      throw this.handleError(error, 'getStatistics');
    }
  }

  // Update loja image
  async updateImage(id: string, imagePath: string): Promise<Loja> {
    return this.update(id, { imagem: imagePath });
  }

  // Remove loja image
  async removeImage(id: string): Promise<Loja> {
    return this.update(id, { imagem: null });
  }
}

// Export singleton instance
export const lojaRepository = new LojaRepository();