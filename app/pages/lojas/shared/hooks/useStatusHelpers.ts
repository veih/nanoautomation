"use client";

import { useCallback } from "react";
import { AtuadorStatus, SensorStatus } from "../../../../../types";

export function useStatusHelpers() {
  const getStatusColorClass = useCallback((status: string) => {
    switch (status) {
      case AtuadorStatus.OPERACIONAL:
      case SensorStatus.OPERACIONAL:
        return "text-success";
      case AtuadorStatus.DEFEITO:
      case SensorStatus.DEFEITO:
        return "text-danger fw-bold";
      case AtuadorStatus.MANUTENCAO:
      case SensorStatus.MANUTENCAO:
        return "text-warning";
      case AtuadorStatus.DESCONHECIDO:
      case SensorStatus.DESCONHECIDO:
        return "text-muted";
      default:
        return "";
    }
  }, []);

  const getStatusOptions = useCallback(() => [
    { value: AtuadorStatus.OPERACIONAL, label: "Operacional" },
    { value: AtuadorStatus.DEFEITO, label: "Defeito" },
    { value: AtuadorStatus.MANUTENCAO, label: "Manutenção" },
    { value: AtuadorStatus.DESCONHECIDO, label: "Desconhecido" },
  ], []);

  const getEquipmentStatusOptions = useCallback(() => [
    { value: "OPERACIONAL", label: "Operacional" },
    { value: "MANUTENCAO", label: "Manutenção" },
    { value: "DESATIVADO", label: "Desativado" },
    { value: "DESCONHECIDO", label: "Desconhecido" },
  ], []);

  return {
    getStatusColorClass,
    getStatusOptions,
    getEquipmentStatusOptions,
  };
}