"use client";

import { Modal, Button, Alert } from "react-bootstrap";

interface ConfirmDeleteModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    loading: boolean;
    itemName: string;
    itemIdentifier: string;
    warningMessage: string;
    confirmLabel: string;
}

const ConfirmDeleteModal = ({
    show,
    onHide,
    onConfirm,
    loading,
    itemName,
    itemIdentifier,
    warningMessage,
    confirmLabel,
}: ConfirmDeleteModalProps) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="h4">Confirmar Exclusão</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0">
                <div className="text-center">
                    <div className="mb-3">
                        <i
                            className="bi bi-exclamation-triangle-fill text-warning"
                            style={{ fontSize: "3rem" }}
                        ></i>
                    </div>
                    <p className="mb-4">
                        Tem certeza que deseja excluir {itemName} {itemIdentifier}?
                    </p>
                    <Alert variant="warning" className="d-flex align-items-center">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        <div>{warningMessage}</div>
                    </Alert>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button
                    variant="secondary"
                    onClick={onHide}
                    disabled={loading}
                    className="px-4"
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    disabled={loading}
                    className="px-4"
                >
                    {loading ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            ></span>
                            Excluindo...
                        </>
                    ) : (
                        confirmLabel
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmDeleteModal;