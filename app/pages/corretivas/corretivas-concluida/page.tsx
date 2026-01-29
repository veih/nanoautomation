/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button, Alert, Row, Col, Form, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import CorretivaConcluidaTable from "./CorretivaConcluidaTable";
import {
  Colaborador,
  CorretivaConcluida,
} from "../../../../types";
import PdfConcluidasButton from "../../../components/PDFs/PdfConcluidasButton";
import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";
import "react-toastify/dist/ReactToastify.css";

// Define the type for raw corretiva data from API
interface RawCorretiva {
  id: string;
  data: string;
  descricao: string;
  local: string;
  colaborador?: string | null;
  solicitacao: string;
  solicitante: string;
  status: string;
  dataConclusao?: string | null;
  fotocorretiva?: Array<{ url: string }> | null;
}

// Custom hooks for better state management
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
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Handle both standardized and legacy response formats
      if (
        typeof result === "object" &&
        result !== null &&
        "success" in result
      ) {
        if (!result.success) {
          throw new Error(result.error?.message || result.error || "API Error");
        }
        setData(result.data || null);
      } else {
        // Legacy format - assume success
        setData(result);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(errorMessage);
      console.error("Fetch error:", err);
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

export default function CorretivasConcluidasPage() {
  const router = useRouter();

  // Using custom hooks for better state management
  const {
    data: rawCorretivas,
    loading,
    error,
    refetch,
  } = useFetch<RawCorretiva[]>("/api/corretivas");
  const { data: colaboradoresData } = useFetch<{ data: Colaborador[] }>(
    "/api/colaboradores"
  );
  const { execute: executeOperation, loading: operationLoading } =
    useAsyncOperation();

  // Local state
  const [searchText, setSearchText] = useState("");
  const [localFilter, setLocalFilter] = useState<string>("");

  // Process corretivas data
  const corretivas: CorretivaConcluida[] = useMemo(() => {
    return rawCorretivas
      ? rawCorretivas
          .filter((c) => c.status === "CONCLUIDO")
          .map((c) => ({
            id: c.id,
            data: c.data,
            descricao: c.descricao,
            local: c.local,
            colaborador: c.colaborador ?? "",
            solicitacao: c.solicitacao,
            solicitante: c.solicitante,
            status: "CONCLUIDO", // Explicitly set to the correct type
            dataConclusao: c.dataConclusao ?? null,
            fotos: c.fotocorretiva && Array.isArray(c.fotocorretiva)
              ? c.fotocorretiva.map((f, index) => ({
                  id: `foto-${c.id}-${index}`, // Generate a temporary ID
                  url: f.url,
                }))
              : []
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

    // Filter by local
    if (localFilter) {
      filtered = filtered.filter(
        (corretiva) => corretiva.local === localFilter
      );
    }

    // Sort by date (most recent first)
    return [...filtered].sort(
      (a, b) =>
        new Date(b.dataConclusao || b.data).getTime() -
        new Date(a.dataConclusao || a.data).getTime()
    );
  }, [corretivas, searchText, localFilter]);

  // Get unique locals for filter dropdown
  const uniqueLocals = useMemo(() => {
    const locals = corretivas.map((c) => c.local);
    return Array.from(new Set(locals)).filter(Boolean);
  }, [corretivas]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = corretivas.length;
    const thisWeek = corretivas.filter((c) => {
      if (!c.dataConclusao) return false;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(c.dataConclusao) >= oneWeekAgo;
    }).length;

    const thisMonth = corretivas.filter((c) => {
      if (!c.dataConclusao) return false;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(c.dataConclusao) >= oneMonthAgo;
    }).length;

    return { total, thisWeek, thisMonth };
  }, [corretivas]);

  // Deletar corretiva
  const handleDelete = useCallback(
    async (c: CorretivaConcluida) => {
      if (!confirm("Tem certeza que deseja excluir?")) return;

      try {
        const res = await fetch(`/api/corretivas/${c.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Erro ao excluir corretiva");
        await refetch();
        toast.success("Corretiva excluída com sucesso!");
      } catch (err) {
        console.error("Erro ao excluir:", err);
        toast.error("Erro ao excluir corretiva");
      }
    },
    [refetch]
  );

  // Editar corretiva
  const handleEdit = useCallback(
    (c: CorretivaConcluida) => {
      // Navigate to the edit page with the corretiva ID
      router.push(`/pages/corretivas?editId=${c.id}`);
    },
    [router]
  );

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="CorretivasConcluidas">
      <div
        className="container-fluid mt-3 mt-md-5"
        style={{ backgroundColor: "white" }}
      >
        <ToastContainer position="top-right" autoClose={2000} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h1 className="text-primary mb-0 h3">
            <i className="bi bi-check-circle me-2"></i>
            Corretivas Concluídas
          </h1>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/pages/corretivas")}
              className="d-flex align-items-center btn-enhanced"
              size="sm"
            >
              <i className="bi bi-arrow-left-circle me-2"></i>
              <span className="d-none d-sm-inline">Voltar para Corretivas</span>
              <span className="d-inline d-sm-none">Voltar</span>
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
            <Card className="bg-success text-white h-100 shadow-sm">
              <Card.Body className="text-center p-2 p-sm-3">
                <i
                  className="bi bi-calendar-week"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <Card.Title className="h6 mt-2 mb-1">Esta Semana</Card.Title>
                <Card.Text className="fs-5 fw-bold">{stats.thisWeek}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="bg-info text-white h-100 shadow-sm">
              <Card.Body className="text-center p-2 p-sm-3">
                <i
                  className="bi bi-calendar-month"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <Card.Title className="h6 mt-2 mb-1">Este Mês</Card.Title>
                <Card.Text className="fs-5 fw-bold">
                  {stats.thisMonth}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="bg-secondary text-white h-100 shadow-sm">
              <Card.Body className="text-center p-2 p-sm-3">
                <i
                  className="bi bi-file-earmark-pdf"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <Card.Title className="h6 mt-2 mb-1">Exportar</Card.Title>
                <div className="mt-2">
                  <PdfConcluidasButton />
                </div>
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
            <Form.Group controlId="localFilter">
              <Form.Select
                value={localFilter}
                onChange={(e) => setLocalFilter(e.target.value)}
                size="sm"
              >
                <option value="">Todos os Locais</option>
                {uniqueLocals.map((local) => (
                  <option key={local} value={local}>
                    {local}
                  </option>
                ))}
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
            {searchText || localFilter
              ? "Nenhuma corretiva concluída encontrada com os filtros aplicados."
              : "Nenhuma corretiva concluída encontrada."}
          </Alert>
        ) : (
          <ComponentErrorBoundary componentName="Tabela de Corretivas Concluídas">
            <CorretivaConcluidaTable
              corretivas={corretivasFiltradas}
              onEdit={handleEdit}
              onDelete={handleDelete}
              colaboradores={colaboradores}
              onSaved={refetch}
            />
          </ComponentErrorBoundary>
        )}
      </div>
    </ComponentErrorBoundary>
  );
}
