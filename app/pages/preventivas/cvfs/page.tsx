"use client";

import { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function PreventivaCvfsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
    }, []);

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-2">Carregando preventivas de CVFs...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">
                        <i className="bi bi-wind me-2"></i>
                        Preventiva de CVFs
                    </h1>
                    <p className="text-muted mb-0">
                        Gestão de manutenção preventiva dos sistemas de CVF
                    </p>
                </div>
                <Button variant="secondary" onClick={() => router.push("/pages/preventivas")}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                </Button>
            </div>

            <Row>
                <Col md={4}>
                    <Card className="text-center border-info">
                        <Card.Body>
                            <div className="rounded-circle bg-info d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ width: '70px', height: '70px' }}>
                                <i className="bi bi-thermometer-half text-white" style={{ fontSize: '1.8rem' }}></i>
                            </div>
                            <Card.Title>Sistema de Refrigeração</Card.Title>
                            <Card.Text>
                                Verificação de compressores, condensadores e evaporadores
                            </Card.Text>
                            <Button variant="info">Acessar</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center border-success">
                        <Card.Body>
                            <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ width: '70px', height: '70px' }}>
                                <i className="bi bi-droplet text-white" style={{ fontSize: '1.8rem' }}></i>
                            </div>
                            <Card.Title>Sistema de Umidificação</Card.Title>
                            <Card.Text>
                                Manutenção de umidificadores e controle de umidade
                            </Card.Text>
                            <Button variant="success">Acessar</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center border-warning">
                        <Card.Body>
                            <div className="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ width: '70px', height: '70px' }}>
                                <i className="bi bi-filter text-dark" style={{ fontSize: '1.8rem' }}></i>
                            </div>
                            <Card.Title>Filtros e Ventilação</Card.Title>
                            <Card.Text>
                                Troca de filtros e verificação dos sistemas de ventilação
                            </Card.Text>
                            <Button variant="warning">Acessar</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="mt-4">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        <i className="bi bi-tools me-2"></i>
                        Planejamento de Preventivas CVF
                    </h5>
                </Card.Header>
                <Card.Body>
                    <p>
                        O sistema de preventivas para CVFs incluirá:
                    </p>
                    <Row>
                        <Col md={6}>
                            <h6>Manutenções Programadas:</h6>
                            <ul>
                                <li>Limpeza de serpentinas e filtros</li>
                                <li>Verificação de níveis de refrigerante</li>
                                <li>Teste de sensores de temperatura e umidade</li>
                                <li>Inspeção de válvulas e dutos</li>
                            </ul>
                        </Col>
                        <Col md={6}>
                            <h6>Controles e Monitoramento:</h6>
                            <ul>
                                <li>Calibração de controladores</li>
                                <li>Atualização de firmware</li>
                                <li>Verificação de alarmes e proteções</li>
                                <li>Análise de eficiência energética</li>
                            </ul>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}