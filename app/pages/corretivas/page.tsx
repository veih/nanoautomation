/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Button, Alert, Row, Col, Form, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CorretivaTable from "./CorretivaTable";
import CorretivaFormModal from "./CorretivaFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ConfirmStatusModal from "./ConfirmStatusModal";
import ImageViewerModal from "./ImageViewerModal";
import { CmsTableSkeleton } from "../../components/Loading";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";

// Local hooks to replace lib/hooks (removed due to infinite callback issues)
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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

  useEffect(() => {
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

function useAsyncOperation() {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (
      operation: () => Promise<unknown>,
      options: { successMessage?: string; errorMessage?: string } = {}
    ) => {
      setLoading(true);
      try {
        const result = await operation();
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        return result;
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : options.errorMessage || "Erro na operação";
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    execute,
    loading,
  };
}

// Tipos
import { Corretiva, CorretivasStatus, Colaborador } from "../../../types";

export default function CorretivasPage() {
  const router = useRouter();

  // Using custom hooks for better state management
  const {
    data: rawCorretivas,
    loading,
    error,
    refetch,
  } = useFetch<any[]>("/api/corretivas");
  const { data: colaboradoresData } = useFetch<{ data: Colaborador[] }>(
    "/api/colaboradores"
  );
  const { execute: executeOperation, loading: operationLoading } =
    useAsyncOperation();

  // Modal states using custom hook
  const { isOpen: showForm, open: openForm, close: closeForm } = useModal();
  const {
    isOpen: showConfirm,
    open: openConfirm,
    close: closeConfirm,
  } = useModal();
  const {
    isOpen: showConfirmStatus,
    open: openConfirmStatus,
    close: closeConfirmStatus,
  } = useModal();
  const {
    isOpen: showImages,
    open: openImages,
    close: closeImages,
  } = useModal();

  // Local state
  const [editData, setEditData] = useState<Corretiva | null>(null);
  const [toDelete, setToDelete] = useState<Corretiva | null>(null);
  const [toConfirmStatus, setToConfirmStatus] = useState<Corretiva | null>(
    null
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Process corretivas data
  const corretivas: Corretiva[] = useMemo(() => {
    return rawCorretivas
      ? rawCorretivas
          .filter((c) => c.status !== "CONCLUIDO")
          .map((c) => ({
            id: c.id,
            data: c.data,
            descricao: c.descricao,
            local: c.local,
            colaborador: c.colaborador ?? "",
            solicitacao: c.solicitacao,
            solicitante: c.solicitante,
            status: CorretivasStatus[c.status as keyof typeof CorretivasStatus],
            dataConclusao: c.dataConclusao ?? "",
            sistema: c.sistema ?? "",
            categoria: c.categoria ?? "",
            formaCorrecao: c.formaCorrecao ?? "",
            fotoUrls: c.fotocorretiva ? c.fotocorretiva.map((f: any) => f.url) : []
          }))
      : [];
  }, [rawCorretivas]);

  const colaboradores: Colaborador[] = colaboradoresData?.data || [];

  // Filter and search corretivas
  const corretivasFiltradas = useMemo(() => {
    let filtered = corretivas;

    // Filter by search text
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        (corretiva) =>
          corretiva.descricao.toLowerCase().includes(lowerSearch) ||
          corretiva.local.toLowerCase().includes(lowerSearch) ||
          corretiva.solicitacao.toLowerCase().includes(lowerSearch) ||
          corretiva.solicitante.toLowerCase().includes(lowerSearch) ||
          (corretiva.colaborador &&
            corretiva.colaborador.toLowerCase().includes(lowerSearch))
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(
        (corretiva) => corretiva.status === statusFilter
      );
    }

    // Sort by date (most recent first)
    return [...filtered].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }, [corretivas, searchText, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = corretivas.length;
    const andamento = corretivas.filter(
      (c) => c.status === CorretivasStatus.ANDAMENTO
    ).length;
    const espera = corretivas.filter(
      (c) => c.status === CorretivasStatus.ESPERA
    ).length;
    const urgente = corretivas.filter((c) =>
      c.solicitacao.toLowerCase().includes("urgente")
    ).length;

    return { total, andamento, espera, urgente };
  }, [corretivas]);

  // ===== HANDLE CONCLUIR =====
  const handleConcluir = useCallback(
    async (corretiva: Corretiva) => {
      if (!corretiva) return;

      const result = await executeOperation(
        async () => {
          const dataConclusao = new Date().toISOString();
          const formData = new FormData();
          formData.append("status", "CONCLUIDO");
          formData.append("dataConclusao", dataConclusao);

          const res = await fetch(`/api/corretivas/${corretiva.id}`, {
            method: "PUT",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Falha ao concluir corretiva");

          await refetch(); // Refresh data
          closeConfirmStatus();
          return data;
        },
        {
          successMessage: "Corretiva concluída com sucesso!",
          errorMessage: "Erro ao concluir corretiva",
        }
      );
    },
    [executeOperation, refetch, closeConfirmStatus]
  );

  const handleEdit = useCallback(
    (corretiva: Corretiva) => {
      setEditData(corretiva);
      openForm();
    },
    [openForm]
  );

  const handleDelete = useCallback(
    (corretiva: Corretiva) => {
      setToDelete(corretiva);
      openConfirm();
    },
    [openConfirm]
  );

  const handleConfirmStatus = useCallback(
    (corretiva: Corretiva) => {
      setToConfirmStatus(corretiva);
      openConfirmStatus();
    },
    [openConfirmStatus]
  );

  const handleNewCorretiva = useCallback(() => {
    setEditData(null);
    openForm();
  }, [openForm]);

  const handleShowImages = useCallback(
    (urls: string[]) => {
      setImageUrls(urls);
      openImages();
    },
    [openImages]
  );

  const navigateToCompleted = useCallback(() => {
    router.push("/pages/corretivas/corretivas-concluida");
  }, [router]);

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Corretivas">
      <div className="container-fluid mt-3 mt-md-5">
        <ToastContainer position="top-right" autoClose={2000} />

        {/* Header - Improved responsive layout */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h1 className="text-primary mb-0 h3">
            <i className="bi bi-tools me-2"></i>
            Corretivas
          </h1>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={handleNewCorretiva}
              className="d-flex align-items-center btn-enhanced"
              size="sm"
            >
              <i className="bi bi-plus-circle me-2"></i>
              <span className="d-none d-sm-inline">Nova Corretiva</span>
              <span className="d-inline d-sm-none">Nova</span>
            </Button>
            <Button
              variant="success"
              onClick={navigateToCompleted}
              className="d-flex align-items-center btn-enhanced"
              size="sm"
            >
              <i className="bi bi-check-circle me-2"></i>
              <span className="d-none d-sm-inline">Corretivas Concluídas</span>
              <span className="d-inline d-sm-none">Concluídas</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards - Improved responsive layout */}
        <Row className="mb-4 g-3">
          <Col xs={6} sm={3}>
            <Card className="bg-primary text-white h-100 shadow-sm">
              <Card.Body className="text-center p-2 p-sm-3">
                <i
                  className="bi bi-list-task"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <Card.Title className="h6 mt-2 mb-1">Total</Card.Title>
                <Card.Text className="fs-5 fw-bold mb-0">
                  {stats.total}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="bg-warning text-dark h-100 shadow-sm">
              <Card.Body className="text-center p-2 p-sm-3">
                <i className="bi bi-clock" style={{ fontSize: "1.5rem" }}></i>
                <Card.Title className="h6 mt-2 mb-1">Em Andamento</Card.Title>
                <Card.Text className="fs-5 fw-bold mb-0">
                  {stats.andamento}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="bg-secondary text-white h-100 shadow-sm">
              <Card.Body className="text-center p-2 p-sm-3">
                <i className="bi bi-pause" style={{ fontSize: "1.5rem" }}></i>
                <Card.Title className="h6 mt-2 mb-1">Em Espera</Card.Title>
                <Card.Text className="fs-5 fw-bold mb-0">
                  {stats.espera}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="bg-danger text-white h-100 shadow-sm">
              <Card.Body className="text-center p-2 p-sm-3">
                <i
                  className="bi bi-exclamation-triangle"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <Card.Title className="h6 mt-2 mb-1">Urgentes</Card.Title>
                <Card.Text className="fs-5 fw-bold mb-0">
                  {stats.urgente}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search and Filter Controls - Improved responsive layout */}
        <Row className="mb-4 g-3">
          <Col xs={12} md={6}>
            <Form.Group controlId="searchCorretivas">
              <Form.Control
                type="text"
                placeholder="Pesquisar por descrição, local, solicitante, colaborador..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                size="sm"
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={3}>
            <Form.Group controlId="statusFilter">
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="sm"
              >
                <option value="">Todos os Status</option>
                <option value={CorretivasStatus.ANDAMENTO}>Em Andamento</option>
                <option value={CorretivasStatus.ESPERA}>Em Espera</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={6} md={3} className="d-flex align-items-center">
            <small className="text-muted text-truncate">
              <i className="bi bi-funnel me-1"></i>
              <span className="d-none d-sm-inline">
                {corretivasFiltradas.length} de {stats.total} corretivas
              </span>
              <span className="d-inline d-sm-none">
                {corretivasFiltradas.length}/{stats.total}
              </span>
            </small>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {corretivasFiltradas.length === 0 && !loading ? (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            {searchText || statusFilter
              ? "Nenhuma corretiva encontrada com os filtros aplicados."
              : "Nenhuma corretiva encontrada. Adicione uma nova!"}
          </Alert>
        ) : (
          <ComponentErrorBoundary componentName="Tabela de Corretivas">
            <CorretivaTable
              corretivas={corretivasFiltradas}
              onEdit={handleEdit}
              onConfirme={handleConfirmStatus}
              onDelete={handleDelete}
              onShowImages={handleShowImages}
              loading={operationLoading}
            />
          </ComponentErrorBoundary>
        )}
        <ComponentErrorBoundary componentName="Formulário de Corretiva">
          <CorretivaFormModal
            show={showForm}
            onHide={closeForm}
            editData={editData}
            colaboradores={colaboradores}
            onSaved={refetch}
          />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="Modal de Confirmação">
          <ConfirmDeleteModal
            show={showConfirm}
            onHide={closeConfirm}
            corretiva={toDelete}
            onDeleted={refetch}
          />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="Modal de Status">
          <ConfirmStatusModal
            show={showConfirmStatus}
            onHide={closeConfirmStatus}
            corretiva={toConfirmStatus}
            onConfirmed={handleConcluir}
            loading={operationLoading}
          />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="Visualizador de Imagens">
          <ImageViewerModal
            show={showImages}
            onHide={closeImages}
            urls={imageUrls}
          />
        </ComponentErrorBoundary>
      </div>
    </ComponentErrorBoundary>
  );
}
