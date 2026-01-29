"use client";

import Link from "next/link";
import { Card, Container, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function ExecutarPreventivaPage() {
    const router = useRouter();

    const preventivaTypes = [
        {
            id: "lojas",
            title: "Preventiva de Lojas",
            description: "Executar manutenção preventiva completa de sensores e equipamentos das lojas",
            icon: "bi-shop",
            color: "primary",
            path: "/pages/preventivas/lojas",
            features: [
                "✓ Sensores de Temperatura Ambiente",
                "✓ Sensores de Movimento", 
                "✓ Botões de Pânico",
                "✓ Quadro de Automação"
            ]
        },
        {
            id: "casa-maquinas",
            title: "Preventiva de Casa de Máquinas",
            description: "Executar manutenção preventiva dos equipamentos da casa de máquinas",
            icon: "bi-gear",
            color: "success",
            path: "/pages/preventivas/casa-maquinas",
            features: [
                "✓ Equipamentos Elétricos",
                "✓ Sistema de Refrigeração",
                "✓ Quadros de Controle"
            ]
        },
        {
            id: "controle-acesso",
            title: "Preventiva de Controle de Acesso",
            description: "Executar manutenção preventiva dos sistemas de controle de acesso",
            icon: "bi-shield-lock",
            color: "warning",
            path: "/pages/preventivas/controle-acesso",
            features: [
                "✓ Leitores Biométricos",
                "✓ Câmeras de Segurança",
                "✓ Controladores de Portaria"
            ]
        },
        {
            id: "cvfs",
            title: "Preventiva de CVFs",
            description: "Executar manutenção preventiva dos sistemas de CVF",
            icon: "bi-wind",
            color: "info",
            path: "/pages/preventivas/cvfs",
            features: [
                "✓ Sistema de Refrigeração",
                "✓ Sistema de Umidificação",
                "✓ Filtros e Ventilação"
            ]
        }
    ];

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">
                        <i className="bi bi-play-circle me-2"></i>
                        Executar Preventiva
                    </h1>
                    <p className="text-muted mb-0">
                        Selecione o tipo de preventiva que deseja executar
                    </p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => router.push("/pages/preventivas")}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                </button>
            </div>

            <Row>
                {preventivaTypes.map((type) => (
                    <Col md={6} lg={3} className="mb-4" key={type.id}>
                        <Link href={type.path} className="text-decoration-none">
                            <Card className={`h-100 border-${type.color} border-2 hover-shadow`}>
                                <Card.Body>
                                    <div className="text-center mb-3">
                                        <div className={`rounded-circle bg-${type.color} d-inline-flex align-items-center justify-content-center mb-3`}
                                            style={{ width: '60px', height: '60px' }}>
                                            <i className={`bi ${type.icon} text-white`} style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <Card.Title className="h5 mb-2">{type.title}</Card.Title>
                                        <Card.Text className="text-muted small">
                                            {type.description}
                                        </Card.Text>
                                    </div>

                                    <div className="mt-3">
                                        <h6 className="small text-muted mb-2">Itens:</h6>
                                        <ul className="small mb-3">
                                            {type.features.map((feature, index) => (
                                                <li key={index} className="text-muted">{feature}</li>
                                            ))}
                                        </ul>
                                        <div className="text-center">
                                            <span className={`badge bg-${type.color}`}>Executar</span>
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
                            Como funciona a execução unificada
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <h6>Processo de Execução:</h6>
                                <ul>
                                    <li><strong>Seleção:</strong> Escolha o tipo de preventiva</li>
                                    <li><strong>Planejamento:</strong> Visualize o checklist completo</li>
                                    <li><strong>Execução:</strong> Siga os passos guiados</li>
                                    <li><strong>Documentação:</strong> Registre fotos e observações</li>
                                    <li><strong>Conclusão:</strong> Finalize e gere relatórios</li>
                                </ul>
                            </Col>
                            <Col md={6}>
                                <h6>Benefícios:</h6>
                                <ul>
                                    <li>Interface unificada para todos os tipos</li>
                                    <li>Checklists padronizados e configuráveis</li>
                                    <li>Captura de fotos obrigatória quando necessário</li>
                                    <li>Acompanhamento em tempo real do progresso</li>
                                    <li>Relatórios automáticos de execução</li>
                                </ul>
                            </Col>
                        </Row>

                        <div className="alert alert-success mt-3">
                            <h6 className="alert-heading">
                                <i className="bi bi-lightbulb me-2"></i>
                                Dica: Preventiva de Lojas
                            </h6>
                            <p className="mb-0">
                                Comece pela preventiva de lojas, que já está totalmente funcional
                                com todos os recursos implementados.
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
}