// app/components/OptimizedComponents.tsx
"use client";

import React, { memo, useMemo, useCallback } from "react";
import { Table, Button, ButtonGroup, Card, Badge } from "react-bootstrap";
import { Cm, Equipamento, Atuador, Sensor } from "@/types";

// ==================== OPTIMIZED TABLE COMPONENTS ====================

interface CmTableRowProps {
  cm: Cm;
  index: number;
  onEdit: (cm: Cm) => void;
  onDelete: (cm: Cm) => void;
}

const CmTableRow = memo(({ cm, index, onEdit, onDelete }: CmTableRowProps) => {
  const handleEdit = useCallback(() => onEdit(cm), [cm, onEdit]);
  const handleDelete = useCallback(() => onDelete(cm), [cm, onDelete]);

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{cm.nome}</td>
      <td>{cm.localizacao}</td>
      <td className="text-center">
        <ButtonGroup size="sm">
          <Button variant="outline-primary" onClick={handleEdit}>
            ✏️ Editar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            🗑️ Excluir
          </Button>
        </ButtonGroup>
      </td>
    </tr>
  );
});

CmTableRow.displayName = "CmTableRow";

interface CmTableProps {
  cms: Cm[];
  onEdit: (cm: Cm) => void;
  onDelete: (cm: Cm) => void;
}

const CmTable = memo(({ cms, onEdit, onDelete }: CmTableProps) => {
  const sortedCms = useMemo(() => {
    return [...cms].sort((a, b) => {
      const localizacaoComparison = (a.localizacao || "").localeCompare(
        b.localizacao || ""
      );
      if (localizacaoComparison !== 0) {
        return localizacaoComparison;
      }
      return (a.nome || "").localeCompare(b.nome || "");
    });
  }, [cms]);

  return (
    <Table striped bordered hover responsive className="shadow-sm">
      <thead>
        <tr>
          <th>#</th>
          <th>Casa de Máquina</th>
          <th>Piso</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {sortedCms.map((cm, index) => (
          <CmTableRow
            key={cm.id}
            cm={cm}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </Table>
  );
});

CmTable.displayName = "CmTable";

// ==================== EQUIPMENT COMPONENTS ====================

interface EquipmentStatusBadgeProps {
  status: string;
}

const EquipmentStatusBadge = memo(({ status }: EquipmentStatusBadgeProps) => {
  const variant = useMemo(() => {
    switch (status) {
      case "OPERACIONAL":
        return "success";
      case "DEFEITO":
        return "danger";
      case "MANUTENCAO":
        return "warning";
      case "DESATIVADO":
        return "secondary";
      default:
        return "light";
    }
  }, [status]);

  return <Badge bg={variant}>{status}</Badge>;
});

EquipmentStatusBadge.displayName = "EquipmentStatusBadge";

interface EquipmentCardProps {
  equipamento: Equipamento;
  onEdit?: (equipamento: Equipamento) => void;
  onDelete?: (equipamento: Equipamento) => void;
  showActions?: boolean;
}

const EquipmentCard = memo(
  ({
    equipamento,
    onEdit,
    onDelete,
    showActions = true,
  }: EquipmentCardProps) => {
    const handleEdit = useCallback(
      () => onEdit?.(equipamento),
      [equipamento, onEdit]
    );
    const handleDelete = useCallback(
      () => onDelete?.(equipamento),
      [equipamento, onDelete]
    );

    const atuadoresCount = useMemo(
      () => equipamento.atuadores?.length || 0,
      [equipamento.atuadores]
    );

    const sensoresCount = useMemo(
      () => equipamento.sensores?.length || 0,
      [equipamento.sensores]
    );

    return (
      <Card className="h-100 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{equipamento.nome}</h6>
          <EquipmentStatusBadge status="OPERACIONAL" />
        </Card.Header>
        <Card.Body>
          {equipamento.descricao && (
            <Card.Text className="text-muted small">
              {equipamento.descricao}
            </Card.Text>
          )}

          <div className="d-flex justify-content-between text-center">
            <div>
              <div className="fw-bold text-primary">{atuadoresCount}</div>
              <small className="text-muted">Atuadores</small>
            </div>
            <div>
              <div className="fw-bold text-info">{sensoresCount}</div>
              <small className="text-muted">Sensores</small>
            </div>
          </div>
        </Card.Body>
        {showActions && (onEdit || onDelete) && (
          <Card.Footer>
            <ButtonGroup size="sm" className="w-100">
              {onEdit && (
                <Button variant="outline-primary" onClick={handleEdit}>
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button variant="outline-danger" onClick={handleDelete}>
                  Excluir
                </Button>
              )}
            </ButtonGroup>
          </Card.Footer>
        )}
      </Card>
    );
  }
);

EquipmentCard.displayName = "EquipmentCard";

// ==================== ACTUATOR/SENSOR COMPONENTS ====================

interface DeviceListItemProps {
  device: Atuador | Sensor;
  type: "atuador" | "sensor";
  onEdit?: (device: Atuador | Sensor) => void;
  onDelete?: (device: Atuador | Sensor) => void;
}

const DeviceListItem = memo(
  ({ device, onEdit, onDelete }: DeviceListItemProps) => {
    const handleEdit = useCallback(() => onEdit?.(device), [device, onEdit]);
    const handleDelete = useCallback(
      () => onDelete?.(device),
      [device, onDelete]
    );

    const statusColor = useMemo(() => {
      switch (device.estado) {
        case "OPERACIONAL":
          return "text-success";
        case "DEFEITO":
          return "text-danger";
        case "MANUTENCAO":
          return "text-warning";
        default:
          return "text-muted";
      }
    }, [device.estado]);

    return (
      <div className="border rounded p-2 mb-2">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="fw-semibold">{device.nome}</div>
            <div className="text-muted small">{device.tipo}</div>
            {"valorAtual" in device && device.valorAtual !== undefined && (
              <div className="text-info small">Valor: {device.valorAtual}</div>
            )}
            <div className={`small ${statusColor}`}>
              Status: {device.estado || "DESCONHECIDO"}
            </div>
          </div>
          {(onEdit || onDelete) && (
            <div className="ms-2">
              <ButtonGroup size="sm">
                {onEdit && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleEdit}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                )}
              </ButtonGroup>
            </div>
          )}
        </div>
        {"descricaoDefeito" in device && device.descricaoDefeito && (
          <div className="mt-2 p-2 bg-light rounded">
            <small className="text-danger">
              <strong>Defeito:</strong>{" "}
              {"descricaoDefeito" in device ? device.descricaoDefeito : "N/A"}
            </small>
          </div>
        )}
      </div>
    );
  }
);

DeviceListItem.displayName = "DeviceListItem";

// ==================== STATISTICS COMPONENTS ====================

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color?: string;
  subtitle?: string;
}

const StatsCard = memo(
  ({ title, value, icon, color = "primary", subtitle }: StatsCardProps) => {
    return (
      <Card className="h-100 shadow-sm">
        <Card.Body className="text-center">
          <div className={`text-${color} mb-2`}>
            <i className={`${icon} fs-1`}></i>
          </div>
          <div className={`display-6 fw-bold text-${color}`}>
            {value.toLocaleString()}
          </div>
          <div className="fw-semibold">
            {title}
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
        </Card.Body>
      </Card>
    );
  }
);

StatsCard.displayName = "StatsCard";

// ==================== SEARCH AND FILTER COMPONENTS ====================

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: Array<{ value: string; label: string }>;
  placeholder?: string;
  filterPlaceholder?: string;
}

const SearchFilter = memo(
  ({
    searchValue,
    onSearchChange,
    filterValue = "",
    onFilterChange,
    filterOptions = [],
    placeholder = "Buscar...",
    filterPlaceholder = "Filtrar por...",
  }: SearchFilterProps) => {
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onSearchChange(e.target.value),
      [onSearchChange]
    );

    const handleFilterChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) =>
        onFilterChange?.(e.target.value),
      [onFilterChange]
    );

    return (
      <div className="row g-2 mb-3">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={placeholder}
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        {filterOptions.length > 0 && onFilterChange && (
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterValue}
              onChange={handleFilterChange}
            >
              <option value="">{filterPlaceholder}</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }
);

SearchFilter.displayName = "SearchFilter";

// Export all optimized components
export {
  CmTableRow,
  CmTable,
  EquipmentStatusBadge,
  EquipmentCard,
  DeviceListItem,
  StatsCard,
  SearchFilter,
};
