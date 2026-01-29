// Core application types and interfaces

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    totalCount?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// Error Types
export interface AppError {
  message: string;
  code: string;
  status: number;
  details?: unknown;
}

// Generic HTTP Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Component Props Base Types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// Enhanced component prop types using intersection instead of extension
export type WithChildren<T = object> = T & BaseComponentProps & {
  children?: React.ReactNode;
};

export type WithLoading<T = object> = T & {
  isLoading?: boolean;
  loadingText?: string;
};

export type WithError<T = object> = T & {
  error?: string | AppError;
  onErrorRetry?: () => void;
};