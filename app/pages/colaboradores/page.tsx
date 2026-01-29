/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Alert,
  Row,
  Col,
  Card,
  ButtonGroup,
  Spinner,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    [validate, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return useMemo(
    () => ({
      values,
      errors,
      setValue,
      handleSubmit,
      reset,
    }),
    [values, errors, setValue, handleSubmit, reset]
  );
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

import { colaboradorSchema } from "../../../lib/validations";
import { Colaborador } from "../../../types";

export default function ColaboradoresPage() {
  // Using custom hooks for better state management
  const {
    data: rawColaboradores,
    loading,
    error,
    refetch,
  } = useFetch<{ data: Colaborador[] }>("/api/colaboradores");
  const { execute: executeOperation, loading: operationLoading } =
    useAsyncOperation();

  // Modal states using custom hook
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
  const {
    isOpen: showConfirmModal,
    open: openConfirmModal,
    close: closeConfirmModal,
  } = useModal();

  // Local state
  const [editData, setEditData] = useState<Colaborador | null>(null);
  const [colaboradorToDelete, setColaboradorToDelete] =
    useState<Colaborador | null>(null);
  const [searchText, setSearchText] = useState("");

  // Ref to track if we need to reset the form
  const shouldResetForm = useRef(true);

  // Form management with validation
  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm(
    {
      nome: "",
      funcao: "",
    },
    (values) => {
      const result = colaboradorSchema.safeParse(values);
      if (result.success) return {};

      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errors;
    }
  );

  // Refs for functions to prevent infinite loops
  const setValueRef = useRef(setValue);
  const resetFormRef = useRef(resetForm);

  // Update refs when functions change
  useEffect(() => {
    setValueRef.current = setValue;
    resetFormRef.current = resetForm;
  }, [setValue, resetForm]);

  // Process colaboradores data

  const colaboradoresFiltrados = useMemo(() => {
    const lowerCaseSearchText = searchText.toLowerCase();
    const colaboradores: Colaborador[] = rawColaboradores?.data || [];

    const filteredColaboradores = (colaboradores || []).filter(
      (colaborador) =>
        colaborador.nome.toLowerCase().includes(lowerCaseSearchText) ||
        colaborador.funcao.toLowerCase().includes(lowerCaseSearchText)
    );

    return [...filteredColaboradores].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
  }, [rawColaboradores?.data, searchText]);

  // Modal handlers
  const fecharModal = useCallback(() => {
    setEditData(null);
    resetForm();
    closeModal();
  }, [resetForm, closeModal]);

  // Initialize form data when editData changes
  useEffect(() => {
    if (editData) {
      setValueRef.current("nome", editData.nome);
      setValueRef.current("funcao", editData.funcao);
      shouldResetForm.current = false;
    } else if (shouldResetForm.current) {
      resetFormRef.current();
    }
    shouldResetForm.current = true;
  }, [editData]); // Removed setValue and resetForm from dependencies to prevent infinite loop

  // Form submission
  const onSubmit = handleSubmit(async (formData) => {
    const isEdit = Boolean(editData);

    await executeOperation(
      async () => {
        const url = isEdit
          ? `/api/colaboradores/${editData?.id}`
          : `/api/colaboradores`;
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Erro ao salvar colaborador");
        }

        await refetch();
        fecharModal();
        return res.json();
      },
      {
        successMessage: isEdit
          ? "Colaborador atualizado com sucesso!"
          : "Colaborador criado com sucesso!",
        errorMessage: "Erro ao salvar colaborador",
      }
    );
  });

  const abrirModalEdicao = useCallback(
    (colaborador: Colaborador) => {
      setEditData(colaborador);
      openModal();
    },
    [openModal]
  );

  const handleShowConfirmModal = useCallback(
    (colaborador: Colaborador) => {
      setColaboradorToDelete(colaborador);
      openConfirmModal();
    },
    [openConfirmModal]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setColaboradorToDelete(null);
    closeConfirmModal();
  }, [closeConfirmModal]);

  const confirmDelete = useCallback(async () => {
    if (!colaboradorToDelete) return;

    await executeOperation(
      async () => {
        const res = await fetch(
          `/api/colaboradores/${colaboradorToDelete.id}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
          throw new Error(error.message || "Erro ao deletar colaborador");
        }

        await refetch();
        handleCloseConfirmModal();
        return res.json();
      },
      {
        successMessage: `Colaborador "${colaboradorToDelete.nome}" excluído com sucesso!`,
        errorMessage: "Erro ao deletar colaborador",
      }
    );
  }, [colaboradorToDelete, executeOperation, refetch, handleCloseConfirmModal]);

  const handleNewColaborador = useCallback(() => {
    setEditData(null);
    openModal();
  }, [openModal]);

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Colaboradores">
      <div className="container py-4">
        <Card className="mb-4 shadow">
          <Card.Body>
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="text-primary">
                <i className="bi bi-people me-2"></i>
                Cadastro de Colaboradores
              </h1>
              <Button
                variant="success"
                onClick={handleNewColaborador}
                className="btn-enhanced"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Adicionar Colaborador
              </Button>
            </div>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Group controlId="searchColaborador">
                  <Form.Control
                    type="text"
                    placeholder="Digite o nome ou função do colaborador..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="search-input"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {colaboradoresFiltrados.length === 0 && !loading ? (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            Nenhum colaborador encontrado com os filtros aplicados. Adicione um
            novo ou ajuste os filtros!
          </Alert>
        ) : (
          <ComponentErrorBoundary componentName="Tabela de Colaboradores">
            <Table striped bordered hover responsive className="shadow-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Função</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {colaboradoresFiltrados.map((colaborador, index) => (
                  <tr key={colaborador.id}>
                    <td>{index + 1}</td>
                    <td>{colaborador.nome}</td>
                    <td>{colaborador.funcao}</td>
                    <td className="text-center">
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          onClick={() => abrirModalEdicao(colaborador)}
                          className="btn-enhanced"
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => handleShowConfirmModal(colaborador)}
                          className="btn-enhanced"
                        >
                          <i className="bi bi-trash me-1"></i>
                          Excluir
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ComponentErrorBoundary>
        )}

        <ComponentErrorBoundary componentName="Modal de Colaborador">
          <Modal show={showModal} onHide={fecharModal} centered>
            <Modal.Header closeButton className="bg-light">
              <Modal.Title>
                <i
                  className={`bi ${
                    editData ? "bi-pencil" : "bi-plus-circle"
                  } me-2`}
                ></i>
                {editData ? "Editar Colaborador" : "Novo Colaborador"}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit} className="form-enhanced">
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Nome <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formValues.nome}
                    onChange={(e) => setValue("nome", e.target.value)}
                    isInvalid={!!formErrors.nome}
                    placeholder="Nome completo do colaborador"
                    required
                  />
                  {formErrors.nome && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.nome}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Função <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formValues.funcao}
                    onChange={(e) => setValue("funcao", e.target.value)}
                    isInvalid={!!formErrors.funcao}
                    placeholder="Função ou cargo do colaborador"
                    required
                  />
                  {formErrors.funcao && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.funcao}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={fecharModal}
                  disabled={operationLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={operationLoading}
                  className="btn-enhanced"
                >
                  {operationLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i
                        className={`bi ${
                          editData ? "bi-check" : "bi-plus"
                        } me-2`}
                      ></i>
                      {editData
                        ? "Salvar Alterações"
                        : "Salvar Novo Colaborador"}
                    </>
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="Modal de Confirmação">
          <Modal
            show={showConfirmModal}
            onHide={handleCloseConfirmModal}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
                Confirmar Exclusão
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Tem certeza de que deseja excluir o colaborador{" "}
                <strong>{colaboradorToDelete?.nome}</strong> (
                {colaboradorToDelete?.funcao})?
              </p>
              <Alert variant="warning">
                <i className="bi bi-info-circle me-2"></i>
                Esta ação é irreversível e não pode ser desfeita.
              </Alert>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseConfirmModal}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={operationLoading}
                className="btn-enhanced"
              >
                {operationLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Excluir Permanentemente
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </ComponentErrorBoundary>
      </div>
    </ComponentErrorBoundary>
  );
}
