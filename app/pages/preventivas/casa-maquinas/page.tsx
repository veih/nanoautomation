"use client";

import { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function PreventivaCasaMaquinasPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-2">Carregando preventivas de casa de máquinas...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">
                        <i className="bi bi-gear me-2"></i>
                        Preventiva de Casa de Máquinas
                    </h1>
                    <p className="text-muted mb-0">
                        Gestão de manutenção preventiva da casa de máquinas
                    </p>
                </div>
                <Button variant="secondary" onClick={() => router.push("/pages/preventivas")}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                </Button>
            </div>

            <Row>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-calendar-check text-white" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <Card.Title>Agendamento</Card.Title>
                            <Card.Text>
                                Programe e gerencie as datas de preventivas
                            </Card.Text>
                            <Button variant="primary">Acessar</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-clipboard-check text-white" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <Card.Title>Checklists</Card.Title>
                            <Card.Text>
                                Execute checklists personalizados para cada equipamento
                            </Card.Text>
                            <Button variant="success">Acessar</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <div className="rounded-circle bg-info d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-graph-up text-white" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <Card.Title>Relatórios</Card.Title>
                            <Card.Text>
                                Visualize relatórios e indicadores de desempenho
                            </Card.Text>
                            <Button variant="info">Acessar</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="mt-4">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Em Desenvolvimento
                    </h5>
                </Card.Header>
                <Card.Body>
                    <p>
                        Esta seção está em desenvolvimento. Em breve você poderá:
                    </p>
                    <ul>
                        <li>Cadastrar equipamentos da casa de máquinas</li>
                        <li>Criar planos de manutenção preventiva</li>
                        <li>Agendar preventivas automaticamente</li>
                        <li>Registrar execução de atividades</li>
                        <li>Gerar relatórios de desempenho</li>
                    </ul>
                </Card.Body>
            </Card>
        </Container>
    );
}