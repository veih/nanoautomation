"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button, Card, Form, Alert, Row, Col, Table } from "react-bootstrap";
import { AccessController, RequestButton, Electromagnet, MagneticSensor } from "../../../../types/accessControl";
import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";
import PdfDefectiveAccessControlButton from "../../../components/PDFs/PdfDefectiveAccessControlButton";

// Define the device types
type DeviceType = 'controller' | 'button' | 'electromagnet' | 'sensor' | '';

// Define the flattened device type
interface FlattenedDevice {
    id: string;
    name: string;
    type: DeviceType;
    status: string;
    location?: string;
    lastUpdated?: string;
    // Removed [key: string]: any; to avoid "any" type
    // Instead, we'll define specific properties as needed
    ipAddress?: string;
    buttonType?: string;
    isPressed?: boolean;
    lastPressed?: string;
    isLocked?: boolean;
    lockStatus?: string;
    powerConsumption?: number;
    sensorType?: string;
    isClosed?: boolean;
    lastTriggered?: string;
}

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

// Helper function to format date safely
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return 'Data inválida';
    }
};

export default function AccessControlDefeitoPage() {
    // Using custom hooks for better state management
    const {
        data: devices,
        loading,
        error,
    } = useFetch<{
        controllers: AccessController[];
        buttons: RequestButton[];
        electromagnets: Electromagnet[];
        sensors: MagneticSensor[];
    }>("/api/access-control");

    // Local state
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
                lastUpdated: controller.lastUpdated,
                ipAddress: controller.ipAddress
            });
        });

        devices.buttons?.forEach(button => {
            flattenedDevices.push({
                id: button.id,
                name: button.name,
                type: 'button',
                status: button.status,
                location: button.location,
                lastUpdated: button.lastUpdated,
                buttonType: button.buttonType,
                isPressed: button.isPressed,
                lastPressed: button.lastPressed
            });
        });

        devices.electromagnets?.forEach(electromagnet => {
            flattenedDevices.push({
                id: electromagnet.id,
                name: electromagnet.name,
                type: 'electromagnet',
                status: electromagnet.status,
                location: electromagnet.location,
                lastUpdated: electromagnet.lastUpdated,
                isLocked: electromagnet.isLocked,
                lockStatus: electromagnet.lockStatus,
                powerConsumption: electromagnet.powerConsumption
            });
        });

        devices.sensors?.forEach(sensor => {
            flattenedDevices.push({
                id: sensor.id,
                name: sensor.name,
                type: 'sensor',
                status: sensor.status,
                location: sensor.location,
                lastUpdated: sensor.lastUpdated,
                sensorType: sensor.sensorType,
                isClosed: sensor.isClosed,
                lastTriggered: sensor.lastTriggered
            });
        });

        return flattenedDevices;
    }, [devices]);

    // Filter devices with "DEFEITO" status
    const defectiveDevices = useMemo(() => {
        if (!allDevices) return [];
        return allDevices.filter(device => device.status === 'DEFEITO');
    }, [allDevices]);

    // ===== Filtragem por texto e tipo =====
    const devicesFiltrados = useMemo(() => {
        if (!defectiveDevices) return [];

        return defectiveDevices.filter((device) => {
            const busca = filtroBusca.toLowerCase();
            const matchesBusca =
                device.name.toLowerCase().includes(busca) ||
                (device.location && device.location.toLowerCase().includes(busca)) ||
                device.type.toLowerCase().includes(busca);

            const matchesTipo = filtroTipo ? device.type === filtroTipo : true;

            return matchesBusca && matchesTipo;
        });
    }, [defectiveDevices, filtroBusca, filtroTipo]);

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
        <ComponentErrorBoundary componentName="AccessControlDefeito">
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="text-primary mb-0">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Dispositivos com Defeito
                    </h1>
                    {devices && (
                        <PdfDefectiveAccessControlButton devices={devices} />
                    )}
                </div>

                {/* Statistics Cards */}
                <Row className="mb-4 g-3">
                    <Col xs={12}>
                        <Card className="bg-danger text-white">
                            <Card.Body className="text-center">
                                <i className="bi bi-exclamation-triangle" style={{ fontSize: "2rem" }}></i>
                                <Card.Title className="h5 mt-2">Total de Dispositivos com Defeito</Card.Title>
                                <Card.Text className="fs-3 fw-bold">
                                    {defectiveDevices.length}
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
                            {devicesFiltrados.length} de {defectiveDevices.length} dispositivos com defeito
                        </small>
                    </Col>
                </Row>

                {devicesFiltrados.length === 0 && !loading ? (
                    <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        {filtroBusca || filtroTipo
                            ? "Nenhum dispositivo com defeito encontrado com os filtros aplicados."
                            : "Nenhum dispositivo com defeito encontrado."}
                    </Alert>
                ) : (
                    <ComponentErrorBoundary componentName="Tabela de Dispositivos com Defeito">
                        <Card>
                            <Card.Body>
                                <Table striped bordered hover responsive className="devices-table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Localização</th>
                                            <th>Última Atualização</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {devicesFiltrados.map((device) => (
                                            <tr key={`${device.type}-${device.id}`}>
                                                <td className="text-danger fw-bold">{device.name}</td>
                                                <td>{getDeviceTypeLabel(device.type)}</td>
                                                <td>{device.location || '-'}</td>
                                                <td>{formatDate(device.lastUpdated)}</td>
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
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </ComponentErrorBoundary>
                )}
            </div>
        </ComponentErrorBoundary>
    );
}