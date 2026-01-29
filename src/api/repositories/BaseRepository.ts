// Base repository class for standardized database operations

import prisma from '@/lib/prisma';
import { AppError, ErrorCode, HttpStatus } from '@/src/utils/api-utils';

export abstract class BaseRepository<T> {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  // Get Prisma model instance
  protected getModel() {
    return (prisma as any)[this.modelName];
  }

  // Find all records with optional filters
  async findAll(filters?: any, options?: {
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<T[]> {
    try {
      const model = this.getModel();
      return await model.findMany({
        where: filters,
        include: options?.include,
        orderBy: options?.orderBy,
        skip: options?.skip,
        take: options?.take,
      });
    } catch (error: any) {
      throw this.handleError(error, 'findAll');
    }
  }

  // Find record by ID
  async findById(id: string, include?: any): Promise<T | null> {
    try {
      const model = this.getModel();
      return await model.findUnique({
        where: { id },
        include,
      });
    } catch (error: any) {
      throw this.handleError(error, 'findById');
    }
  }

  // Find first record matching criteria
  async findOne(where: any, include?: any): Promise<T | null> {
    try {
      const model = this.getModel();
      return await model.findFirst({
        where,
        include,
      });
    } catch (error: any) {
      throw this.handleError(error, 'findOne');
    }
  }

  // Create new record
  async create(data: any, include?: any): Promise<T> {
    try {
      const model = this.getModel();
      return await model.create({
        data,
        include,
      });
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  // Update record by ID
  async update(id: string, data: any, include?: any): Promise<T> {
    try {
      const model = this.getModel();
      return await model.update({
        where: { id },
        data,
        include,
      });
    } catch (error: any) {
      throw this.handleError(error, 'update');
    }
  }

  // Delete record by ID
  async delete(id: string): Promise<T> {
    try {
      const model = this.getModel();
      return await model.delete({
        where: { id },
      });
    } catch (error: any) {
      throw this.handleError(error, 'delete');
    }
  }

  // Count records with optional filters
  async count(where?: any): Promise<number> {
    try {
      const model = this.getModel();
      return await model.count({ where });
    } catch (error: any) {
      throw this.handleError(error, 'count');
    }
  }

  // Check if record exists
  async exists(where: any): Promise<boolean> {
    try {
      const count = await this.count(where);
      return count > 0;
    } catch (error: any) {
      throw this.handleError(error, 'exists');
    }
  }

  // Bulk create records
  async createMany(data: any[]): Promise<T[]> {
    try {
      const model = this.getModel();
      return await model.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error: any) {
      throw this.handleError(error, 'createMany');
    }
  }

  // Update many records
  async updateMany(where: any, data: any): Promise<any> {
    try {
      const model = this.getModel();
      return await model.updateMany({
        where,
        data,
      });
    } catch (error: any) {
      throw this.handleError(error, 'updateMany');
    }
  }

  // Delete many records
  async deleteMany(where: any): Promise<any> {
    try {
      const model = this.getModel();
      return await model.deleteMany({ where });
    } catch (error: any) {
      throw this.handleError(error, 'deleteMany');
    }
  }

  // Find with pagination
  async findPaginated(page: number = 1, limit: number = 10, filters?: any, options?: {
    include?: any;
    orderBy?: any;
  }): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [data, totalCount] = await Promise.all([
        this.findAll(filters, {
          ...options,
          skip,
          take: limit,
        }),
        this.count(filters),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'findPaginated');
    }
  }

  // Error handling with standardized format
  protected handleError(error: any, operation: string): AppError {
    console.error(`Repository Error in ${operation}:`, error);
    
    // Handle Prisma specific errors
    if (error.code) {
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          return {
            message: 'Record already exists with these values',
            code: ErrorCode.VALIDATION_ERROR,
            status: HttpStatus.CONFLICT,
            details: error.meta,
          };
        case 'P2025': // Record not found
          return {
            message: 'Record not found',
            code: ErrorCode.NOT_FOUND,
            status: HttpStatus.NOT_FOUND,
            details: error.meta,
          };
        case 'P2003': // Foreign key constraint
          return {
            message: 'Cannot perform operation due to foreign key constraint',
            code: ErrorCode.VALIDATION_ERROR,
            status: HttpStatus.BAD_REQUEST,
            details: error.meta,
          };
        default:
          return {
            message: `Database error: ${error.message}`,
            code: ErrorCode.DATABASE_ERROR,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            details: error.meta,
          };
      }
    }

    // Generic error
    return {
      message: error.message || 'An unexpected error occurred',
      code: ErrorCode.INTERNAL_ERROR,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      details: error,
    };
  }
}