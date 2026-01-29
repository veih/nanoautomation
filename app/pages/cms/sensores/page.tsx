"use client";

import React, { useState, useMemo } from "react";
import { Button, Card, Form, Alert, Row, Col } from "react-bootstrap";
import { Sensor, SensorStatus, Equipamento, Cm } from "../../../../types";
import SensoresTable from "./SensoresTable";
import SensorFormModal from "./SensorFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";

// Simple local hooks to replace lib/hooks (removed due to infinite callback issues)
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return { data, loading, error, refetch: fetchData };
}

function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

export default function SensoresPage() {
  // Using custom hooks for better state management
  const {
    data: rawSensores,
    loading,
    error,
    refetch,
  } = useFetch<Sensor[]>("/api/cmsApi/sensores");
  const { data: equipamentos } = useFetch<Equipamento[]>(
    "/api/cmsApi/maquinas"
  );
  const { data: cms } = useFetch<Cm[]>("/api/cmsApi/cms");

  // Modal states using custom hook
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
  const {
    isOpen: showDeleteModal,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useModal();

  // Local state
  const [editSensor, setEditSensor] = useState<Sensor | null>(null);
  const [sensorToDelete, setSensorToDelete] = useState<Sensor | null>(null);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<SensorStatus | "">("");

  // Process sensores data to ensure estado has default value
  const sensores = useMemo(() => {
    return rawSensores
      ? rawSensores.map((s) => ({
        ...s,
        estado: s.estado || SensorStatus.DESCONHECIDO,
      }))
      : [];
  }, [rawSensores]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = sensores.length;
    const operacionais = sensores.filter(
      (s) => s.estado === SensorStatus.OPERACIONAL
    ).length;
    const defeitos = sensores.filter(
      (s) => s.estado === SensorStatus.DEFEITO
    ).length;
    const manutencao = sensores.filter(
      (s) => s.estado === SensorStatus.MANUTENCAO
    ).length;

    return { total, operacionais, defeitos, manutencao };
  }, [sensores]);

  // --- Filtragem ---
  const sensoresFiltrados = useMemo(() => {
    return sensores.filter((s) => {
      const matchesBusca =
        s.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        s.tipo?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        s.equipamento?.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        s.equipamento?.cm?.nome
          .toLowerCase()
          .includes(filtroBusca.toLowerCase());

      const matchesStatus = filtroStatus ? s.estado === filtroStatus : true;

      return matchesBusca && matchesStatus;
    });
  }, [sensores, filtroBusca, filtroStatus]);

  // Event handlers
  const abrirModalEdicao = (s: Sensor) => {
    setEditSensor(s);
    openModal();
  };

  const abrirModalAdicao = () => {
    setEditSensor(null);
    openModal();
  };

  const confirmarDelecao = (s: Sensor) => {
    setSensorToDelete(s);
    openDeleteModal();
  };

  const handleCloseModal = () => {
    setEditSensor(null);
    closeModal();
  };

  const handleCloseDeleteModal = () => {
    setSensorToDelete(null);
    closeDeleteModal();
  };

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Sensores">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary mb-0">
            <i className="bi bi-activity me-2"></i>
            Gerenciamento de Sensores
          </h1>
          <Button
            variant="success"
            onClick={abrirModalAdicao}
            className="btn-enhanced"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Adicionar Sensor
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <Card className="bg-primary text-white h-100">
              <Card.Body className="text-center">
                <i
                  className="bi bi-activity"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">Total</Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {stats.total}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="bg-success text-white h-100">
              <Card.Body className="text-center">
                <i
                  className="bi bi-check-circle"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">Operacionais</Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {stats.operacionais}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="bg-danger text-white h-100">
              <Card.Body className="text-center">
                <i
                  className="bi bi-exclamation-triangle"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">Defeitos</Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {stats.defeitos}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="bg-warning text-dark h-100">
              <Card.Body className="text-center">
                <i className="bi bi-tools" style={{ fontSize: "2rem" }}></i>
                <Card.Title className="h6 mt-2">Manutenção</Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {stats.manutencao}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Search and Filter Controls */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group controlId="searchSensores">
              <Form.Control
                type="text"
                placeholder="Buscar por sensor, tipo, equipamento ou CM..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="search-input"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="statusFilter">
              <Form.Select
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value as "" | SensorStatus)
                }
              >
                <option value="">Todos os Status</option>
                {Object.values(SensorStatus).map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-center">
            <small className="text-muted">
              <i className="bi bi-funnel me-1"></i>
              {sensoresFiltrados.length} de {stats.total} sensores
            </small>
          </Col>
        </Row>

        {sensoresFiltrados.length === 0 && !loading ? (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            {filtroBusca || filtroStatus
              ? "Nenhum sensor encontrado com os filtros aplicados."
              : "Nenhum sensor encontrado. Adicione um novo!"}
          </Alert>
        ) : (
          <ComponentErrorBoundary componentName="Tabela de Sensores">
            <SensoresTable
              sensores={sensoresFiltrados}
              abrirModalEdicao={abrirModalEdicao}
              confirmarDelecao={confirmarDelecao}
            />
          </ComponentErrorBoundary>
        )}

        <ComponentErrorBoundary componentName="Formulário de Sensor">
          <SensorFormModal
            show={showModal}
            onHide={handleCloseModal}
            onSaved={refetch}
            sensor={editSensor}
            equipamentos={equipamentos || []}
            cms={cms || []}
          />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="Modal de Confirmação">
          <ConfirmDeleteModal
            show={showDeleteModal}
            onHide={handleCloseDeleteModal}
            sensor={sensorToDelete}
            onDeleted={refetch}
          />
        </ComponentErrorBoundary>
      </div>
    </ComponentErrorBoundary>
  );
}
