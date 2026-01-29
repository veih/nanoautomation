"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";

// Simple useAsyncOperation replacement to avoid infinite loops
function useAsyncOperation() {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async <T = unknown>(
    operation: () => Promise<T>,
    options: { successMessage?: string; errorMessage?: string } = {}
  ) => {
    setLoading(true);
    try {
      const result = await operation();
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      return result;
    } catch (error: unknown) {
      const message = (error as Error).message || options.errorMessage || 'Erro na operação';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    execute,
    loading,
  };
}

interface CrudOperationsConfig<T> {
  apiEndpoint: string;
  entityName: string;
  getItemName?: (item: T) => string;
  onSuccess?: () => void;
}

export function useCrudOperations<T extends { id: string }>({
  apiEndpoint,
  entityName,
  getItemName = <T extends { id: string }>(item: T) => (item as { name?: string; nome?: string }).name || (item as { name?: string; nome?: string }).nome || item.id,
  onSuccess,
}: CrudOperationsConfig<T>) {
  const { execute: executeOperation, loading: operationLoading } = useAsyncOperation();
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // Stable reference to onSuccess to prevent recreation of callbacks
  const stableOnSuccess = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  const createItem = useCallback(async (data: Partial<T>) => {
    return executeOperation(
      async () => {
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          let errorMessage = `Erro ao criar ${entityName}`;
          try {
            const errorData = await res.json();
            // Handle different error response formats
            if (typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (typeof errorData.error === 'object' && errorData.error.message) {
              errorMessage = errorData.error.message;
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.join(', ');
            } else if (errorData && typeof errorData === 'object') {
              // Handle any other object by extracting string values or converting to JSON
              errorMessage = Object.values(errorData).find(v => typeof v === 'string') as string ||
                JSON.stringify(errorData).replace(/[{}"]/g, '').replace(/,/g, ', ') ||
                errorMessage;
            }
          } catch {
            // If response is not JSON, use status text
            errorMessage = res.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        stableOnSuccess();
        return res.json();
      },
      {
        successMessage: `${entityName} criado com sucesso!`,
        errorMessage: `Erro ao criar ${entityName}`,
      }
    );
  }, [apiEndpoint, entityName, executeOperation, stableOnSuccess]);

  const updateItem = useCallback(async (id: string, data: Partial<T>) => {
    return executeOperation(
      async () => {
        const res = await fetch(`${apiEndpoint}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          let errorMessage = `Erro ao atualizar ${entityName}`;
          try {
            const errorData = await res.json();
            // Handle different error response formats
            if (typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (typeof errorData.error === 'object' && errorData.error.message) {
              errorMessage = errorData.error.message;
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.join(', ');
            } else if (errorData && typeof errorData === 'object') {
              // Handle any other object by extracting string values or converting to JSON
              errorMessage = Object.values(errorData).find(v => typeof v === 'string') as string ||
                JSON.stringify(errorData).replace(/[{}"]/g, '').replace(/,/g, ', ') ||
                errorMessage;
            }
          } catch {
            // If response is not JSON, use status text
            errorMessage = res.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        stableOnSuccess();
        return res.json();
      },
      {
        successMessage: `${entityName} atualizado com sucesso!`,
        errorMessage: `Erro ao atualizar ${entityName}`,
      }
    );
  }, [apiEndpoint, entityName, executeOperation, stableOnSuccess]);

  const deleteItem = useCallback(async (item: T) => {
    const itemName = getItemName(item);
    return executeOperation(
      async () => {
        const res = await fetch(`${apiEndpoint}/${item.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          let errorMessage = `Erro ao deletar ${entityName}`;
          try {
            const errorData = await res.json();
            // Handle different error response formats
            if (typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (typeof errorData.error === 'object' && errorData.error.message) {
              errorMessage = errorData.error.message;
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.join(', ');
            } else if (errorData && typeof errorData === 'object') {
              // Handle any other object by extracting string values or converting to JSON
              errorMessage = Object.values(errorData).find(v => typeof v === 'string') as string ||
                JSON.stringify(errorData).replace(/[{}"]/g, '').replace(/,/g, ', ') ||
                errorMessage;
            }
          } catch {
            // If response is not JSON, use status text or fallback
            errorMessage = res.statusText || errorMessage;
          }

          // Special handling for foreign key constraint errors
          if (errorMessage.includes('Violação de chave estrangeira') ||
            errorMessage.includes('foreign key constraint') ||
            errorMessage.includes('dependências')) {
            errorMessage = `Erro inesperado de dependência. A exclusão em cascata deveria ter funcionado automaticamente.`;
          }

          throw new Error(errorMessage);
        }

        // Check if response has content before parsing JSON
        let result = null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await res.text();
          if (text) {
            result = JSON.parse(text);
          }
        }

        stableOnSuccess();
        return result;
      },
      {
        successMessage: `${entityName} "${itemName}" excluído com sucesso!`,
        errorMessage: `Erro ao deletar ${entityName}`,
      }
    );
  }, [apiEndpoint, entityName, executeOperation, getItemName, stableOnSuccess]);

  const saveItem = useCallback(async (data: Partial<T>, isEdit: boolean) => {
    // Filter out undefined values to prevent sending undefined fields
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([value]) => value !== undefined)
    );

    if (isEdit && selectedItem?.id) {
      return updateItem(selectedItem.id, filteredData as Partial<T>);
    } else {
      return createItem(filteredData as Partial<T>);
    }
  }, [createItem, updateItem, selectedItem]);

  return {
    selectedItem,
    setSelectedItem,
    operationLoading,
    createItem,
    updateItem,
    deleteItem,
    saveItem,
  };
}