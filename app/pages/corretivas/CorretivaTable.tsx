import React, { useMemo } from "react";
import {
  Table,
  Button,
  ButtonGroup,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Corretiva, CorretivasStatus } from "../../../types";

interface Props {
  corretivas: Corretiva[];
  onEdit: (c: Corretiva) => void;
  onConfirme: (c: Corretiva) => void;
  onDelete: (c: Corretiva) => void;
  onShowImages: (urls: string[]) => void;
  loading?: boolean;
}

// Memoized tooltip components to prevent unnecessary re-renders
const EditTooltip = React.memo(() => <Tooltip>Editar Corretiva</Tooltip>);
EditTooltip.displayName = "EditTooltip";
const ConcludeTooltip = React.memo(() => <Tooltip>Concluir Corretiva</Tooltip>);
ConcludeTooltip.displayName = "ConcludeTooltip";
const DeleteTooltip = React.memo(() => <Tooltip>Excluir Corretiva</Tooltip>);
DeleteTooltip.displayName = "DeleteTooltip";
const UrgentTooltip = React.memo(() => <Tooltip>Solicitação Urgente</Tooltip>);
UrgentTooltip.displayName = "UrgentTooltip";
const DescriptionTooltip = React.memo(
  ({ description }: { description: string }) => <Tooltip>{description}</Tooltip>
);
DescriptionTooltip.displayName = "DescriptionTooltip";

export default function CorretivaTable({
  corretivas,
  onEdit,
  onDelete,
  onConfirme,
  onShowImages,
  loading = false,
}: Props) {
  function formatDateBR(isoDate?: string) {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleDateString("pt-BR");
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case CorretivasStatus.CONCLUIDO:
        return "success";
      case CorretivasStatus.ANDAMENTO:
        return "warning";
      case CorretivasStatus.ESPERA:
        return "secondary";
      default:
        return "dark";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case CorretivasStatus.CONCLUIDO:
        return "bi-check-circle";
      case CorretivasStatus.ANDAMENTO:
        return "bi-clock";
      case CorretivasStatus.ESPERA:
        return "bi-pause-circle";
      default:
        return "bi-question-circle";
    }
  };

  const isUrgent = (solicitacao: string) => {
    return solicitacao.toLowerCase().includes("urgente");
  };

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(
    () =>
      corretivas.map((c) => (
        <tr
          key={c.id}
          className={isUrgent(c.solicitacao) ? "table-warning" : ""}
        >
          <td className="d-none d-md-table-cell">
            <div className="d-flex align-items-center">
              {isUrgent(c.solicitacao) && (
                <OverlayTrigger
                  placement="top"
                  overlay={<UrgentTooltip />}
                  trigger={["hover", "focus"]}
                  delay={{ show: 250, hide: 0 }}
                  container={document.body}
                >
                  <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                </OverlayTrigger>
              )}
              <span className="fw-bold">{formatDateBR(c.data)}</span>
            </div>
          </td>
          <td>
            <div>
              <div className="d-md-none">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">{formatDateBR(c.data)}</span>
                  <Badge
                    bg={getStatusVariant(c.status)}
                    className="d-flex align-items-center"
                  >
                    <i className={`bi ${getStatusIcon(c.status)} me-1`}></i>
                    <span className="d-none d-xxl-inline">{c.status}</span>
                  </Badge>
                </div>
                <div className="mt-1">
                  <i className="bi bi-geo-alt text-primary me-1"></i>
                  <strong>{c.local}</strong>
                </div>
              </div>
              <div className="d-none d-md-block">
                <i className="bi bi-geo-alt text-primary me-1"></i>
                {c.local}
              </div>
              <div className="d-md-none mt-1">
                <small className="text-muted">
                  <i className="bi bi-person me-1"></i>
                  {c.colaborador || "-"}
                </small>
              </div>
              <div className="d-md-none mt-1">
                <small className="text-muted">
                  <i className="bi bi-person-check me-1"></i>
                  {c.solicitante}
                </small>
              </div>
              <div className="d-md-none mt-1">
                <small
                  className="text-muted text-truncate"
                  style={{ maxWidth: "200px" }}
                >
                  {c.descricao}
                </small>
              </div>
            </div>
          </td>
          <td className="d-none d-lg-table-cell">
            <div className="text-truncate" style={{ maxWidth: "200px" }}>
              <OverlayTrigger
                placement="top"
                overlay={<DescriptionTooltip description={c.descricao} />}
                trigger={["hover", "focus"]}
                delay={{ show: 250, hide: 0 }}
                container={document.body}
              >
                <span>{c.descricao}</span>
              </OverlayTrigger>
            </div>
          </td>
          <td className="d-none d-xl-table-cell">
            <i className="bi bi-person text-info me-1"></i>
            {c.colaborador || "-"}
          </td>
          <td className="d-none d-lg-table-cell">
            <i className="bi bi-person-check text-success me-1"></i>
            {c.solicitante}
          </td>
          <td>
            <div className="d-md-none">
              <Badge
                bg={getStatusVariant(c.status)}
                className="d-flex align-items-center justify-content-center w-100"
              >
                <i className={`bi ${getStatusIcon(c.status)} me-1`}></i>
                {c.status}
              </Badge>
            </div>
            <div className="d-none d-md-block">
              <Badge
                bg={getStatusVariant(c.status)}
                className="d-flex align-items-center justify-content-center"
                style={{ minWidth: "100px" }}
              >
                <i className={`bi ${getStatusIcon(c.status)} me-1`}></i>
                {c.status}
              </Badge>
            </div>
          </td>
          <td className="d-none d-md-table-cell text-center">
            {c.fotoUrls && c.fotoUrls.length > 0 ? (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onShowImages(c.fotoUrls || [])}
                className="d-flex align-items-center"
              >
                <i className="bi bi-images me-1"></i>
                {c.fotoUrls.length} foto{c.fotoUrls.length > 1 ? "s" : ""}
              </Button>
            ) : (
              <span className="text-muted">
                <i className="bi bi-image me-1"></i>
                Sem fotos
              </span>
            )}
          </td>
          <td className="p-1">
            <div className="d-flex flex-column">
              <div className="d-md-none mb-2">
                {c.fotoUrls && c.fotoUrls.length > 0 ? (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onShowImages(c.fotoUrls || [])}
                    className="d-flex align-items-center w-100"
                  >
                    <i className="bi bi-images me-1"></i>
                    {c.fotoUrls.length} foto{c.fotoUrls.length > 1 ? "s" : ""}
                  </Button>
                ) : (
                  <span className="text-muted">
                    <i className="bi bi-image me-1"></i>
                    Sem fotos
                  </span>
                )}
              </div>
              <div className="w-100">
                <ButtonGroup size="sm" className="w-100 d-flex">
                  <Button
                    variant="outline-primary"
                    onClick={() => onEdit(c)}
                    disabled={loading}
                    className="flex-fill"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-success"
                    onClick={() => onConfirme(c)}
                    disabled={
                      c.status === CorretivasStatus.CONCLUIDO || loading
                    }
                    className="flex-fill"
                  >
                    <i className="bi bi-check"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    onClick={() => onDelete(c)}
                    disabled={loading}
                    className="flex-fill"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </td>
        </tr>
      )),
    [corretivas, loading, onEdit, onDelete, onConfirme, onShowImages]
  );

  return (
    <div className="table-responsive">
      <Table striped bordered hover className="shadow-sm" size="sm">
        <thead className="bg-primary text-white">
          <tr>
            <th className="d-none d-md-table-cell">
              <i className="bi bi-calendar me-2"></i>
              Data Inicial
            </th>
            <th>
              <i className="bi bi-geo-alt me-2"></i>
              <span className="d-none d-md-inline">Local</span>
              <span className="d-inline d-md-none">Local</span>
            </th>
            <th className="d-none d-lg-table-cell">
              <i className="bi bi-file-text me-2"></i>
              Descrição
            </th>
            <th className="d-none d-xl-table-cell">
              <i className="bi bi-person me-2"></i>
              Colaborador
            </th>
            <th className="d-none d-lg-table-cell">
              <i className="bi bi-person-check me-2"></i>
              Solicitante
            </th>
            <th>
              <i className="bi bi-flag me-2"></i>
              Status
            </th>
            <th className="d-none d-md-table-cell text-center">
              <i className="bi bi-camera me-2"></i>
              Fotos
            </th>
            <th className="text-center">
              <i className="bi bi-gear me-2"></i>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </Table>
    </div>
  );
}
