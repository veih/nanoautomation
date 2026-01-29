"use client";

import React from "react";
import { SensorTemperaturaStatus, SensorUmidadeStatus } from "../../../../types";

// Helper function to display enum values in a readable format with colors
export const formatSensorStatus = (status: string | undefined) => {
    if (!status) return <span className="text-muted">N/A</span>;

    switch (status) {
        case SensorTemperaturaStatus.OPERACIONAL:
        case SensorUmidadeStatus.OPERACIONAL:
            return <span className="text-success">Operacional</span>;
        case SensorTemperaturaStatus.DEFEITO:
        case SensorUmidadeStatus.DEFEITO:
            return <span className="text-danger fw-bold">Defeito</span>;
        case SensorTemperaturaStatus.N_A:
        case SensorUmidadeStatus.N_A:
            return <span className="text-muted">N/A</span>;
        default:
            return <span className="text-muted">{status}</span>;
    }
};

// Helper function to display AtuadorStatus values in a readable format with colors
export const formatAtuadorStatus = (status: string | undefined) => {
    if (!status) return <span className="text-muted">N/A</span>;

    switch (status) {
        case "OPERACIONAL":
            return <span className="text-success">Operacional</span>;
        case "DEFEITO":
            return <span className="text-danger fw-bold">Defeito</span>;
        case "MANUTENCAO":
            return <span className="text-warning">Manutenção</span>;
        case "DESCONHECIDO":
            return <span className="text-muted">Desconhecido</span>;
        default:
            return <span className="text-muted">{status}</span>;
    }
};