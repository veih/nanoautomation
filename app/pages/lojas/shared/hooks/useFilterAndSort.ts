"use client";

import { useMemo } from "react";

// Helper function to get nested property value
function getNestedProperty<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((current: unknown, prop) => {
    if (current && typeof current === 'object' && prop in current) {
      return (current as Record<string, unknown>)[prop];
    }
    return undefined;
  }, obj as unknown);
}

export function useFilterAndSort<T>(
  data: T[],
  searchText: string,
  searchFields: (keyof T | string)[], // Allow string paths for nested properties
  sortConfig?: {
    primaryField: keyof T;
    secondaryField?: keyof T;
  }
) {
  return useMemo(() => {
    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : [];

    // If search text is empty, return all data (sorted if needed)
    if (!searchText.trim()) {
      if (sortConfig) {
        return [...dataArray].sort((a, b) => {
          const primaryA = String(a[sortConfig.primaryField] || "");
          const primaryB = String(b[sortConfig.primaryField] || "");
          const primaryComparison = primaryA.localeCompare(primaryB);

          if (primaryComparison === 0 && sortConfig.secondaryField) {
            const secondaryA = String(a[sortConfig.secondaryField] || "");
            const secondaryB = String(b[sortConfig.secondaryField] || "");
            return secondaryA.localeCompare(secondaryB);
          }

          return primaryComparison;
        });
      }
      return dataArray;
    }

    const lowerCaseSearchText = searchText.toLowerCase();

    // Filter data based on search text
    const filteredData = dataArray.filter((item) =>
      searchFields.some((field) => {
        // Handle both direct properties and nested properties
        let value: unknown;
        if (typeof field === 'string' && field.includes('.')) {
          // Nested property access
          value = getNestedProperty(item, field);
        } else {
          // Direct property access
          value = item[field as keyof T];
        }

        if (value == null) return false;
        return String(value).toLowerCase().includes(lowerCaseSearchText);
      })
    );

    // Sort data if sort configuration is provided
    if (sortConfig) {
      return [...filteredData].sort((a, b) => {
        const primaryA = String(a[sortConfig.primaryField] || "");
        const primaryB = String(b[sortConfig.primaryField] || "");
        const primaryComparison = primaryA.localeCompare(primaryB);

        if (primaryComparison === 0 && sortConfig.secondaryField) {
          const secondaryA = String(a[sortConfig.secondaryField] || "");
          const secondaryB = String(b[sortConfig.secondaryField] || "");
          return secondaryA.localeCompare(secondaryB);
        }

        return primaryComparison;
      });
    }

    return filteredData;
  }, [data, searchText, searchFields, sortConfig]);
}