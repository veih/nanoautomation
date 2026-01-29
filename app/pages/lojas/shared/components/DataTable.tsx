"use client";

import { ReactNode, useCallback } from "react";
import { Table, ButtonGroup, Button, Alert, Card } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../../components/ErrorBoundary";

// Helper function to get nested property value
function getNestedProperty<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((current: unknown, prop) => {
    if (current && typeof current === 'object' && prop in current) {
      return (current as Record<string, unknown>)[prop];
    }
    return undefined;
  }, obj as unknown);
}

interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onViewDetails?: (item: T) => void;
  editLabel?: string;
  deleteLabel?: string;
  viewDetailsLabel?: string;
  idKey?: keyof T;
  className?: string;
  title?: string; // New prop for table title
  showHeader?: boolean; // New prop to control header visibility
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = "Nenhum item encontrado",
  onEdit,
  onDelete,
  onViewDetails,
  editLabel = "Editar",
  deleteLabel = "Excluir",
  viewDetailsLabel = "Detalhes",
  idKey = "id" as keyof T,
  className = "",
  title, // New prop
  showHeader = true, // New prop
}: DataTableProps<T>) {
  const renderCell = useCallback(
    (item: T, column: TableColumn<T>, index: number): ReactNode => {
      if (column.render) {
        return column.render(item, index);
      }
      // Use the helper function to get nested property values
      const value = getNestedProperty(item, column.key);
      return value != null ? String(value) : "N/A";
    },
    []
  );

  if (error) {
    return (
      <Card className="shadow-sm border-0 mb-4">
        {showHeader && title && (
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-table me-2"></i>
              {title}
            </h5>
          </Card.Header>
        )}
        <Card.Body>
          <Alert variant="danger" className="mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <Card className="shadow-sm border-0 mb-4">
        {showHeader && title && (
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-table me-2"></i>
              {title}
            </h5>
          </Card.Header>
        )}
        <Card.Body>
          <Alert variant="info" className="text-center mb-0">
            <i className="bi bi-info-circle me-2"></i>
            {emptyMessage}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <ComponentErrorBoundary componentName="DataTable">
      <Card className="shadow-sm border-0 mb-4">
        {showHeader && title && (
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-table me-2"></i>
              {title}
            </h5>
            <span className="badge bg-light text-dark">
              {data.length} {data.length === 1 ? 'item' : 'itens'}
            </span>
          </Card.Header>
        )}
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table
              striped
              bordered
              hover
              className={`mb-0 ${className}`}
            >
              <thead className="bg-light">
                <tr>
                  <th className="text-center" style={{ width: '50px' }}>#</th>
                  {columns.map((column) => (
                    <th key={column.key} className={column.className}>
                      {column.header}
                    </th>
                  ))}
                  {(onEdit || onDelete || onViewDetails) && <th className="text-center" style={{ width: '150px' }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={String((item as Record<string, unknown>)[String(idKey)])}>
                    <td className="text-center align-middle">{index + 1}</td>
                    {columns.map((column) => (
                      <td key={column.key} className={column.className || "align-middle"}>
                        {renderCell(item, column, index)}
                      </td>
                    ))}
                    {(onEdit || onDelete || onViewDetails) && (
                      <td className="text-center align-middle">
                        <ButtonGroup size="sm">
                          {onViewDetails && (
                            <Button
                              variant="outline-info"
                              onClick={() => onViewDetails(item)}
                              className="btn-enhanced me-1"
                              title={viewDetailsLabel}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="outline-primary"
                              onClick={() => onEdit(item)}
                              className="btn-enhanced me-1"
                              title={editLabel}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline-danger"
                              onClick={() => onDelete(item)}
                              className="btn-enhanced"
                              title={deleteLabel}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          )}
                        </ButtonGroup>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </ComponentErrorBoundary>
  );
}