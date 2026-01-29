"use client";

import { useState, useCallback, useMemo } from "react";
import { Cvf } from "../../../../types";

// Simple local hooks to replace lib/hooks (removed due to infinite callback issues)
export function useModal() {
    const [isOpen, setIsOpen] = useState(false);
    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    };
}

// Custom hook for CRUD operations
export function useCrudOperations<T extends { id?: number | string }>({
    apiEndpoint,
    entityName,
    getItemName,
    onSuccess,
}: {
    apiEndpoint: string;
    entityName: string;
    getItemName: (item: T) => string;
    onSuccess?: () => void;
}) {
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [operationLoading, setOperationLoading] = useState(false);

    const saveItem = async (item: Partial<T>, isEdit: boolean = false) => {
        setOperationLoading(true);
        try {
            const method = isEdit ? "PUT" : "POST";
            const url = isEdit && item.id ? `${apiEndpoint}/${item.id}` : apiEndpoint;

            // Validate and clean the data before sending
            const cleanItem: Partial<T> & {
                sensorTemperatura?: string | null;
                sensorUmidade?: string | null
            } = {
                ...item,
            };

            // Only add sensor fields if they exist on the item (for CVF specifically)
            if ('sensorTemperatura' in item) {
                cleanItem.sensorTemperatura = (item as Partial<Cvf>).sensorTemperatura || null;
            }

            if ('sensorUmidade' in item) {
                cleanItem.sensorUmidade = (item as Partial<Cvf>).sensorUmidade || null;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cleanItem),
            });

            // First check if we got a response at all
            if (!response) {
                throw new Error("No response from server");
            }

            // Try to parse the response
            let result;
            try {
                result = await response.json();
            } catch {
                // If we can't parse JSON, use the text response
                const textResponse = await response.text();
                throw new Error(
                    `HTTP ${response.status}: ${textResponse || response.statusText}`
                );
            }

            // Check if the response has the expected structure
            if (!response.ok) {
                // Handle different types of errors
                if (response.status === 405) {
                    throw new Error(
                        "Método não permitido. A tabela CVF pode não existir no banco de dados. Verifique se a migração foi aplicada. Entre em contato com o administrador do sistema."
                    );
                }

                const errorMessage =
                    result?.error?.message ||
                    result?.message ||
                    `Failed to ${isEdit ? "update" : "create"} ${entityName} (HTTP ${response.status})`;
                throw new Error(errorMessage);
            }

            // Check for API-level success flag
            if (result && result.success === false) {
                const errorMessage =
                    result?.error?.message ||
                    `Failed to ${isEdit ? "update" : "create"} ${entityName}`;
                throw new Error(errorMessage);
            }

            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            // Error handling would be done in the component
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    const deleteItem = async (item: T) => {
        if (!item.id) return;

        setOperationLoading(true);
        try {
            const response = await fetch(`${apiEndpoint}/${item.id}`, {
                method: "DELETE",
            });

            // First check if we got a response at all
            if (!response) {
                throw new Error("No response from server");
            }

            // Try to parse the response
            let result;
            try {
                result = await response.json();
            } catch {
                // If we can't parse JSON, use the text response
                const textResponse = await response.text();
                throw new Error(
                    `HTTP ${response.status}: ${textResponse || response.statusText}`
                );
            }

            // Check if the response has the expected structure
            if (!response.ok) {
                // Handle different types of errors
                if (response.status === 405) {
                    throw new Error(
                        "Método não permitido. A tabela CVF pode não existir no banco de dados. Verifique se a migração foi aplicada. Entre em contato com o administrador do sistema."
                    );
                }

                const errorMessage =
                    result?.error?.message ||
                    result?.message ||
                    `Failed to delete ${entityName} ${getItemName(item)} (HTTP ${response.status})`;
                throw new Error(errorMessage);
            }

            // Check for API-level success flag
            if (result && result.success === false) {
                const errorMessage =
                    result?.error?.message ||
                    `Failed to delete ${entityName} ${getItemName(item)}`;
                throw new Error(errorMessage);
            }

            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            // Error handling would be done in the component
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    return {
        selectedItem,
        setSelectedItem,
        operationLoading,
        saveItem,
        deleteItem,
    };
}

// Custom hook for filtering and sorting data
export function useFilterAndSort<T>(
    data: T[],
    searchText: string,
    searchFields: string[],
    sortConfig?: {
        primaryField: keyof T;
        secondaryField?: keyof T;
    }
): T[] {
    return useMemo(() => {
        let filtered = data;

        // Apply text filter
        if (searchText) {
            const normalizedSearchText = searchText.toLowerCase().trim();
            filtered = data.filter((item) =>
                searchFields.some((field) => {
                    const value = item[field as keyof T];
                    return (
                        value && String(value).toLowerCase().includes(normalizedSearchText)
                    );
                })
            );
        }

        // Apply sorting
        if (sortConfig) {
            filtered = [...filtered].sort((a, b) => {
                const primaryA = a[sortConfig.primaryField];
                const primaryB = b[sortConfig.primaryField];

                if (primaryA < primaryB) return -1;
                if (primaryA > primaryB) return 1;

                // If primary field values are equal, sort by secondary field if provided
                if (sortConfig.secondaryField) {
                    const secondaryA = a[sortConfig.secondaryField];
                    const secondaryB = b[sortConfig.secondaryField];

                    if (secondaryA < secondaryB) return -1;
                    if (secondaryA > secondaryB) return 1;
                }

                return 0;
            });
        }

        return filtered;
    }, [data, searchText, searchFields, sortConfig]);
}

export function useForm<T>(
    initialValues: T,
    validate?: (values: T) => Record<string, string>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setValue = useCallback(
        (field: keyof T, value: unknown) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            if (errors[field as string]) {
                setErrors((prev) => ({ ...prev, [field as string]: "" }));
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        (onSubmit: (values: T) => void | Promise<void>) => {
            return async (e?: React.FormEvent) => {
                if (e) e.preventDefault();

                const validationErrors = validate ? validate(values) : {};
                setErrors(validationErrors);

                if (Object.keys(validationErrors).length === 0) {
                    await onSubmit(values);
                }
            };
        },
        [values, validate]
    );

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    return {
        values,
        errors,
        setValue,
        handleSubmit,
        reset,
    };
}