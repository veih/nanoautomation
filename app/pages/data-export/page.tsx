"use client";

import React, { useState } from "react";
import { Card, Button, Alert, Spinner, Form, InputGroup } from "react-bootstrap";

export default function DataExportPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [authenticated, setAuthenticated] = useState<boolean>(false);

    const handleAuthenticate = () => {
        if (password === "veih") {
            setAuthenticated(true);
            setError(null);
        } else {
            setError("Senha incorreta. Por favor, insira a senha correta para exportar os dados.");
        }
    };

    const handleExport = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Fetch the data directly to ensure proper handling
            const response = await fetch('/api/export-data');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Failed to export data: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            // Get the blob from the response
            const blob = await response.blob();

            // Create a download URL
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'DBJsonVeih.json';

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setSuccess("Dados exportados com sucesso!");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to export data. Please try again.';
            setError(errorMessage);
            console.error('Export error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h1 className="mb-0">
                        <i className="bi bi-download me-2"></i>
                        Exportar Dados do Banco
                    </h1>
                </Card.Header>
                <Card.Body>
                    <p className="lead">
                        Esta página permite exportar todos os dados do banco de dados em formato JSON para backup e recuperação.
                    </p>

                    <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        O arquivo exportado conterá todos os dados de:
                        <ul className="mb-0 mt-2">
                            <li>Casas de Máquinas (CMs)</li>
                            <li>Equipamentos</li>
                            <li>Atuadores</li>
                            <li>Sensores</li>
                            <li>Lojas</li>
                            <li>Equipamentos de Lojas</li>
                            <li>Atuadores de Lojas</li>
                            <li>Sensores de Lojas</li>
                            <li>Corretivas</li>
                            <li>Colaboradores</li>
                            <li>CVFs (Unidades de Viga Fria)</li>
                        </ul>
                    </Alert>

                    {!authenticated ? (
                        <div className="mt-4">
                            <Form.Group className="mb-3">
                                <Form.Label>Senha para exportar os dados:</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Digite a senha"
                                        disabled={loading}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "Ocultar" : "Mostrar"}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <div className="d-flex justify-content-center">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleAuthenticate}
                                    disabled={loading}
                                    className="d-flex align-items-center"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                className="me-2"
                                            />
                                            Autenticando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-shield-lock me-2"></i>
                                            Autenticar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <Alert variant="danger" className="mt-3">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success" className="mt-3">
                                    <i className="bi bi-check-circle me-2"></i>
                                    {success}
                                </Alert>
                            )}

                            <div className="d-flex justify-content-center mt-4">
                                <Button
                                    variant="success"
                                    size="lg"
                                    onClick={handleExport}
                                    disabled={loading}
                                    className="d-flex align-items-center"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                className="me-2"
                                            />
                                            Exportando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-file-earmark-arrow-down me-2"></i>
                                            Exportar Dados
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}

                    <div className="mt-4">
                        <h5>Instruções para uso:</h5>
                        <ol>
                            <li>Insira a senha &quot;veih&quot; para autenticação</li>
                            <li>Clique no botão &quot;Exportar Dados&quot; para baixar o arquivo JSON</li>
                            <li>O arquivo será salvo com o nome &quot;DBJsonVeih.json&quot;</li>
                            <li>Para restaurar os dados, use o arquivo com o script de importação apropriado</li>
                        </ol>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}