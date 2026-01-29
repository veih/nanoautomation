"use client";

import { useState } from "react";
import { Modal, Button, Alert, Spinner, Badge, Form } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../../components/ErrorBoundary";

interface DependencyInfo {
  equipamentos: number;
  atuadores: number;
  sensores: number;
  equipamentoAtuadores: number;
  equipamentoSensores: number;
}

interface EnhancedDeleteModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (forceDelete?: boolean) => void;
  loading?: boolean;
  title?: string;
  itemName?: string;
  itemIdentifier?: string;
  dependencies?: DependencyInfo | null;
  totalDependencies?: number;
}

export function EnhancedDeleteModal({
  show,
  onHide,
  onConfirm,
  loading = false,
  title = "Confirmar Exclusão",
  itemName = "item",
  itemIdentifier,
  dependencies,
  totalDependencies = 0,
}: EnhancedDeleteModalProps) {
  const [forceDelete, setForceDelete] = useState(false);
  const hasDependencies = totalDependencies > 0;

  const handleConfirm = () => {
    onConfirm(forceDelete);
  };

  const handleClose = () => {
    setForceDelete(false);
    onHide();
  };

  return (
    <ComponentErrorBoundary componentName="EnhancedDeleteModal">
      <Modal show={show} onHide={handleClose} centered size="lg">
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

          {hasDependencies && dependencies && (
            <>
              <Alert variant="warning">
                <h6 className="alert-heading">
                  <i className="bi bi-link me-2"></i>
                  Itens Dependentes Encontrados
                </h6>
                <p className="mb-2">
                  Esta loja possui <strong>{totalDependencies} itens</strong>{" "}
                  associados que também serão afetados:
                </p>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {dependencies.equipamentos > 0 && (
                    <Badge bg="info">
                      <i className="bi bi-gear me-1"></i>
                      {dependencies.equipamentos} Equipamentos
                    </Badge>
                  )}
                  {dependencies.atuadores > 0 && (
                    <Badge bg="primary">
                      <i className="bi bi-cpu me-1"></i>
                      {dependencies.atuadores} Atuadores
                    </Badge>
                  )}
                  {dependencies.sensores > 0 && (
                    <Badge bg="success">
                      <i className="bi bi-wifi me-1"></i>
                      {dependencies.sensores} Sensores
                    </Badge>
                  )}
                  {dependencies.equipamentoAtuadores > 0 && (
                    <Badge bg="secondary">
                      <i className="bi bi-diagram-3 me-1"></i>
                      {dependencies.equipamentoAtuadores} Atuadores de
                      Equipamentos
                    </Badge>
                  )}
                  {dependencies.equipamentoSensores > 0 && (
                    <Badge bg="dark">
                      <i className="bi bi-broadcast me-1"></i>
                      {dependencies.equipamentoSensores} Sensores de
                      Equipamentos
                    </Badge>
                  )}
                </div>
              </Alert>

              <div className="border rounded p-3 bg-light">
                <h6 className="mb-3">
                  <i className="bi bi-gear me-2"></i>
                  Opções de Exclusão
                </h6>

                <Form.Check
                  type="radio"
                  id="manual-delete"
                  name="deleteOption"
                  label="Remoção Manual (Recomendado)"
                  checked={!forceDelete}
                  onChange={() => setForceDelete(false)}
                  className="mb-2"
                />
                <p className="text-muted small ms-4 mb-3">
                  Você precisará remover manualmente todos os itens dependentes
                  antes de excluir a loja.
                </p>

                <Form.Check
                  type="radio"
                  id="cascade-delete"
                  name="deleteOption"
                  label="Exclusão em Cascata (Cuidado!)"
                  checked={forceDelete}
                  onChange={() => setForceDelete(true)}
                  className="mb-2"
                />
                <p className="text-muted small ms-4">
                  <strong>ATENÇÃO:</strong> Todos os {totalDependencies} itens
                  listados acima serão permanentemente removidos junto com a
                  loja.
                </p>
              </div>
            </>
          )}

          {!hasDependencies && (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Esta loja não possui itens dependentes. Ela pode ser removida com
              segurança.
            </Alert>
          )}

          <Alert variant="danger" className="mt-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Esta ação é irreversível e não pode ser desfeita.</strong>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>

          {hasDependencies && !forceDelete && (
            <Button
              variant="outline-primary"
              onClick={handleClose}
              disabled={loading}
            >
              <i className="bi bi-list-ul me-2"></i>
              Gerenciar Itens Dependentes
            </Button>
          )}

          <Button
            variant={forceDelete ? "danger" : "warning"}
            onClick={handleConfirm}
            disabled={loading}
            className="btn-enhanced"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {forceDelete ? "Removendo Tudo..." : "Verificando..."}
              </>
            ) : (
              <>
                <i
                  className={`bi ${
                    forceDelete ? "bi-trash-fill" : "bi-trash"
                  } me-2`}
                ></i>
                {forceDelete
                  ? `Remover Loja + ${totalDependencies} Itens`
                  : hasDependencies
                  ? "Tentar Excluir"
                  : "Excluir Loja"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </ComponentErrorBoundary>
  );
}
