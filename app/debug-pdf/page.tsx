/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DebugPdfPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all data sources
            const responses = await Promise.all([
                fetch("/api/lojasApi/atuadores-loja"),
                fetch("/api/lojasApi/lojas"),
                fetch("/api/lojasApi/equipamentos-loja")
            ]);

            const [atuadoresRes, lojasRes, equipamentosRes] = responses;

            if (!atuadoresRes.ok || !lojasRes.ok || !equipamentosRes.ok) {
                throw new Error("Failed to fetch one or more data sources");
            }

            const atuadoresData = await atuadoresRes.json();
            const lojasData = await lojasRes.json();
            const equipamentosData = await equipamentosRes.json();

            setData({
                atuadores: atuadoresData,
                lojas: lojasData,
                equipamentos: equipamentosData
            });
        } catch (err: any) {
            setError(err.message || "Unknown error occurred");
            console.error("Debug error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h1 className="mb-4">Debug PDF Data</h1>

            <div className="mb-4">
                <Button onClick={fetchData} disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Carregando...
                        </>
                    ) : (
                        "Carregar Dados"
                    )}
                </Button>
            </div>

            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Erro</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {data && (
                <div>
                    <h2>Dados Carregados</h2>

                    <div className="card mb-3">
                        <div className="card-header">
                            <h3>Atuadores ({data.atuadores.data?.atuadores?.length || data.atuadores.atuadores?.length || 0})</h3>
                        </div>
                        <div className="card-body">
                            <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                                {JSON.stringify(data.atuadores, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-header">
                            <h3>Lojas ({data.lojas.data?.lojas?.length || data.lojas.lojas?.length || 0})</h3>
                        </div>
                        <div className="card-body">
                            <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                                {JSON.stringify(data.lojas, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-header">
                            <h3>Equipamentos ({data.equipamentos.data?.equipamentos?.length || data.equipamentos.equipamentos?.length || 0})</h3>
                        </div>
                        <div className="card-body">
                            <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                                {JSON.stringify(data.equipamentos, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}