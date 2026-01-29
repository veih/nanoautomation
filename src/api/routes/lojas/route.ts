// Modern consolidated lojas API route using the new architecture

import { NextRequest } from 'next/server';
import { lojaService } from '@/src/services/LojaService';
import { AppError } from '@/src/types';
import { 
  sendJsonResponseAppRouter as sendJsonResponse, 
  sendErrorResponseAppRouter as sendErrorResponse, 
  HttpStatus,
  parseRequestBodyAppRouter as parseRequestBody,
  validateRequiredFields,
  logApiRequest,
  logApiError
} from '@/src/utils/api-utils';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    logApiRequest(request, startTime);

    switch (action) {
      case 'stats':
        const stats = await lojaService.getLojaStatistics();
        return sendJsonResponse(request, stats);
        
      case 'defective-report':
        const report = await lojaService.getDefectiveLojasReport();
        return sendJsonResponse(request, report);
        
      case 'search':
        const searchTerm = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        
        if (!searchTerm) {
          return sendErrorResponse(
            request,
            'Search term is required',
            HttpStatus.BAD_REQUEST,
            'VALIDATION_ERROR'
          );
        }
        
        const searchResults = await lojaService.searchLojas(searchTerm, page, limit);
        return sendJsonResponse(request, searchResults.data, HttpStatus.OK, {
          pagination: searchResults.pagination
        });
        
      default:
        // Get all lojas with stats
        const lojas = await lojaService.getAllLojasWithStats();
        return sendJsonResponse(request, lojas);
    }
  } catch (error: unknown) {
    logApiError(error, request);
    
    // Type guard to check if error is AppError-like
    const appError = error as Partial<AppError>;
    
    return sendErrorResponse(
      request,
      appError.message || 'Internal server error',
      appError.status || HttpStatus.INTERNAL_SERVER_ERROR,
      appError.code || 'INTERNAL_ERROR',
      appError.details as Record<string, unknown> | undefined
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await parseRequestBody(request);
    const bodyObj = body as Record<string, unknown>;
    const { action, ...data } = bodyObj;
    
    logApiRequest(request, startTime);

    switch (action) {
      case 'create':
        const requiredFields = ['nome', 'LUC'];
        const missingFields = validateRequiredFields(data, requiredFields);
        
        if (missingFields.length > 0) {
          return sendErrorResponse(
            request,
            `Missing required fields: ${missingFields.join(', ')}`,
            HttpStatus.BAD_REQUEST,
            'VALIDATION_ERROR'
          );
        }
        
        // Type assertion for CreateLojaData
        const createData = {
          nome: String(data.nome),
          LUC: String(data.LUC),
          localizacao: data.localizacao ? String(data.localizacao) : undefined,
          smart: data.smart ? String(data.smart) : undefined,
          idKron: data.idKron ? String(data.idKron) : undefined,
          imagem: data.imagem ? String(data.imagem) : undefined,
        };
        
        const newLoja = await lojaService.createLoja(createData);
        return sendJsonResponse(request, newLoja, HttpStatus.CREATED);
        
      default:
        return sendErrorResponse(
          request,
          'Invalid action',
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR'
        );
    }
  } catch (error: unknown) {
    logApiError(error, request);
    
    // Type guard to check if error is AppError-like
    const appError = error as Partial<AppError>;
    
    return sendErrorResponse(
      request,
      appError.message || 'Internal server error',
      appError.status || HttpStatus.INTERNAL_SERVER_ERROR,
      appError.code || 'INTERNAL_ERROR',
      appError.details as Record<string, unknown> | undefined
    );
  }
}

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await parseRequestBody(request);
    const bodyObj = body as Record<string, unknown>;
    const { id, action, ...data } = bodyObj;
    const lojaId = String(id);
    
    if (!lojaId) {
      return sendErrorResponse(
        request,
        'ID is required',
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }
    
    logApiRequest(request, startTime);

    switch (action) {
      case 'update':
        const updatedLoja = await lojaService.updateLoja(lojaId, data);
        return sendJsonResponse(request, updatedLoja);
        
      case 'update-image':
        if (!data.imagePath) {
          return sendErrorResponse(
            request,
            'Image path is required',
            HttpStatus.BAD_REQUEST,
            'VALIDATION_ERROR'
          );
        }
        const lojaWithImage = await lojaService.updateLojaImage(lojaId, data.imagePath as string);
        return sendJsonResponse(request, lojaWithImage);
        
      case 'remove-image':
        const lojaWithoutImage = await lojaService.removeLojaImage(lojaId);
        return sendJsonResponse(request, lojaWithoutImage);
        
      default:
        return sendErrorResponse(
          request,
          'Invalid action',
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR'
        );
    }
  } catch (error: unknown) {
    logApiError(error, request);
    
    // Type guard to check if error is AppError-like
    const appError = error as Partial<AppError>;
    
    return sendErrorResponse(
      request,
      appError.message || 'Internal server error',
      appError.status || HttpStatus.INTERNAL_SERVER_ERROR,
      appError.code || 'INTERNAL_ERROR',
      appError.details as Record<string, unknown> | undefined
    );
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return sendErrorResponse(
        request,
        'ID is required',
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }
    
    logApiRequest(request, startTime);
    
    await lojaService.deleteLoja(id);
    return sendJsonResponse(request, { message: 'Loja deleted successfully' }, HttpStatus.NO_CONTENT);
  } catch (error: unknown) {
    logApiError(error, request);
    
    // Type guard to check if error is AppError-like
    const appError = error as Partial<AppError>;
    
    return sendErrorResponse(
      request,
      appError.message || 'Internal server error',
      appError.status || HttpStatus.INTERNAL_SERVER_ERROR,
      appError.code || 'INTERNAL_ERROR',
      appError.details as Record<string, unknown> | undefined
    );
  }
}