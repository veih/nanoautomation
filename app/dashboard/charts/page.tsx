"use client";

import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Form } from "react-bootstrap";
import Link from "next/link";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend
} from "recharts";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";
import { CmsTableSkeleton } from "../../components/Loading";

// Types
import {
    AccessController,
    RequestButton,
    Electromagnet,
    MagneticSensor
} from "../../../types/accessControl";
import {
    Cm,
    Atuador,
    Sensor,
    AtuadorStatus,
    SensorStatus
} from "../../../types";
import { Loja } from "../../../types";
import { Cvf } from "../../../types";

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            name: string;
            value: number;
        };
    }>;
}

export default function AllChartsDashboard() {
    // State management
    const [cmsData, setCmsData] = useState<Cm[]>([]);
    const [accessControlData, setAccessControlData] = useState<{
        controllers: AccessController[];
        buttons: RequestButton[];
        electromagnets: Electromagnet[];
        sensors: MagneticSensor[];
    }>({
        controllers: [],
        buttons: [],
        electromagnets: [],
        sensors: []
    });
    const [cvfData, setCvfData] = useState<Cvf[]>([]);
    const [lojasData, setLojasData] = useState<Loja[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>("");

    // Fetch data from all APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch CMS data
                const cmsResponse = await fetch('/api/cmsApi/cms');
                if (!cmsResponse.ok) {
                    throw new Error(`HTTP Error fetching CMS data: ${cmsResponse.status}`);
                }
                const cmsResult = await cmsResponse.json();
                const cmsData = cmsResult.success ? cmsResult.data : cmsResult;
                setCmsData(Array.isArray(cmsData) ? cmsData : []);

                // Fetch Access Control data
                const accessControlResponse = await fetch('/api/access-control');
                if (!accessControlResponse.ok) {
                    throw new Error(`HTTP Error fetching Access Control data: ${accessControlResponse.status}`);
                }
                const accessControlResult = await accessControlResponse.json();
                const accessControlData = accessControlResult.success ? accessControlResult.data : accessControlResult;
                setAccessControlData({
                    controllers: accessControlData.controllers || [],
                    buttons: accessControlData.buttons || [],
                    electromagnets: accessControlData.electromagnets || [],
                    sensors: accessControlData.sensors || []
                });

                // Fetch CVF data
                const cvfResponse = await fetch('/api/cvf');
                if (!cvfResponse.ok) {
                    throw new Error(`HTTP Error fetching CVF data: ${cvfResponse.status}`);
                }
                const cvfResult = await cvfResponse.json();
                const cvfData = cvfResult.success ? cvfResult.data : cvfResult;
                setCvfData(Array.isArray(cvfData) ? cvfData : (cvfData.cvfs || []));

                // Fetch Lojas data
                const lojasResponse = await fetch('/api/lojasApi/lojas');
                if (!lojasResponse.ok) {
                    throw new Error(`HTTP Error fetching Lojas data: ${lojasResponse.status}`);
                }
                const lojasResult = await lojasResponse.json();
                const lojasData = lojasResult.success ? lojasResult.data : lojasResult;
                setLojasData(Array.isArray(lojasData) ? lojasData : (lojasData.lojas || []));

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dados";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    // Render label for pie charts
    const renderLabel = (props: { name?: string; value?: number; }) => {
        const { name, value } = props;
        if (value === undefined || name === undefined) return null;
        return `${name}: ${value}`;
    };

    // Generate line chart data that shows the same status distribution as pie charts but over time
    const generateDynamicLineChartData = () => {
        // Define time points for the last 12 months
        const timePoints = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // For CMS - Show actuators and sensors status distribution over time
        const cmsLineData = timePoints.map((month) => {
            // Return the same status distribution as pie charts but with month label
            return {
                name: month,
                ...atuadoresStatusData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>),
                ...sensoresStatusData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>)
            };
        });

        // For Access Control - Show device status distribution over time
        const accessControlLineData = timePoints.map((month) => {
            // Return the same status distribution as pie charts but with month label
            return {
                name: month,
                ...controllerStatusData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>),
                ...buttonStatusData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>),
                ...electromagnetStatusData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>),
                ...sensorStatusData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>)
            };
        });

        // For CVF - Show sensor and actuator status distribution over time
        const cvfLineData = timePoints.map((month) => {
            // Return the same status distribution as pie charts but with month label
            return {
                name: month,
                ...temperatureData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>),
                ...humidityData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>),
                ...actuatorData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>)
            };
        });

        // For Lojas - Show actuators and sensors status distribution over time
        const lojasLineData = timePoints.map((month) => {
            // Return the same status distribution as pie charts but with month label
            return {
                name: month,
                ...lojasAtuadoresStatusData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>),
                ...lojasSensoresStatusData.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, number>)
            };
        });

        return {
            cmsLineData,
            accessControlLineData,
            cvfLineData,
            lojasLineData
        };
    };

    // Calculate CMS chart data
    const cmsChartData = () => {
        // Flatten all actuators and sensors from all CMS
        const allAtuadores: Atuador[] = cmsData.flatMap(cms =>
            (cms.equipamentos || []).flatMap(equipamento =>
                (equipamento.atuadores || [])
            )
        );

        const allSensores: Sensor[] = cmsData.flatMap(cms =>
            (cms.equipamentos || []).flatMap(equipamento =>
                (equipamento.sensores || [])
            )
        );

        // For actuators, categorize by estado
        const atuadoresStatusData = [
            {
                name: "Operacional",
                value: allAtuadores.filter(
                    (a) => a.estado === AtuadorStatus.OPERACIONAL
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: allAtuadores.filter(
                    (a) => a.estado === AtuadorStatus.DEFEITO
                ).length,
                color: "#dc3545",
            },
            {
                name: "Manutenção",
                value: allAtuadores.filter(
                    (a) => a.estado === AtuadorStatus.MANUTENCAO
                ).length,
                color: "#ffc107",
            },
            {
                name: "Desconhecido",
                value: allAtuadores.filter(
                    (a) => a.estado === AtuadorStatus.DESCONHECIDO
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        // For sensors, categorize by estado
        const sensoresStatusData = [
            {
                name: "Operacional",
                value: allSensores.filter(
                    (s) => s.estado === SensorStatus.OPERACIONAL
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: allSensores.filter(
                    (s) => s.estado === SensorStatus.DEFEITO
                ).length,
                color: "#dc3545",
            },
            {
                name: "Manutenção",
                value: allSensores.filter(
                    (s) => s.estado === SensorStatus.MANUTENCAO
                ).length,
                color: "#ffc107",
            },
            {
                name: "Desconhecido",
                value: allSensores.filter(
                    (s) => s.estado === SensorStatus.DESCONHECIDO
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        return { atuadoresStatusData, sensoresStatusData };
    };

    // Calculate Access Control chart data
    const accessControlChartData = () => {
        // For controllers, categorize by status
        const controllerStatusData = [
            {
                name: "Operacional",
                value: accessControlData.controllers.filter(
                    (c) => c.status === "OPERACIONAL"
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: accessControlData.controllers.filter(
                    (c) => c.status === "DEFEITO"
                ).length,
                color: "#dc3545",
            },
            {
                name: "Manutenção",
                value: accessControlData.controllers.filter(
                    (c) => c.status === "MANUTENCAO"
                ).length,
                color: "#ffc107",
            },
            {
                name: "N/A",
                value: accessControlData.controllers.filter(
                    (c) => c.status === "N_A"
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        // For buttons, categorize by status
        const buttonStatusData = [
            {
                name: "Operacional",
                value: accessControlData.buttons.filter(
                    (b) => b.status === "OPERACIONAL"
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: accessControlData.buttons.filter(
                    (b) => b.status === "DEFEITO"
                ).length,
                color: "#dc3545",
            },
            {
                name: "Manutenção",
                value: accessControlData.buttons.filter(
                    (b) => b.status === "MANUTENCAO"
                ).length,
                color: "#ffc107",
            },
            {
                name: "N/A",
                value: accessControlData.buttons.filter(
                    (b) => b.status === "N_A"
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        // For electromagnets, categorize by status
        const electromagnetStatusData = [
            {
                name: "Operacional",
                value: accessControlData.electromagnets.filter(
                    (e) => e.status === "OPERACIONAL"
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: accessControlData.electromagnets.filter(
                    (e) => e.status === "DEFEITO"
                ).length,
                color: "#dc3545",
            },
            {
                name: "Manutenção",
                value: accessControlData.electromagnets.filter(
                    (e) => e.status === "MANUTENCAO"
                ).length,
                color: "#ffc107",
            },
            {
                name: "N/A",
                value: accessControlData.electromagnets.filter(
                    (e) => e.status === "N_A"
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        // For sensors, categorize by status
        const sensorStatusData = [
            {
                name: "Operacional",
                value: accessControlData.sensors.filter(
                    (s) => s.status === "OPERACIONAL"
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: accessControlData.sensors.filter(
                    (s) => s.status === "DEFEITO"
                ).length,
                color: "#dc3545",
            },
            {
                name: "Manutenção",
                value: accessControlData.sensors.filter(
                    (s) => s.status === "MANUTENCAO"
                ).length,
                color: "#ffc107",
            },
            {
                name: "N/A",
                value: accessControlData.sensors.filter(
                    (s) => s.status === "N_A"
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        return {
            controllerStatusData,
            buttonStatusData,
            electromagnetStatusData,
            sensorStatusData
        };
    };

    // Calculate CVF chart data
    const cvfChartData = () => {
        // For temperature sensors, categorize by status
        const temperatureData = [
            {
                name: "Operacional",
                value: cvfData.filter(
                    (c) => c.sensorTemperatura === "OPERACIONAL"
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: cvfData.filter(
                    (c) => c.sensorTemperatura === "DEFEITO"
                ).length,
                color: "#dc3545",
            },
            {
                name: "N/A",
                value: cvfData.filter(
                    (c) => c.sensorTemperatura === "N_A"
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        // For humidity sensors, categorize by status
        const humidityData = [
            {
                name: "Operacional",
                value: cvfData.filter(
                    (c) => c.sensorUmidade === "OPERACIONAL"
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: cvfData.filter(
                    (c) => c.sensorUmidade === "DEFEITO"
                ).length,
                color: "#dc3545",
            },
            {
                name: "N/A",
                value: cvfData.filter(
                    (c) => c.sensorUmidade === "N_A"
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        // For actuators, categorize by status
        const actuatorData = [
            {
                name: "Operacional",
                value: cvfData.filter(
                    (c) => c.atuador === "OPERACIONAL"
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: cvfData.filter(
                    (c) => c.atuador === "DEFEITO"
                ).length,
                color: "#dc3545",
            },
            {
                name: "N/A",
                value: cvfData.filter(
                    (c) => c.atuador === "N_A"
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        return { temperatureData, humidityData, actuatorData };
    };

    // Calculate Lojas chart data
    const lojasChartData = () => {
        // Flatten all actuators and sensors from all lojas
        const allAtuadores = lojasData.flatMap(loja =>
            (loja.atuadores || [])
        );

        const allSensores = lojasData.flatMap(loja =>
            (loja.sensores || [])
        );

        // For actuators, categorize by estado
        const atuadoresStatusData = [
            {
                name: "Operacional",
                value: allAtuadores.filter(
                    (a) => a.estado === AtuadorStatus.OPERACIONAL
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: allAtuadores.filter(
                    (a) => a.estado === AtuadorStatus.DEFEITO
                ).length,
                color: "#dc3545",
            },
            {
                name: "Manutenção",
                value: allAtuadores.filter(
                    (a) => a.estado === AtuadorStatus.MANUTENCAO
                ).length,
                color: "#ffc107",
            },
            {
                name: "Desconhecido",
                value: allAtuadores.filter(
                    (a) => a.estado === AtuadorStatus.DESCONHECIDO
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        // For sensors, categorize by estado
        const sensoresStatusData = [
            {
                name: "Operacional",
                value: allSensores.filter(
                    (s) => s.estado === SensorStatus.OPERACIONAL
                ).length,
                color: "#28a745",
            },
            {
                name: "Defeito",
                value: allSensores.filter(
                    (s) => s.estado === SensorStatus.DEFEITO
                ).length,
                color: "#dc3545",
            },
            {
                name: "Manutenção",
                value: allSensores.filter(
                    (s) => s.estado === SensorStatus.MANUTENCAO
                ).length,
                color: "#ffc107",
            },
            {
                name: "Desconhecido",
                value: allSensores.filter(
                    (s) => s.estado === SensorStatus.DESCONHECIDO
                ).length,
                color: "#6c757d",
            },
        ].filter((d) => d.value > 0);

        return { atuadoresStatusData, sensoresStatusData };
    };

    // Get chart data
    const { atuadoresStatusData, sensoresStatusData } = cmsChartData();
    const {
        controllerStatusData,
        buttonStatusData,
        electromagnetStatusData,
        sensorStatusData
    } = accessControlChartData();
    const { temperatureData, humidityData, actuatorData } = cvfChartData();
    const { atuadoresStatusData: lojasAtuadoresStatusData, sensoresStatusData: lojasSensoresStatusData } = lojasChartData();

    // Generate dynamic line chart data
    const {
        cmsLineData,
        accessControlLineData,
        cvfLineData,
        lojasLineData
    } = generateDynamicLineChartData();

    if (loading) {
        return <CmsTableSkeleton />;
    }

    return (
        <ComponentErrorBoundary componentName="All Charts Dashboard">
            <Container fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3 text-primary">
                        <i className="bi bi-bar-chart me-2"></i>
                        Visão Geral de Todos os Gráficos
                    </h1>
                    <Link href="/dashboard" className="btn btn-outline-primary">
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar ao Dashboard
                    </Link>
                </div>

                {error && (
                    <Alert variant="danger" className="mb-4">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                )}

                {/* Search Filter */}
                <Row className="mb-4">
                    <Col md={6} className="mx-auto">
                        <Form.Group controlId="searchCharts">
                            <Form.Control
                                type="text"
                                placeholder="Filtrar gráficos..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* CMS Charts */}
                <Row className="mb-5">
                    <Col xs={12}>
                        <h3 className="text-secondary mb-4">
                            <i className="bi bi-gear me-2"></i>
                            Casa de Máquinas
                        </h3>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-lightning me-2"></i>
                                    Status dos Atuadores
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {atuadoresStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={atuadoresStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label={renderLabel}
                                                labelLine={false}
                                            >
                                                {atuadoresStatusData.map((entry, index) => (
                                                    <Cell key={`cell-atuador-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderCustomTooltip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum atuador encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-warning text-dark">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-activity me-2"></i>
                                    Status dos Sensores
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {sensoresStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={sensoresStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label={renderLabel}
                                                labelLine={false}
                                            >
                                                {sensoresStatusData.map((entry, index) => (
                                                    <Cell key={`cell-sensor-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderCustomTooltip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum sensor encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* CMS Line Chart */}
                    <Col xs={12} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-secondary text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-graph-up me-2"></i>
                                    Evolução dos Equipamentos da Casa de Máquinas
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={cmsLineData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {atuadoresStatusData.map((item, index) => (
                                            <Line
                                                key={`cms-atuador-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                activeDot={{ r: 8 }}
                                                name={`Atuadores - ${item.name}`}
                                            />
                                        ))}
                                        {sensoresStatusData.map((item, index) => (
                                            <Line
                                                key={`cms-sensor-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                name={`Sensores - ${item.name}`}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Access Control Charts */}
                <Row className="mb-5">
                    <Col xs={12}>
                        <h3 className="text-secondary mb-4">
                            <i className="bi bi-shield-lock me-2"></i>
                            Controle de Acesso
                        </h3>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-controller me-2"></i>
                                    Status dos Controladores
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {controllerStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={controllerStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
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
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum controlador encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-success text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-hand-index me-2"></i>
                                    Status dos Botões
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {buttonStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={buttonStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
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
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum botão encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-warning text-dark">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-magnet me-2"></i>
                                    Status dos Eletroímãs
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {electromagnetStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={electromagnetStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
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
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum eletroímã encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-info text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-activity me-2"></i>
                                    Status dos Sensores Magnéticos
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {sensorStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={sensorStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label={renderLabel}
                                                labelLine={false}
                                            >
                                                {sensorStatusData.map((entry, index) => (
                                                    <Cell key={`cell-magnetic-sensor-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderCustomTooltip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum sensor magnético encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Access Control Line Chart */}
                    <Col xs={12} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-secondary text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-graph-up me-2"></i>
                                    Evolução dos Equipamentos de Controle de Acesso
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={accessControlLineData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {controllerStatusData.map((item, index) => (
                                            <Line
                                                key={`access-control-controller-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                activeDot={{ r: 8 }}
                                                name={`Controladores - ${item.name}`}
                                            />
                                        ))}
                                        {buttonStatusData.map((item, index) => (
                                            <Line
                                                key={`access-control-button-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                name={`Botões - ${item.name}`}
                                            />
                                        ))}
                                        {electromagnetStatusData.map((item, index) => (
                                            <Line
                                                key={`access-control-electromagnet-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                name={`Eletroímãs - ${item.name}`}
                                            />
                                        ))}
                                        {sensorStatusData.map((item, index) => (
                                            <Line
                                                key={`access-control-sensor-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                name={`Sensores - ${item.name}`}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* CVF Charts */}
                <Row className="mb-5">
                    <Col xs={12}>
                        <h3 className="text-secondary mb-4">
                            <i className="bi bi-building me-2"></i>
                            Sistema CVF
                        </h3>
                    </Col>

                    <Col md={4} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-thermometer-half me-2"></i>
                                    Status dos Sensores de Temperatura
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {temperatureData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={temperatureData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label={renderLabel}
                                                labelLine={false}
                                            >
                                                {temperatureData.map((entry, index) => (
                                                    <Cell key={`cell-temperature-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderCustomTooltip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum sensor de temperatura encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-success text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-moisture me-2"></i>
                                    Status dos Sensores de Umidade
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {humidityData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={humidityData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label={renderLabel}
                                                labelLine={false}
                                            >
                                                {humidityData.map((entry, index) => (
                                                    <Cell key={`cell-humidity-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderCustomTooltip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum sensor de umidade encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-warning text-dark">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-lightning me-2"></i>
                                    Status dos Atuadores
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {actuatorData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={actuatorData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label={renderLabel}
                                                labelLine={false}
                                            >
                                                {actuatorData.map((entry, index) => (
                                                    <Cell key={`cell-cvf-actuator-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderCustomTooltip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum atuador encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* CVF Line Chart */}
                    <Col xs={12} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-secondary text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-graph-up me-2"></i>
                                    Evolução dos Equipamentos do Sistema CVF
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={cvfLineData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {temperatureData.map((item, index) => (
                                            <Line
                                                key={`cvf-temperature-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                activeDot={{ r: 8 }}
                                                name={`Temperatura - ${item.name}`}
                                            />
                                        ))}
                                        {humidityData.map((item, index) => (
                                            <Line
                                                key={`cvf-humidity-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                name={`Umidade - ${item.name}`}
                                            />
                                        ))}
                                        {actuatorData.map((item, index) => (
                                            <Line
                                                key={`cvf-actuator-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                name={`Atuadores - ${item.name}`}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Lojas Charts */}
                <Row className="mb-5">
                    <Col xs={12}>
                        <h3 className="text-secondary mb-4">
                            <i className="bi bi-shop me-2"></i>
                            Monitoramento de Lojas
                        </h3>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-lightning me-2"></i>
                                    Status dos Atuadores
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {lojasAtuadoresStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={lojasAtuadoresStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label={renderLabel}
                                                labelLine={false}
                                            >
                                                {lojasAtuadoresStatusData.map((entry, index) => (
                                                    <Cell key={`cell-loja-atuador-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderCustomTooltip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum atuador encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-warning text-dark">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-activity me-2"></i>
                                    Status dos Sensores
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {lojasSensoresStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={lojasSensoresStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                label={renderLabel}
                                                labelLine={false}
                                            >
                                                {lojasSensoresStatusData.map((entry, index) => (
                                                    <Cell key={`cell-loja-sensor-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderCustomTooltip} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <i className="bi bi-info-circle" style={{ fontSize: "3rem" }}></i>
                                        <h5 className="mt-3 mb-0">Nenhum sensor encontrado.</h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Lojas Line Chart */}
                    <Col xs={12} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Header className="bg-secondary text-white">
                                <h5 className="mb-0 text-center">
                                    <i className="bi bi-graph-up me-2"></i>
                                    Evolução dos Equipamentos do Monitoramento de Lojas
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={lojasLineData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {lojasAtuadoresStatusData.map((item, index) => (
                                            <Line
                                                key={`loja-atuador-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                activeDot={{ r: 8 }}
                                                name={`Atuadores - ${item.name}`}
                                            />
                                        ))}
                                        {lojasSensoresStatusData.map((item, index) => (
                                            <Line
                                                key={`loja-sensor-${index}`}
                                                type="monotone"
                                                dataKey={item.name}
                                                stroke={item.color}
                                                name={`Sensores - ${item.name}`}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </ComponentErrorBoundary>
    );
}