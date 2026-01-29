/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, Container, Row, Col } from "react-bootstrap";

import { CmsTableSkeleton } from "../../components/Loading";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";
import {
  Cvf,
  SensorTemperaturaStatus,
  SensorUmidadeStatus,
  AtuadorStatus,
} from "../../../types";
import PDFGeradorCvf from "../../components/PDFs/PDFGeradorCvf";

// Import extracted hooks
import { useModal, useCrudOperations, useFilterAndSort, useForm } from "./hooks/useCvfHooks";

// Import extracted helper functions
import { formatSensorStatus, formatAtuadorStatus } from "./utils/statusHelpers";

// Import extracted components
import PageHeader from "./components/PageHeader";
import DataTable from "./components/DataTable";
import FormModal from "./components/FormModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";

export default function CvfPage() {
  // State for data fetching
  const [cvfs, setCvfs] = useState<Cvf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD operations
  const {
    selectedItem: editData,
    setSelectedItem: setEditData,
    operationLoading,
    saveItem,
    deleteItem,
  } = useCrudOperations<Cvf>({
    apiEndpoint: "/api/cvf",
    entityName: "cvf",
    getItemName: (cvf) => `CVF ${cvf.id}`,
    onSuccess: () => {
      fetchData();
    },
  });

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cvf");
      if (!res.ok) {
        if (res.status === 405) {
          throw new Error(
            "Método não permitido. A tabela CVF pode não existir no banco de dados. Verifique se a migração foi aplicada. Entre em contato com o administrador do sistema."
          );
        }
        throw new Error(`Failed to fetch CVFs (HTTP ${res.status})`);
      }
      const data = await res.json();
      // The API returns data in { cvfs: [...] } format
      const cvfsArray = Array.isArray(data.cvfs) ? data.cvfs : [];
      setCvfs(cvfsArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal states
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
  const {
    isOpen: showConfirmModal,
    open: openConfirmModal,
    close: closeConfirmModal,
  } = useModal();

  // Local state
  const [cvfToDelete, setCvfToDelete] = useState<Cvf | null>(null);
  const [searchText, setSearchText] = useState("");

  // Form management
  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm<Partial<Cvf>>(
    {
      vigaFria: "",
      piso: "",
      sensorTemperatura: SensorTemperaturaStatus.N_A,
      sensorUmidade: SensorUmidadeStatus.N_A,
      localizacaoQuadro: "",
      localizacaoValvula: "",
      atuador: AtuadorStatus.OPERACIONAL,
      observacoes: "",
    },
    (values) => {
      const errors: Record<string, string> = {};
      // Add validation if needed

      return errors;
    }
  );

  // Filtered and sorted data
  const filteredCvfs = useFilterAndSort(
    Array.isArray(cvfs) ? cvfs : [],
    searchText,
    [
      "vigaFria",
      "piso",
      "sensorTemperatura",
      "sensorUmidade",
      "atuador",
      "localizacaoQuadro",
      "localizacaoValvula",
    ],
    {
      primaryField: "vigaFria",
      secondaryField: "piso",
    }
  );

  // Table configuration
  const tableColumns = useMemo(
    () => [
      {
        key: "vigaFria",
        header: "Viga Fria",
      },
      {
        key: "piso",
        header: "Piso",
      },
      {
        key: "sensorTemperatura",
        header: "Sensor Temperatura",
        render: (cvf: Cvf) => formatSensorStatus(cvf.sensorTemperatura),
      },
      {
        key: "sensorUmidade",
        header: "Sensor Umidade",
        render: (cvf: Cvf) => formatSensorStatus(cvf.sensorUmidade),
      },
      {
        key: "atuador",
        header: "Atuador",
        render: (cvf: Cvf) => formatAtuadorStatus(cvf.atuador),
      },
      {
        key: "localizacaoQuadro",
        header: "Localização Quadro",
        render: (cvf: Cvf) => cvf.localizacaoQuadro || "N/A",
      },
      {
        key: "localizacaoValvula",
        header: "Localização Válvula",
        render: (cvf: Cvf) => cvf.localizacaoValvula || "N/A",
      },
      {
        key: "observacoes",
        header: "Observações",
        render: (cvf: Cvf) => cvf.observacoes || "N/A",
      },
    ],
    []
  );

  const formFields = useMemo(
    () => [
      {
        name: "vigaFria",
        label: "Viga Fria",
        type: "text" as const,
      },
      {
        name: "piso",
        label: "Piso",
        type: "text" as const,
      },
      {
        name: "sensorTemperatura",
        label: "Sensor de Temperatura",
        type: "select" as const,
        options: [
          { value: SensorTemperaturaStatus.OPERACIONAL, label: "Operacional" },
          { value: SensorTemperaturaStatus.DEFEITO, label: "Defeito" },
          { value: SensorTemperaturaStatus.N_A, label: "N/A" },
        ],
      },
      {
        name: "sensorUmidade",
        label: "Sensor de Umidade",
        type: "select" as const,
        options: [
          { value: SensorUmidadeStatus.OPERACIONAL, label: "Operacional" },
          { value: SensorUmidadeStatus.DEFEITO, label: "Defeito" },
          { value: SensorUmidadeStatus.N_A, label: "N/A" },
        ],
      },
      {
        name: "atuador",
        label: "Atuador",
        type: "select" as const,
        options: [
          { value: AtuadorStatus.OPERACIONAL, label: "Operacional" },
          { value: AtuadorStatus.DEFEITO, label: "Defeito" },
          { value: AtuadorStatus.MANUTENCAO, label: "Manutenção" },
          { value: AtuadorStatus.DESCONHECIDO, label: "Desconhecido" },
        ],
      },
      {
        name: "localizacaoQuadro",
        label: "Localização do Quadro",
        type: "text" as const,
      },
      {
        name: "localizacaoValvula",
        label: "Localização da Válvula",
        type: "text" as const,
      },
      {
        name: "observacoes",
        label: "Observações",
        type: "textarea" as const,
      },
    ],
    []
  );

  // Event handlers
  const handleNewCvf = useCallback(() => {
    setEditData(null);
    resetForm();
    openModal();
  }, [resetForm, openModal, setEditData]);

  const handleEditCvf = useCallback(
    (cvf: Cvf) => {
      setEditData(cvf);
      openModal();
    },
    [openModal, setEditData]
  );

  const handleDeleteCvf = useCallback(
    (cvf: Cvf) => {
      setCvfToDelete(cvf);
      openConfirmModal();
    },
    [openConfirmModal]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setCvfToDelete(null);
    closeConfirmModal();
  }, [closeConfirmModal]);

  const confirmDelete = useCallback(async () => {
    if (!cvfToDelete) return;
    try {
      await deleteItem(cvfToDelete);
      toast.success("CVF excluído com sucesso!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao excluir CVF: ${errorMessage}`);
    }
    handleCloseConfirmModal();
  }, [cvfToDelete, deleteItem, handleCloseConfirmModal]);

  // Form handlers
  const fecharModal = useCallback(() => {
    setEditData(null);
    resetForm();
    closeModal();
  }, [resetForm, closeModal, setEditData]);

  const onSubmit = handleSubmit(async (formData) => {
    const isEdit = Boolean(editData);
    // When editing, include the ID from editData in the item to be saved
    const itemToSave =
      isEdit && editData ? { ...formData, id: editData.id } : formData;

    try {
      await saveItem(itemToSave, isEdit);
      toast.success(`CVF ${isEdit ? "atualizado" : "criado"} com sucesso!`);
      fecharModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao ${isEdit ? "atualizar" : "criar"} CVF: ${errorMessage}`);
    }
  });

  // Initialize form when editing
  useEffect(() => {
    if (editData) {
      // Store the ID in a ref or state that can be accessed during form submission
      setValue("id", editData.id);
      setValue("vigaFria", editData.vigaFria || "");
      setValue("piso", editData.piso || "");
      setValue(
        "sensorTemperatura",
        editData.sensorTemperatura || SensorTemperaturaStatus.OPERACIONAL
      );
      setValue(
        "sensorUmidade",
        editData.sensorUmidade || SensorUmidadeStatus.OPERACIONAL
      );
      setValue("localizacaoQuadro", editData.localizacaoQuadro || "");
      setValue("localizacaoValvula", editData.localizacaoValvula || "");
      setValue("atuador", editData.atuador || AtuadorStatus.OPERACIONAL);
      setValue("observacoes", editData.observacoes || "");
    } else {
      resetForm();
    }
  }, [editData]); // Only depend on editData

  if (loading) {
    return (
      <Container fluid className="px-0">
        <Card className="mb-4 shadow mx-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
              <h1 className="text-primary">
                <i className="bi bi-building me-2"></i>
                Gerenciamento de CVFs
              </h1>
            </div>
          </Card.Body>
        </Card>
        <Container className="px-3">
          <CmsTableSkeleton />
        </Container>
      </Container>
    );
  }

  return (
    <ComponentErrorBoundary componentName="CVFs">
      <Container fluid className="px-0">
        <ToastContainer position="top-right" autoClose={2000} />
        <PageHeader
          title="Gerenciamento de CVFs"
          icon="bi-building"
          onAddNew={handleNewCvf}
          addButtonLabel="Adicionar CVF"
          searchValue={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Digite a viga fria, piso, sensor, atuador ou localização..."
        ></PageHeader>

        <Container fluid className="px-3">
          <Row className="mb-3 align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <h4 className="text-secondary mb-0">
                <i className="bi bi-table me-2"></i>
                Lista de CVFs
              </h4>
            </Col>
            <Col xs={12} md={6} className="d-flex justify-content-md-end">
              <div className="pdf-generator-wrapper">
                <PDFGeradorCvf cvfsData={cvfs} />
              </div>
            </Col>
          </Row>

          <div className="cvf-table-container">
            <DataTable
              data={filteredCvfs}
              columns={tableColumns}
              error={error}
              emptyMessage="Nenhum CVF encontrado com os filtros aplicados. Adicione um novo ou ajuste os filtros!"
              onEdit={handleEditCvf}
              onDelete={handleDeleteCvf}
            />
          </div>

          <div className="horizontal-scrollbar-indicator">
            <div className="scrollbar-track">
              <div className="scrollbar-thumb"></div>
            </div>
            <p className="text-muted small text-center mt-2">
              Arraste para o lado para ver mais conteúdo
            </p>
          </div>

          <FormModal
            show={showModal}
            onHide={fecharModal}
            title={editData ? "Editar CVF" : "Novo CVF"}
            isEdit={Boolean(editData)}
            onSubmit={onSubmit}
            loading={operationLoading}
            fields={formFields}
            values={formValues}
            errors={formErrors}
            onChange={(field, value) => {
              setValue(field as keyof Partial<Cvf>, value);
            }}
          />

          <ConfirmDeleteModal
            show={showConfirmModal}
            onHide={handleCloseConfirmModal}
            onConfirm={confirmDelete}
            loading={operationLoading}
            itemName="o CVF"
            itemIdentifier={cvfToDelete ? `CVF ${cvfToDelete.id}` : ""}
            warningMessage="ATENÇÃO: Esta ação irá remover permanentemente o CVF. Esta ação é irreversível."
            confirmLabel="Excluir CVF"
          />
        </Container>
      </Container>
    </ComponentErrorBoundary>
  );
}