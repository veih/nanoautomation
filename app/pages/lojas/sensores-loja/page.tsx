"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Card, Row, Col, Alert } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";

// Import components
import LojaNavigationSubmenu from "../../../components/navigation/LojaNavigationSubmenu";
import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";

// Import types
import {
  SensorLoja,
  SensorStatus,
} from "../../../../types";

// Import shared components and utilities
import {
  DataTable,
  FormModal,
  ConfirmDeleteModal,
  PageHeader,
  useCrudOperations,
  useFilterAndSort,
  useLojas,
  useSensoresLoja,
  useStatusHelpers,
  sensorLojaFormSchema,
  SensorLojaFormData,
  MobileCameraCapture,
} from "../shared";

// ==================== TYPE DEFINITIONS ====================
// Define a type that includes all possible sensor status enums
type AnySensorStatus = SensorStatus;

// Update the form data type to include the extended status types
interface ExtendedSensorLojaFormData extends Omit<SensorLojaFormData, 'estado'> {
  estado: AnySensorStatus;
}

// ==================== CUSTOM HOOKS ====================
// Simple local hooks to replace lib/hooks (removed due to infinite callback issues)
function useModal() {
  const [isOpen, setIsOpen] = useState(false);
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
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = useCallback(
    (field: keyof T, value: unknown) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field as string]: "" }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => {
      return async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const validationErrors = validate ? validate(values) : {};
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
          await onSubmit(values);
        }
      };
    },
    [values, validate]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]); // Memoize reset function with initialValues

  return {
    values,
    errors,
    setValue,
    handleSubmit,
    reset,
  };
}

// ==================== HELPER FUNCTIONS ====================
// Sensor type configuration
const SENSOR_TYPES = [
  { value: "", label: "Selecione..." },
  { value: "Botao de panico", label: "Botao de panico" },
  { value: "Sensor de movimento", label: "Sensor de movimento" },
  { value: "Sensor de insuflamento", label: "Sensor de insuflamento" },
  { value: "Sensor de porta", label: "Sensor de porta" },
  { value: "Sensor de temperatura", label: "Sensor de temperatura" },
  { value: "Outro", label: "Outro" },
];

// Get status options based on sensor type
const getStatusOptionsByType = (
  sensorType: string,
  defaultOptions: { value: string; label: string }[]
) => {
  // Since specific status enums don't exist, we'll use the general SensorStatus for all sensor types
  return defaultOptions;
};

// ==================== MAIN COMPONENT ====================
export default function SensoresLojaPage() {
  // ==================== DATA FETCHING ====================
  const { lojas, loading: loadingLojas, error: errorLojas } = useLojas();
  const {
    sensores,
    loading: loadingSensores,
    error: errorSensores,
    refetch,
  } = useSensoresLoja();
  const { getStatusColorClass, getStatusOptions } = useStatusHelpers();

  // Stable refetch reference to prevent infinite loops in useCrudOperations
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // ==================== CRUD OPERATIONS ====================
  const {
    selectedItem: editData,
    setSelectedItem: setEditData,
    operationLoading,
    saveItem,
    deleteItem,
  } = useCrudOperations<SensorLoja>({
    apiEndpoint: "/api/lojasApi/sensores-loja",
    entityName: "Sensor",
    getItemName: (sensor) => sensor.nome,
    onSuccess: stableRefetch,
  });

  // ==================== MODAL STATES ====================
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
  const {
    isOpen: showConfirmModal,
    open: openConfirmModal,
    close: closeConfirmModal,
  } = useModal();

  // ==================== LOCAL STATE ====================
  const [sensorToDelete, setSensorToDelete] = useState<SensorLoja | null>(null);
  const [searchText, setSearchText] = useState("");
  const [images, setImages] = useState<string[]>([]); // State for images
  const [showCamera, setShowCamera] = useState(false); // State for mobile camera

  // ==================== FORM MANAGEMENT ====================
  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm<ExtendedSensorLojaFormData>(
    {
      nome: "",
      tipo: "",
      estado: SensorStatus.OPERACIONAL as AnySensorStatus,
      lojaId: "",
      descricaoDefeito: "",
    },
    (values) => {
      const result = sensorLojaFormSchema.safeParse(values);
      if (result.success) return {};

      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: unknown) => {
        const validationError = err as { path: string[]; message: string };
        const path = validationError.path.join(".");
        errors[path] = validationError.message;
      });
      return errors;
    }
  );

  // ==================== LOADING AND ERROR STATES ====================
  const loading = loadingSensores || loadingLojas;
  const error = errorSensores || errorLojas;

  // ==================== DATA PROCESSING ====================
  // Associate sensores with their lojas
  const sensoresComLojas = useMemo(() => {
    return sensores.map((sensor) => ({
      ...sensor,
      loja: lojas.find((loja) => loja.id === sensor.lojaId),
    }));
  }, [sensores, lojas]);

  // Filtered and sorted data - updated to include search by loja.nome and loja.LUC
  const filteredSensores = useFilterAndSort(
    sensoresComLojas,
    searchText,
    ["nome", "tipo", "loja.nome", "loja.LUC"], // Added loja.nome and loja.LUC to search fields
    {
      primaryField: "nome" as keyof (typeof sensoresComLojas)[0],
    }
  );

  // Statistics calculations
  const stats = useMemo(() => {
    if (!sensores)
      return {
        total: 0,
        operacionais: 0,
        defeitos: 0,
        manutencao: 0,
        desconhecidos: 0,
      };

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
    const desconhecidos = sensores.filter(
      (s) => !s.estado || s.estado === SensorStatus.DESCONHECIDO
    ).length;

    return { total, operacionais, defeitos, manutencao, desconhecidos };
  }, [sensores]);

  // ==================== TABLE CONFIGURATION ====================
  const tableColumns = useMemo(
    () => [
      {
        key: "nome",
        header: "Nome",
      },
      {
        key: "tipo",
        header: "Tipo",
      },
      {
        key: "loja",
        header: "Loja",
        render: (sensor: (typeof sensoresComLojas)[0]) =>
          sensor.loja ? `${sensor.loja.nome} (${sensor.loja.LUC})` : "N/A",
      },
      {
        key: "estado",
        header: "Estado",
        render: (sensor: SensorLoja) => (
          <span
            className={getStatusColorClass(
              sensor.estado || SensorStatus.DESCONHECIDO
            )}
          >
            {sensor.estado || "Desconhecido"}
          </span>
        ),
      },
    ],
    [getStatusColorClass]
  );

  const formFields = useMemo(
    () => {
      // Determine which status options to use based on the selected tipo
      const currentStatusOptions = getStatusOptionsByType(formValues.tipo, getStatusOptions());

      return [
        {
          name: "nome",
          label: "Nome do Sensor",
          required: true,
        },
        {
          name: "tipo",
          label: "Tipo",
          required: true,
          type: "select" as const,
          options: SENSOR_TYPES,
        },
        {
          name: "lojaId",
          label: "Loja",
          type: "select" as const,
          required: true,
          options: lojas.map((loja) => ({
            value: loja.id,
            label: `${loja.nome} (${loja.LUC})`,
          })),
        },
        {
          name: "estado",
          label: "Estado",
          type: "select" as const,
          options: currentStatusOptions,
        },
        {
          name: "descricaoDefeito",
          label: "Observações",
          type: "textarea" as const,
          rows: 3,
        },
      ];
    },
    [lojas, getStatusOptions, formValues.tipo]
  );

  // ==================== EVENT HANDLERS ====================
  const handleNewSensor = useCallback(() => {
    setEditData(null);
    resetForm();
    setImages([]); // Reset images when creating new sensor
    openModal();
  }, [resetForm, openModal, setEditData]);

  const handleEditSensor = useCallback(
    (sensor: SensorLoja) => {
      setEditData(sensor);
      setImages([]); // Reset images when editing sensor
      openModal();
    },
    [openModal, setEditData]
  );

  const handleDeleteSensor = useCallback(
    (sensor: SensorLoja) => {
      setSensorToDelete(sensor);
      openConfirmModal();
    },
    [openConfirmModal]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setSensorToDelete(null);
    closeConfirmModal();
  }, [closeConfirmModal]);

  const confirmDelete = useCallback(async () => {
    if (!sensorToDelete) return;
    await deleteItem(sensorToDelete);
    handleCloseConfirmModal();
  }, [sensorToDelete, deleteItem, handleCloseConfirmModal]);

  // ==================== FORM HANDLERS ====================
  const fecharModal = useCallback(() => {
    setEditData(null);
    resetForm();
    setImages([]); // Reset images when closing modal
    closeModal();
  }, [resetForm, closeModal, setEditData]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      // Upload images first if sensor status is not operational
      let imagePaths: string[] = [];
      if (formData.estado !== SensorStatus.OPERACIONAL && images.length > 0) {
        const imageResponse = await fetch("/api/lojasApi/sensores-loja/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sensorId: editData?.id, // Pass sensor ID if editing
            images: images
          }),
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.error?.message || "Failed to upload images");
        }

        const imageData = await imageResponse.json();
        imagePaths = imageData.data.imagePaths;
      }

      // Convert the estado to match the SensorLoja interface before saving
      const formDataForApi = {
        ...formData,
        estado: formData.estado as SensorStatus, // Type assertion to match the expected interface
        imagePaths: imagePaths.length > 0 ? JSON.stringify(imagePaths) : undefined
      };

      const isEdit = Boolean(editData);
      await saveItem(formDataForApi, isEdit);
      setImages([]); // Reset images after successful save
      fecharModal();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to save sensor"
      );
    }
  });

  // Handle image changes
  const handleImageChange = useCallback((newImages: string[]) => {
    setImages(newImages);
  }, []);

  // Handle removing an image
  const handleRemoveImage = useCallback((index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  }, [images]);

  // Handle mobile camera capture
  const handleCameraCapture = useCallback((imageData: string) => {
    setImages(prev => [...prev, imageData]);
  }, []);

  // ==================== EFFECTS ====================
  // Initialize form when editing
  useEffect(() => {
    if (editData) {
      setValue("nome", editData.nome);
      setValue("tipo", editData.tipo);
      setValue("estado", editData.estado || SensorStatus.OPERACIONAL);
      setValue("lojaId", editData.lojaId || "");
      setValue("descricaoDefeito", editData.descricaoDefeito || "");
    } else {
      // Reset to initial values when not editing
      setValue("nome", "");
      setValue("tipo", "");
      setValue("estado", SensorStatus.OPERACIONAL as AnySensorStatus);
      setValue("lojaId", "");
      setValue("descricaoDefeito", "");
    }
  }, [editData, setValue]);

  // ==================== RENDER ====================
  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Sensores Loja">
      <div className="container">
        <PageHeader
          title="Sensores das Lojas"
          icon="bi-speedometer2"
          onAddNew={handleNewSensor}
          addButtonLabel="Adicionar Sensor"
          searchValue={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Digite o nome, tipo, loja ou LUC do sensor..."
        >
          <LojaNavigationSubmenu isCollapsed={false} />
          <ToastContainer position="top-right" autoClose={2000} />
        </PageHeader>

        {/* Statistics Cards */}
        <Card className="mb-4 shadow">
          <Card.Body>
            <Row className="mb-4 g-3">
              <Col xs={6} md={3}>
                <Card className="bg-primary text-white h-100">
                  <Card.Body className="text-center">
                    <i
                      className="bi bi-speedometer2"
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
          </Card.Body>
        </Card>

        <DataTable
          data={filteredSensores}
          columns={tableColumns}
          error={error}
          emptyMessage="Nenhum sensor encontrado. Adicione um novo ou ajuste os filtros!"
          onEdit={handleEditSensor}
          onDelete={handleDeleteSensor}
        />

        <FormModal
          show={showModal}
          onHide={fecharModal}
          title={editData ? "Editar Sensor" : "Novo Sensor"}
          isEdit={Boolean(editData)}
          onSubmit={onSubmit}
          loading={operationLoading}
          fields={formFields}
          values={{ ...formValues } as Record<string, unknown>}
          errors={formErrors}
          onChange={(field, value) =>
            setValue(field as keyof ExtendedSensorLojaFormData, value)
          }
          // Image upload props
          showImageUpload={formValues.estado !== SensorStatus.OPERACIONAL}
          onImageChange={handleImageChange}
          images={images}
          onRemoveImage={handleRemoveImage}
          // Mobile camera props
          showCameraButton={true}
          onOpenCamera={() => setShowCamera(true)}
        />

        <MobileCameraCapture
          show={showCamera}
          onHide={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />

        <ConfirmDeleteModal
          show={showConfirmModal}
          onHide={handleCloseConfirmModal}
          onConfirm={confirmDelete}
          loading={operationLoading}
          itemName="o sensor"
          itemIdentifier={sensorToDelete?.nome}
        />
      </div>
    </ComponentErrorBoundary>
  );
}