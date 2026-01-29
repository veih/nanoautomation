import { Modal, Button, Alert } from "react-bootstrap";
import { Corretiva } from "../../../types";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";

interface Props {
    show: boolean;
    onHide: () => void;
    corretiva: Corretiva | null;
    onConfirmed: (c: Corretiva) => void;
    loading?: boolean;
}

export default function ConfirmStatusModal({
    show,
    onHide,
    corretiva,
    onConfirmed,
    loading = false
}: Props) {
    if (!corretiva) return null;

    const handleConfirm = () => {
        onConfirmed(corretiva);
    };

    return (
        <ComponentErrorBoundary componentName="Modal de Confirmação de Status">
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title>
                        <i className="bi bi-check-circle me-2"></i>
                        Confirmar Conclusão
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                        <h5 className="mt-3 mb-3">Marcar corretiva como concluída?</h5>

                        <div className="bg-light p-3 rounded mb-3">
                            <strong>Descrição:</strong> {corretiva.descricao}<br />
                            <strong>Local:</strong> {corretiva.local}<br />
                            <strong>Solicitante:</strong> {corretiva.solicitante}<br />
                            <strong>Data Inicial:</strong> {new Date(corretiva.data).toLocaleDateString('pt-BR')}
                        </div>

                        <Alert variant="info" className="text-start">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Informação:</strong> Ao confirmar, a corretiva será marcada como <strong>CONCLUÍDA</strong>
                            e será automaticamente adicionada à lista de corretivas concluídas.
                        </Alert>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        disabled={loading}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="btn-enhanced"
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Concluindo...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                Sim, Concluir
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </ComponentErrorBoundary>
    );
}
