"use client";

import React, { useState } from "react";
import { Card, Button, Alert, Spinner, Container } from "react-bootstrap";

export default function SyncCloudinaryPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        message: string;
        processed?: number;
        checked?: number;
        deleted?: number
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSync = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/sync-cloudinary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || 'Failed to synchronize database');
            }
        } catch (err) {
            setError(`Error: ${(err as Error).message}`);
            console.error('Sync error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h1 className="mb-0">
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Sincronizar Banco de Dados com Cloudinary
                    </h1>
                </Card.Header>
                <Card.Body>
                    <p className="lead">
                        Esta ferramenta verifica quais imagens registradas no banco de dados realmente existem no Cloudinary
                        e remove os registros órfãos do banco de dados.
                    </p>

                    <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Importante:</strong> Esta operação é segura e apenas remove registros do banco de dados
                        para imagens que já foram excluídas do Cloudinary. Nenhuma imagem será excluída do Cloudinary por esta ferramenta.
                    </Alert>

                    {error && (
                        <Alert variant="danger" className="mt-3">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    {result && (
                        <Alert variant="success" className="mt-3">
                            <i className="bi bi-check-circle me-2"></i>
                            <strong>{result.message}</strong>
                            {result.processed !== undefined && (
                                <div className="mt-2">
                                    <div>Registros processados: {result.processed}</div>
                                    <div>Imagens verificadas: {result.checked}</div>
                                    <div>Registros removidos: {result.deleted}</div>
                                </div>
                            )}
                        </Alert>
                    )}

                    <div className="d-flex justify-content-center mt-4">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSync}
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
                                    Sincronizando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Iniciar Sincronização
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="mt-4">
                        <h5>Instruções:</h5>
                        <ol>
                            <li>Clique no botão &#34;Iniciar Sincronização&#34;</li>
                            <li>O sistema verificará todas as imagens registradas no banco de dados</li>
                            <li>Para cada imagem, será verificado se ela existe no Cloudinary</li>
                            <li>Registros de imagens que não existem mais no Cloudinary serão removidos do banco de dados</li>
                        </ol>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}