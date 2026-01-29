"use client";

import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../../components/ErrorBoundary";

interface ConfirmDeleteModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  itemName?: string;
  itemIdentifier?: string;
  warningMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDeleteModal({
  show,
  onHide,
  onConfirm,
  loading = false,
  title = "Confirmar Exclusão",
  itemName = "item",
  itemIdentifier,
  warningMessage = "Esta ação é irreversível e não pode ser desfeita.",
  confirmLabel = "Excluir Permanentemente",
  cancelLabel = "Cancelar",
}: ConfirmDeleteModalProps) {
  return (
    <ComponentErrorBoundary componentName="ConfirmDeleteModal">
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tem certeza de que deseja excluir {itemName}
            {itemIdentifier && (
              <>
                {" "}
                <strong>{itemIdentifier}</strong>
              </>
            )}
            ?
          </p>
          <Alert variant="warning">
            <i className="bi bi-info-circle me-2"></i>
            {warningMessage}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            className="btn-enhanced"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Excluindo...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                {confirmLabel}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </ComponentErrorBoundary>
  );
}
