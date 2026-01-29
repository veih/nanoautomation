// Standardized API utilities and response handlers

import { ApiResponse } from '@/src/types';
import { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';

// Re-export AppError from types
export type { AppError } from '@/src/types';

// Standard HTTP status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Standard error codes
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// Type definitions for API utilities
interface MetaData {
  [key: string]: unknown;
}

interface ErrorDetails {
  [key: string]: unknown;
}

// Create standardized success response
export function createSuccessResponse<T>(
  data: T,
  meta?: MetaData
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

// Create standardized error response
export function createErrorResponse(
  message: string,
  code: string = ErrorCode.INTERNAL_ERROR,
  details?: ErrorDetails
): ApiResponse<null> {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}

// Send standardized JSON response for App Router
export function sendJsonResponseAppRouter<T>(
  request: NextRequest,
  data: T,
  status: number = HttpStatus.OK,
  meta?: MetaData
) {
  return NextResponse.json(createSuccessResponse(data, meta), { status });
}

// Send standardized error response for App Router
export function sendErrorResponseAppRouter(
  request: NextRequest,
  message: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  code?: string,
  details?: ErrorDetails
) {
  return NextResponse.json(
    createErrorResponse(
      message,
      code || getErrorCodeFromStatus(status),
      details
    ),
    { status }
  );
}

// Parse request body with error handling for App Router
export async function parseRequestBodyAppRouter(request: NextRequest): Promise<unknown> {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const obj: Record<string, string> = {};
      formData.forEach((value, key) => {
        obj[key] = value.toString();
      });
      return obj;
    } else if (contentType.includes('multipart/form-data')) {
      // For multipart, return the raw FormData for manual processing
      return await request.formData();
    } else {
      // Try to parse as JSON, fallback to text
      try {
        return await request.json();
      } catch {
        const text = await request.text();
        return text ? { data: text } : {};
      }
    }
  } catch {
    throw new Error('Invalid request body format');
  }
}

// Helper to get error code from HTTP status
function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.VALIDATION_ERROR;
    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ErrorCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return ErrorCode.INTERNAL_ERROR;
    default:
      return ErrorCode.INTERNAL_ERROR;
  }
}

// Parse request body with error handling
export async function parseRequestBody(req: NextApiRequest): Promise<unknown> {
  try {
    return req.body ? JSON.parse(JSON.stringify(req.body)) : {};
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

// Validate required fields
export function validateRequiredFields(
  obj: Record<string, unknown>,
  requiredFields: string[]
): string[] {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}

// Standard logging for API requests (App Router compatible)
export function logApiRequest(request: NextRequest, startTime: number) {
  const duration = Date.now() - startTime;
  console.log(`API Request: ${request.method} ${request.url} - ${duration}ms`);
}

// Standard logging for API errors (App Router compatible)
export function logApiError(error: unknown, request: NextRequest) {
  console.error(`API Error: ${request.method} ${request.url}`, {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    url: request.url,
    method: request.method,
  });
}