"use client";

import React, { useMemo } from "react";
import { Card, Row, Col, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { ComponentErrorBoundary } from "../../components/ErrorBoundary";
import { CmsTableSkeleton } from "../../components/Loading";
import { CorretivasStatus } from "../../../types";

// Simple useFetch replacement to avoid problematic lib/hooks dependency
function useFetch<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      // Handle both standardized and legacy response formats
      if (
        typeof result === "object" &&
        result !== null &&
        "success" in result
      ) {
        if (!result.success) {
          throw new Error(result.error?.message || "API Error");
        }
        setData(result.data || null);
      } else {
        setData(result);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
}

// Interface da corretiva
interface Corretiva {
  id: string;
  status: CorretivasStatus;
}

// Interface para estatísticas
interface EstatisticaCorretiva {
  status: CorretivasStatus;
  total: number;
  color: string;
}

// Cores do gráfico
const COLORS: Record<CorretivasStatus, string> = {
  [CorretivasStatus.CONCLUIDO]: "#28a745",
  [CorretivasStatus.ANDAMENTO]: "#ffc107",
  [CorretivasStatus.ESPERA]: "#6c757d",
};

export default function CorretivaDashboard() {
  const router = useRouter();

  // Using custom hook for data fetching
  const {
    data: corretivas,
    loading,
    error,
  } = useFetch<Corretiva[]>("/api/corretivas");

  // Process statistics using useMemo for performance
  const estatisticas: EstatisticaCorretiva[] = useMemo(() => {
    if (!corretivas || !Array.isArray(corretivas)) {
      return [
        {
          status: CorretivasStatus.CONCLUIDO,
          total: 0,
          color: COLORS[CorretivasStatus.CONCLUIDO],
        },
        {
          status: CorretivasStatus.ANDAMENTO,
          total: 0,
          color: COLORS[CorretivasStatus.ANDAMENTO],
        },
        {
          status: CorretivasStatus.ESPERA,
          total: 0,
          color: COLORS[CorretivasStatus.ESPERA],
        },
      ];
    }

    const totalConcluido = corretivas.filter(
      (c) => c.status === CorretivasStatus.CONCLUIDO
    ).length;
    const totalAndamento = corretivas.filter(
      (c) => c.status === CorretivasStatus.ANDAMENTO
    ).length;
    const totalEspera = corretivas.filter(
      (c) => c.status === CorretivasStatus.ESPERA
    ).length;

    return [
      {
        status: CorretivasStatus.CONCLUIDO,
        total: totalConcluido,
        color: COLORS[CorretivasStatus.CONCLUIDO],
      },
      {
        status: CorretivasStatus.ANDAMENTO,
        total: totalAndamento,
        color: COLORS[CorretivasStatus.ANDAMENTO],
      },
      {
        status: CorretivasStatus.ESPERA,
        total: totalEspera,
        color: COLORS[CorretivasStatus.ESPERA],
      },
    ];
  }, [corretivas]);

  const getCardColor = (status: CorretivasStatus) => {
    switch (status) {
      case CorretivasStatus.CONCLUIDO:
        return "success";
      case CorretivasStatus.ANDAMENTO:
        return "warning";
      case CorretivasStatus.ESPERA:
        return "secondary";
      default:
        return "dark";
    }
  };

  const getStatusIcon = (status: CorretivasStatus) => {
    switch (status) {
      case CorretivasStatus.CONCLUIDO:
        return "bi-check-circle";
      case CorretivasStatus.ANDAMENTO:
        return "bi-clock";
      case CorretivasStatus.ESPERA:
        return "bi-pause-circle";
      default:
        return "bi-question-circle";
    }
  };

  const handleCardClick = (status: CorretivasStatus) => {
    // Mapeie para as rotas correspondentes
    switch (status) {
      case CorretivasStatus.CONCLUIDO:
        router.push("/pages/corretivas/corretivas-concluida");
        break;
      case CorretivasStatus.ANDAMENTO:
        router.push("/pages/corretivas");
        break;
      case CorretivasStatus.ESPERA:
        router.push("/pages/corretivas");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Dashboard de Corretivas">
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary mb-0">
            <i className="bi bi-tools me-2"></i>
            Dashboard de Corretivas
          </h1>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Row className="g-3 mb-4">
          {estatisticas.map((estat) => (
            <Col key={estat.status} xs={12} md={4}>
              <Card
                bg={getCardColor(estat.status).toLowerCase()}
                text="white"
                className="shadow-sm h-100 cursor-pointer"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease-in-out",
                }}
                onClick={() => handleCardClick(estat.status)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <i
                      className={`bi ${getStatusIcon(estat.status)}`}
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                    <span className="badge bg-light text-dark">
                      {estat.total}
                    </span>
                  </div>
                  <Card.Title className="h5 mb-1">
                    {estat.status}
                  </Card.Title>
                  <Card.Text className="display-6 mb-0">
                    {estat.total}
                  </Card.Text>
                  <small className="opacity-75">
                    Clique para visualizar
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">
              <i className="bi bi-pie-chart me-2"></i>
              Distribuição de Corretivas
            </h5>
          </Card.Header>
          <Card.Body>
            {estatisticas.every((stat) => stat.total === 0) ? (
              <Alert variant="info" className="text-center mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Nenhuma corretiva encontrada no sistema.
              </Alert>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estatisticas.filter((stat) => stat.total > 0)}
                    dataKey="total"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => `${entry.status}: ${entry.total}`}
                  >
                    {estatisticas
                      .filter((stat) => stat.total > 0)
                      .map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Status: ${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>

        <Row className="mt-4">
          <Col md={6}>
            <Card className="h-100">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Resumo
                </h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>Total de Corretivas:</strong>{" "}
                  {estatisticas.reduce((acc, stat) => acc + stat.total, 0)}
                </p>
                <p className="mb-2">
                  <strong>Taxa de Conclusão:</strong>{" "}
                  {estatisticas.reduce((acc, stat) => acc + stat.total, 0) >
                    0
                    ? `${(
                      ((estatisticas.find(
                        (s) => s.status === CorretivasStatus.CONCLUIDO
                      )?.total || 0) /
                        estatisticas.reduce(
                          (acc, stat) => acc + stat.total,
                          0
                        )) *
                      100
                    ).toFixed(1)}%`
                    : "0%"}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-lightbulb me-2"></i>
                  Ações Rápidas
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => router.push("/pages/corretivas")}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Nova Corretiva
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => router.push("/pages/corretivas")}
                  >
                    <i className="bi bi-list me-2"></i>
                    Ver Todas
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </ComponentErrorBoundary>
  );
}
