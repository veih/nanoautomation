"use client";

import React from "react";
import { Container, Card, Row, Col, Alert, Button } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";

export default function DashboardSdai() {
  return (
    <ComponentErrorBoundary componentName="Dashboard SDAI">
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary mb-0">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard SDAI
          </h1>
        </div>

        <Alert variant="info" className="mb-4">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Em Desenvolvimento:</strong> Este dashboard está sendo desenvolvido e estará disponível em breve.
        </Alert>

        <Row className="g-4">
          <Col md={6} lg={4}>
            <Card className="h-100 border-primary">
              <Card.Body className="text-center">
                <i className="bi bi-bar-chart-line text-primary" style={{ fontSize: '3rem' }}></i>
                <Card.Title className="mt-3">Relatórios</Card.Title>
                <Card.Text className="text-muted">
                  Visualização de dados e estatísticas do SDAI
                </Card.Text>
                <Button variant="outline-primary" disabled>
                  <i className="bi bi-clock me-2"></i>
                  Em Breve
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="h-100 border-success">
              <Card.Body className="text-center">
                <i className="bi bi-gear text-success" style={{ fontSize: '3rem' }}></i>
                <Card.Title className="mt-3">Configurações</Card.Title>
                <Card.Text className="text-muted">
                  Gerenciamento de configurações do sistema
                </Card.Text>
                <Button variant="outline-success" disabled>
                  <i className="bi bi-clock me-2"></i>
                  Em Breve
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="h-100 border-warning">
              <Card.Body className="text-center">
                <i className="bi bi-bell text-warning" style={{ fontSize: '3rem' }}></i>
                <Card.Title className="mt-3">Alertas</Card.Title>
                <Card.Text className="text-muted">
                  Sistema de notificações e alertas
                </Card.Text>
                <Button variant="outline-warning" disabled>
                  <i className="bi bi-clock me-2"></i>
                  Em Breve
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mt-4">
          <Card.Header className="bg-light">
            <h5 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Funcionalidades Planejadas
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-check2 text-success me-2"></i>
                    Dashboard de monitoramento em tempo real
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check2 text-success me-2"></i>
                    Relatórios de performance
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check2 text-success me-2"></i>
                    Gráficos e métricas customizáveis
                  </li>
                </ul>
              </Col>
              <Col md={6}>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-check2 text-success me-2"></i>
                    Sistema de alertas inteligentes
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check2 text-success me-2"></i>
                    Integração com outros módulos
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check2 text-success me-2"></i>
                    Export de dados e relatórios
                  </li>
                </ul>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </ComponentErrorBoundary>
  );
}
