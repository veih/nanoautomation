// Centralized data fetching hooks

import { useState, useEffect, useCallback } from 'react';
import { AppError } from '@/src/types';

// Type guard for error objects
function isErrorLike(error: unknown): error is { message?: string; code?: string; status?: number; details?: unknown } {
  return typeof error === 'object' && error !== null;
}

interface UseApiOptions<T = unknown> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  refetch: () => void;
  setData: (data: T) => void;
}

// Generic API hook for data fetching
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
    } catch (err: unknown) {
      const errorObj = isErrorLike(err) ? err : {};
      const appError: AppError = {
        message: errorObj.message || 'An error occurred',
        code: errorObj.code || 'UNKNOWN_ERROR',
        status: errorObj.status || 500,
        details: errorObj.details,
      };
      setError(appError);
      onError?.(appError);
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
}

// Hook for paginated data
interface UsePaginatedApiOptions<T> extends UseApiOptions<T[]> {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number) => void;
}

interface UsePaginatedApiState<T> extends UseApiState<T[]> {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{ 
    data: T[]; 
    pagination: { 
      page: number; 
      limit: number; 
      totalCount: number; 
      totalPages: number 
    } 
  }>,
  options: UsePaginatedApiOptions<T> = {}
): UsePaginatedApiState<T> {
  const { 
    initialPage = 1, 
    initialLimit = 10, 
    onPageChange,
    ...apiOptions 
  } = options;
  
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const { data: paginatedData, loading, error, refetch, setData: setPaginatedData } = useApi(
    () => apiCall(page, limit),
    {
      ...apiOptions,
      onSuccess: (result: unknown) => {
        // Type assertion for paginated response structure
        const paginatedResult = result as { 
          pagination: { totalPages: number; totalCount: number }; 
          data: T[] 
        };
        setTotalPages(paginatedResult.pagination.totalPages);
        setTotalCount(paginatedResult.pagination.totalCount);
        apiOptions.onSuccess?.(paginatedResult.data);
      }
    }
  );

  // Extract the actual data array from the paginated response
  const data = paginatedData?.data || [];

  // Wrapper function to update the paginated data structure
  const setData = useCallback((newData: T[]) => {
    if (paginatedData) {
      setPaginatedData({
        ...paginatedData,
        data: newData
      });
    }
  }, [paginatedData, setPaginatedData]);

  const setPageWrapper = useCallback((newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  }, [onPageChange]);

  const setLimitWrapper = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPageWrapper(page + 1);
    }
  }, [page, totalPages, setPageWrapper]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPageWrapper(page - 1);
    }
  }, [page, setPageWrapper]);

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: data || [],
    loading,
    error,
    refetch,
    setData,
    page,
    limit,
    totalPages,
    totalCount,
    setPage: setPageWrapper,
    setLimit: setLimitWrapper,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  };
}

// Hook for search functionality
interface UseSearchOptions<T> extends UseApiOptions<T[]> {
  debounceMs?: number;
}

interface UseSearchState<T> extends UseApiState<T[]> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
}

export function useSearch<T>(
  searchApiCall: (term: string) => Promise<T[]>,
  options: UseSearchOptions<T> = {}
): UseSearchState<T> {
  const { debounceMs = 300, ...apiOptions } = options;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const { data, loading, error, refetch, setData } = useApi(
    () => debouncedSearchTerm ? searchApiCall(debouncedSearchTerm) : Promise.resolve([]),
    {
      immediate: false,
      ...apiOptions,
      onSuccess: apiOptions.onSuccess ? (data: unknown) => {
        // Type assertion for search results
        apiOptions.onSuccess?.(data as T[]);
      } : undefined
    }
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setData([]);
  }, [setData]);

  return {
    data: data || [],
    loading,
    error,
    refetch,
    setData,
    searchTerm,
    setSearchTerm,
    clearSearch,
  };
}

// Hook for CRUD operations
interface UseCrudOptions<T> extends UseApiOptions {
  onCreateSuccess?: (data: T) => void;
  onUpdateSuccess?: (data: T) => void;
  onDeleteSuccess?: () => void;
}

interface UseCrudState<T> extends UseApiState<T[]> {
  create: (item: Omit<T, 'id'>) => Promise<T | null>;
  update: (id: string, item: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  getById: (id: string) => Promise<T | null>;
}

export function useCrud<T>(
  baseUrl: string,
  options: UseCrudOptions<T> = {}
): UseCrudState<T> {
  const { 
    onCreateSuccess, 
    onUpdateSuccess, 
    onDeleteSuccess,
    ...apiOptions 
  } = options;

  const {
    data,
    loading,
    error,
    refetch,
    setData
  } = useApi<T[]>(() => fetch(baseUrl).then(res => res.json()), apiOptions);

  const create = useCallback(async (item: Omit<T, 'id'>): Promise<T | null> => {
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) throw new Error('Failed to create item');
      
      const createdItem = await response.json();
      onCreateSuccess?.(createdItem);
      refetch();
      return createdItem;
    } catch (err: unknown) {
      console.error('Create error:', isErrorLike(err) ? err.message : 'Unknown error');
      return null;
    }
  }, [baseUrl, onCreateSuccess, refetch]);

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T | null> => {
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) throw new Error('Failed to update item');
      
      const updatedItem = await response.json();
      onUpdateSuccess?.(updatedItem);
      refetch();
      return updatedItem;
    } catch (err: unknown) {
      console.error('Update error:', isErrorLike(err) ? err.message : 'Unknown error');
      return null;
    }
  }, [baseUrl, onUpdateSuccess, refetch]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete item');
      
      onDeleteSuccess?.();
      refetch();
      return true;
    } catch (err: unknown) {
      console.error('Delete error:', isErrorLike(err) ? err.message : 'Unknown error');
      return false;
    }
  }, [baseUrl, onDeleteSuccess, refetch]);

  const getById = useCallback(async (id: string): Promise<T | null> => {
    try {
      const response = await fetch(`${baseUrl}/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err: unknown) {
      console.error('Get by ID error:', isErrorLike(err) ? err.message : 'Unknown error');
      return null;
    }
  }, [baseUrl]);

  return {
    data: data || [],
    loading,
    error,
    refetch,
    setData,
    create,
    update,
    remove,
    getById,
  };
}