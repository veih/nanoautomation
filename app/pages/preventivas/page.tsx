"use client";

import Link from "next/link";
import { Card, Container, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function PreventivasPage() {
    const router = useRouter();

    const preventivaModules = [
        {
            id: "lojas",
            title: "Preventiva de Lojas",
            description: "Manutenção preventiva completa de sensores e equipamentos das lojas",
            icon: "bi-shop",
            color: "primary",
            path: "/pages/preventivas/lojas",
            features: [
                "✓ Sensores de Temperatura Ambiente",
                "✓ Sensores de Movimento",
                "✓ Sensores de Porta",
                "✓ Botões de Pânico",
                "✓ Quadro de Automação",
                "✓ Captura de Fotos Obrigatória"
            ]
        },
        {
            id: "casa-maquinas",
            title: "Preventiva de Casa de Máquinas",
            description: "Manutenção preventiva dos equipamentos da casa de máquinas",
            icon: "bi-gear",
            color: "success",
            path: "/pages/preventivas/casa-maquinas",
            features: [
                "✓ Agendamento Automático",
                "✓ Checklists Personalizados",
                "✓ Relatórios Técnicos",
                "✓ Gestão de Peças"
            ]
        },
        {
            id: "controle-acesso",
            title: "Preventiva de Controle de Acesso",
            description: "Manutenção preventiva dos sistemas de controle de acesso",
            icon: "bi-shield-lock",
            color: "warning",
            path: "/pages/preventivas/controle-acesso",
            features: [
                "✓ Leitores Biométricos",
                "✓ Câmeras de Segurança",
                "✓ Controles de Portaria",
                "✓ Sistemas de Vigilância"
            ]
        },
        {
            id: "cvfs",
            title: "Preventiva de CVFs",
            description: "Manutenção preventiva dos sistemas de CVF",
            icon: "bi-wind",
            color: "info",
            path: "/pages/preventivas/cvfs",
            features: [
                "✓ Sistema de Refrigeração",
                "✓ Sistema de Umidificação",
                "✓ Filtros e Ventilação",
                "✓ Controles Ambientais"
            ]
        }
    ];

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">
                        <i className="bi bi-tools me-2"></i>
                        Sistema de Preventivas
                    </h1>
                    <p className="text-muted mb-0">
                        Gestão completa de manutenção preventiva de todos os sistemas
                    </p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => router.back()}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                </button>
            </div>

            <Row>
                <Col md={12} className="mb-4">
                    <Card className="bg-primary text-white border-primary">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <i className="bi bi-play-circle" style={{ fontSize: '2rem' }}></i>
                                </div>
                                <div className="flex-grow-1">
                                    <Card.Title className="h4 mb-1 text-white">Executar Preventiva</Card.Title>
                                    <Card.Text className="mb-0">
                                        Acesse a interface unificada para executar qualquer tipo de preventiva
                                    </Card.Text>
                                </div>
                                <Link href="/pages/preventivas/executar" className="btn btn-light">
                                    <i className="bi bi-play me-1"></i>
                                    Iniciar Execução
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Row>
                {preventivaModules.map((module) => (
                    <Col md={6} lg={3} className="mb-4" key={module.id}>
                        <Link href={module.path} className="text-decoration-none">
                            <Card className={`h-100 border-${module.color} border-2 hover-shadow`}>
                                <Card.Body>
                                    <div className="text-center mb-3">
                                        <div className={`rounded-circle bg-${module.color} d-inline-flex align-items-center justify-content-center mb-3`}
                                            style={{ width: '60px', height: '60px' }}>
                                            <i className={`bi ${module.icon} text-white`} style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <Card.Title className="h5 mb-2">{module.title}</Card.Title>
                                        <Card.Text className="text-muted small">
                                            {module.description}
                                        </Card.Text>
                                    </div>

                                    <div className="mt-3">
                                        <h6 className="small text-muted mb-2">Recursos:</h6>
                                        <ul className="small mb-3">
                                            {module.features.map((feature, index) => (
                                                <li key={index} className="text-muted">{feature}</li>
                                            ))}
                                        </ul>
                                        <div className="text-center">
                                            <span className={`badge bg-${module.color}`}>Acessar Módulo</span>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>

            <div className="mt-5">
                <Card>
                    <Card.Header className="bg-primary text-white">
                        <h5 className="mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            Sobre o Sistema de Preventivas
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <h6>Funcionalidades Principais:</h6>
                                <ul>
                                    <li><strong>Agendamento Inteligente:</strong> Planejamento automático de preventivas</li>
                                    <li><strong>Checklists Digitais:</strong> Execução guiada com validações</li>
                                    <li><strong>Captura de Fotos:</strong> Documentação visual obrigatória</li>
                                    <li><strong>Relatórios Automáticos:</strong> Indicadores de desempenho em tempo real</li>
                                    <li><strong>Gestão de Equipes:</strong> Atribuição e acompanhamento de técnicos</li>
                                </ul>
                            </Col>
                            <Col md={6}>
                                <h6>Benefícios:</h6>
                                <ul>
                                    <li>Redução de falhas e paradas não programadas</li>
                                    <li>Melhoria na vida útil dos equipamentos</li>
                                    <li>Padronização dos procedimentos de manutenção</li>
                                    <li>Rastreabilidade completa das atividades</li>
                                    <li>Otimização dos recursos e custos</li>
                                </ul>
                            </Col>
                        </Row>

                        <div className="alert alert-info mt-3">
                            <h6 className="alert-heading">
                                <i className="bi bi-lightbulb me-2"></i>
                                Destaque: Preventiva de Lojas
                            </h6>
                            <p className="mb-0">
                                O módulo de preventiva de lojas já está totalmente funcional,
                                incluindo verificação de todos os sensores críticos e captura
                                obrigatória de fotos para documentação.
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
}