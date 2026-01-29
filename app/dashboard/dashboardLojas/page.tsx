/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo, useState, FormEvent, memo } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Form,
  Alert,
  Modal,
  Button,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

// Components
import LojaNavigationSubmenuProps from "../../components/navigation/LojaNavigationSubmenu";
import PDFGeradorLoja from "../../components/PDFs/PDFGeradorLoja";
import { CmsTableSkeleton } from "../../components/Loading";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";

// Import SensorStatus enum
import { AtuadorStatus, SensorStatus } from "@/types";
// Local hooks to replace lib/hooks (removed due to infinite callback issues)
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

function useForm<T>(
  initialValues: T,
  validate?: (values: T) => Record<string, string>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const setValue = (field: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
  };

  const handleSubmit = (onSubmit: (values: T) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const validationErrors = validate ? validate(values) : {};
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        await onSubmit(values);
      }
    };
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    setValue,
    handleSubmit,
    reset,
  };
}

function useAsyncOperation() {
  const [loading, setLoading] = React.useState(false);

  const execute = React.useCallback(
    async (operation: () => Promise<unknown>) => {
      setLoading(true);
      try {
        const result = await operation();
        return result;
      } catch (error: unknown) {
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

// Utilities
import { lojaSchema } from "../../../lib/validations";
import { AtuadorLoja, EquipamentoLoja, Loja, SensorLoja } from "@/types";

type EditableItem = EquipamentoLoja | AtuadorLoja | SensorLoja;
type EditItemType = "equipamento" | "atuador" | "sensor";

/* =========================
   Utilitários e Lógica de Negócio
   ========================= */

// Função utilitária para converter um valor para número ou null

// Normaliza os dados brutos da API para o formato esperado
function normalizeLoja(raw: any): Loja {
  const equipamentosLoja: EquipamentoLoja[] =
    raw.equipamentosLoja?.map((eq: any) => ({
      id: String(eq.id),
      nome: String(eq.nome ?? ""),
      descricao: eq.descricao ?? "",
      lojaId: String(eq.lojaId ?? raw.id ?? ""),
      status: (eq.status as EquipamentoLoja["status"]) ?? "DESCONHECIDO",
      atuadoresLoja:
        eq.atuadoresLoja?.map((atu: any) => ({
          id: String(atu.id),
          nome: String(atu.nome ?? ""),
          tipo: String(atu.tipo ?? ""),
          descricaoDefeito: atu.descricaoDefeito ?? null,
          existe: atu.existe ?? true,
          motivoNaoExiste: atu.motivoNaoExiste ?? null,
          lojaId: atu.lojaId ? String(atu.lojaId) : null,
          equipamentoLojaId: atu.equipamentoLojaId
            ? String(atu.equipamentoLojaId)
            : null,
          estado: atu.estado ?? null,
        })) ?? [],
      sensoresLoja:
        eq.sensoresLoja?.map((sen: any) => ({
          id: String(sen.id),
          nome: String(sen.nome ?? ""),
          tipo: String(sen.tipo ?? ""),
          estado: sen.estado ?? null,
          ultimaAtivacao: sen.ultimaAtivacao ?? null,
          existe: sen.existe ?? true,
          motivoNaoExiste: sen.motivoNaoExiste ?? null,
          lojaId: sen.lojaId ? String(sen.lojaId) : null,
          equipamentoLojaId: sen.equipamentoLojaId
            ? String(sen.equipamentoLojaId)
            : null,
        })) ?? [],
    })) ?? [];

  const atuadoresDiretos: AtuadorLoja[] =
    raw.atuadores?.map((atu: any) => ({
      id: String(atu.id),
      nome: String(atu.nome ?? ""),
      tipo: String(atu.tipo ?? ""),
      descricaoDefeito: atu.descricaoDefeito ?? null,
      existe: atu.existe ?? true,
      motivoNaoExiste: atu.motivoNaoExiste ?? null,
      lojaId: atu.lojaId ? String(atu.lojaId) : null,
      equipamentoLojaId: atu.equipamentoLojaId
        ? String(atu.equipamentoLojaId)
        : null,
      estado: atu.estado ?? null,
    })) ?? [];

  const sensoresDiretos: SensorLoja[] =
    raw.sensores?.map((sen: any) => ({
      id: String(sen.id),
      nome: String(sen.nome ?? ""),
      tipo: String(sen.tipo ?? ""),
      estado: sen.estado ?? null,
      ultimaAtivacao: sen.ultimaAtivacao ?? null,
      existe: sen.existe ?? true,
      motivoNaoExiste: sen.motivoNaoExiste ?? null,
      lojaId: sen.lojaId ? String(sen.lojaId) : null,
      equipamentoLojaId: sen.equipamentoLojaId
        ? String(sen.equipamentoLojaId)
        : null,
    })) ?? [];

  return {
    id: String(raw.id),
    nome: String(raw.nome ?? ""),
    LUC: String(raw.LUC ?? ""),
    localizacao: raw.localizacao ?? null,
    smart: raw.smart ?? "",
    equipamentosLoja,
    atuadores: atuadoresDiretos,
    sensores: sensoresDiretos,
  };
}

// Retorna o endpoint da API para o tipo de item
function getEditEndpoint(type: EditItemType, id: string): string {
  switch (type) {
    case "equipamento":
      return `/api/lojasApi/equipamentos-loja/${id}`;
    case "atuador":
      return `/api/lojasApi/atuadores-loja/${id}`;
    case "sensor":
      return `/api/lojasApi/sensores-loja/${id}`;
    default:
      return "";
  }
}

/* =========================
   Componentes Menores
   ========================= */

// Componente para a tabela de lojas
const LojasTable = memo(
  ({
    lojas,
    onViewDetails,
  }: {
    lojas: Loja[];
    abrirModalEdicao: (item: EditableItem, type: EditItemType) => void;
    onViewDetails: (loja: Loja) => void;
  }) => (
    <div className="table-responsive">
      <Table striped bordered hover className="shadow-sm">
        <thead className="bg-primary text-white">
          <tr>
            <th>
              <i className="bi bi-shop me-2"></i>
              Loja
            </th>
            <th>
              <i className="bi bi-geo-alt me-2"></i>
              Localização
            </th>
            <th>
              <i className="bi bi-upc-scan me-2"></i>
              LUC
            </th>
            <th>
              <i className="bi bi-cpu me-2"></i>
              Smart
            </th>
            <th>
              <i className="bi bi-gear me-2"></i>
              Componentes (Total)
            </th>
            <th>
              <i className="bi bi-lightning me-2"></i>
              Atuadores (Total)
            </th>
            <th>
              <i className="bi bi-activity me-2"></i>
              Sensores (Total)
            </th>
            <th>
              <i className="bi bi-list-ul me-2"></i>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {lojas.map((loja) => {
            const equipamentosTotalLoja = loja.equipamentosLoja?.length ?? 0;
            const atuadoresTotalLoja =
              (loja.equipamentosLoja?.reduce(
                (acc, eq) => acc + (eq.atuadoresLoja?.length ?? 0),
                0
              ) ?? 0) + (loja.atuadores?.length ?? 0);
            const sensoresTotalLoja =
              (loja.equipamentosLoja?.reduce(
                (acc, eq) => acc + (eq.sensoresLoja?.length ?? 0),
                0
              ) ?? 0) + (loja.sensores?.length ?? 0);

            return (
              <tr key={loja.id}>
                <td className="fw-bold">{loja.nome}</td>
                <td>{loja.localizacao}</td>
                <td>
                  <span className="badge bg-secondary">{loja.LUC}</span>
                </td>
                <td>{loja.smart || "N/A"}</td>
                <td>
                  <span className="badge bg-success">
                    {equipamentosTotalLoja}
                  </span>
                </td>
                <td>
                  <span className="badge bg-info">{atuadoresTotalLoja}</span>
                </td>
                <td>
                  <span className="badge bg-warning text-dark">
                    {sensoresTotalLoja}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => onViewDetails(loja)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Detalhes
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  )
);

LojasTable.displayName = "LojasTable";

// Componente para o modal de edição
const ItemEditModal = memo(
  ({
    show,
    onHide,
    onSubmit,
    editItemType,
    formValues,
    formErrors,
    setValue,
    handleGerenciarDetalhesItem,
    error,
  }: {
    show: boolean;
    onHide: () => void;
    onSubmit: (e: FormEvent) => void;
    editItemType: EditItemType | null;
    formValues: { nome: string };
    formErrors: Record<string, string>;
    setValue: (name: "nome", value: any) => void;
    handleGerenciarDetalhesItem: () => void;
    error: string | null;
  }) => (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Editar{" "}
          {editItemType === "equipamento"
            ? "Componente"
            : editItemType === "atuador"
              ? "Atuador"
              : editItemType === "sensor"
                ? "Sensor"
                : ""}
          {formValues.nome ? `: ${formValues.nome}` : ""}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          <Form.Group className="mb-3" controlId="editItemNome">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              value={formValues.nome}
              onChange={(e) => setValue("nome", e.target.value)}
              isInvalid={!!formErrors.nome}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.nome}
            </Form.Control.Feedback>
          </Form.Group>
          <Alert variant="info" className="mt-3">
            Para gerenciar detalhes específicos deste {editItemType}, clique no
            botão
            <strong> Gerenciar Detalhes</strong> abaixo.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button
            variant="info"
            onClick={handleGerenciarDetalhesItem}
            className="me-auto"
            disabled={!editItemType}
          >
            Gerenciar Detalhes
          </Button>
          <Button variant="primary" type="submit">
            Salvar Alterações
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
);

ItemEditModal.displayName = "ItemEditModal";

/* =========================
   Página Principal
   ========================= */

const DashboardLojasPage = () => {
  const router = useRouter();

  // Using custom hooks for data fetching and state management
  const {
    data: rawApiResponse,
    loading,
    error,
    refetch,
  } = useFetch<any>("/api/lojasApi/lojas");
  const { execute: executeOperation } = useAsyncOperation();

  // Modal states
  const {
    isOpen: showItemModal,
    open: openItemModal,
    close: closeItemModal,
  } = useModal();

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showGraphs, setShowGraphs] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editItemType, setEditItemType] = useState<EditItemType | null>(null);

  // Form management for item editing
  const validationFunction = useCallback((values: { nome: string }) => {
    const result = lojaSchema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    result.error.issues.forEach((err: any) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });
    return errors;
  }, []);

  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm({ nome: "" }, validationFunction);

  // Process lojas data first
  const lojas = useMemo(() => {
    if (!rawApiResponse) return [];

    // The API returns { lojas: [...], total_items, page, limit }
    const lojasArray = rawApiResponse.lojas || rawApiResponse;

    // Ensure we have an array
    if (!Array.isArray(lojasArray)) {
      console.warn(
        "API response does not contain lojas array:",
        rawApiResponse
      );
      return [];
    }

    return lojasArray.map(normalizeLoja);
  }, [rawApiResponse]);

  // Fetch fire detection equipment data
  const {
    data: fireDetectionData,
    loading: fireDetectionLoading,
    error: fireDetectionError,
  } = useFetch<any>("/api/lojasApi/fire-detection-equipment");

  // Display error if fire detection data fails to load
  if (fireDetectionError) {
    console.error("Erro ao carregar dados de detecção de incêndio:", fireDetectionError);
  }

  // Process fire detection equipment data
  const fireDetectionEquipment = useMemo(() => {
    if (!fireDetectionData) return [];

    // The API returns { equipment: [...], total_items, page, limit }
    const equipmentArray = fireDetectionData.equipment || fireDetectionData;

    // Ensure we have an array
    if (!Array.isArray(equipmentArray)) {
      console.warn(
        "API response does not contain equipment array:",
        fireDetectionData
      );
      return [];
    }

    return equipmentArray;
  }, [fireDetectionData]);

  // Filter and sort lojas based on search
  const lojasProcessadas = useMemo(() => {
    if (!lojas.length) return [];

    let filtered = lojas;

    const q = searchText.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (l) =>
          l.nome.toLowerCase().includes(q) ||
          l.LUC.toLowerCase().includes(q) ||
          (l.localizacao ?? "").toLowerCase().includes(q)
      );
    }

    return [...filtered].sort((a, b) => {
      const loc = (a.localizacao ?? "").localeCompare(b.localizacao ?? "");
      if (loc !== 0) return loc;
      return a.nome.localeCompare(b.nome);
    });
  }, [lojas, searchText]);

  // Sort and structure the data for display with stable references
  const lojasComDetalhesOrdenados = useMemo(() => {
    if (!lojasProcessadas.length) return [];

    return lojasProcessadas.map((loja) => {
      // Create stable sorted arrays
      const sortedEquipamentos = (loja.equipamentosLoja || [])
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((eq) => ({
          ...eq,
          atuadoresLoja: (eq.atuadoresLoja || [])
            .slice()
            .sort((a, b) => a.nome.localeCompare(b.nome)),
          sensoresLoja: (eq.sensoresLoja || [])
            .slice()
            .sort((a, b) => a.nome.localeCompare(b.nome)),
        }));

      const sortedAtuadores = (loja.atuadores || [])
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome));

      const sortedSensores = (loja.sensores || [])
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome));

      return {
        id: loja.id,
        nome: loja.nome,
        LUC: loja.LUC,
        localizacao: loja.localizacao ?? null,
        smart: loja.smart,
        equipamentosLoja: sortedEquipamentos,
        atuadores: sortedAtuadores,
        sensores: sortedSensores,
      } as Loja;
    });
  }, [lojasProcessadas]);

  // Calculate totals using useMemo for performance
  const totals = useMemo(() => {
    const totalEquip = lojasComDetalhesOrdenados.reduce(
      (acc: number, l: Loja) => acc + (l.equipamentosLoja?.length || 0),
      0
    );

    const totalAtuadores = lojasComDetalhesOrdenados.reduce(
      (acc: number, l: Loja) =>
        acc +
        (l.equipamentosLoja || []).reduce(
          (a: number, eq: EquipamentoLoja) =>
            a + (eq.atuadoresLoja?.length ?? 0),
          0
        ) +
        (l.atuadores?.length ?? 0),
      0
    );

    const totalSensores = lojasComDetalhesOrdenados.reduce(
      (acc: number, l: Loja) =>
        acc +
        (l.equipamentosLoja || []).reduce(
          (a: number, eq: EquipamentoLoja) =>
            a + (eq.sensoresLoja?.length ?? 0),
          0
        ) +
        (l.sensores?.length ?? 0),
      0
    );

    const atuadoresComDefeito = lojasComDetalhesOrdenados.flatMap((l: Loja) =>
      (l.equipamentosLoja || [])
        .flatMap(
          (eq: EquipamentoLoja) =>
            (eq.atuadoresLoja || []).filter(
              (at: AtuadorLoja) =>
                at.estado === AtuadorStatus.DEFEITO ||
                (at.descricaoDefeito && at.descricaoDefeito.trim() !== "") ||
                at.existe === false
            ) ?? []
        )
        .concat(
          (l.atuadores || []).filter(
            (at: AtuadorLoja) =>
              at.estado === AtuadorStatus.DEFEITO ||
              (at.descricaoDefeito && at.descricaoDefeito.trim() !== "") ||
              at.existe === false
          ) ?? []
        )
    );

    const sensoresComDefeito = lojasComDetalhesOrdenados.flatMap((l: Loja) =>
      (l.equipamentosLoja || [])
        .flatMap(
          (eq: EquipamentoLoja) =>
            (eq.sensoresLoja || []).filter(
              (s: SensorLoja) =>
                s.estado === SensorStatus.DEFEITO ||
                (s.descricaoDefeito && s.descricaoDefeito.trim() !== "") ||
                s.existe === false
            ) ?? []
        )
        .concat(
          (l.sensores || []).filter(
            (s: SensorLoja) =>
              s.estado === SensorStatus.DEFEITO ||
              (s.descricaoDefeito && s.descricaoDefeito.trim() !== "") ||
              s.existe === false
          ) ?? []
        )
    );

    // Fire detection equipment totals
    const totalFireDetectionEquipment = fireDetectionEquipment.length;
    const existingFireDetectionEquipment = fireDetectionEquipment.filter(
      (e: any) => e.existe
    ).length;
    const commissionedFireDetectionEquipment = fireDetectionEquipment.filter(
      (e: any) => e.comissionada
    ).length;

    return {
      totalEquip,
      totalAtuadores,
      totalSensores,
      atuadoresComDefeito,
      sensoresComDefeito,
      totalFireDetectionEquipment,
      existingFireDetectionEquipment,
      commissionedFireDetectionEquipment,
    };
  }, [lojasComDetalhesOrdenados, fireDetectionEquipment]);

  // Chart data for status visualization
  const chartData = useMemo(() => {
    const allAtuadores = lojasComDetalhesOrdenados.flatMap((l: Loja) =>
      (l.equipamentosLoja || [])
        .flatMap((eq: EquipamentoLoja) => eq.atuadoresLoja || [])
        .concat(l.atuadores || [])
    );
    const allSensores = lojasComDetalhesOrdenados.flatMap((l: Loja) =>
      (l.equipamentosLoja || [])
        .flatMap((eq: EquipamentoLoja) => (eq.sensoresLoja || []))
        .concat(l.sensores || [])
    );

    const atuadoresStatusData = [
      {
        name: "Operacional",
        value: allAtuadores.filter(
          (a) =>
            a.estado !== AtuadorStatus.DEFEITO &&
            !(a.descricaoDefeito && a.descricaoDefeito.trim() !== "") &&
            a.existe !== false
        ).length,
        color: "#28a745",
      },
      {
        name: "Defeito",
        value: allAtuadores.filter(
          (a) =>
            a.estado === AtuadorStatus.DEFEITO ||
            (a.descricaoDefeito && a.descricaoDefeito.trim() !== "") ||
            a.existe === false
        ).length,
        color: "#dc3545",
      },
    ].filter((d) => d.value > 0);

    const sensoresStatusData = [
      {
        name: "Operacional",
        value: allSensores.filter(
          (s) =>
            !(
              s.estado === SensorStatus.DEFEITO ||
              (s.descricaoDefeito && s.descricaoDefeito.trim() !== "") ||
              s.existe === false
            )
        ).length,
        color: "#28a745",
      },
      {
        name: "Defeito",
        value: allSensores.filter(
          (s) =>
            s.estado === SensorStatus.DEFEITO ||
            (s.descricaoDefeito && s.descricaoDefeito.trim() !== "") ||
            s.existe === false
        ).length,
        color: "#dc3545",
      },
    ].filter((d) => d.value > 0);

    return { atuadoresStatusData, sensoresStatusData };
  }, [lojasComDetalhesOrdenados]);

  // Modal handlers with stable references
  const abrirModalEdicao = useCallback(
    (item: EditableItem, type: EditItemType) => {
      setEditItemId(item.id);
      setValue("nome", item.nome);
      setEditItemType(type);
      openItemModal();
    },
    [setValue, openItemModal]
  );

  const fecharModalItem = useCallback(() => {
    setEditItemId(null);
    setEditItemType(null);
    resetForm();
    closeItemModal();
  }, [resetForm, closeItemModal]);

  // Form submission with stable reference
  const onSubmit = useCallback(
    (e: FormEvent) => {
      return handleSubmit(async (formData) => {
        if (!editItemId || !editItemType) return;

        await executeOperation(async () => {
          const endpoint = getEditEndpoint(editItemType, editItemId);
          if (!endpoint) throw new Error("Endpoint de edição não encontrado.");

          const res = await fetch(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: formData.nome }),
          });

          if (!res.ok) {
            const error = await res
              .json()
              .catch(() => ({ message: res.statusText }));
            throw new Error(error.message || `Erro ao salvar ${editItemType}`);
          }

          await refetch();
          fecharModalItem();
          return res.json();
        });
      })(e);
    },
    [
      editItemId,
      editItemType,
      executeOperation,
      refetch,
      fecharModalItem,
      handleSubmit,
    ]
  );

  const handleGerenciarDetalhesItem = useCallback(() => {
    if (!editItemId || !editItemType) return;
    switch (editItemType) {
      case "equipamento":
        router.push(`/pages/lojas/componentes-loja`);
        break;
      case "atuador":
        router.push(`/pages/lojas/atuadores-loja`);
        break;
      case "sensor":
        router.push(`/pages/lojas/sensores-loja`);
        break;
      default:
        router.push(`/pages/lojas`);
    }
    fecharModalItem();
  }, [editItemId, editItemType, fecharModalItem, router]);

  // Custom tooltip and label rendering functions with stable references
  const renderCustomTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
          <p className="label fw-bold">{`${data.name}`}</p>
          <p className="desc mb-0">{`Quantidade: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  }, []);

  const renderLabel = useCallback(({ name, value }: any) => {
    return `${name}: ${value}`;
  }, []);

  // Add this new function for handling view details
  const handleViewDetails = useCallback((loja: Loja) => {
    router.push(`/pages/lojas/detalhes?id=${loja.id}`);
  }, [router]);

  if (loading || fireDetectionLoading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Dashboard Lojas">
      <div className="container py-1">
        <LojaNavigationSubmenuProps isCollapsed={false} />

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <h1 className="text-primary mb-0">
            <i className="bi bi-shop me-2"></i>
            Dashboard Geral de Lojas
          </h1>
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
            <Form.Group controlId="searchLojaOrLocation">
              <Form.Control
                className="text-primary search-input"
                type="text"
                placeholder="Digite o nome da loja, LUC ou localização..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row className="mb-4 g-3">
          <Col xs={6} sm={4} md={3} lg={2}>
            <Card
              bg="primary"
              text="white"
              className="mb-3 shadow-sm cursor-pointer"
              onClick={() => router.push("/pages/lojas")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center">
                <i className="bi bi-shop" style={{ fontSize: "2rem" }}></i>
                <Card.Title className="h6 mt-2">Lojas</Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {lojasProcessadas.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={3} lg={2}>
            <Card
              bg="success"
              text="white"
              className="mb-3 shadow-sm cursor-pointer"
              onClick={() => router.push("/pages/lojas/componentes-loja")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center">
                <i className="bi bi-gear" style={{ fontSize: "2rem" }}></i>
                <Card.Title className="h6 mt-2">
                  Componentes da Loja
                </Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {totals.totalEquip}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={3} lg={2}>
            <Card
              bg="info"
              text="white"
              className="mb-3 shadow-sm cursor-pointer"
              onClick={() => router.push("/pages/lojas/atuadores-loja")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center">
                <i
                  className="bi bi-lightning"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">
                  Atuadores de Loja
                </Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {totals.totalAtuadores}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={3} lg={2}>
            <Card
              bg="warning"
              text="dark"
              className="mb-3 shadow-sm cursor-pointer"
              onClick={() => router.push("/pages/lojas/sensores-loja")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center">
                <i
                  className="bi bi-activity"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">
                  Sensores de Loja
                </Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {totals.totalSensores}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={3} lg={2}>
            <Card
              bg="danger"
              text="white"
              className="mb-3 shadow-sm cursor-pointer"
              onClick={() =>
                router.push(
                  "/pages/lojas/atuadores-loja/atuadores-loja-defeito"
                )
              }
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center">
                <i
                  className="bi bi-exclamation-triangle"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">
                  Atuadores C/ Defeito
                </Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {totals.atuadoresComDefeito.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={3} lg={2}>
            <Card
              bg="danger"
              text="white"
              className="mb-3 shadow-sm cursor-pointer"
              onClick={() =>
                router.push(
                  "/pages/lojas/sensores-loja/sensores-loja-defeito"
                )
              }
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center">
                <i
                  className="bi bi-exclamation-triangle"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">
                  Sensores C/ Defeito
                </Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {totals.sensoresComDefeito.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={3} lg={2}>
            <Card
              bg="info"
              text="white"
              className="mb-3 shadow-sm cursor-pointer"
              onClick={() => router.push("/pages/lojas/deteccao-loja")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center">
                <i
                  className="bi bi-fire"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">
                  Detecção de Incêndio
                </Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {totals.totalFireDetectionEquipment}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Toggle Charts Button */}
        <div className="d-flex justify-content-center mb-4">
          <Button
            variant="outline-secondary"
            onClick={() => setShowGraphs(!showGraphs)}
            className="btn-enhanced"
          >
            <i
              className={`bi ${showGraphs ? "bi-eye-slash" : "bi-eye"
                } me-2`}
            ></i>
            {showGraphs ? "Esconder Gráficos" : "Mostrar Gráficos"}
          </Button>
        </div>

        {/* Charts Section */}
        {showGraphs && (
          <ComponentErrorBoundary componentName="Gráficos de Status">
            <Row className="mb-4 g-3">
              <Col xs={12}>
                <h4 className="text-secondary mt-4 mb-3">
                  <i className="bi bi-bar-chart me-2"></i>
                  Eficiência de Atuadores e Sensores
                </h4>
              </Col>

              {/* Actuators Chart */}
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0 text-center">
                      <i className="bi bi-lightning me-2"></i>
                      Status dos Atuadores
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {totals.totalAtuadores > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.atuadoresStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            label={renderLabel}
                            labelLine={false}
                          >
                            {chartData.atuadoresStatusData.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-atuador-${index}`}
                                  fill={entry.color}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip content={renderCustomTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-secondary py-5">
                        <i
                          className="bi bi-info-circle"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <h5 className="mt-33 mb-0">
                          Nenhum atuador encontrado.
                        </h5>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Sensors Chart */}
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Header className="bg-warning text-dark">
                    <h5 className="mb-0 text-center">
                      <i className="bi bi-activity me-2"></i>
                      Status dos Sensores
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {totals.totalSensores > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.sensoresStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            label={renderLabel}
                            labelLine={false}
                          >
                            {chartData.sensoresStatusData.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-sensor-${index}`}
                                  fill={entry.color}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip content={renderCustomTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-secondary py-5">
                        <i
                          className="bi bi-info-circle"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <h5 className="mt-3 mb-0">
                          Nenhum sensor encontrado
                        </h5>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </ComponentErrorBoundary>
        )}

        {/* Lojas Details Table */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="text-secondary">
            <i className="bi bi-table me-2"></i>
            Resumo Detalhado por Loja
          </h4>
          <PDFGeradorLoja
            lojasData={
              lojasComDetalhesOrdenados.map((loja) => ({
                id: loja.id,
                nome: loja.nome,
                LUC: loja.LUC,
                localizacao: loja.localizacao ?? null,
                smart: loja.smart ?? null,
                equipamentosLoja: loja.equipamentosLoja ?? [],
                atuadores: loja.atuadores ?? [],
                sensores: loja.sensores ?? [],
              })) as any
            }
          />
        </div>

        {lojasProcessadas.length === 0 ? (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            Nenhuma Loja encontrada com os filtros aplicados.
          </Alert>
        ) : (
          <ComponentErrorBoundary componentName="Tabela de Lojas">
            <LojasTable
              lojas={lojasComDetalhesOrdenados}
              abrirModalEdicao={abrirModalEdicao}
              onViewDetails={handleViewDetails}
            />
          </ComponentErrorBoundary>
        )}

        {/* Modal de Edição */}
        <ComponentErrorBoundary componentName="Modal de Edição">
          <ItemEditModal
            show={showItemModal}
            onHide={fecharModalItem}
            onSubmit={onSubmit}
            editItemType={editItemType}
            formValues={formValues}
            formErrors={formErrors}
            setValue={setValue}
            handleGerenciarDetalhesItem={handleGerenciarDetalhesItem}
            error={error}
          />
        </ComponentErrorBoundary>
      </div>
    </ComponentErrorBoundary>
  );
};

/* =========================
   Exports
   ========================= */

export default DashboardLojasPage;
