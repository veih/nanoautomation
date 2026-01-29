// lib/api-utils.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// ==================== TYPES ====================
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: unknown;
        field?: string;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export interface ApiError {
    message: string;
    statusCode: number;
    code?: string;
    details?: unknown;
    field?: string;
}

// ==================== ERROR CLASSES ====================
export class ValidationError extends Error {
    constructor(message: string, public field?: string, public details?: unknown) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends Error {
    constructor(message: string = 'Recurso não encontrado') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends Error {
    constructor(message: string = 'Conflito de dados') {
        super(message);
        this.name = 'ConflictError';
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string = 'Não autorizado') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

// ==================== ERROR HANDLER ====================
export function handleApiError(error: unknown): ApiError {
    console.error('API Error:', error);

    // Validation errors
    if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        return {
            message: firstError.message,
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            field: firstError.path.join('.'),
            details: error.issues
        };
    }

    // Custom application errors
    if (error instanceof ValidationError) {
        return {
            message: error.message,
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            field: error.field,
            details: error.details
        };
    }

    if (error instanceof NotFoundError) {
        return {
            message: error.message,
            statusCode: 404,
            code: 'NOT_FOUND'
        };
    }

    if (error instanceof ConflictError) {
        return {
            message: error.message,
            statusCode: 409,
            code: 'CONFLICT'
        };
    }

    if (error instanceof UnauthorizedError) {
        return {
            message: error.message,
            statusCode: 401,
            code: 'UNAUTHORIZED'
        };
    }

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return {
                    message: 'Dados duplicados. Este registro já existe.',
                    statusCode: 409,
                    code: 'DUPLICATE_ENTRY',
                    details: error.meta
                };
            case 'P2025':
                return {
                    message: 'Registro não encontrado.',
                    statusCode: 404,
                    code: 'NOT_FOUND',
                    details: error.meta
                };
            case 'P2003':
                return {
                    message: 'Violação de chave estrangeira. Verifique as dependências.',
                    statusCode: 400,
                    code: 'FOREIGN_KEY_CONSTRAINT',
                    details: error.meta
                };
            case 'P2014':
                return {
                    message: 'Operação inválida devido a dependências existentes.',
                    statusCode: 400,
                    code: 'DEPENDENCY_CONSTRAINT',
                    details: error.meta
                };
            default:
                return {
                    message: `Erro de banco de dados: ${error.message}`,
                    statusCode: 500,
                    code: error.code,
                    details: error.meta
                };
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return {
            message: 'Erro de validação nos dados enviados.',
            statusCode: 400,
            code: 'PRISMA_VALIDATION_ERROR'
        };
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
        return {
            message: 'Erro de conexão com o banco de dados.',
            statusCode: 500,
            code: 'DATABASE_CONNECTION_ERROR'
        };
    }

    // Generic errors
    if (error instanceof Error) {
        return {
            message: error.message || 'Erro interno do servidor',
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR'
        };
    }

    // Unknown errors
    return {
        message: 'Erro interno do servidor',
        statusCode: 500,
        code: 'UNKNOWN_ERROR',
        details: String(error)
    };
}

// ==================== RESPONSE HELPERS ====================
export function sendSuccess<T>(
    res: NextApiResponse,
    data: T,
    statusCode: number = 200,
    meta?: ApiResponse['meta']
): void {
    const response: ApiResponse<T> = {
        success: true,
        data,
        ...(meta && { meta })
    };
    res.status(statusCode).json(response);
}

export function sendError(
    res: NextApiResponse,
    error: ApiError
): void {
    const response: ApiResponse = {
        success: false,
        error: {
            message: error.message,
            code: error.code,
            details: error.details,
            field: error.field
        }
    };
    res.status(error.statusCode).json(response);
}

export function sendValidationError(
    res: NextApiResponse,
    message: string,
    field?: string,
    details?: unknown
): void {
    sendError(res, {
        message,
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        field,
        details
    });
}

export function sendNotFound(
    res: NextApiResponse,
    message: string = 'Recurso não encontrado'
): void {
    sendError(res, {
        message,
        statusCode: 404,
        code: 'NOT_FOUND'
    });
}

// ==================== METHOD HANDLER ====================
export function withMethodHandler(
    handlers: Record<string, (req: NextApiRequest, res: NextApiResponse) => Promise<void>>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const method = req.method;

        if (!method || !handlers[method]) {
            return sendError(res, {
                message: `Método ${method} não permitido`,
                statusCode: 405,
                code: 'METHOD_NOT_ALLOWED'
            });
        }

        try {
            await handlers[method](req, res);
        } catch (error) {
            const apiError = handleApiError(error);
            sendError(res, apiError);
        }
    };
}

// ==================== VALIDATION HELPERS ====================
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map((issue) => {
                const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
                return `${path}${issue.message}`;
            });
            return { success: false, errors };
        }
        return { success: false, errors: ['Erro de validação desconhecido'] };
    }
};

// ==================== VALIDATION MIDDLEWARE ====================
export function withValidation<T>(
    schema: z.ZodSchema<T>,
    handler: (req: NextApiRequest & { validatedData: T }, res: NextApiResponse) => Promise<void>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            const validatedData = schema.parse(req.body);
            (req as NextApiRequest & { validatedData: T }).validatedData = validatedData;
            await handler(req as NextApiRequest & { validatedData: T }, res);
        } catch (error) {
            const apiError = handleApiError(error);
            sendError(res, apiError);
        }
    };
}

// ==================== PAGINATION HELPER ====================
export function getPaginationMeta(
    page: number,
    limit: number,
    total: number
) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

// ==================== QUERY HELPERS ====================
export function parseQueryParams(req: NextApiRequest) {
    const { page = '1', limit = '10', search, status, ...filters } = req.query;

    return {
        page: Math.max(1, parseInt(page as string) || 1),
        limit: Math.min(100, Math.max(1, parseInt(limit as string) || 10)),
        search: search as string || undefined,
        status: status as string || undefined,
        filters: Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [key, value as string])
        )
    };
}