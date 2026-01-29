"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Container, Row, Col, Button, Badge, Alert } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";
import { Cvf, SensorTemperaturaStatus, SensorUmidadeStatus, AtuadorStatus } from "../../../../types";

// Helper functions for formatting status
const formatSensorStatus = (status: string | undefined) => {
    if (!status) return "N/A";

    switch (status) {
        case SensorTemperaturaStatus.OPERACIONAL:
        case SensorUmidadeStatus.OPERACIONAL:
            return <Badge bg="success">Operacional</Badge>;
        case SensorTemperaturaStatus.DEFEITO:
        case SensorUmidadeStatus.DEFEITO:
            return <Badge bg="danger">Defeito</Badge>;
        case SensorTemperaturaStatus.N_A:
        case SensorUmidadeStatus.N_A:
            return <Badge bg="secondary">N/A</Badge>;
        default:
            return <Badge bg="secondary">Desconhecido</Badge>;
    }
};

const formatAtuadorStatus = (status: string | undefined) => {
    if (!status) return "N/A";

    switch (status) {
        case AtuadorStatus.OPERACIONAL:
            return <Badge bg="success">Operacional</Badge>;
        case AtuadorStatus.DEFEITO:
            return <Badge bg="danger">Defeito</Badge>;
        case AtuadorStatus.MANUTENCAO:
            return <Badge bg="warning">Manutenção</Badge>;
        case AtuadorStatus.DESCONHECIDO:
            return <Badge bg="secondary">Desconhecido</Badge>;
        default:
            return <Badge bg="secondary">Desconhecido</Badge>;
    }
};

export default function CvfDetailsPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [cvf, setCvf] = useState<Cvf | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch CVF data
    useEffect(() => {
        const fetchCvf = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/cvf/${params?.id}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("CVF não encontrado");
                    }
                    throw new Error(`Failed to fetch CVF (HTTP ${res.status})`);
                }
                const data = await res.json();
                setCvf(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                toast.error(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        if (params?.id) {
            fetchCvf();
        }
    }, [params?.id]);

    if (loading) {
        return (
            <Container fluid className="px-0">
                <CmsTableSkeleton />
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="px-0">
                <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </Alert>
                <div className="d-flex justify-content-center mt-4">
                    <Button variant="primary" onClick={() => router.back()}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </Button>
                </div>
            </Container>
        );
    }

    if (!cvf) {
        return (
            <Container fluid className="px-0">
                <Alert variant="warning" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    CVF não encontrado
                </Alert>
                <div className="d-flex justify-content-center mt-4">
                    <Button variant="primary" onClick={() => router.back()}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </Button>
                </div>
            </Container>
        );
    }

    // Parse image paths if they exist
    let imagePaths: string[] = [];
    if (cvf.imagePaths) {
        try {
            const parsed = JSON.parse(cvf.imagePaths);
            if (Array.isArray(parsed)) {
                // Normalize path separators to forward slashes for URL compatibility
                imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
            }
        } catch (e) {
            console.error("Error parsing image paths:", e);
        }
    }

    return (
        <ComponentErrorBoundary componentName="Detalhes CVF">
            <Container fluid className="px-0">
                <ToastContainer position="top-right" autoClose={2000} />

                {/* Header */}
                <Card className="mb-4 shadow mx-3">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                            <div>
                                <h1 className="text-primary mb-1">
                                    <i className="bi bi-building me-2"></i>
                                    Detalhes do CVF
                                </h1>
                                <p className="text-muted mb-0">
                                    Informações detalhadas da unidade de viga fria
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => router.back()}
                                >
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Voltar
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => router.push(`/pages/cvf?id=${cvf.id}`)}
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                    Editar
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Container fluid className="px-3">
                    {/* CVF Images for Defective Status */}
                    {imagePaths.length > 0 && (
                        <Row className="mb-4">
                            <Col xs={12}>
                                <Card className="shadow-sm">
                                    <Card.Header className="bg-primary text-white">
                                        <h5 className="mb-0">
                                            <i className="bi bi-images me-2"></i>
                                            Imagens do Defeito
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="row">
                                            {imagePaths.map((imagePath, index) => (
                                                <div key={index} className="col-md-4 mb-3">
                                                    <Image
                                                        src={`/api/serve-image?imagePath=${encodeURIComponent(imagePath)}&module=cvf`}
                                                        alt={`Defeito ${index + 1}`}
                                                        className="img-fluid"
                                                        width={200}
                                                        height={200}
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                        unoptimized={true}
                                                        onError={() => {
                                                            console.error(`Failed to load image: ${imagePath}`);
                                                            // Don't manipulate the src directly to avoid infinite loops
                                                            // The Image component will handle fallback automatically
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    <Row className="mb-4">
                        <Col xs={12}>
                            <Card className="shadow-sm">
                                <Card.Header className="bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Informações do CVF
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Viga Fria</h6>
                                                <p className="mb-0">{cvf.vigaFria || "N/A"}</p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Piso</h6>
                                                <p className="mb-0">{cvf.piso || "N/A"}</p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Localização do Quadro</h6>
                                                <p className="mb-0">{cvf.localizacaoQuadro || "N/A"}</p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Localização da Válvula</h6>
                                                <p className="mb-0">{cvf.localizacaoValvula || "N/A"}</p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Sensor de Temperatura</h6>
                                                <p className="mb-0">
                                                    {formatSensorStatus(cvf.sensorTemperatura)}
                                                </p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Sensor de Umidade</h6>
                                                <p className="mb-0">
                                                    {formatSensorStatus(cvf.sensorUmidade)}
                                                </p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Atuador</h6>
                                                <p className="mb-0">
                                                    {formatAtuadorStatus(cvf.atuador)}
                                                </p>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Observações</h6>
                                                <p className="mb-0">{cvf.observacoes || "N/A"}</p>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row className="mt-4">
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Data de Criação</h6>
                                                <p className="mb-0">
                                                    {cvf.createdAt
                                                        ? new Date(cvf.createdAt).toLocaleString()
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Última Atualização</h6>
                                                <p className="mb-0">
                                                    {cvf.updatedAt
                                                        ? new Date(cvf.updatedAt).toLocaleString()
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Container>
        </ComponentErrorBoundary>
    );
}