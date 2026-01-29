"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Alert } from "react-bootstrap";

export default function TestApiPage() {
    const [colaboradores, setColaboradores] = useState<{ id: string; nome: string; funcao: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchColaboradores = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/colaboradores");
            if (!response.ok) {
                throw new Error("Falha ao carregar colaboradores");
            }
            const result = await response.json();
            console.log("API Response:", result);

            // Handle both possible response formats
            let colaboradoresData = [];
            if (result && result.data) {
                if (Array.isArray(result.data)) {
                    // Direct array format
                    colaboradoresData = result.data;
                } else if (result.data.data && Array.isArray(result.data.data)) {
                    // Nested data format
                    colaboradoresData = result.data.data;
                }
            }

            setColaboradores(colaboradoresData);
        } catch (err) {
            console.error("Erro ao buscar colaboradores:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido");
            setColaboradores([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColaboradores();
    }, []);

    return (
        <div className="container py-4">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                        <i className="bi bi-bug me-2"></i>
                        Teste de API de Colaboradores
                    </h4>
                </Card.Header>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Lista de Colaboradores</h5>
                        <Button variant="primary" onClick={fetchColaboradores}>
                            <i className="bi bi-arrow-repeat me-1"></i>
                            Recarregar
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="danger">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                            <p className="mt-2">Carregando colaboradores...</p>
                        </div>
                    ) : (
                        <div>
                            <p>Total de colaboradores: {colaboradores.length}</p>
                            {colaboradores.length > 0 ? (
                                <ul className="list-group">
                                    {colaboradores.map((colaborador) => (
                                        <li key={colaborador.id} className="list-group-item">
                                            <strong>{colaborador.nome}</strong> - {colaborador.funcao}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <Alert variant="warning">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Nenhum colaborador encontrado.
                                </Alert>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}