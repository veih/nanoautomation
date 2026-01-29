"use client";

import { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function PreventivaControleAcessoPage() {
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
                <p className="mt-2">Carregando preventivas de controle de acesso...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">
                        <i className="bi bi-shield-lock me-2"></i>
                        Preventiva de Controle de Acesso
                    </h1>
                    <p className="text-muted mb-0">
                        Gestão de manutenção preventiva dos sistemas de controle de acesso
                    </p>
                </div>
                <Button variant="secondary" onClick={() => router.push("/pages/preventivas")}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                </Button>
            </div>

            <Row>
                <Col md={6}>
                    <Card>
                        <Card.Body className="text-center">
                            <i className="bi bi-door-open text-primary" style={{ fontSize: '3rem' }}></i>
                            <Card.Title className="mt-3">Leitores Biométricos</Card.Title>
                            <Card.Text>
                                Manutenção preventiva de leitores biométricos e cartográficos
                            </Card.Text>
                            <Button variant="outline-primary">Gerenciar</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body className="text-center">
                            <i className="bi bi-camera-video text-success" style={{ fontSize: '3rem' }}></i>
                            <Card.Title className="mt-3">Câmeras de Segurança</Card.Title>
                            <Card.Text>
                                Verificação e limpeza das câmeras do sistema de vigilância
                            </Card.Text>
                            <Button variant="outline-success">Gerenciar</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="mt-4">
                <Card.Header className="bg-warning text-dark">
                    <h5 className="mb-0">
                        <i className="bi bi-cone-striped me-2"></i>
                        Funcionalidade em Construção
                    </h5>
                </Card.Header>
                <Card.Body>
                    <p>
                        Esta funcionalidade será implementada em breve com as seguintes características:
                    </p>
                    <ul>
                        <li>Agendamento de verificações periódicas</li>
                        <li>Testes de funcionamento dos equipamentos</li>
                        <li>Atualização de firmware e software</li>
                        <li>Limpeza e manutenção física</li>
                        <li>Relatórios de disponibilidade do sistema</li>
                    </ul>
                </Card.Body>
            </Card>
        </Container>
    );
}