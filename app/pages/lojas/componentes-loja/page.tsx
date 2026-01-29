/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LojaNavigationSubmenu from "../../../components/navigation/LojaNavigationSubmenu";
import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";
import { EquipamentoLoja } from "../../../../types";

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

// Import shared components and utilities - All connected to standardized APIs
import {
  DataTable,
  FormModal,
  ConfirmDeleteModal,
  PageHeader,
  useCrudOperations,
  useFilterAndSort,
  useLojas,
  useEquipamentosLoja,
  useStatusHelpers,
  equipamentoLojaFormSchema,
  EquipamentoLojaFormData,
} from "../shared";

// Equipment status enum
enum EquipamentoStatus {
  OPERACIONAL = "OPERACIONAL",
  MANUTENCAO = "MANUTENCAO",
  DESATIVADO = "DESATIVADO",
  DESCONHECIDO = "DESCONHECIDO",
}

export default function ComponentesLojaPage() {
  // Data fetching with enhanced error handling
  const { lojas, loading: loadingLojas, error: errorLojas } = useLojas();
  const {
    equipamentos,
    loading: loadingEquipamentos,
    error: errorEquipamentos,
    refetch,
  } = useEquipamentosLoja();
  const { getEquipmentStatusOptions } = useStatusHelpers();

  // Stable refetch reference to prevent infinite loops in useCrudOperations
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // CRUD operations with standardized API endpoints
  const {
    selectedItem: editData,
    setSelectedItem: setEditData,
    operationLoading,
    saveItem,
    deleteItem,
  } = useCrudOperations<EquipamentoLoja>({
    apiEndpoint: "/api/lojasApi/equipamentos-loja",
    entityName: "Equipamento",
    getItemName: (equipamento) => equipamento.nome,
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
  const [equipamentoToDelete, setEquipamentoToDelete] =
    useState<EquipamentoLoja | null>(null);
  const [searchText, setSearchText] = useState("");

  // Form management
  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm<EquipamentoLojaFormData>(
    {
      nome: "",
      descricao: "",
      descricaoDefeito: "",
      status: EquipamentoStatus.OPERACIONAL,
      lojaId: "",
    },
    (values) => {
      const result = equipamentoLojaFormSchema.safeParse(values);
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
  const loading = loadingEquipamentos || loadingLojas;
  const error = errorEquipamentos || errorLojas;

  // Associate equipamentos with their lojas
  const equipamentosComLojas = useMemo(() => {
    return equipamentos.map((equipamento) => ({
      ...equipamento,
      loja: lojas.find((loja) => loja.id === equipamento.lojaId),
    }));
  }, [equipamentos, lojas]);

  // Filtered and sorted data - updated to include search by loja.nome and loja.LUC
  const filteredEquipamentos = useFilterAndSort(
    equipamentosComLojas,
    searchText,
    ["nome", "descricao", "loja.nome", "loja.LUC"], // Added loja.nome and loja.LUC to search fields
    {
      primaryField: "nome" as keyof (typeof equipamentosComLojas)[0],
    }
  );

  // Table configuration
  const tableColumns = useMemo(
    () => [
      {
        key: "nome",
        header: "Nome",
      },
      {
        key: "descricao",
        header: "Descrição",
        render: (equipamento: EquipamentoLoja) =>
          equipamento.descricao || "N/A",
      },
      {
        key: "descricaoDefeito",
        header: "Observações",
        render: (equipamento: EquipamentoLoja) =>
          equipamento.descricaoDefeito || "N/A",
      },
      {
        key: "loja",
        header: "Loja",
        render: (equipamento: (typeof equipamentosComLojas)[0]) =>
          equipamento.loja
            ? `${equipamento.loja.nome} (${equipamento.loja.LUC})`
            : "N/A",
      },
      {
        key: "status",
        header: "Status",
        render: (equipamento: EquipamentoLoja) => {
          const statusColorMap: Record<string, string> = {
            [EquipamentoStatus.OPERACIONAL]: "text-success",
            [EquipamentoStatus.MANUTENCAO]: "text-warning",
            [EquipamentoStatus.DESATIVADO]: "text-danger",
            [EquipamentoStatus.DESCONHECIDO]: "text-muted",
          };

          return (
            <span
              className={
                statusColorMap[
                equipamento.status || EquipamentoStatus.DESCONHECIDO
                ]
              }
            >
              {equipamento.status || "Desconhecido"}
            </span>
          );
        },
      },
    ],
    []
  );

  const formFields = useMemo(
    () => [
      {
        name: "nome",
        label: "Nome do Equipamento",
        required: true,
      },
      {
        name: "descricao",
        label: "Descrição",
        type: "textarea" as const,
        rows: 3,
      },
      {
        name: "descricaoDefeito",
        label: "Observações",
        type: "textarea" as const,
        rows: 3,
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
        name: "status",
        label: "Status",
        type: "select" as const,
        options: getEquipmentStatusOptions(),
      },
    ],
    [lojas, getEquipmentStatusOptions]
  );

  // Event handlers
  const handleNewEquipamento = useCallback(() => {
    setEditData(null);
    resetForm();
    openModal();
  }, [resetForm, openModal, setEditData]);

  const handleEditEquipamento = useCallback(
    (equipamento: EquipamentoLoja) => {
      setEditData(equipamento);
      openModal();
    },
    [openModal, setEditData]
  );

  const handleDeleteEquipamento = useCallback(
    (equipamento: EquipamentoLoja) => {
      setEquipamentoToDelete(equipamento);
      openConfirmModal();
    },
    [openConfirmModal]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setEquipamentoToDelete(null);
    closeConfirmModal();
  }, [closeConfirmModal]);

  const confirmDelete = useCallback(async () => {
    if (!equipamentoToDelete) return;
    await deleteItem(equipamentoToDelete);
    handleCloseConfirmModal();
  }, [equipamentoToDelete, deleteItem, handleCloseConfirmModal]);

  // Form handlers
  const fecharModal = useCallback(() => {
    setEditData(null);
    resetForm();
    closeModal();
  }, [resetForm, closeModal, setEditData]);

  const onSubmit = handleSubmit(async (formData) => {
    const isEdit = Boolean(editData);
    await saveItem(formData, isEdit);
    fecharModal();
  });

  // Initialize form when editing
  useEffect(() => {
    if (editData) {
      setValue("nome", editData.nome);
      setValue("descricao", editData.descricao || "");
      setValue("descricaoDefeito", editData.descricaoDefeito || "");
      setValue("status", editData.status || EquipamentoStatus.OPERACIONAL);
      setValue("lojaId", editData.lojaId || "");
    } else {
      resetForm();
    }
  }, [editData]); // Only depend on editData

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Equipamentos Loja">
      <div className="container">
        <PageHeader
          title="Equipamentos das Lojas"
          icon="bi-pc-display"
          onAddNew={handleNewEquipamento}
          addButtonLabel="Adicionar Equipamento"
          searchValue={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Digite o nome, descrição, loja ou LUC do equipamento..."
        >
          <LojaNavigationSubmenu isCollapsed={false} />
          <ToastContainer position="top-right" autoClose={2000} />
        </PageHeader>

        <DataTable
          data={filteredEquipamentos}
          columns={tableColumns}
          error={error}
          emptyMessage="Nenhum equipamento encontrado. Adicione um novo ou ajuste os filtros!"
          onEdit={handleEditEquipamento}
          onDelete={handleDeleteEquipamento}
        />

        <FormModal
          show={showModal}
          onHide={fecharModal}
          title={editData ? "Editar Equipamento" : "Novo Equipamento"}
          isEdit={Boolean(editData)}
          onSubmit={onSubmit}
          loading={operationLoading}
          fields={formFields}
          values={formValues}
          errors={formErrors}
          onChange={(field, value) =>
            setValue(field as keyof EquipamentoLojaFormData, value)
          }
        />

        <ConfirmDeleteModal
          show={showConfirmModal}
          onHide={handleCloseConfirmModal}
          onConfirm={confirmDelete}
          loading={operationLoading}
          itemName="o equipamento"
          itemIdentifier={equipamentoToDelete?.nome}
        />
      </div>
    </ComponentErrorBoundary>
  );
}