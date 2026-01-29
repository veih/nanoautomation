// app/components/ErrorBoundary.tsx
"use client";

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Alert, Button, Container, Card } from 'react-bootstrap';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
    return (
        <Container className="mt-5">
            <Card className="shadow-sm">
                <Card.Header className="bg-danger text-white">
                    <h4 className="mb-0">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Algo deu errado!
                    </h4>
                </Card.Header>
                <Card.Body>
                    <Alert variant="danger" className="mb-4">
                        <Alert.Heading>Erro da Aplicação</Alert.Heading>
                        <p className="mb-3">
                            Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada e está trabalhando para resolver o problema.
                        </p>
                        <hr />
                        <details className="mb-3">
                            <summary className="fw-bold mb-2" style={{ cursor: 'pointer' }}>
                                Detalhes técnicos (clique para expandir)
                            </summary>
                            <code className="d-block p-3 bg-light rounded">
                                <strong>Erro:</strong> {error.message}<br />
                                <strong>Stack:</strong><br />
                                <pre className="mb-0" style={{ fontSize: '0.85em', whiteSpace: 'pre-wrap' }}>
                                    {error.stack}
                                </pre>
                            </code>
                        </details>
                    </Alert>

                    <div className="d-flex gap-2 flex-wrap">
                        <Button
                            variant="primary"
                            onClick={resetErrorBoundary}
                            className="d-flex align-items-center"
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Tentar Novamente
                        </Button>

                        <Button
                            variant="outline-secondary"
                            onClick={() => window.location.href = '/dashboard'}
                            className="d-flex align-items-center"
                        >
                            <i className="bi bi-house me-2"></i>
                            Voltar ao Dashboard
                        </Button>

                        <Button
                            variant="outline-info"
                            onClick={() => window.location.reload()}
                            className="d-flex align-items-center"
                        >
                            <i className="bi bi-arrow-repeat me-2"></i>
                            Recarregar Página
                        </Button>
                    </div>

                    <div className="mt-4 p-3 bg-light rounded">
                        <h6 className="text-muted mb-2">Sugestões para resolver:</h6>
                        <ul className="text-muted mb-0 small">
                            <li>Verifique sua conexão com a internet</li>
                            <li>Tente recarregar a página</li>
                            <li>Limpe o cache do navegador</li>
                            <li>Se o problema persistir, entre em contato com o suporte</li>
                        </ul>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

interface AppErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<ErrorFallbackProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function AppErrorBoundary({
    children,
    fallback: Fallback = ErrorFallback,
    onError
}: AppErrorBoundaryProps) {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {

        // Call custom error handler if provided
        onError?.(error, errorInfo);
    };

    return (
        <ReactErrorBoundary
            FallbackComponent={Fallback}
            onError={handleError}
            onReset={() => {
                // Clear any error state, refresh data, etc.
                window.location.reload();
            }}
        >
            {children}
        </ReactErrorBoundary>
    );
}

// Smaller error boundary for specific components
export function ComponentErrorBoundary({
    children,
    componentName = 'Componente'
}: {
    children: React.ReactNode;
    componentName?: string;
}) {
    const ComponentFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
        <Alert variant="warning" className="m-3">
            <Alert.Heading className="h6">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Erro no {componentName}
            </Alert.Heading>
            <p className="mb-3 small">
                Este componente encontrou um problema e não pode ser exibido.
            </p>
            <div className="d-flex gap-2">
                <Button size="sm" variant="outline-warning" onClick={resetErrorBoundary}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Tentar Novamente
                </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                    <summary className="small" style={{ cursor: 'pointer' }}>Detalhes do erro</summary>
                    <code className="small d-block mt-1 p-2 bg-light rounded">
                        {error.message}
                    </code>
                </details>
            )}
        </Alert>
    );

    return (
        <ReactErrorBoundary
            FallbackComponent={ComponentFallback}
            onError={() => {
                // Removed console.error to prevent terminal logs
            }}
        >
            {children}
        </ReactErrorBoundary>
    );
}

export default AppErrorBoundary;