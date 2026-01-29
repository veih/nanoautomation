"use client";

import React, { useMemo, useState } from "react";
import { Table, Card, Container, Row, Col, Form, Alert } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";

// Interface para definir a estrutura de um cabo elétrico
interface CaboEletrico {
  bitola: string;
  aplicacao: string;
  caracteristicas: string;
  capacidadeCorrente: string;
  cor: string;
}

// Dados de exemplo para os cabos elétricos
const dadosCabos: CaboEletrico[] = [
  {
    bitola: "1.5 mm²",
    aplicacao: "Circuitos de iluminação (lâmpadas, luminárias de baixo consumo)",
    caracteristicas: "Fio de cobre isolado com PVC, flexível, 750V",
    capacidadeCorrente: "15.5 A (127V) / 10 A (220V)",
    cor: "Branco, Azul Claro, Amarelo, Vermelho, Preto",
  },
  {
    bitola: "2.5 mm²",
    aplicacao: "Circuitos de tomadas de uso geral (TUGs) - geladeiras, TVs, computadores",
    caracteristicas: "Fio de cobre isolado com PVC, flexível, 750V",
    capacidadeCorrente: "21 A (127V) / 15 A (220V)",
    cor: "Branco, Azul Claro, Amarelo, Vermelho, Preto",
  },
  {
    bitola: "4.0 mm²",
    aplicacao: "Circuitos de tomadas de uso específico (TUEs) - micro-ondas, máquinas de lavar, chuveiros (baixa potência)",
    caracteristicas: "Fio de cobre isolado com PVC, flexível, 750V",
    capacidadeCorrente: "28 A (127V) / 20 A (220V)",
    cor: "Branco, Azul Claro, Amarelo, Vermelho, Preto",
  },
  {
    bitola: "6.0 mm²",
    aplicacao: "Circuitos de chuveiros elétricos, torneiras elétricas, fornos elétricos (média potência)",
    caracteristicas: "Fio de cobre isolado com PVC, flexível, 750V",
    capacidadeCorrente: "36 A (127V) / 25 A (220V)",
    cor: "Branco, Azul Claro, Amarelo, Vermelho, Preto",
  },
  {
    bitola: "10.0 mm²",
    aplicacao: "Entrada de energia (ramal de entrada), circuitos de alta potência",
    caracteristicas: "Fio de cobre isolado com PVC, flexível ou rígido, 750V / 1kV",
    capacidadeCorrente: "50 A (127V) / 35 A (220V)",
    cor: "Branco, Azul Claro, Amarelo, Vermelho, Preto",
  },
  {
    bitola: "16.0 mm²",
    aplicacao: "Entrada de energia (ramal de entrada) para residências maiores, circuitos industriais",
    caracteristicas: "Fio de cobre isolado com PVC, flexível ou rígido, 750V / 1kV",
    capacidadeCorrente: "68 A (127V) / 46 A (220V)",
    cor: "Branco, Azul Claro, Amarelo, Vermelho, Preto",
  },
  {
    bitola: "25.0 mm²",
    aplicacao: "Entrada de energia para edifícios, grandes instalações comerciais/industriais",
    caracteristicas: "Fio de cobre isolado com PVC/XLPE, flexível ou rígido, 750V / 1kV",
    capacidadeCorrente: "89 A (127V) / 62 A (220V)",
    cor: "Branco, Azul Claro, Amarelo, Vermelho, Preto",
  },
];

const CaboEletricoInfo: React.FC = () => {
  const [searchText, setSearchText] = useState("");

  // Filter cables based on search text
  const cabosFiltrados = useMemo(() => {
    const lowerCaseSearchText = searchText.toLowerCase();

    return dadosCabos.filter(cabo =>
      cabo.bitola.toLowerCase().includes(lowerCaseSearchText) ||
      cabo.aplicacao.toLowerCase().includes(lowerCaseSearchText) ||
      cabo.caracteristicas.toLowerCase().includes(lowerCaseSearchText) ||
      cabo.capacidadeCorrente.toLowerCase().includes(lowerCaseSearchText)
    );
  }, [searchText]);

  return (
    <ComponentErrorBoundary componentName="Informações de Cabos">
      <Container className="py-4">
        <Card className="mb-4 shadow">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="text-primary mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Tabela de Referência de Cabos Elétricos
              </h1>
            </div>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="searchCabos">
                  <Form.Control
                    type="text"
                    placeholder="Pesquisar por bitola, aplicação, características..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="search-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info" className="mb-4">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Importante:</strong> Esta tabela fornece informações gerais sobre as bitolas de cabos
              elétricos mais comuns e suas características. Sempre consulte um
              eletricista qualificado e as normas técnicas locais (como a NBR 5410 no
              Brasil) para dimensionamento e instalação corretos.
            </Alert>
          </Card.Body>
        </Card>

        {cabosFiltrados.length === 0 ? (
          <Alert variant="warning" className="text-center">
            <i className="bi bi-search me-2"></i>
            Nenhum cabo encontrado com os filtros aplicados. Tente ajustar sua pesquisa.
          </Alert>
        ) : (
          <Card className="shadow">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table striped bordered hover className="mb-0">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th>
                        <i className="bi bi-rulers me-2"></i>
                        Bitola
                      </th>
                      <th>
                        <i className="bi bi-gear me-2"></i>
                        Aplicação Comum
                      </th>
                      <th>
                        <i className="bi bi-list-check me-2"></i>
                        Características
                      </th>
                      <th>
                        <i className="bi bi-lightning me-2"></i>
                        Capacidade de Corrente (A) *
                      </th>
                      <th>
                        <i className="bi bi-palette me-2"></i>
                        Cores Comuns
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cabosFiltrados.map((cabo, index) => (
                      <tr key={index}>
                        <td>
                          <span className="badge bg-primary fs-6">{cabo.bitola}</span>
                        </td>
                        <td>{cabo.aplicacao}</td>
                        <td>
                          <small className="text-muted">{cabo.caracteristicas}</small>
                        </td>
                        <td>
                          <span className="fw-bold text-success">{cabo.capacidadeCorrente}</span>
                        </td>
                        <td>
                          <small>{cabo.cor}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        <Alert variant="warning" className="mt-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Aviso Legal:</strong> Os valores de capacidade de corrente são aproximados e podem variar
          dependendo do método de instalação, temperatura ambiente, número de
          condutores no eletroduto e outros fatores, conforme a NBR 5410. Sempre
          utilize tabelas de dimensionamento específicas e a orientação de um
          profissional qualificado.
        </Alert>

        <Card className="mt-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <i className="bi bi-book me-2"></i>
              Referências e Normas
            </h5>
          </Card.Header>
          <Card.Body>
            <ul className="mb-0">
              <li><strong>NBR 5410:</strong> Instalações elétricas de baixa tensão</li>
              <li><strong>NBR 14136:</strong> Plugues e tomadas para uso doméstico</li>
              <li><strong>NR-10:</strong> Segurança em instalações e serviços em eletricidade</li>
              <li><strong>ABNT NBR 5471:</strong> Condutores elétricos</li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </ComponentErrorBoundary>
  );
};

export default CaboEletricoInfo;