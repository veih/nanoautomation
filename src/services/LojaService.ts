// Loja service - business logic layer

import { lojaRepository } from '@/src/api/repositories/LojaRepository';
import { AppError, ErrorCode, HttpStatus } from '@/src/utils/api-utils';
import { Loja } from '../../types'; // Import from root types directory

// Type definitions for Loja service operations
interface CreateLojaData {
  nome: string;
  LUC: string;
  localizacao?: string;
  smart?: string;
  idKron?: string;
  imagem?: string;
}

interface UpdateLojaData {
  nome?: string;
  LUC?: string;
  localizacao?: string;
  smart?: string;
  idKron?: string;
  imagem?: string;
}

interface LojaWithDefectStats extends Loja {
  totalDefeitos: number;
  equipamentosDefeituosos: number;
  sensoresDefeituosos: number;
  atuadoresDefeituosos: number;
}

// Type guard for error objects
function isErrorLike(error: unknown): error is { message?: string; code?: string; status?: number; details?: unknown } {
  return typeof error === 'object' && error !== null;
}

export class LojaService {
  // Get all lojas with defect statistics
  static async getAllLojasWithStats(): Promise<LojaWithDefectStats[]> {
    try {
      return await lojaRepository.getLojasWithDefectStats();
    } catch (error: unknown) {
      throw this.handleError(error, 'getAllLojasWithStats');
    }
  }

  // Get loja by ID with all relations
  static async getLojaById(id: string) {
    try {
      const loja = await lojaRepository.findByIdWithRelations(id);
      if (!loja) {
        throw {
          message: 'Loja not found',
          code: ErrorCode.NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      return loja;
    } catch (error: unknown) {
      throw this.handleError(error, 'getLojaById');
    }
  }

  // Get loja by LUC
  static async getLojaByLUC(luc: string) {
    try {
      const loja = await lojaRepository.findByLUC(luc);
      if (!loja) {
        throw {
          message: 'Loja not found',
          code: ErrorCode.NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }
      return loja;
    } catch (error: unknown) {
      throw this.handleError(error, 'getLojaByLUC');
    }
  }

  // Search lojas
  static async searchLojas(searchTerm: string, page: number = 1, limit: number = 10) {
    try {
      if (!searchTerm.trim()) {
        throw {
          message: 'Search term is required',
          code: ErrorCode.VALIDATION_ERROR,
          status: HttpStatus.BAD_REQUEST,
        };
      }

      return await lojaRepository.search(searchTerm, page, limit);
    } catch (error: unknown) {
      throw this.handleError(error, 'searchLojas');
    }
  }

  // Get loja statistics
  static async getLojaStatistics() {
    try {
      return await lojaRepository.getStatistics();
    } catch (error: unknown) {
      throw this.handleError(error, 'getLojaStatistics');
    }
  }

  // Create new loja
  static async createLoja(data: CreateLojaData) {
    try {
      // Validate required fields
      const requiredFields: (keyof CreateLojaData)[] = ['nome', 'LUC'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw {
          message: `Missing required fields: ${missingFields.join(', ')}`,
          code: ErrorCode.VALIDATION_ERROR,
          status: HttpStatus.BAD_REQUEST,
        };
      }

      // Check if LUC already exists
      const existingLoja = await lojaRepository.findByLUC(data.LUC);
      if (existingLoja) {
        throw {
          message: 'Loja with this LUC already exists',
          code: ErrorCode.VALIDATION_ERROR,
          status: HttpStatus.CONFLICT,
        };
      }

      return await lojaRepository.create(data);
    } catch (error: unknown) {
      throw this.handleError(error, 'createLoja');
    }
  }

  // Update loja
  static async updateLoja(id: string, data: UpdateLojaData) {
    try {
      // Verify loja exists
      const existingLoja = await lojaRepository.findById(id);
      if (!existingLoja) {
        throw {
          message: 'Loja not found',
          code: ErrorCode.NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }

      // If LUC is being updated, check uniqueness
      if (data.LUC && data.LUC !== existingLoja.LUC) {
        const lojaWithSameLUC = await lojaRepository.findByLUC(data.LUC);
        if (lojaWithSameLUC) {
          throw {
            message: 'Another loja already exists with this LUC',
            code: ErrorCode.VALIDATION_ERROR,
            status: HttpStatus.CONFLICT,
          };
        }
      }

      return await lojaRepository.update(id, data);
    } catch (error: unknown) {
      throw this.handleError(error, 'updateLoja');
    }
  }

  // Delete loja
  static async deleteLoja(id: string) {
    try {
      // Verify loja exists
      const existingLoja = await lojaRepository.findById(id);
      if (!existingLoja) {
        throw {
          message: 'Loja not found',
          code: ErrorCode.NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }

      // Check for related records that might prevent deletion
      const lojaWithRelations = await lojaRepository.findByIdWithRelations(id);
      if (lojaWithRelations) {
        const hasRelatedData = 
          (lojaWithRelations.equipamentosLoja?.length || 0) > 0 ||
          (lojaWithRelations.sensores?.length || 0) > 0 ||
          (lojaWithRelations.atuadores?.length || 0) > 0 ||
          (lojaWithRelations.preventivas?.length || 0) > 0;

        if (hasRelatedData) {
          throw {
            message: 'Cannot delete loja with associated equipment, sensors, actuators, or maintenance records',
            code: ErrorCode.VALIDATION_ERROR,
            status: HttpStatus.BAD_REQUEST,
          };
        }
      }

      return await lojaRepository.delete(id);
    } catch (error: unknown) {
      throw this.handleError(error, 'deleteLoja');
    }
  }

  // Update loja image
  static async updateLojaImage(id: string, imagePath: string) {
    try {
      const existingLoja = await lojaRepository.findById(id);
      if (!existingLoja) {
        throw {
          message: 'Loja not found',
          code: ErrorCode.NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }

      return await lojaRepository.updateImage(id, imagePath);
    } catch (error: unknown) {
      throw this.handleError(error, 'updateLojaImage');
    }
  }

  // Remove loja image
  static async removeLojaImage(id: string) {
    try {
      const existingLoja = await lojaRepository.findById(id);
      if (!existingLoja) {
        throw {
          message: 'Loja not found',
          code: ErrorCode.NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }

      return await lojaRepository.removeImage(id);
    } catch (error: unknown) {
      throw this.handleError(error, 'removeLojaImage');
    }
  }

  // Get lojas with defects report
  static async getDefectiveLojasReport() {
    try {
      const lojasWithStats = await this.getAllLojasWithStats();
      const defectiveLojas = lojasWithStats.filter(
        (loja: LojaWithDefectStats) => loja.totalDefeitos > 0
      );

      return {
        totalLojas: lojasWithStats.length,
        lojasComDefeitos: defectiveLojas.length,
        taxaDefeitos: lojasWithStats.length > 0 
          ? (defectiveLojas.length / lojasWithStats.length) * 100 
          : 0,
        lojasDefeituosas: defectiveLojas.sort(
          (a: LojaWithDefectStats, b: LojaWithDefectStats) => b.totalDefeitos - a.totalDefeitos
        ),
      };
    } catch (error: unknown) {
      throw this.handleError(error, 'getDefectiveLojasReport');
    }
  }

  // Private error handler
  private static handleError(error: unknown, operation: string): AppError {
    // If it's already an AppError, return it
    if (error && typeof error === 'object' && 'code' in error && 'status' in error) {
      return error as AppError;
    }

    // Convert generic errors to AppError using type guard
    const errorObj = isErrorLike(error) ? error : {};
    
    return {
      message: errorObj.message || 'An unexpected error occurred',
      code: ErrorCode.INTERNAL_ERROR,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      details: {
        operation,
        originalError: error,
      },
    };
  }
}

// Export singleton instance
export const lojaService = LojaService;