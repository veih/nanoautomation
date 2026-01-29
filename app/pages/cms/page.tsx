/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import CmsNavigationSubmenuProps from "./../../components/navigation/CmsNavigationSubmenu";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CmsTableSkeleton } from "../../components/Loading";
import { CardView } from "./shared/components";
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

function useForm<T>(
  initialValues: T,
  validate?: (values: T) => Record<string, string>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

function useCrud<T extends { id: string }>(apiEndpoint: string) {
  const [loading, setLoading] = useState(false);

  const create = useCallback(
    async (data: Partial<T>) => {
      setLoading(true);
      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Erro ao criar item");
        }

        return response.json();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao criar item"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      setLoading(true);
      try {
        const response = await fetch(`${apiEndpoint}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Erro ao atualizar item");
        }

        return response.json();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao atualizar item"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await fetch(`${apiEndpoint}/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ message: response.statusText }));
          throw new Error(error.message || "Erro ao deletar item");
        }

        // Check if response has content before parsing JSON
        let result = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const text = await response.text();
          if (text) {
            result = JSON.parse(text);
          }
        }

        return result;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao deletar item"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint]
  );

  return {
    create,
    update,
    remove,
    loading,
  };
}

import { cmSchema } from "../../../lib/validations";
import { Cm, } from "../../../types";

// Local interface definitions removed - using imported types from ../../../types

export default function CmsPage() {
  // Using custom hooks for better state management
  const {
    data: cms,
    loading,
    error,
    refetch,
  } = useFetch<Cm[]>("/api/cmsApi/cms");
  const {
    create,
    update,
    remove,
    loading: crudLoading,
  } = useCrud<Cm>("/api/cmsApi/cms");
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
  const {
    isOpen: showConfirmModal,
    open: openConfirmModal,
    close: closeConfirmModal,
  } = useModal();

  // Form and edit state
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [cmToDelete, setCmToDelete] = useState<Cm | null>(null);

  // Form management with validation
  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm({ nome: "", localizacao: "" }, (values) => {
    const result = cmSchema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    result.error.issues.forEach((err: any) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });
    return errors;
  });

  // Lógica de ordenação usando useMemo
  const cmsOrdenadas = useMemo(() => {
    if (!cms) return [];
    // 1. Cria uma cópia do array para não mutar o original diretamente
    // 2. Ordena primeiro por 'localizacao' e depois por 'nome'
    return [...cms].sort((a, b) => {
      // Compara por localização
      const localizacaoComparison = (a.localizacao || "").localeCompare(
        b.localizacao || ""
      );
      if (localizacaoComparison !== 0) {
        return localizacaoComparison;
      }
      // Se as localizações forem iguais, compara por nome
      return (a.nome || "").localeCompare(b.nome || "");
    });
  }, [cms]); // Recalcula apenas quando 'cms' muda

  // Função para lidar com o envio do formulário (criação/edição)
  const onSubmit = handleSubmit(async (formData) => {
    try {
      if (editMode && editId) {
        await update(editId, formData);
        toast.success("CM atualizada com sucesso!");
      } else {
        await create(formData);
        toast.success("CM adicionada com sucesso!");
      }

      await refetch(); // Recarrega os dados
      handleCloseModal(); // Fecha e reseta o modal
    } catch (error) {
      // Error is already handled by the useCrud hook
      console.error("Erro ao salvar CM:", error);
    }
  });

  // Funções para o modal de confirmação de exclusão
  const handleShowConfirmModal = useCallback(
    (cm: Cm) => {
      setCmToDelete(cm);
      openConfirmModal();
    },
    [openConfirmModal]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setCmToDelete(null);
    closeConfirmModal();
  }, [closeConfirmModal]);

  // Função para confirmar a exclusão
  const confirmDelete = useCallback(async () => {
    if (cmToDelete) {
      try {
        await remove(cmToDelete.id);
        toast.success(`CM "${cmToDelete.nome}" excluída com sucesso!`);
        await refetch(); // Recarrega os dados
      } catch (error) {
        // Error is already handled by the useCrud hook
        console.error("Erro ao deletar CM:", error);
      } finally {
        handleCloseConfirmModal(); // Fecha o modal de confirmação
      }
    }
  }, [cmToDelete, remove, refetch, handleCloseConfirmModal]);

  // Função para abrir o modal de edição
  const abrirModalEdicao = useCallback(
    (cm: Cm) => {
      setEditMode(true);
      setEditId(cm.id);
      setValue("nome", cm.nome);
      setValue("localizacao", cm.localizacao);
      openModal();
    },
    [setValue, openModal]
  );

  // Função para fechar e resetar o modal
  const handleCloseModal = useCallback(() => {
    closeModal();
    setEditMode(false);
    setEditId(null);
    resetForm();
  }, [closeModal, resetForm]);

  // Função para abrir modal de criação
  const abrirModalCriacao = useCallback(() => {
    resetForm();
    openModal();
  }, [resetForm, openModal]);

  return (
    <div className="container">
      <CmsNavigationSubmenuProps isCollapsed={false} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
        <h1>Gerenciamento de Casas de Máquinas</h1>
        <Button variant="success" onClick={abrirModalCriacao}>
          + Adicionar CM
        </Button>
      </div>

      {loading ? (
        <CmsTableSkeleton />
      ) : error ? (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      ) : cmsOrdenadas.length === 0 ? (
        <Alert variant="info" className="text-center mb-4">
          Nenhuma Casa de Máquinas cadastrada. Adicione uma nova!
        </Alert>
      ) : (
        <>
          {/* Summary Statistics */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    <i className="bi bi-building me-2"></i>
                    Total de CMs
                  </h5>
                  <p className="card-text display-4">{cmsOrdenadas.length}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    <i className="bi bi-box-seam me-2"></i>
                    Equipamentos
                  </h5>
                  <p className="card-text display-4">
                    {cmsOrdenadas.reduce((total, cm) => total + (cm.equipamentos?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    <i className="bi bi-gear me-2"></i>
                    Atuadores
                  </h5>
                  <p className="card-text display-4">
                    {cmsOrdenadas.reduce((total, cm) => 
                      total + (cm.equipamentos?.reduce((eqTotal, eq) => eqTotal + (eq.atuadores?.length || 0), 0) || 0), 0
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-dark h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    <i className="bi bi-thermometer me-2"></i>
                    Sensores
                  </h5>
                  <p className="card-text display-4">
                    {cmsOrdenadas.reduce((total, cm) => 
                      total + (cm.equipamentos?.reduce((eqTotal, eq) => eqTotal + (eq.sensores?.length || 0), 0) || 0), 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CM Cards */}
          <CardView
            data={cmsOrdenadas}
            error={error}
            emptyMessage="Nenhuma Casa de Máquinas encontrada."
            onEdit={abrirModalEdicao}
            onDelete={handleShowConfirmModal}
            title="Casas de Máquinas"
          />
        </>
      )}

      {/* Modal de Adição/Edição */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Editar CM" : "Nova Central de Monitoramento"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={onSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Casa de Máquina</Form.Label>
              <Form.Control
                type="text"
                value={formValues.nome}
                onChange={(e) => setValue("nome", e.target.value)}
                isInvalid={!!formErrors.nome}
                required
              />
              {formErrors.nome && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.nome}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Piso</Form.Label>
              <Form.Control
                type="text"
                value={formValues.localizacao}
                onChange={(e) => setValue("localizacao", e.target.value)}
                isInvalid={!!formErrors.localizacao}
                required
              />
              {formErrors.localizacao && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.localizacao}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={crudLoading}>
              {crudLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {editMode ? "Salvando..." : "Criando..."}
                </>
              ) : editMode ? (
                "Salvar Alterações"
              ) : (
                "Salvar"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza de que deseja excluir a Central de Monitoramento{" "}
          <strong>{cmToDelete?.nome}</strong> em{" "}
          <strong>{cmToDelete?.localizacao}</strong>? Esta ação é irreversível e
          não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Excluir Permanentemente
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
