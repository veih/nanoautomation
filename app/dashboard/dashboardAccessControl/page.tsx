"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    Row,
    Col,
    Table,
    Form,
    Alert,
    Button,
    Badge,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";
import { CmsTableSkeleton } from "../../components/Loading";

// Import types
import {
    AccessController,
    RequestButton,
    Electromagnet,
    MagneticSensor,
    AccessControlDevice
} from "../../../types/accessControl";

// Enums for status
type AccessControlStatus = 'OPERACIONAL' | 'DEFEITO' | 'MANUTENCAO' | 'N_A';
type RequestButtonType = 'ENTRY' | 'EXIT' | 'EMERGENCY';
type LockStatus = 'LOCKED' | 'UNLOCKED' | 'LOCKING' | 'UNLOCKING';
type SensorType = 'DOOR' | 'WINDOW' | 'GATE';

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            name: string;
            value: number;
        };
    }>;
}

export default function AccessControlDashboard() {
    const router = useRouter();

    // State management
    const [controllers, setControllers] = useState<AccessController[]>([]);
    const [buttons, setButtons] = useState<RequestButton[]>([]);
    const [electromagnets, setElectromagnets] = useState<Electromagnet[]>([]);
    const [sensors, setSensors] = useState<MagneticSensor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [showGraphs, setShowGraphs] = useState<boolean>(false);
    // Removed unused state variables for device modal

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/access-control');

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const result: { success: boolean; data: unknown } = await response.json();
                const data = result.success ? result.data : result;

                setControllers((data as { controllers?: AccessController[] }).controllers || []);
                setButtons((data as { buttons?: RequestButton[] }).buttons || []);
                setElectromagnets((data as { electromagnets?: Electromagnet[] }).electromagnets || []);
                setSensors((data as { sensors?: MagneticSensor[] }).sensors || []);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dados";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter devices based on search text
    const filteredControllers = controllers.filter(controller =>
        controller.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (controller.location && controller.location.toLowerCase().includes(searchText.toLowerCase()))
    );

    const filteredButtons = buttons.filter(button =>
        button.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (button.location && button.location.toLowerCase().includes(searchText.toLowerCase()))
    );

    const filteredElectromagnets = electromagnets.filter(electromagnet =>
        electromagnet.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (electromagnet.location && electromagnet.location.toLowerCase().includes(searchText.toLowerCase()))
    );

    const filteredSensors = sensors.filter(sensor =>
        sensor.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (sensor.location && sensor.location.toLowerCase().includes(searchText.toLowerCase()))
    );

    // Calculate totals
    const totals = {
        controllers: controllers.length,
        buttons: buttons.length,
        electromagnets: electromagnets.length,
        sensors: sensors.length,
    };

    // Calculate status counts for charts
    const getStatusCounts = (devices: AccessControlDevice[]) => {
        const counts = {
            OPERACIONAL: 0,
            DEFEITO: 0,
            MANUTENCAO: 0,
            N_A: 0
        };

        devices.forEach(device => {
            counts[device.status as keyof typeof counts]++;
        });

        return [
            { name: "Operacional", value: counts.OPERACIONAL, color: "#28a745" },
            { name: "Defeito", value: counts.DEFEITO, color: "#dc3545" },
            { name: "Manutenção", value: counts.MANUTENCAO, color: "#ffc107" },
            { name: "N/A", value: counts.N_A, color: "#6c757d" },
        ].filter(item => item.value > 0);
    };

    const controllerStatusData = getStatusCounts(controllers);
    const buttonStatusData = getStatusCounts(buttons);
    const electromagnetStatusData = getStatusCounts(electromagnets);
    const sensorStatusData = getStatusCounts(sensors);

    // Get status badge variant
    const getStatusVariant = (status: AccessControlStatus) => {
        switch (status) {
            case 'OPERACIONAL': return 'success';
            case 'DEFEITO': return 'danger';
            case 'MANUTENCAO': return 'warning';
            case 'N_A': return 'secondary';
            default: return 'secondary';
        }
    };

    // Get button type badge variant
    const getButtonTypeVariant = (type?: RequestButtonType) => {
        switch (type) {
            case 'ENTRY': return 'primary';
            case 'EXIT': return 'success';
            case 'EMERGENCY': return 'danger';
            default: return 'secondary';
        }
    };

    // Get lock status badge variant
    const getLockStatusVariant = (status?: LockStatus) => {
        switch (status) {
            case 'LOCKED': return 'success';
            case 'UNLOCKED': return 'danger';
            case 'LOCKING': return 'warning';
            case 'UNLOCKING': return 'info';
            default: return 'secondary';
        }
    };

    // Get sensor type badge variant
    const getSensorTypeVariant = (type?: SensorType) => {
        switch (type) {
            case 'DOOR': return 'primary';
            case 'WINDOW': return 'success';
            case 'GATE': return 'info';
            default: return 'secondary';
        }
    };

    // View device details
    const handleViewDetails = (device: AccessControlDevice) => {
        router.push(`/pages/access-control/detalhes?name=${encodeURIComponent(device.name)}&status=${device.status}`);
    };

    // Removed unused modal functions

    // Custom tooltip for charts
    const renderCustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
                    <p className="label fw-bold">{`${data.name}`}</p>
                    <p className="desc mb-0">{`Quantidade: ${data.value}`}</p>
                </div>
            );
        }
        return null;
    };

    // Custom label for charts
    const renderLabel = (props: { name: string; value?: number }) => {
        const { name, value } = props;
        if (!value || value === 0) return null;
        return `${name}: ${value}`;
    };

    if (loading) {
        return <CmsTableSkeleton />;
    }

    return (
        <ComponentErrorBoundary componentName="Dashboard Access Control">
            <div className="container py-1">
                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                    <h1 className="text-primary mb-0">
                        <i className="bi bi-shield-lock me-2"></i>
                        Dashboard de Controle de Acesso
                    </h1>
                </div>

                {error && (
                    <Alert variant="danger" className="mb-4">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                )}

                {/* Search Filter */}
                <Row className="mb-4 g-3 justify-content-center">
                    <Col md={6}>
                        <Form.Group controlId="searchDevices">
                            <Form.Control
                                className="text-primary search-input"
                                type="text"
                                placeholder="Buscar dispositivos..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* Summary Cards */}
                <Row className="mb-4 g-3">
                    <Col xs={6} sm={4} md={3} lg={2}>
                        <Card
                            bg="primary"
                            text="white"
                            className="mb-3 shadow-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push("/pages/access-control")}
                        >
                            <Card.Body className="text-center">
                                <i className="bi bi-controller" style={{ fontSize: "2rem" }}></i>
                                <Card.Title className="h6 mt-2">Controladoras</Card.Title>
                                <Card.Text className="fs-4 fw-bold">{totals.controllers}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={6} sm={4} md={3} lg={2}>
                        <Card
                            bg="info"
                            text="white"
                            className="mb-3 shadow-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push("/pages/access-control")}
                        >
                            <Card.Body className="text-center">
                                <i className="bi bi-app" style={{ fontSize: "2rem" }}></i>
                                <Card.Title className="h6 mt-2">Botões</Card.Title>
                                <Card.Text className="fs-4 fw-bold">{totals.buttons}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={6} sm={4} md={3} lg={2}>
                        <Card
                            bg="success"
                            text="white"
                            className="mb-3 shadow-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push("/pages/access-control")}
                        >
                            <Card.Body className="text-center">
                                <i className="bi bi-magnet" style={{ fontSize: "2rem" }}></i>
                                <Card.Title className="h6 mt-2">Eletroímãs</Card.Title>
                                <Card.Text className="fs-4 fw-bold">{totals.electromagnets}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={6} sm={4} md={3} lg={2}>
                        <Card
                            bg="warning"
                            text="dark"
                            className="mb-3 shadow-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push("/pages/access-control")}
                        >
                            <Card.Body className="text-center">
                                <i className="bi bi-radar" style={{ fontSize: "2rem" }}></i>
                                <Card.Title className="h6 mt-2">Sensores</Card.Title>
                                <Card.Text className="fs-4 fw-bold">{totals.sensors}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={6} sm={4} md={3} lg={2}>
                        <Card
                            bg="danger"
                            text="white"
                            className="mb-3 shadow-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push("/pages/access-control/defeito")}
                        >
                            <Card.Body className="text-center">
                                <i className="bi bi-exclamation-triangle" style={{ fontSize: "2rem" }}></i>
                                <Card.Title className="h6 mt-2">Em Defeito</Card.Title>
                                <Card.Text className="fs-4 fw-bold">
                                    {getStatusCounts([...controllers, ...buttons, ...electromagnets, ...sensors])
                                        .find(item => item.name === "Defeito")?.value || 0}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={6} sm={4} md={3} lg={2}>
                        <Card
                            bg="secondary"
                            text="white"
                            className="mb-3 shadow-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push("/pages/access-control")}
                        >
                            <Card.Body className="text-center">
                                <i className="bi bi-tools" style={{ fontSize: "2rem" }}></i>
                                <Card.Title className="h6 mt-2">Em Manutenção</Card.Title>
                                <Card.Text className="fs-4 fw-bold">
                                    {getStatusCounts([...controllers, ...buttons, ...electromagnets, ...sensors])
                                        .find(item => item.name === "Manutenção")?.value || 0}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Toggle Charts Button */}
                <div className="d-flex justify-content-center mb-4">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowGraphs(!showGraphs)}
                        className="btn-enhanced"
                    >
                        <i className={`bi ${showGraphs ? "bi-eye-slash" : "bi-eye"} me-2`}></i>
                        {showGraphs ? "Esconder Gráficos" : "Mostrar Gráficos"}
                    </Button>
                </div>

                {/* Charts Section */}
                {showGraphs && (
                    <ComponentErrorBoundary componentName="Gráficos de Status">
                        <Row className="mb-4 g-3">
                            <Col xs={12}>
                                <h4 className="text-secondary mt-4 mb-3">
                                    <i className="bi bi-bar-chart me-2"></i>
                                    Status dos Dispositivos de Controle de Acesso
                                </h4>
                            </Col>

                            {/* Controllers Chart */}
                            <Col md={6} lg={3}>
                                <Card className="shadow-sm h-100">
                                    <Card.Header className="bg-primary text-white">
                                        <h5 className="mb-0 text-center">
                                            <i className="bi bi-controller me-2"></i>
                                            Controladoras
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {totals.controllers > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={controllerStatusData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={70}
                                                        label={renderLabel}
                                                        labelLine={false}
                                                    >
                                                        {controllerStatusData.map((entry, index) => (
                                                            <Cell key={`cell-controller-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={renderCustomTooltip} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center text-secondary py-3">
                                                <i className="bi bi-info-circle" style={{ fontSize: "2rem" }}></i>
                                                <h6 className="mt-2 mb-0">Nenhuma controladora encontrada.</h6>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Buttons Chart */}
                            <Col md={6} lg={3}>
                                <Card className="shadow-sm h-100">
                                    <Card.Header className="bg-info text-white">
                                        <h5 className="mb-0 text-center">
                                            <i className="bi bi-app me-2"></i>
                                            Botões
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {totals.buttons > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={buttonStatusData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={70}
                                                        label={renderLabel}
                                                        labelLine={false}
                                                    >
                                                        {buttonStatusData.map((entry, index) => (
                                                            <Cell key={`cell-button-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={renderCustomTooltip} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center text-secondary py-3">
                                                <i className="bi bi-info-circle" style={{ fontSize: "2rem" }}></i>
                                                <h6 className="mt-2 mb-0">Nenhum botão encontrado.</h6>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Electromagnets Chart */}
                            <Col md={6} lg={3}>
                                <Card className="shadow-sm h-100">
                                    <Card.Header className="bg-success text-white">
                                        <h5 className="mb-0 text-center">
                                            <i className="bi bi-magnet me-2"></i>
                                            Eletroímãs
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {totals.electromagnets > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={electromagnetStatusData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={70}
                                                        label={renderLabel}
                                                        labelLine={false}
                                                    >
                                                        {electromagnetStatusData.map((entry, index) => (
                                                            <Cell key={`cell-electromagnet-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={renderCustomTooltip} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center text-secondary py-3">
                                                <i className="bi bi-info-circle" style={{ fontSize: "2rem" }}></i>
                                                <h6 className="mt-2 mb-0">Nenhum eletroímã encontrado.</h6>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Sensors Chart */}
                            <Col md={6} lg={3}>
                                <Card className="shadow-sm h-100">
                                    <Card.Header className="bg-warning text-dark">
                                        <h5 className="mb-0 text-center">
                                            <i className="bi bi-radar me-2"></i>
                                            Sensores
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {totals.sensors > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={sensorStatusData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={70}
                                                        label={renderLabel}
                                                        labelLine={false}
                                                    >
                                                        {sensorStatusData.map((entry, index) => (
                                                            <Cell key={`cell-sensor-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={renderCustomTooltip} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center text-secondary py-3">
                                                <i className="bi bi-info-circle" style={{ fontSize: "2rem" }}></i>
                                                <h6 className="mt-2 mb-0">Nenhum sensor encontrado.</h6>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </ComponentErrorBoundary>
                )}

                {/* Controllers Table */}
                <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                    <h4 className="text-secondary">
                        <i className="bi bi-controller me-2"></i>
                        Controladoras ({filteredControllers.length})
                    </h4>
                </div>

                {filteredControllers.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        Nenhuma controladora encontrada.
                    </Alert>
                ) : (
                    <ComponentErrorBoundary componentName="Tabela de Controladoras">
                        <div className="table-responsive">
                            <Table striped bordered hover className="shadow-sm">
                                <thead className="bg-primary text-white">
                                    <tr>
                                        <th>Nome</th>
                                        <th>Localização</th>
                                        <th>Status</th>
                                        <th>IP</th>
                                        <th>Atualizado</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredControllers.map((controller) => (
                                        <tr key={controller.id}>
                                            <td className="fw-bold">{controller.name}</td>
                                            <td>{controller.location || "-"}</td>
                                            <td>
                                                <Badge bg={getStatusVariant(controller.status as AccessControlStatus)}>
                                                    {controller.status}
                                                </Badge>
                                            </td>
                                            <td>{controller.ipAddress || "-"}</td>
                                            <td>
                                                {controller.lastUpdated
                                                    ? new Date(controller.lastUpdated).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(controller)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Detalhes
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </ComponentErrorBoundary>
                )}

                {/* Buttons Table */}
                <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                    <h4 className="text-secondary">
                        <i className="bi bi-app me-2"></i>
                        Botões ({filteredButtons.length})
                    </h4>
                </div>

                {filteredButtons.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        Nenhum botão encontrado.
                    </Alert>
                ) : (
                    <ComponentErrorBoundary componentName="Tabela de Botões">
                        <div className="table-responsive">
                            <Table striped bordered hover className="shadow-sm">
                                <thead className="bg-info text-white">
                                    <tr>
                                        <th>Nome</th>
                                        <th>Localização</th>
                                        <th>Status</th>
                                        <th>Tipo</th>
                                        <th>Pressionado</th>
                                        <th>Atualizado</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredButtons.map((button) => (
                                        <tr key={button.id}>
                                            <td className="fw-bold">{button.name}</td>
                                            <td>{button.location || "-"}</td>
                                            <td>
                                                <Badge bg={getStatusVariant(button.status as AccessControlStatus)}>
                                                    {button.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                {button.buttonType ? (
                                                    <Badge bg={getButtonTypeVariant(button.buttonType as RequestButtonType)}>
                                                        {button.buttonType}
                                                    </Badge>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td>
                                                {button.isPressed ? (
                                                    <Badge bg="success">Sim</Badge>
                                                ) : (
                                                    <Badge bg="secondary">Não</Badge>
                                                )}
                                            </td>
                                            <td>
                                                {button.lastUpdated
                                                    ? new Date(button.lastUpdated).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(button)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Detalhes
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </ComponentErrorBoundary>
                )}

                {/* Electromagnets Table */}
                <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                    <h4 className="text-secondary">
                        <i className="bi bi-magnet me-2"></i>
                        Eletroímãs ({filteredElectromagnets.length})
                    </h4>
                </div>

                {filteredElectromagnets.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        Nenhum eletroímã encontrado.
                    </Alert>
                ) : (
                    <ComponentErrorBoundary componentName="Tabela de Eletroímãs">
                        <div className="table-responsive">
                            <Table striped bordered hover className="shadow-sm">
                                <thead className="bg-success text-white">
                                    <tr>
                                        <th>Nome</th>
                                        <th>Localização</th>
                                        <th>Status</th>
                                        <th>Travado</th>
                                        <th>Status da Trava</th>
                                        <th>Consumo (W)</th>
                                        <th>Atualizado</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredElectromagnets.map((electromagnet) => (
                                        <tr key={electromagnet.id}>
                                            <td className="fw-bold">{electromagnet.name}</td>
                                            <td>{electromagnet.location || "-"}</td>
                                            <td>
                                                <Badge bg={getStatusVariant(electromagnet.status as AccessControlStatus)}>
                                                    {electromagnet.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                {electromagnet.isLocked ? (
                                                    <Badge bg="success">Sim</Badge>
                                                ) : (
                                                    <Badge bg="secondary">Não</Badge>
                                                )}
                                            </td>
                                            <td>
                                                {electromagnet.lockStatus ? (
                                                    <Badge bg={getLockStatusVariant(electromagnet.lockStatus as LockStatus)}>
                                                        {electromagnet.lockStatus}
                                                    </Badge>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td>
                                                {electromagnet.powerConsumption !== undefined
                                                    ? electromagnet.powerConsumption.toFixed(2)
                                                    : "-"}
                                            </td>
                                            <td>
                                                {electromagnet.lastUpdated
                                                    ? new Date(electromagnet.lastUpdated).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(electromagnet)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Detalhes
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </ComponentErrorBoundary>
                )}

                {/* Sensors Table */}
                <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                    <h4 className="text-secondary">
                        <i className="bi bi-radar me-2"></i>
                        Sensores Magnéticos ({filteredSensors.length})
                    </h4>
                </div>

                {filteredSensors.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        Nenhum sensor encontrado.
                    </Alert>
                ) : (
                    <ComponentErrorBoundary componentName="Tabela de Sensores">
                        <div className="table-responsive">
                            <Table striped bordered hover className="shadow-sm">
                                <thead className="bg-warning text-dark">
                                    <tr>
                                        <th>Nome</th>
                                        <th>Localização</th>
                                        <th>Status</th>
                                        <th>Tipo</th>
                                        <th>Fechado</th>
                                        <th>Última Ativação</th>
                                        <th>Atualizado</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSensors.map((sensor) => (
                                        <tr key={sensor.id}>
                                            <td className="fw-bold">{sensor.name}</td>
                                            <td>{sensor.location || "-"}</td>
                                            <td>
                                                <Badge bg={getStatusVariant(sensor.status as AccessControlStatus)}>
                                                    {sensor.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                {sensor.sensorType ? (
                                                    <Badge bg={getSensorTypeVariant(sensor.sensorType as SensorType)}>
                                                        {sensor.sensorType}
                                                    </Badge>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td>
                                                {sensor.isClosed ? (
                                                    <Badge bg="success">Fechado</Badge>
                                                ) : (
                                                    <Badge bg="danger">Aberto</Badge>
                                                )}
                                            </td>
                                            <td>
                                                {sensor.lastTriggered
                                                    ? new Date(sensor.lastTriggered).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td>
                                                {sensor.lastUpdated
                                                    ? new Date(sensor.lastUpdated).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(sensor)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Detalhes
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </ComponentErrorBoundary>
                )}

                {/* Device Detail Modal - Removed as we now navigate to the details page */}
            </div>
        </ComponentErrorBoundary>
    );
}