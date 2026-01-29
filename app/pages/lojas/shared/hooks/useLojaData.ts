"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { Loja, AtuadorLoja, SensorLoja, EquipamentoLoja, FireDetectionEquipmentLoja } from "../../../../../types";

// Standardized API response types following project specifications
interface ApiResponse<T = unknown> {
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
};

// Simple useFetch replacement to avoid infinite loops
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Stable refetch function that doesn't cause infinite loops
  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  // Effect that only depends on url and refetchTrigger - no function dependencies
  useEffect(() => {
    const fetchData = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const result: ApiResponse<T> | T = await response.json();

        // Handle both standardized and non-standardized responses
        if (typeof result === 'object' && result !== null && 'success' in result) {
          const apiResponse = result as ApiResponse<T>;
          if (!apiResponse.success) {
            throw new Error(apiResponse.error?.message || 'API Error');
          }
          setData(apiResponse.data || null);
        } else {
          setData(result as T);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, refetchTrigger]); // Only url and refetchTrigger as dependencies

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// API Response Types
interface LojasApiResponse {
  total_items?: number;
  page?: number;
  limit?: number;
  lojas: Loja[];
}

interface AtuadoresLojaApiResponse {
  total_items: number;
  page: number;
  limit: number;
  atuadores: AtuadorLoja[];
}

interface SensoresLojaApiResponse {
  total_items: number;
  page: number;
  limit: number;
  sensores: SensorLoja[];
}

interface EquipamentosLojaApiResponse {
  total_items: number;
  page: number;
  limit: number;
  equipamentos: EquipamentoLoja[];
}

// Add the interface for fire detection equipment response
interface FireDetectionEquipmentApiResponse {
  total_items: number;
  page: number;
  limit: number;
  equipment: FireDetectionEquipmentLoja[];
}

// Data Hooks
export function useLojas() {
  const { data: rawLojas, loading, error, refetch } = useFetch<LojasApiResponse | Loja[]>("/api/lojasApi/lojas");

  const lojas: Loja[] = rawLojas
    ? Array.isArray(rawLojas)
      ? rawLojas
      : (rawLojas as LojasApiResponse).lojas || []
    : [];

  return {
    lojas,
    loading,
    error,
    refetch,
  };
}

export function useAtuadoresLoja() {
  const { data: rawAtuadores, loading, error, refetch } = useFetch<AtuadoresLojaApiResponse>("/api/lojasApi/atuadores-loja");

  return {
    atuadores: rawAtuadores?.atuadores || [],
    loading,
    error,
    refetch,
  };
}

export function useSensoresLoja() {
  const { data: rawSensores, loading, error, refetch } = useFetch<SensoresLojaApiResponse>("/api/lojasApi/sensores-loja");

  return {
    sensores: rawSensores?.sensores || [],
    loading,
    error,
    refetch,
  };
}

export function useEquipamentosLoja() {
  const { data: rawEquipamentos, loading, error, refetch } = useFetch<EquipamentosLojaApiResponse>("/api/lojasApi/equipamentos-loja");

  return {
    equipamentos: rawEquipamentos?.equipamentos || [],
    loading,
    error,
    refetch,
  };
}

// Add the hook for fire detection equipment
export function useFireDetectionEquipment() {
  const { data: rawEquipment, loading, error, refetch } = useFetch<FireDetectionEquipmentApiResponse>("/api/lojasApi/fire-detection-equipment");

  return {
    equipment: rawEquipment?.equipment || [],
    loading,
    error,
    refetch,
  };
}