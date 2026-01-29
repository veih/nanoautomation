import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { Corretiva } from "../../../types";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";

// Simple useAsyncOperation replacement to avoid infinite loops
function useAsyncOperation() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const execute = React.useCallback(
    async (
      operation: () => Promise<unknown>,
      options: { successMessage?: string; errorMessage?: string } = {}
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await operation();
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : options.errorMessage || "Erro na operação";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    execute,
    loading,
    error,
  };
}

interface Props {
  show: boolean;
  onHide: () => void;
  corretiva: Corretiva | null;
  onDeleted: () => void;
}

export default function ConfirmDeleteModal({
  show,
  onHide,
  corretiva,
  onDeleted,
}: Props) {
  const { execute: executeDelete, loading, error } = useAsyncOperation();

  const handleDelete = async () => {
    if (!corretiva) return;

    await executeDelete(
      async () => {
        const res = await fetch(`/api/corretivas/${corretiva.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ message: res.statusText }));
          throw new Error(errorData.message || "Erro ao excluir corretiva");
        }

        onDeleted();
        onHide();
        return res.json();
      },
      {
        successMessage: "Corretiva excluída com sucesso!",
        errorMessage: "Erro ao excluir corretiva",
      }
    );
  };

  if (!corretiva) return null;

  return (
    <ComponentErrorBoundary componentName="Modal de Confirmação de Exclusão">
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Confirmar Exclusão
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <div className="text-center">
            <i
              className="bi bi-trash text-danger"
              style={{ fontSize: "3rem" }}
            ></i>
            <h5 className="mt-3 mb-3">
              Tem certeza que deseja excluir esta corretiva?
            </h5>

            <div className="bg-light p-3 rounded mb-3">
              <strong>Descrição:</strong> {corretiva.descricao}
              <br />
              <strong>Local:</strong> {corretiva.local}
              <br />
              <strong>Data:</strong>{" "}
              {new Date(corretiva.data).toLocaleDateString("pt-BR")}
            </div>

            <Alert variant="warning" className="text-start">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Atenção:</strong> Esta ação não pode ser desfeita.
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            className="btn-enhanced"
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Excluindo...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Confirmar Exclusão
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </ComponentErrorBoundary>
  );
}
