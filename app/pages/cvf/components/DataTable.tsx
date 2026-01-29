"use client";

import { Table, Button, Alert } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";
import { Cvf } from "../../../../types";

interface DataTableProps {
    data: Cvf[];
    columns: {
        key: string;
        header: string;
        render?: (item: Cvf, index: number) => React.ReactNode;
        className?: string;
    }[];
    error?: string | null;
    emptyMessage?: string;
    onEdit?: (item: Cvf) => void;
    onDelete?: (item: Cvf) => void;
    idKey?: keyof Cvf;
}

const DataTable = ({
    data,
    columns,
    error,
    emptyMessage,
    onEdit,
    onDelete,
    idKey = "id",
}: DataTableProps) => {
    const renderCell = (
        item: Cvf,
        column: {
            key: string;
            render?: (item: Cvf, index: number) => React.ReactNode;
        },
        index: number
    ): React.ReactNode => {
        if (column.render) {
            return column.render(item, index);
        }
        const value = item[column.key as keyof Cvf];
        return value != null ? String(value) : "N/A";
    };

    if (error) {
        return (
            <Alert variant="danger" className="mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </Alert>
        );
    }

    if (data.length === 0) {
        return (
            <Alert variant="info" className="text-center">
                <i className="bi bi-info-circle me-2"></i>
                {emptyMessage || "Nenhum item encontrado"}
            </Alert>
        );
    }

    return (
        <ComponentErrorBoundary componentName="DataTable">
            <div className="table-responsive cvf-table-responsive">
                <Table striped bordered hover className="shadow-sm">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th>#</th>
                            {columns.map((column) => (
                                <th key={column.key} className={column.className}>
                                    {column.header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && <th className="text-center">Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={(item[idKey as keyof Cvf] as string) || index}>
                                <td>{index + 1}</td>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={column.className}
                                        data-label={column.header}
                                    >
                                        {renderCell(item, column, index)}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="text-center align-middle actions-cell" data-label="Ações">
                                        <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
                                            {onEdit && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => onEdit(item)}
                                                    className="d-flex align-items-center btn-action"
                                                >
                                                    <i className="bi bi-pencil me-1"></i>
                                                    <span className="d-none d-md-inline">Editar</span>
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => onDelete(item)}
                                                    className="d-flex align-items-center btn-action"
                                                >
                                                    <i className="bi bi-trash me-1"></i>
                                                    <span className="d-none d-md-inline">Excluir</span>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </ComponentErrorBoundary>
    );
};

export default DataTable;