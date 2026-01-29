"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button, Card, Form, Alert, Row, Col, Table, Badge } from "react-bootstrap";
import DeviceFormModal from "./DeviceFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { CmsTableSkeleton } from "../../components/Loading";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";
import {
    DeviceType,
    FlattenedDevice,
    AccessControlApiResponse
} from "./types";

// Simple local hooks to replace lib/hooks (removed due to infinite callback issues)
function useFetch<T>(url: string) {
    const [data, setData] = React.useState<T | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result: { success: boolean; data: unknown; error?: { message: string } } = await response.json();

            // Handle both standardized and legacy response formats
            if (
                typeof result === "object" &&
                result !== null &&
                "success" in result
            ) {
                if (!result.success) {
                    throw new Error(result.error?.message || "API Error");
                }
                setData(result.data as T || null);
            } else {
                setData(result as T);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro ao carregar dados";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [url]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

function useModal() {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    };
}

export default function AccessControlDemoPage() {
    // Using custom hooks for better state management
    const {
        data: devices,
        loading,
        error,
        refetch,
    } = useFetch<AccessControlApiResponse>("/api/access-control");

    // Modal states using custom hook
    const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
    const {
        isOpen: showConfirmModal,
        open: openConfirmModal,
        close: closeConfirmModal,
    } = useModal();

    // Local state
    const [editDevice, setEditDevice] = useState<FlattenedDevice | null>(null);
    const [deviceToDelete, setDeviceToDelete] = useState<FlattenedDevice | null>(null);
    const [filtroBusca, setFiltroBusca] = useState<string>("");
    const [filtroTipo, setFiltroTipo] = useState<DeviceType>("");

    // Flatten all devices into a single array for easier handling
    const allDevices = useMemo(() => {
        if (!devices) return [];

        const flattenedDevices: FlattenedDevice[] = [];

        devices.controllers?.forEach(controller => {
            flattenedDevices.push({
                id: controller.id,
                name: controller.name,
                type: 'controller',
                status: controller.status,
                location: controller.location,
                ipAddress: controller.ipAddress,
                description: controller.description,
                lastUpdated: controller.lastUpdated
            });
        });

        devices.buttons?.forEach(button => {
            flattenedDevices.push({
                id: button.id,
                name: button.name,
                type: 'button',
                status: button.status,
                location: button.location,
                buttonType: button.buttonType,
                isPressed: button.isPressed,
                lastPressed: button.lastPressed,
                controllerId: button.controllerId,
                description: button.description,
                lastUpdated: button.lastUpdated
            });
        });

        devices.electromagnets?.forEach(electromagnet => {
            flattenedDevices.push({
                id: electromagnet.id,
                name: electromagnet.name,
                type: 'electromagnet',
                status: electromagnet.status,
                location: electromagnet.location,
                isLocked: electromagnet.isLocked,
                lockStatus: electromagnet.lockStatus,
                powerConsumption: electromagnet.powerConsumption,
                controllerId: electromagnet.controllerId,
                description: electromagnet.description,
                lastUpdated: electromagnet.lastUpdated
            });
        });

        devices.sensors?.forEach(sensor => {
            flattenedDevices.push({
                id: sensor.id,
                name: sensor.name,
                type: 'sensor',
                status: sensor.status,
                location: sensor.location,
                sensorType: sensor.sensorType,
                isClosed: sensor.isClosed,
                lastTriggered: sensor.lastTriggered,
                controllerId: sensor.controllerId,
                description: sensor.description,
                lastUpdated: sensor.lastUpdated
            });
        });

        return flattenedDevices;
    }, [devices]);

    // Statistics calculations
    const stats = useMemo(() => {
        if (!devices)
            return { total: 0, controllers: 0, buttons: 0, electromagnets: 0, sensors: 0 };

        const controllers = devices.controllers?.length || 0;
        const buttons = devices.buttons?.length || 0;
        const electromagnets = devices.electromagnets?.length || 0;
        const sensors = devices.sensors?.length || 0;
        const total = controllers + buttons + electromagnets + sensors;

        return { total, controllers, buttons, electromagnets, sensors };
    }, [devices]);

    // Helper function to safely convert values
    const convertToString = (value: unknown): string => {
        if (value === undefined || value === null) return "";
        return String(value);
    };

    // ===== Filtragem por texto e tipo =====
    const devicesFiltrados = useMemo(() => {
        if (!allDevices) return [];

        return allDevices.filter((device) => {
            const busca = filtroBusca.toLowerCase();
            const matchesBusca =
                convertToString(device.name).toLowerCase().includes(busca) ||
                (device.location && convertToString(device.location).toLowerCase().includes(busca)) ||
                convertToString(device.type).toLowerCase().includes(busca);

            const matchesTipo = filtroTipo ? convertToString(device.type) === filtroTipo : true;

            return matchesBusca && matchesTipo;
        });
    }, [allDevices, filtroBusca, filtroTipo]);

    // Event handlers
    const handleEdit = (device: FlattenedDevice) => {
        setEditDevice(device);
        openModal();
    };

    const handleDelete = (device: FlattenedDevice) => {
        setDeviceToDelete(device);
        openConfirmModal();
    };

    const handleNew = () => {
        setEditDevice(null);
        openModal();
    };

    const handleCloseModal = () => {
        setEditDevice(null);
        closeModal();
    };

    const handleCloseConfirmModal = () => {
        setDeviceToDelete(null);
        closeConfirmModal();
    };

    // Wrapper functions to handle async callbacks
    const handleSaved = async () => {
        await refetch();
    };

    const handleDeleted = () => {
        refetch();
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'OPERACIONAL': return 'success';
            case 'DEFEITO': return 'danger';
            case 'MANUTENCAO': return 'warning';
            default: return 'secondary';
        }
    };

    const getDeviceTypeLabel = (type: string) => {
        switch (type) {
            case 'controller': return 'Controlador';
            case 'button': return 'Botão';
            case 'electromagnet': return 'Eletroímã';
            case 'sensor': return 'Sensor';
            default: return type;
        }
    };

    if (loading) {
        return <CmsTableSkeleton />;
    }

    return (
        <ComponentErrorBoundary componentName="AccessControl">
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="text-primary mb-0">
                        <i className="bi bi-shield-lock me-2"></i>
                        Gerenciamento de Controle de Acesso
                    </h1>
                    <Button
                        variant="success"
                        onClick={handleNew}
                        className="btn-enhanced"
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Adicionar Dispositivo
                    </Button>
                </div>

                {/* Statistics Cards */}
                <Row className="mb-4 g-3">
                    <Col xs={6} md={3}>
                        <Card className="bg-primary text-white h-100">
                            <Card.Body className="text-center">
                                <i
                                    className="bi bi-shield-lock"
                                    style={{ fontSize: "2rem" }}
                                ></i>
                                <Card.Title className="h6 mt-2">Total</Card.Title>
                                <Card.Text className="fs-4 fw-bold">
                                    {stats.total}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className="bg-info text-white h-100">
                            <Card.Body className="text-center">
                                <i
                                    className="bi bi-cpu"
                                    style={{ fontSize: "2rem" }}
                                ></i>
                                <Card.Title className="h6 mt-2">Controladores</Card.Title>
                                <Card.Text className="fs-4 fw-bold">
                                    {stats.controllers}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className="bg-success text-white h-100">
                            <Card.Body className="text-center">
                                <i
                                    className="bi bi-app-indicator"
                                    style={{ fontSize: "2rem" }}
                                ></i>
                                <Card.Title className="h6 mt-2">Botões</Card.Title>
                                <Card.Text className="fs-4 fw-bold">
                                    {stats.buttons}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className="bg-warning text-dark h-100">
                            <Card.Body className="text-center">
                                <i
                                    className="bi bi-magnet"
                                    style={{ fontSize: "2rem" }}
                                ></i>
                                <Card.Title className="h6 mt-2">Eletroímãs</Card.Title>
                                <Card.Text className="fs-4 fw-bold">
                                    {stats.electromagnets}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className="bg-secondary text-white h-100">
                            <Card.Body className="text-center">
                                <i
                                    className="bi bi-radar"
                                    style={{ fontSize: "2rem" }}
                                ></i>
                                <Card.Title className="h6 mt-2">Sensores</Card.Title>
                                <Card.Text className="fs-4 fw-bold">
                                    {stats.sensors}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {error && (
                    <Alert variant="danger" className="mb-4">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                )}

                {/* Search and Filter Controls */}
                <Row className="mb-4">
                    <Col md={6}>
                        <Form.Group controlId="searchDevices">
                            <Form.Control
                                type="text"
                                placeholder="Buscar por nome, localização ou tipo..."
                                value={filtroBusca}
                                onChange={(e) => setFiltroBusca(e.target.value)}
                                className="search-input"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="typeFilter">
                            <Form.Select
                                value={filtroTipo}
                                onChange={(e) =>
                                    setFiltroTipo(e.target.value as DeviceType)
                                }
                            >
                                <option value="">Todos os Tipos</option>
                                <option value="controller">Controladores</option>
                                <option value="button">Botões</option>
                                <option value="electromagnet">Eletroímãs</option>
                                <option value="sensor">Sensores</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex align-items-center">
                        <small className="text-muted">
                            <i className="bi bi-funnel me-1"></i>
                            {devicesFiltrados.length} de {stats.total} dispositivos
                        </small>
                    </Col>
                </Row>

                {devicesFiltrados.length === 0 && !loading ? (
                    <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        {filtroBusca || filtroTipo
                            ? "Nenhum dispositivo encontrado com os filtros aplicados."
                            : "Nenhum dispositivo encontrado. Adicione um novo!"}
                    </Alert>
                ) : (
                    <ComponentErrorBoundary componentName="Tabela de Dispositivos">
                        <Card>
                            <Card.Body>
                                <Table striped bordered hover responsive className="devices-table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Status</th>
                                            <th>Localização</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {devicesFiltrados.map((device) => (
                                            <tr key={`${device.type}-${device.id}`}>
                                                <td>
                                                    {device.name}
                                                    {device.status === 'DEFEITO' && device.imagePaths && (
                                                        <i className="bi bi-images ms-2 text-primary" title="Possui imagens"></i>
                                                    )}
                                                </td>
                                                <td>{getDeviceTypeLabel(device.type)}</td>
                                                <td>
                                                    <Badge bg={getStatusVariant(device.status)}>
                                                        {device.status}
                                                    </Badge>
                                                </td>
                                                <td>{device.location || '-'}</td>
                                                <td>
                                                    <Link href={`/pages/access-control/detalhes?name=${encodeURIComponent(device.name)}&status=${device.status}`}>
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            className="me-2"
                                                        >
                                                            <i className="bi bi-eye"></i> Detalhes
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleEdit(device)}
                                                    >
                                                        <i className="bi bi-pencil"></i> Editar
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(device)}
                                                    >
                                                        <i className="bi bi-trash"></i> Excluir
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </ComponentErrorBoundary>
                )}

                <ComponentErrorBoundary componentName="Formulário de Dispositivo">
                    <DeviceFormModal
                        show={showModal}
                        device={editDevice}
                        onHide={handleCloseModal}
                        onSaved={handleSaved}
                    />
                </ComponentErrorBoundary>

                <ComponentErrorBoundary componentName="Modal de Confirmação">
                    <ConfirmDeleteModal
                        show={showConfirmModal}
                        device={deviceToDelete}
                        onHide={handleCloseConfirmModal}
                        onDeleted={handleDeleted}
                    />
                </ComponentErrorBoundary>
            </div>
        </ComponentErrorBoundary>
    );
}