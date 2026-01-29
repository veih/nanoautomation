/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Card, Row, Col, Alert } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";

import LojaNavigationSubmenu from "../../../components/navigation/LojaNavigationSubmenu";
import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";
import { AtuadorLoja, AtuadorStatus } from "../../../../types";

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
  }, [initialValues]);

  return {
    values,
    errors,
    setValue,
    handleSubmit,
    reset,
  };
}

// Import shared components and utilities
import {
  DataTable,
  FormModal,
  ConfirmDeleteModal,
  PageHeader,
  useCrudOperations,
  useFilterAndSort,
  useLojas,
  useAtuadoresLoja,
  useStatusHelpers,
  atuadorLojaFormSchema,
  AtuadorLojaFormData,
  MobileCameraCapture,
} from "../shared";

export default function AtuadoresLojaPage() {
  // Data fetching
  const { lojas, loading: loadingLojas, error: errorLojas } = useLojas();
  const {
    atuadores,
    loading: loadingAtuadores,
    error: errorAtuadores,
    refetch,
  } = useAtuadoresLoja();
  const { getStatusColorClass, getStatusOptions } = useStatusHelpers();

  // Stable refetch reference to prevent infinite loops in useCrudOperations
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // CRUD operations
  const {
    selectedItem: editData,
    setSelectedItem: setEditData,
    operationLoading,
    saveItem,
    deleteItem,
  } = useCrudOperations<AtuadorLoja>({
    apiEndpoint: "/api/lojasApi/atuadores-loja",
    entityName: "Atuador",
    getItemName: (atuador) => atuador.nome,
    onSuccess: stableRefetch,
  });

  // Modal states
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
  const {
    isOpen: showConfirmModal,
    open: openConfirmModal,
    close: closeConfirmModal,
  } = useModal();

  // Local state
  const [atuadorToDelete, setAtuadorToDelete] = useState<AtuadorLoja | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [images, setImages] = useState<string[]>([]); // State for images
  const [showCamera, setShowCamera] = useState(false); // State for mobile camera

  // Form management
  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm<AtuadorLojaFormData>(
    {
      nome: "",
      tipo: "",
      estado: AtuadorStatus.OPERACIONAL,
      lojaId: "",
      descricaoDefeito: "",
    },
    (values) => {
      const result = atuadorLojaFormSchema.safeParse(values);
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

  // Loading and error states
  const loading = loadingAtuadores || loadingLojas;
  const error = errorAtuadores || errorLojas;

  // Associate atuadores with their lojas
  const atuadoresComLojas = useMemo(() => {
    return atuadores.map((atuador) => ({
      ...atuador,
      loja: lojas.find((loja) => loja.id === atuador.lojaId),
    }));
  }, [atuadores, lojas]);

  // Filtered and sorted data - updated to include search by loja.nome and loja.LUC
  const filteredAtuadores = useFilterAndSort(
    atuadoresComLojas,
    searchText,
    ["nome", "tipo", "loja.nome", "loja.LUC"], // Added loja.nome and loja.LUC to search fields
    {
      primaryField: "nome" as keyof (typeof atuadoresComLojas)[0],
    }
  );

  // Statistics calculations
  const stats = useMemo(() => {
    if (!atuadores)
      return {
        total: 0,
        operacionais: 0,
        defeitos: 0,
        manutencao: 0,
        desconhecidos: 0,
      };

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
    const desconhecidos = atuadores.filter(
      (a) => !a.estado || a.estado === AtuadorStatus.DESCONHECIDO
    ).length;

    return { total, operacionais, defeitos, manutencao, desconhecidos };
  }, [atuadores]);

  // Table configuration
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
        render: (atuador: (typeof atuadoresComLojas)[0]) =>
          atuador.loja ? `${atuador.loja.nome} (${atuador.loja.LUC})` : "N/A",
      },
      {
        key: "estado",
        header: "Estado",
        render: (atuador: AtuadorLoja) => (
          <span
            className={getStatusColorClass(
              atuador.estado || AtuadorStatus.DESCONHECIDO
            )}
          >
            {atuador.estado || "Desconhecido"}
          </span>
        ),
      },
    ],
    [getStatusColorClass]
  );

  const formFields = useMemo(
    () => [
      {
        name: "nome",
        label: "Nome do Atuador",
        required: true,
      },
      {
        name: "tipo",
        label: "Tipo",
        required: true,
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
        options: getStatusOptions(),
      },
      {
        name: "descricaoDefeito",
        label: "Observações",
        type: "textarea" as const,
        rows: 3,
      },
    ],
    [lojas, getStatusOptions]
  );

  // Event handlers
  const handleNewAtuador = useCallback(() => {
    setEditData(null);
    resetForm();
    setImages([]); // Reset images when creating new actuator
    openModal();
  }, [resetForm, openModal, setEditData]);

  const handleEditAtuador = useCallback(
    (atuador: AtuadorLoja) => {
      setEditData(atuador);
      setImages([]); // Reset images when editing actuator
      openModal();
    },
    [openModal, setEditData]
  );

  const handleDeleteAtuador = useCallback(
    (atuador: AtuadorLoja) => {
      setAtuadorToDelete(atuador);
      openConfirmModal();
    },
    [openConfirmModal]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setAtuadorToDelete(null);
    closeConfirmModal();
  }, [closeConfirmModal]);

  const confirmDelete = useCallback(async () => {
    if (!atuadorToDelete) return;
    await deleteItem(atuadorToDelete);
    handleCloseConfirmModal();
  }, [atuadorToDelete, deleteItem, handleCloseConfirmModal]);

  // Form handlers
  const fecharModal = useCallback(() => {
    setEditData(null);
    resetForm();
    setImages([]); // Reset images when closing modal
    closeModal();
  }, [resetForm, closeModal, setEditData]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      // Upload images first if actuator status is not operational
      let imagePaths: string[] = [];
      if (formData.estado === AtuadorStatus.DEFEITO && images.length > 0) {
        const imageResponse = await fetch("/api/lojasApi/atuadores-loja/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            atuadorId: editData?.id, // Pass actuator ID if editing
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

      // Convert the estado to match the AtuadorLoja interface before saving
      const formDataForApi = {
        ...formData,
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
          : "Failed to save actuator"
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

  // Initialize form when editing
  useEffect(() => {
    if (editData) {
      setValue("nome", editData.nome);
      setValue("tipo", editData.tipo);
      setValue("estado", editData.estado || AtuadorStatus.OPERACIONAL);
      setValue("lojaId", editData.lojaId || "");
      setValue("descricaoDefeito", editData.descricaoDefeito || "");
    } else {
      resetForm();
    }
  }, [editData]); // Only depend on editData

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Atuadores Loja">
      <div className="container">
        <PageHeader
          title="Atuadores das Lojas"
          icon="bi-gear"
          onAddNew={handleNewAtuador}
          addButtonLabel="Adicionar Atuador"
          searchValue={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Digite o nome, tipo, loja ou LUC do atuador..."
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
                    <i className="bi bi-gear" style={{ fontSize: "2rem" }}></i>
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
          data={filteredAtuadores}
          columns={tableColumns}
          error={error}
          emptyMessage="Nenhum atuador encontrado. Adicione um novo ou ajuste os filtros!"
          onEdit={handleEditAtuador}
          onDelete={handleDeleteAtuador}
        />

        <FormModal
          show={showModal}
          onHide={fecharModal}
          title={editData ? "Editar Atuador" : "Novo Atuador"}
          isEdit={Boolean(editData)}
          onSubmit={onSubmit}
          loading={operationLoading}
          fields={formFields}
          values={formValues}
          errors={formErrors}
          onChange={(field, value) =>
            setValue(field as keyof AtuadorLojaFormData, value)
          }
          // Image upload props
          showImageUpload={formValues.estado === AtuadorStatus.DEFEITO}
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
          itemName="o atuador"
          itemIdentifier={atuadorToDelete?.nome}
        />
      </div>
    </ComponentErrorBoundary>
  );
}