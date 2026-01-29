/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, Row, Col, Alert, Form, Button, Badge } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CmsTableSkeleton } from "../../components/Loading";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";
import { Cvf } from "../../../types";
import PDFGeradorCvf from "../../components/PDFs/PDFGeradorCvf";
import PdfTodosDefeitosButton from "../../components/PDFs/PdfTodosDefeitosButton";

// Simple useFetch hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  const refetch = () => {
    // Simple refetch by triggering useEffect
  };

  return { data, loading, error, refetch };
}

export default function DashboardCvf() {
  const router = useRouter();

  // Data fetching
  const {
    data: apiResponse,
    loading,
    error,
    refetch,
  } = useFetch<any>("/api/cvf");

  // Process CVFs data
  const cvfs = useMemo(() => {
    if (!apiResponse) return [];

    // The API returns { cvfs: [...], total_items, page, limit }
    const cvfsArray = apiResponse.cvfs || apiResponse;

    // Ensure we have an array
    if (!Array.isArray(cvfsArray)) {
      console.warn("API response does not contain cvfs array:", apiResponse);
      return [];
    }

    return cvfsArray;
  }, [apiResponse]);

  // Filter and search state
  const [searchText, setSearchText] = useState("");

  // Filtered data
  const filteredCvfs = useMemo(() => {
    if (!cvfs.length) return [];

    let filtered = cvfs;

    const q = searchText.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (c: Cvf) =>
          (c.vigaFria && c.vigaFria.toLowerCase().includes(q)) ||
          (c.piso && c.piso.toLowerCase().includes(q)) ||
          (c.sensorTemperatura &&
            c.sensorTemperatura.toLowerCase().includes(q)) ||
          (c.sensorUmidade && c.sensorUmidade.toLowerCase().includes(q)) ||
          (c.atuador && c.atuador.toLowerCase().includes(q)) ||
          (c.localizacaoQuadro &&
            c.localizacaoQuadro.toLowerCase().includes(q)) ||
          (c.localizacaoValvula &&
            c.localizacaoValvula.toLowerCase().includes(q))
      );
    }

    return [...filtered].sort((a: Cvf, b: Cvf) => {
      const pisoA = (a.piso ?? "").localeCompare(b.piso ?? "");
      if (pisoA !== 0) return pisoA;
      return (a.vigaFria ?? "").localeCompare(b.vigaFria ?? "");
    });
  }, [cvfs, searchText]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: cvfs.length,
      withTemperatureSensor: cvfs.filter((c: Cvf) => c.sensorTemperatura)
        .length,
      withHumiditySensor: cvfs.filter((c: Cvf) => c.sensorUmidade).length,
      withActuator: cvfs.filter((c: Cvf) => c.atuador).length,
      withDefects: cvfs.filter(
        (c: Cvf) =>
          c.sensorTemperatura === "DEFEITO" ||
          c.sensorUmidade === "DEFEITO" ||
          c.atuador === "DEFEITO"
      ).length,
    };
  }, [cvfs]);

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Dashboard CVF">
      <div className="container-fluid">
        <ToastContainer position="top-right" autoClose={2000} />

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0 text-gray-800">
              <i className="bi bi-building me-2"></i>
              Dashboard CVF
            </h1>
            <p className="text-muted mb-0">
              Gerenciamento de Unidades de Viga Fria
            </p>
          </div>
          <div className="d-flex gap-2">
            <PDFGeradorCvf cvfsData={cvfs} />
            <Button variant="primary" onClick={() => router.push("/pages/cvf")}>
              <i className="bi bi-gear me-2"></i>
              Gerenciar CVFs
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Search Filter */}
        <Row className="mb-4 g-3 justify-content-center">
          <Col md={6}>
            <Form.Group controlId="searchCvf">
              <Form.Control
                className="text-primary search-input"
                type="text"
                placeholder="Digite a viga fria, piso, sensor, atuador ou localização..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row className="mb-4 g-3">
          <Col xs={6} sm={4} md={3} lg={2}>
            <Card bg="primary" text="white" className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title className="h5 mb-0">
                  <i className="bi bi-building me-2"></i>
                  {stats.total}
                </Card.Title>
                <Card.Text className="small mb-0">Total CVFs</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={4} md={3} lg={2}>
            <Card bg="info" text="white" className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title className="h5 mb-0">
                  <i className="bi bi-thermometer-half me-2"></i>
                  {stats.withTemperatureSensor}
                </Card.Title>
                <Card.Text className="small mb-0">Com Sensor Temp.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={4} md={3} lg={2}>
            <Card bg="success" text="white" className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title className="h5 mb-0">
                  <i className="bi bi-moisture me-2"></i>
                  {stats.withHumiditySensor}
                </Card.Title>
                <Card.Text className="small mb-0">Com Sensor Umid.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={4} md={3} lg={2}>
            <Card bg="warning" text="white" className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title className="h5 mb-0">
                  <i className="bi bi-speedometer2 me-2"></i>
                  {stats.withActuator}
                </Card.Title>
                <Card.Text className="small mb-0">Com Atuador</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={4} md={3} lg={2}>
            <Card
              bg="danger"
              text="white"
              className="mb-3 shadow-sm cursor-pointer"
              onClick={() => router.push("/pages/cvf/defeitos")}
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <Card.Title className="h5 mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {stats.withDefects}
                </Card.Title>
                <Card.Text className="small mb-0">Com Defeito</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* CVFs Table */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-list me-2"></i>
                    Lista de CVFs
                  </h5>
                  <Badge bg="secondary">{filteredCvfs.length} itens</Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {filteredCvfs.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-building fs-1 text-muted mb-3"></i>
                    <p className="text-muted mb-0">
                      {searchText
                        ? "Nenhum CVF encontrado com os critérios de busca."
                        : "Nenhum CVF cadastrado."}
                    </p>
                    {!searchText && (
                      <Button
                        variant="primary"
                        className="mt-3"
                        onClick={() => router.push("/pages/cvf")}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Adicionar CVF
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Viga Fria</th>
                          <th>Piso</th>
                          <th>Sensor Temperatura</th>
                          <th>Sensor Umidade</th>
                          <th>Atuador</th>
                          <th>Localização Quadro</th>
                          <th>Localização Válvula</th>
                          <th className="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCvfs.map((cvf: Cvf) => (
                          <tr key={cvf.id}>
                            <td>{cvf.vigaFria || "N/A"}</td>
                            <td>{cvf.piso || "N/A"}</td>
                            <td>{cvf.sensorTemperatura || "N/A"}</td>
                            <td>{cvf.sensorUmidade || "N/A"}</td>
                            <td>{cvf.atuador || "N/A"}</td>
                            <td>{cvf.localizacaoQuadro || "N/A"}</td>
                            <td>{cvf.localizacaoValvula || "N/A"}</td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() =>
                                  router.push(`/pages/cvf/${cvf.id}`)
                                }
                              >
                                <i className="bi bi-eye me-1"></i>
                                Detalhes
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </ComponentErrorBoundary>
  );
}