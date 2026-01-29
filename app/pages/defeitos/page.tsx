"use client";

import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Form, Alert, Button, Badge, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";

// Components
import { CmsTableSkeleton } from "../../components/Loading";
import PdfDefeitosButton from "../../components/PDFs/PdfDefeitosButton";

// Types
import {
    AccessController,
    RequestButton,
    Electromagnet,
    MagneticSensor
} from "../../../types/accessControl";
import {
    Cvf,
    AtuadorLoja,
    SensorLoja,
    Atuador,
    Sensor,
    AtuadorStatus,
    SensorStatus,
    Cm,
    Loja,
    Equipamento
} from "../../../types";

interface DefectiveDevice {
    id: string;
    name: string;
    type: string;
    location?: string;
    lastUpdated?: string;
    dashboard: string;
    additionalInfo?: Record<string, unknown>;
}

type CmsApiResponse = Cm[] | { success: boolean; data: Cm[] };
type LojasApiResponse = Loja[] | { success: boolean; data: Loja[]; total: number } | { lojas: Loja[]; total_items: number; page: number; limit: number };

export default function DefeitosPage() {
    const [defectiveDevices, setDefectiveDevices] = useState<DefectiveDevice[]>([]);
    const [filteredDevices, setFilteredDevices] = useState<DefectiveDevice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedDashboard, setSelectedDashboard] = useState<string>("all");
    const router = useRouter();

    // Helper function to display dashboard name in a readable format
    const formatDashboardName = (dashboard: string) => {
        switch (dashboard) {
            case "access-control":
                return "Controle de Acesso";
            case "cvf":
                return "Sistema CVF";
            case "lojas":
                return "Monitoramento de Lojas";
            case "cms":
                return "Casa de Máquinas";
            case "sdai":
                return "Sistema SDAI";
            default:
                return dashboard;
        }
    };

    // Helper function to display device type in a readable format
    const formatDeviceType = (type: string) => {
        switch (type) {
            case "controller":
                return "Controlador";
            case "button":
                return "Botão de Solicitação";
            case "electromagnet":
                return "Eletroímã";
            case "sensor":
                return "Sensor Magnético";
            case "cvf":
                return "Unidade CVF";
            case "atuador-loja":
                return "Atuador de Loja";
            case "sensor-loja":
                return "Sensor de Loja";
            case "fire-detection-equipment":
                return "Equipamento de Detecção de Incêndio";
            case "atuador-cms":
                return "Atuador de CM";
            case "sensor-cms":
                return "Sensor de CM";
            default:
                return type;
        }
    };

    // Fetch all defective devices from all dashboards
    const fetchAllDefectiveDevices = async () => {
        try {
            setLoading(true);
            setError(null);
            const defectiveDevices: DefectiveDevice[] = [];

            // Fetch Access Control Defective Data
            try {
                const accessControlResponse = await fetch('/api/access-control');
                if (accessControlResponse.ok) {
                    const accessControlData: { success: boolean; data: unknown } = await accessControlResponse.json();
                    const data = accessControlData.success ? accessControlData.data : accessControlData;

                    // Controllers with defects
                    const defectiveControllers = ((data as { controllers?: AccessController[] }).controllers || []).filter(
                        (controller: AccessController) => controller.status === "DEFEITO"
                    );

                    defectiveControllers.forEach((controller: AccessController) => {
                        defectiveDevices.push({
                            id: controller.id,
                            name: controller.name,
                            type: "controller",
                            location: controller.location,
                            lastUpdated: controller.lastUpdated,
                            dashboard: "access-control",
                            additionalInfo: {
                                ipAddress: controller.ipAddress,
                                description: controller.description
                            }
                        });
                    });

                    // Buttons with defects
                    const defectiveButtons = ((data as { buttons?: RequestButton[] }).buttons || []).filter(
                        (button: RequestButton) => button.status === "DEFEITO"
                    );

                    defectiveButtons.forEach((button: RequestButton) => {
                        defectiveDevices.push({
                            id: button.id,
                            name: button.name,
                            type: "button",
                            location: button.location,
                            lastUpdated: button.lastUpdated,
                            dashboard: "access-control",
                            additionalInfo: {
                                buttonType: button.buttonType,
                                isPressed: button.isPressed,
                                lastPressed: button.lastPressed,
                                description: button.description
                            }
                        });
                    });

                    // Electromagnets with defects
                    const defectiveElectromagnets = ((data as { electromagnets?: Electromagnet[] }).electromagnets || []).filter(
                        (electromagnet: Electromagnet) => electromagnet.status === "DEFEITO"
                    );

                    defectiveElectromagnets.forEach((electromagnet: Electromagnet) => {
                        defectiveDevices.push({
                            id: electromagnet.id,
                            name: electromagnet.name,
                            type: "electromagnet",
                            location: electromagnet.location,
                            lastUpdated: electromagnet.lastUpdated,
                            dashboard: "access-control",
                            additionalInfo: {
                                isLocked: electromagnet.isLocked,
                                lockStatus: electromagnet.lockStatus,
                                powerConsumption: electromagnet.powerConsumption,
                                description: electromagnet.description
                            }
                        });
                    });

                    // Sensors with defects
                    const defectiveSensors = ((data as { sensors?: MagneticSensor[] }).sensors || []).filter(
                        (sensor: MagneticSensor) => sensor.status === "DEFEITO"
                    );

                    defectiveSensors.forEach((sensor: MagneticSensor) => {
                        defectiveDevices.push({
                            id: sensor.id,
                            name: sensor.name,
                            type: "sensor",
                            location: sensor.location,
                            lastUpdated: sensor.lastUpdated,
                            dashboard: "access-control",
                            additionalInfo: {
                                sensorType: sensor.sensorType,
                                isClosed: sensor.isClosed,
                                lastTriggered: sensor.lastTriggered,
                                description: sensor.description
                            }
                        });
                    });
                }
            } catch (error) {
                console.error("Error fetching access control data:", error);
            }

            // Fetch CVF Defective Data
            try {
                const cvfResponse = await fetch('/api/cvf');
                if (cvfResponse.ok) {
                    const cvfData: Cvf[] | { cvfs: Cvf[] } = await cvfResponse.json();
                    const cvfs = Array.isArray(cvfData) ? cvfData : (cvfData.cvfs || []);

                    const defectiveCvfs = cvfs.filter(
                        (cvf: Cvf) =>
                            cvf.sensorTemperatura === "DEFEITO" ||
                            cvf.sensorUmidade === "DEFEITO" ||
                            cvf.atuador === "DEFEITO"
                    );

                    defectiveCvfs.forEach((cvf: Cvf) => {
                        defectiveDevices.push({
                            id: cvf.id,
                            name: `${cvf.vigaFria || 'N/A'} - ${cvf.piso || 'N/A'}`,
                            type: "cvf",
                            location: `${cvf.localizacaoQuadro || 'N/A'} / ${cvf.localizacaoValvula || 'N/A'}`,
                            lastUpdated: new Date().toISOString(), // CVF doesn't seem to have lastUpdated field
                            dashboard: "cvf",
                            additionalInfo: {
                                vigaFria: cvf.vigaFria,
                                piso: cvf.piso,
                                sensorTemperatura: cvf.sensorTemperatura,
                                sensorUmidade: cvf.sensorUmidade,
                                atuador: cvf.atuador,
                                localizacaoQuadro: cvf.localizacaoQuadro,
                                localizacaoValvula: cvf.localizacaoValvula,
                                observacoes: cvf.observacoes
                            }
                        });
                    });
                }
            } catch (error) {
                console.error("Error fetching CVF data:", error);
            }

            // Fetch CMS Defective Data
            try {
                const cmsResponse = await fetch('/api/cmsApi/cms');
                if (cmsResponse.ok) {
                    const cmsData: CmsApiResponse = await cmsResponse.json();
                    const cmsList = Array.isArray(cmsData) ? cmsData : (cmsData.data || []);

                    if (Array.isArray(cmsList)) {
                        cmsList.forEach((cms: Cm) => {
                            // Check equipment in CMS
                            const equipamentos = (cms as { equipamentos?: Equipamento[] }).equipamentos;
                            if (equipamentos && Array.isArray(equipamentos)) {
                                equipamentos.forEach((equipamento: Equipamento) => {
                                    // Check actuators in equipment
                                    const atuadores = (equipamento as { atuadores?: Atuador[] }).atuadores;
                                    if (atuadores && Array.isArray(atuadores)) {
                                        const defectiveAtuadores = atuadores.filter(
                                            (atuador: Atuador) => {
                                                // Check multiple conditions for defective actuators
                                                const temEstadoDefeito =
                                                    atuador.estado === AtuadorStatus.DEFEITO;

                                                return temEstadoDefeito;
                                            }
                                        );

                                        defectiveAtuadores.forEach((atuador: Atuador) => {
                                            defectiveDevices.push({
                                                id: atuador.id,
                                                name: atuador.nome,
                                                type: "atuador-cms",
                                                location: `${cms.nome} - ${equipamento.nome}`,
                                                lastUpdated: new Date().toISOString(), // CMS actuators don't have lastUpdated field
                                                dashboard: "cms",
                                                additionalInfo: {
                                                    tipo: atuador.tipo,
                                                    descricao: atuador.descricaoDefeito,
                                                    status: atuador.estado
                                                }
                                            });
                                        });
                                    }

                                    // Check sensors in equipment
                                    const sensores = (equipamento as { sensores?: Sensor[] }).sensores;
                                    if (sensores && Array.isArray(sensores)) {
                                        const defectiveSensores = sensores.filter(
                                            (sensor: Sensor) => {
                                                // Check multiple conditions for defective sensors
                                                const temEstadoDefeito =
                                                    sensor.estado === SensorStatus.DEFEITO;

                                                return temEstadoDefeito;
                                            }
                                        );

                                        defectiveSensores.forEach((sensor: Sensor) => {
                                            defectiveDevices.push({
                                                id: sensor.id,
                                                name: sensor.nome,
                                                type: "sensor-cms",
                                                location: `${cms.nome} - ${equipamento.nome}`,
                                                lastUpdated: new Date().toISOString(), // CMS sensors don't have lastUpdated field
                                                dashboard: "cms",
                                                additionalInfo: {
                                                    tipo: sensor.tipo,
                                                    descricao: sensor.descricaoDefeito,
                                                    status: sensor.estado
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching CMS data:", error);
            }

            // Fetch Lojas Defective Data
            try {
                const lojasResponse = await fetch('/api/lojasApi/lojas');
                if (lojasResponse.ok) {
                    const lojasResponseData: LojasApiResponse = await lojasResponse.json();
                    // The Lojas API returns data in a different structure with pagination
                    // Check if it's the paginated format with lojas property
                    const lojas = Array.isArray(lojasResponseData)
                        ? lojasResponseData
                        : ('lojas' in lojasResponseData
                            ? lojasResponseData.lojas
                            : ('data' in lojasResponseData ? lojasResponseData.data : []));

                    // Ensure lojas is actually an array before calling forEach
                    if (Array.isArray(lojas)) {
                        lojas.forEach((loja: { atuadores?: AtuadorLoja[]; sensores?: SensorLoja[]; equipamentosLoja?: { atuadoresLoja?: AtuadorLoja[]; sensoresLoja?: SensorLoja[]; nome?: string }[]; nome?: string; fireDetectionEquipment?: { existe?: boolean; stAlarme?: boolean; stFalha?: boolean; cmdAlarme?: boolean }[] }) => {
                            // Check direct actuators
                            if (loja.atuadores && Array.isArray(loja.atuadores)) {
                                const defectiveAtuadores = loja.atuadores.filter(
                                    (atuador: AtuadorLoja) => {
                                        // Check multiple conditions for defective actuators
                                        const temEstadoDefeito =
                                            atuador.estado === "DEFEITO";

                                        const temDescricaoDefeito =
                                            atuador.descricaoDefeito &&
                                            atuador.descricaoDefeito.trim() !== "";

                                        const naoExiste = atuador.existe === false;

                                        return temEstadoDefeito || temDescricaoDefeito || naoExiste;
                                    }
                                );

                                defectiveAtuadores.forEach((atuador: AtuadorLoja) => {
                                    defectiveDevices.push({
                                        id: atuador.id,
                                        name: atuador.nome,
                                        type: "atuador-loja",
                                        location: loja.nome,
                                        lastUpdated: new Date().toISOString(), // Loja actuators don't have lastUpdated field
                                        dashboard: "lojas",
                                        additionalInfo: {
                                            tipo: atuador.tipo,
                                            valorAtual: atuador.valorAtual,
                                            descricaoDefeito: atuador.descricaoDefeito,
                                            estado: atuador.estado,
                                            existe: atuador.existe
                                        }
                                    });
                                });
                            }

                            // Check direct sensors
                            if (loja.sensores && Array.isArray(loja.sensores)) {
                                const defectiveSensores = loja.sensores.filter(
                                    (sensor: SensorLoja) => {
                                        // Check multiple conditions for defective sensors
                                        const temEstadoDefeito =
                                            sensor.estado === "DEFEITO";

                                        const temDescricaoDefeito =
                                            sensor.descricaoDefeito &&
                                            sensor.descricaoDefeito.trim() !== "";

                                        const naoExiste = sensor.existe === false;

                                        return temEstadoDefeito || temDescricaoDefeito || naoExiste;
                                    }
                                );

                                defectiveSensores.forEach((sensor: SensorLoja) => {
                                    defectiveDevices.push({
                                        id: sensor.id,
                                        name: sensor.nome,
                                        type: "sensor-loja",
                                        location: loja.nome,
                                        lastUpdated: sensor.ultimaAtivacao,
                                        dashboard: "lojas",
                                        additionalInfo: {
                                            tipo: sensor.tipo,
                                            estado: sensor.estado,
                                            ultimaAtivacao: sensor.ultimaAtivacao,
                                            descricaoDefeito: sensor.descricaoDefeito,
                                            existe: sensor.existe
                                        }
                                    });
                                });
                            }

                            // Check equipment actuators and sensors
                            if (loja.equipamentosLoja && Array.isArray(loja.equipamentosLoja)) {
                                loja.equipamentosLoja.forEach((equipamento: { atuadoresLoja?: AtuadorLoja[]; sensoresLoja?: SensorLoja[]; nome?: string }) => {
                                    // Check equipment actuators
                                    if (equipamento.atuadoresLoja && Array.isArray(equipamento.atuadoresLoja)) {
                                        const defectiveAtuadores = equipamento.atuadoresLoja.filter(
                                            (atuador: AtuadorLoja) => {
                                                // Check multiple conditions for defective actuators
                                                const temEstadoDefeito =
                                                    atuador.estado === "DEFEITO";

                                                const temDescricaoDefeito =
                                                    atuador.descricaoDefeito &&
                                                    atuador.descricaoDefeito.trim() !== "";

                                                const naoExiste = atuador.existe === false;

                                                return temEstadoDefeito || temDescricaoDefeito || naoExiste;
                                            }
                                        );

                                        defectiveAtuadores.forEach((atuador: AtuadorLoja) => {
                                            defectiveDevices.push({
                                                id: atuador.id,
                                                name: atuador.nome,
                                                type: "atuador-loja",
                                                location: `${loja.nome} - ${equipamento.nome}`,
                                                lastUpdated: new Date().toISOString(), // Loja actuators don't have lastUpdated field
                                                dashboard: "lojas",
                                                additionalInfo: {
                                                    tipo: atuador.tipo,
                                                    valorAtual: atuador.valorAtual,
                                                    descricaoDefeito: atuador.descricaoDefeito,
                                                    estado: atuador.estado,
                                                    existe: atuador.existe
                                                }
                                            });
                                        });
                                    }

                                    // Check equipment sensors
                                    if (equipamento.sensoresLoja && Array.isArray(equipamento.sensoresLoja)) {
                                        const defectiveSensores = equipamento.sensoresLoja.filter(
                                            (sensor: SensorLoja) => {
                                                // Check multiple conditions for defective sensors
                                                const temEstadoDefeito =
                                                    sensor.estado === "DEFEITO";

                                                const temDescricaoDefeito =
                                                    sensor.descricaoDefeito &&
                                                    sensor.descricaoDefeito.trim() !== "";

                                                const naoExiste = sensor.existe === false;

                                                return temEstadoDefeito || temDescricaoDefeito || naoExiste;
                                            }
                                        );

                                        defectiveSensores.forEach((sensor: SensorLoja) => {
                                            defectiveDevices.push({
                                                id: sensor.id,
                                                name: sensor.nome,
                                                type: "sensor-loja",
                                                location: `${loja.nome} - ${equipamento.nome}`,
                                                lastUpdated: sensor.ultimaAtivacao,
                                                dashboard: "lojas",
                                                additionalInfo: {
                                                    tipo: sensor.tipo,
                                                    estado: sensor.estado,
                                                    ultimaAtivacao: sensor.ultimaAtivacao,
                                                    descricaoDefeito: sensor.descricaoDefeito,
                                                    existe: sensor.existe
                                                }
                                            });
                                        });
                                    }
                                });
                            }

                            // Check fire detection equipment
                            if (loja.fireDetectionEquipment && Array.isArray(loja.fireDetectionEquipment)) {
                                const defectiveFireEquipment = loja.fireDetectionEquipment.filter(
                                    (equipment: { existe?: boolean; stAlarme?: boolean; stFalha?: boolean; cmdAlarme?: boolean }) => {
                                        // Check if equipment doesn't exist or has alarm/failure states
                                        const naoExiste = equipment.existe === false;
                                        const alarmeAtivo = equipment.stAlarme === true;
                                        const falhaAtiva = equipment.stFalha === true;
                                        const comandoAlarmeFalha = equipment.cmdAlarme === false;

                                        return naoExiste || alarmeAtivo || falhaAtiva || comandoAlarmeFalha;
                                    }
                                );

                                defectiveFireEquipment.forEach((equipment) => {
                                    // Define inline type for fire detection equipment
                                    type FireEquipment = {
                                        id: string;
                                        nome: string;
                                        tipo: string;
                                        existe?: boolean;
                                        stAlarme?: boolean;
                                        stFalha?: boolean;
                                        cmdAlarme?: boolean;
                                        loja?: { nome: string }
                                    };

                                    defectiveDevices.push({
                                        id: (equipment as FireEquipment).id,
                                        name: (equipment as FireEquipment).nome,
                                        type: "fire-detection-equipment",
                                        location: (equipment as FireEquipment).loja?.nome || "N/A",
                                        lastUpdated: new Date().toISOString(),
                                        dashboard: "lojas",
                                        additionalInfo: {
                                            tipo: (equipment as FireEquipment).tipo,
                                            existe: equipment.existe,
                                            stAlarme: equipment.stAlarme,
                                            stFalha: equipment.stFalha,
                                            cmdAlarme: equipment.cmdAlarme
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching Lojas data:", error);
            }

            setDefectiveDevices(defectiveDevices);
            setFilteredDevices(defectiveDevices);
        } catch (error) {
            console.error("Error fetching defective devices:", error);
            setError("Erro ao carregar os dispositivos com defeito. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // Filter devices based on search term and selected dashboard
    useEffect(() => {
        let result = defectiveDevices;

        // Filter by dashboard
        if (selectedDashboard !== "all") {
            result = result.filter(device => device.dashboard === selectedDashboard);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(device =>
                device.name.toLowerCase().includes(term) ||
                device.type.toLowerCase().includes(term) ||
                (device.location && device.location.toLowerCase().includes(term)) ||
                (device.additionalInfo && JSON.stringify(device.additionalInfo).toLowerCase().includes(term))
            );
        }

        setFilteredDevices(result);
    }, [searchTerm, selectedDashboard, defectiveDevices]);

    // Fetch data on component mount
    useEffect(() => {
        fetchAllDefectiveDevices();
    }, []);

    // Group devices by dashboard
    const groupedDevices = filteredDevices.reduce((acc: Record<string, DefectiveDevice[]>, device) => {
        if (!acc[device.dashboard]) {
            acc[device.dashboard] = [];
        }
        acc[device.dashboard].push(device);
        return acc;
    }, {});

    // Calculate totals
    const totalDefectiveDevices = defectiveDevices.length;
    const filteredDeviceCount = filteredDevices.length;

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-primary">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Dispositivos com Defeito
                    </h1>
                    <p className="text-muted">
                        Visualização detalhada de todos os dispositivos com status DEFEITO em todos os sistemas
                    </p>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Pesquisar dispositivos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col md={4}>
                    <Form.Select
                        value={selectedDashboard}
                        onChange={(e) => setSelectedDashboard(e.target.value)}
                    >
                        <option value="all">Todos os Dashboards</option>
                        <option value="access-control">Controle de Acesso</option>
                        <option value="cvf">Sistema CVF</option>
                        <option value="lojas">Monitoramento de Lojas</option>
                        <option value="cms">Casa de Máquinas</option>
                        <option value="sdai">Sistema SDAI</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <PdfDefeitosButton defectiveDevices={filteredDevices} />
                </Col>
            </Row>

            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {loading ? (
                <Row>
                    <Col>
                        <CmsTableSkeleton />
                    </Col>
                </Row>
            ) : (
                <>
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-0">Resumo Estatístico</h5>
                                            <p className="text-muted mb-0">
                                                Total de dispositivos com defeito: {totalDefectiveDevices}
                                                {searchTerm || selectedDashboard !== "all" ? ` (Filtrados: ${filteredDeviceCount})` : ""}
                                            </p>
                                        </div>
                                        <Button variant="outline-primary" onClick={fetchAllDefectiveDevices}>
                                            <i className="bi bi-arrow-clockwise me-1"></i> Atualizar
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {Object.keys(groupedDevices).length === 0 ? (
                        <Row>
                            <Col>
                                <Card className="shadow-sm">
                                    <Card.Body className="text-center py-5">
                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
                                        <h3 className="mt-3">Nenhum dispositivo com defeito encontrado</h3>
                                        <p className="text-muted">
                                            {searchTerm || selectedDashboard !== "all"
                                                ? "Nenhum dispositivo corresponde aos critérios de filtragem."
                                                : "Todos os dispositivos estão operacionais."}
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        Object.entries(groupedDevices).map(([dashboard, devices]) => (
                            <Row key={dashboard} className="mb-4">
                                <Col md={12}>
                                    <Card className="shadow-sm">
                                        <Card.Header className="bg-light">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">
                                                    <Badge bg="danger" className="me-2">DEFEITO</Badge>
                                                    {formatDashboardName(dashboard)}
                                                    <Badge bg="secondary" className="ms-2">{devices.length}</Badge>
                                                </h5>
                                            </div>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="table-responsive">
                                                <Table hover className="mb-0">
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
                                                        {devices.map((device) => (
                                                            <tr key={device.id}>
                                                                <td>
                                                                    <div className="fw-bold text-danger">{device.name || "Dispositivo sem nome"}</div>
                                                                </td>
                                                                <td>{formatDeviceType(device.type)}</td>
                                                                <td>{device.location || "N/A"}</td>
                                                                <td>
                                                                    {device.lastUpdated
                                                                        ? new Date(device.lastUpdated).toLocaleString("pt-BR")
                                                                        : "N/A"}
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            // Navigate to the specific device detail page based on device type and dashboard
                                                                            if (dashboard === "access-control") {
                                                                                // For access control devices, we need to pass both id and type
                                                                                const deviceType = device.type;
                                                                                router.push(`/pages/access-control/detalhes?id=${device.id}&type=${deviceType}`);
                                                                            } else if (dashboard === "cvf") {
                                                                                // For CVF devices, navigate to the CVF detail page
                                                                                router.push(`/pages/cvf/${device.id}`);
                                                                            } else if (dashboard === "lojas") {
                                                                                // For lojas devices, navigate to lojas detail page
                                                                                router.push(`/pages/lojas/detalhes?id=${device.id}`);
                                                                            } else if (dashboard === "cms") {
                                                                                // For CMS devices, navigate to CMS detail page
                                                                                router.push(`/pages/cms/detalhes?id=${device.id}`);
                                                                            } else if (dashboard === "sdai") {
                                                                                // For SDAI devices, navigate to SDAI page
                                                                                router.push("/pages/sdai");
                                                                            } else {
                                                                                // Fallback to general dashboard page
                                                                                if (dashboard === "access-control") {
                                                                                    router.push("/pages/access-control");
                                                                                } else if (dashboard === "cvf") {
                                                                                    router.push("/pages/cvf");
                                                                                } else if (dashboard === "lojas") {
                                                                                    router.push("/pages/lojas");
                                                                                } else if (dashboard === "cms") {
                                                                                    router.push("/pages/cms");
                                                                                } else if (dashboard === "sdai") {
                                                                                    router.push("/pages/sdai");
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-eye me-1"></i> Ver Detalhes
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        ))
                    )}
                </>
            )}
        </Container>
    );
}