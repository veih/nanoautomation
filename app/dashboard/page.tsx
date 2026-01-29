// app/dashboard/page.tsx
"use client";

import React, { useState, JSX } from "react";
import { Card, Row, Col, Container, Button, Modal } from "react-bootstrap";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { ComponentErrorBoundary } from "../components/ErrorBoundary";
// Interfaces

interface DashboardConfig {
  href: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
  category?: string; // Added category field
}

interface QuickAction {
  title: string;
  href: string;
  icon: string;
  description: string;
  variant: string;
}

export default function DashboardHomePage(): JSX.Element {
  const [showWelcome, setShowWelcome] = useState(false);

  // Dashboard configurations grouped by category
  const dashboards: DashboardConfig[] = [
    // Fire Safety Systems
    {
      href: "/dashboard/dashboardSdai",
      title: "Sistema SDAI",
      icon: "bi bi-broadcast",
      description: "Sistema de Detecção e Alarme de Incêndio",
      color: "#dc3545",
      gradient: "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)",
      category: "Segurança contra Incêndio"
    },
    {
      href: "/dashboard/dashboardCvf",
      title: "Sistema CVF",
      icon: "bi bi-building",
      description: "Gerenciamento de Unidades de Viga Frea",
      color: "#20c997",
      gradient: "linear-gradient(135deg, #20c997 0%, #0dcaf0 100%)",
      category: "Segurança contra Incêndio"
    },
    {
      href: "/dashboard/dashboardScp",
      title: "Sistema SCP",
      icon: "bi bi-rocket-takeoff",
      description: "Sistema de Controle e Proteção Avançado",
      color: "#fd7e14",
      gradient: "linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)",
      category: "Segurança contra Incêndio"
    },

    // Building Management
    {
      href: "/dashboard/dashboardCms",
      title: "Casa de Máquinas",
      icon: "bi bi-gear",
      description: "Gestão completa de casas de máquinas e equipamentos",
      color: "#0d6efd",
      gradient: "linear-gradient(135deg, #0d6efd 0%, #0ea5e9 100%)",
      category: "Gestão Predial"
    },
    {
      href: "/dashboard/dashboardLojas",
      title: "Monitoramento de Lojas",
      icon: "bi bi-shop",
      description: "Supervisão de estabelecimentos comerciais",
      color: "#198754",
      gradient: "linear-gradient(135deg, #198754 0%, #20c997 100%)",
      category: "Gestão Predial"
    },

    // Access Control
    {
      href: "/dashboard/dashboardAccessControl",
      title: "Controle de Acesso",
      icon: "bi bi-shield-lock",
      description: "Gestão de controladoras, eletroímãs, botões e sensores",
      color: "#6610f2",
      gradient: "linear-gradient(135deg, #6610f2 0%, #6f42c1 100%)",
      category: "Controle de Acesso"
    },

    // Maintenance Systems
    {
      href: "/dashboard/dashboardCorretiva",
      title: "Ações Corretivas",
      icon: "bi bi-lightning",
      description: "Gestão de manutenções e correções de sistema",
      color: "#6f42c1",
      gradient: "linear-gradient(135deg, #6f42c1 0%, #d63384 100%)",
      category: "Manutenção"
    },

    // Special Systems
    {
      href: "/dashboard/dashboardSmart32",
      title: "Smart32 Gestos",
      icon: "bi bi-hand-index-thumb",
      description: "Monitoramento de gestos e interações",
      color: "#0dcaf0",
      gradient: "linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%)",
      category: "Sistemas Especiais"
    },
  ];

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: "Nova Manutenção",
      href: "/pages/corretivas",
      icon: "bi bi-plus-circle",
      description: "Registrar nova ação corretiva",
      variant: "primary",
    },
    {
      title: "Relatórios",
      href: "/pages/api-status",
      icon: "bi bi-file-earmark-text",
      description: "Gerar relatórios do sistema",
      variant: "success",
    },
    {
      title: "Relatório Consolidado de Defeitos",
      href: "#",
      icon: "bi bi-file-earmark-pdf",
      description: "PDF com todos os dispositivos com status DEFEITO",
      variant: "danger",
    },
    {
      title: "Dispositivos com Defeito",
      href: "/pages/defeitos",
      icon: "bi bi-exclamation-triangle",
      description: "Visualizar todos os dispositivos com status DEFEITO",
      variant: "warning",
    },
    {
      title: "Todos os Gráficos",
      href: "/dashboard/charts",
      icon: "bi bi-bar-chart",
      description: "Visualizar todos os gráficos em uma única página",
      variant: "info",
    },
    {
      title: "Responçãveis Configurações",
      href: "/pages/colaboradores",
      icon: "bi bi-gear",
      description: "Configurar sistema",
      variant: "secondary",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 400,
      },
    },
  };

  return (
    <ComponentErrorBoundary>
      <Container fluid className="dashboard-home">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Row className="mb-4">
            <Col>
              <h1 className="display-4 fw-bold text-primary mb-2">
                <i className="bi bi-speedometer2 me-3" aria-hidden="true"></i>
                Dashboard Nanoautomation
              </h1>
            </Col>
          </Row>
        </motion.div>

        {/* Main Dashboards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row className="mb-4">
            <Col>
              <h2 className="h3 fw-semibold mb-3">
                <i className="bi bi-grid-3x3-gap me-2" aria-hidden="true"></i>
                Módulos do Sistema
              </h2>
            </Col>
          </Row>

          <Row>
            <AnimatePresence>
              {dashboards.map((dashboard) => (
                <Col key={dashboard.href} md={4} className="mb-4">
                  <motion.div variants={itemVariants} whileHover="hover" layout>
                    <Link
                      href={dashboard.href}
                      style={{ textDecoration: "none" }}
                    >
                      <motion.div variants={cardHoverVariants}>
                        <Card
                          className="h-100 border-0 shadow-sm position-relative overflow-hidden dashboard-card"
                          style={{
                            backgroundColor: "white",
                            borderLeft: `4px solid ${dashboard.color}`,
                            minHeight: "200px",
                          }}
                        >
                          <Card.Body className="text-dark d-flex flex-column">
                            <div className="mb-3">
                              <i
                                className={`${dashboard.icon} display-4 mb-3`}
                                style={{ color: dashboard.color }}
                                aria-hidden="true"
                              ></i>
                              <Card.Title
                                className="h4 fw-bold mb-2"
                                style={{ color: dashboard.color }}
                              >
                                {dashboard.title}
                              </Card.Title>
                              <Card.Text className="text-muted mb-3">
                                {dashboard.description}
                              </Card.Text>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary">
                              <span className="fw-semibold text-dark">
                                Acessar Módulo
                              </span>
                              <i
                                className="bi bi-arrow-right fs-5"
                                style={{ color: dashboard.color }}
                              ></i>
                            </div>
                          </Card.Body>
                        </Card>
                      </motion.div>
                    </Link>
                  </motion.div>
                </Col>
              ))}
            </AnimatePresence>
          </Row>
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Row className="mb-4">
            <Col>
              <h2 className="h3 fw-semibold mb-3">
                <i className="bi bi-lightning me-2" aria-hidden="true"></i>
                Ações Rápidas
              </h2>
            </Col>
          </Row>

          <Row>
            {quickActions.map((action, index) => (
              <Col key={index} md={4} className="mb-3">
                {action.title === "Relatório Consolidado de Defeitos" ? (
                  <Card className="h-100 border-0 shadow-sm quick-action-card">
                    {/* <Card.Body className="text-center p-4">
                      <i
                        className={`${action.icon} display-6 text-${action.variant} mb-3`}
                      ></i>
                      <Card.Title className="h5 fw-semibold">
                        {action.title}
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        {action.description}
                      </Card.Text>
                      <div className="mt-3">
                        <PdfTodosDefeitosButton />
                      </div>
                    </Card.Body> */}
                  </Card>
                ) : (
                  <Link href={action.href} style={{ textDecoration: "none" }}>
                    <Card className="h-100 border-0 shadow-sm quick-action-card">
                      <Card.Body className="text-center p-4">
                        <i
                          className={`${action.icon} display-6 text-${action.variant} mb-3`}
                        ></i>
                        <Card.Title className="h5 fw-semibold">
                          {action.title}
                        </Card.Title>
                        <Card.Text className="text-muted small">
                          {action.description}
                        </Card.Text>
                        <Button
                          variant={action.variant}
                          size="sm"
                          className="rounded-pill"
                        >
                          Acessar <i className="bi bi-arrow-right ms-1"></i>
                        </Button>
                      </Card.Body>
                    </Card>
                  </Link>
                )}
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* Welcome Modal */}
        <Modal show={showWelcome} onHide={() => setShowWelcome(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-hand-thumbs-up text-primary me-2"></i>
              Bem-vindo ao Dashboard Nanoautomation!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Bem-vindo ao centro de controle da Nanoautomation! Aqui você pode:
            </p>
            <ul>
              <li>Acessar todos os módulos do sistema</li>
              <li>Navegar entre diferentes funcionalidades</li>
              <li>Executar ações rápidas do sistema</li>
              <li>Gerenciar configurações e relatórios</li>
            </ul>
            <p className="mb-0 text-muted small">
              <i className="bi bi-lightbulb me-1"></i>
              Dica: Use o menu lateral para navegação rápida entre os módulos.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowWelcome(false)}>
              Entendi, vamos começar!
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <style jsx>{`
        .dashboard-home {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .dashboard-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px !important;
          overflow: hidden;
          border: 1px solid #e9ecef;
        }

        .dashboard-card:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
          border-color: transparent;
        }

        .quick-action-card {
          transition: all 0.3s ease;
          border-radius: 12px !important;
        }

        .quick-action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
        }

        @media (max-width: 768px) {
          .dashboard-card {
            min-height: 180px;
          }

          .display-4 {
            font-size: 2rem;
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .dashboard-card,
          .quick-action-card {
            transition: none;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .dashboard-card {
            border: 2px solid currentColor !important;
          }
        }
      `}</style>
    </ComponentErrorBoundary>
  );
}