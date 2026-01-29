"use client";

import React, { useState, useMemo } from "react";
import { Button, Card, Form, Alert, Row, Col } from "react-bootstrap";
import { Atuador, AtuadorStatus, Equipamento, Cm } from "../../../../types";
import AtuadoresTable from "./AtuadoresTable";
import AtuadorFormModal from "./AtuadorFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";

// Simple local hooks to replace lib/hooks (removed due to infinite callback issues)
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

  return { data, loading, error, refetch: fetchData };
}

function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

export default function AtuadoresPage() {
  // Using custom hooks for better state management
  const {
    data: atuadores,
    loading,
    error,
    refetch,
  } = useFetch<Atuador[]>("/api/cmsApi/atuador");
  const { data: equipamentos } = useFetch<Equipamento[]>(
    "/api/cmsApi/maquinas"
  );
  const { data: cms } = useFetch<Cm[]>("/api/cmsApi/cms");

  // Modal states using custom hook
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
  const {
    isOpen: showConfirmModal,
    open: openConfirmModal,
    close: closeConfirmModal,
  } = useModal();

  // Local state
  const [editAtuador, setEditAtuador] = useState<Atuador | null>(null);
  const [atuadorToDelete, setAtuadorToDelete] = useState<Atuador | null>(null);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<AtuadorStatus | "">("");

  // Statistics calculations
  const stats = useMemo(() => {
    if (!atuadores)
      return { total: 0, operacionais: 0, defeitos: 0, manutencao: 0 };

    const total = atuadores.length;
    const operacionais = atuadores.filter(
      (a) => a.estado === AtuadorStatus.OPERACIONAL
    ).length;
    const defeitos = atuadores.filter(
      (a) => a.estado === AtuadorStatus.DEFEITO
    ).length;
    const manutencao = atuadores.filter(
      (a) => a.estado === AtuadorStatus.MANUTENCAO
    ).length;

    return { total, operacionais, defeitos, manutencao };
  }, [atuadores]);

  // ===== Filtragem por texto e status =====
  const atuadoresFiltrados = useMemo(() => {
    if (!atuadores) return [];

    return atuadores.filter((a) => {
      const busca = filtroBusca.toLowerCase();
      const matchesBusca =
        a.nome.toLowerCase().includes(busca) ||
        a.tipo.toLowerCase().includes(busca) ||
        a.equipamento?.nome.toLowerCase().includes(busca) ||
        a.equipamento?.cm?.nome.toLowerCase().includes(busca);

      const matchesStatus = filtroStatus ? a.estado === filtroStatus : true;

      return matchesBusca && matchesStatus;
    });
  }, [atuadores, filtroBusca, filtroStatus]);

  // Event handlers
  const handleEdit = (atuador: Atuador) => {
    setEditAtuador(atuador);
    openModal();
  };

  const handleDelete = (atuador: Atuador) => {
    setAtuadorToDelete(atuador);
    openConfirmModal();
  };

  const handleNew = () => {
    setEditAtuador(null);
    openModal();
  };

  const handleCloseModal = () => {
    setEditAtuador(null);
    closeModal();
  };

  const handleCloseConfirmModal = () => {
    setAtuadorToDelete(null);
    closeConfirmModal();
  };

  // Wrapper functions to handle async callbacks
  const handleSaved = async () => {
    await refetch();
  };

  const handleDeleted = () => {
    refetch();
  };

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Atuadores">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary mb-0">
            <i className="bi bi-lightning me-2"></i>
            Gerenciamento de Atuadores
          </h1>
          <Button
            variant="success"
            onClick={handleNew}
            className="btn-enhanced"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Adicionar Atuador
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <Card className="bg-primary text-white h-100">
              <Card.Body className="text-center">
                <i
                  className="bi bi-lightning"
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
            <Form.Group controlId="searchAtuadores">
              <Form.Control
                type="text"
                placeholder="Buscar por atuador, tipo, equipamento ou CM..."
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
                  setFiltroStatus(e.target.value as AtuadorStatus | "")
                }
              >
                <option value="">Todos os Status</option>
                {Object.values(AtuadorStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).toLowerCase()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-center">
            <small className="text-muted">
              <i className="bi bi-funnel me-1"></i>
              {atuadoresFiltrados.length} de {stats.total} atuadores
            </small>
          </Col>
        </Row>

        {atuadoresFiltrados.length === 0 && !loading ? (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            {filtroBusca || filtroStatus
              ? "Nenhum atuador encontrado com os filtros aplicados."
              : "Nenhum atuador encontrado. Adicione um novo!"}
          </Alert>
        ) : (
          <ComponentErrorBoundary componentName="Tabela de Atuadores">
            <AtuadoresTable
              atuadores={atuadoresFiltrados}
              abrirModalEdicao={handleEdit}
              handleShowConfirmModal={handleDelete}
              setShowModal={openModal}
              setShowConfirmModal={openConfirmModal}
            />
          </ComponentErrorBoundary>
        )}

        <ComponentErrorBoundary componentName="Formulário de Atuador">
          <AtuadorFormModal
            show={showModal}
            atuador={editAtuador}
            onHide={handleCloseModal}
            onSaved={handleSaved}
            equipamentos={equipamentos || []}
            cms={cms || []}
          />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="Modal de Confirmação">
          <ConfirmDeleteModal
            show={showConfirmModal}
            atuador={atuadorToDelete}
            onHide={handleCloseConfirmModal}
            onDeleted={handleDeleted}
          />
        </ComponentErrorBoundary>
      </div>
    </ComponentErrorBoundary>
  );
}
