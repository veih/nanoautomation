/* eslint-disable */
"use client";

import { ReactNode, useState } from "react";
import { Modal, Button, Spinner, Table, Badge, Card, Tabs, Tab } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../../../app/components/ErrorBoundary";
import { EquipamentoLoja, AtuadorLoja, SensorLoja } from "../../../../../types";

interface RelatedEntitiesModalProps {
    show: boolean;
    onHide: () => void;
    lojaNome: string;
    equipamentos: EquipamentoLoja[];
    atuadores: AtuadorLoja[];
    sensores: SensorLoja[];
    loading: boolean;
    onAddEquipamento: () => void;
    onEditEquipamento: (equipamento: EquipamentoLoja) => void;
    onDeleteEquipamento: (equipamento: EquipamentoLoja) => void;
    onAddAtuador: () => void;
    onEditAtuador: (atuador: AtuadorLoja) => void;
    onDeleteAtuador: (atuador: AtuadorLoja) => void;
    onAddSensor: () => void;
    onEditSensor: (sensor: SensorLoja) => void;
    onDeleteSensor: (sensor: SensorLoja) => void;
}

export function RelatedEntitiesModal({
    show,
    onHide,
    lojaNome,
    equipamentos,
    atuadores,
    sensores,
    loading,
    onAddEquipamento,
    onEditEquipamento,
    onDeleteEquipamento,
    onAddAtuador,
    onEditAtuador,
    onDeleteAtuador,
    onAddSensor,
    onEditSensor,
    onDeleteSensor,
}: RelatedEntitiesModalProps) {
    // Add confirmation handlers for delete operations
    const handleDeleteEquipamento = (equipamento: EquipamentoLoja) => {
        if (window.confirm(`Tem certeza que deseja excluir o equipamento "${equipamento.nome}"?`)) {
            onDeleteEquipamento(equipamento);
        }
    };

    const handleDeleteAtuador = (atuador: AtuadorLoja) => {
        if (window.confirm(`Tem certeza que deseja excluir o atuador "${atuador.nome}"?`)) {
            onDeleteAtuador(atuador);
        }
    };

    const handleDeleteSensor = (sensor: SensorLoja) => {
        if (window.confirm(`Tem certeza que deseja excluir o sensor "${sensor.nome}"?`)) {
            onDeleteSensor(sensor);
        }
    };

    return (
        <ComponentErrorBoundary componentName="RelatedEntitiesModal">
            <Modal show={show} onHide={onHide} centered size="xl">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        <i className="bi bi-shop me-2"></i>
                        Equipamentos, Atuadores e Sensores da Loja: {lojaNome}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Carregando equipamentos, atuadores e sensores...</p>
                        </div>
                    ) : (
                        <Tabs
                            defaultActiveKey="equipamentos"
                            id="related-entities-tabs"
                            className="mb-4"
                        >
                            {/* Equipamentos Tab */}
                            <Tab eventKey="equipamentos" title={`Equipamentos (${equipamentos.length})`}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0 text-primary">
                                                <i className="bi bi-box-seam me-2"></i>
                                                Equipamentos
                                            </h5>
                                            <Button variant="primary" size="sm" onClick={onAddEquipamento}>
                                                <i className="bi bi-plus-circle me-1"></i>
                                                Adicionar Equipamento
                                            </Button>
                                        </div>
                                        {equipamentos.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table striped bordered hover className="align-middle">
                                                    <thead className="bg-light">
                                                        <tr>
                                                            <th>Nome</th>
                                                            <th>Descrição</th>
                                                            <th>Status</th>
                                                            <th className="text-center" style={{ width: '120px' }}>Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {equipamentos.map((equipamento) => (
                                                            <tr key={equipamento.id}>
                                                                <td className="fw-medium">{equipamento.nome}</td>
                                                                <td>{equipamento.descricao || "N/A"}</td>
                                                                <td>
                                                                    <Badge
                                                                        bg={
                                                                            equipamento.status === "OPERACIONAL" ? "success" :
                                                                                equipamento.status === "MANUTENCAO" ? "warning" :
                                                                                    equipamento.status === "DESATIVADO" ? "secondary" :
                                                                                        equipamento.status === "DEFEITO" ? "danger" : "info"
                                                                        }
                                                                    >
                                                                        {equipamento.status || "DESCONHECIDO"}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-center">
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="me-1"
                                                                        onClick={() => onEditEquipamento(equipamento)}
                                                                        title="Editar"
                                                                    >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteEquipamento(equipamento)}
                                                                        title="Excluir"
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-light rounded">
                                                <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>
                                                <h6 className="text-muted">Nenhum equipamento cadastrado</h6>
                                                <p className="text-muted mb-0">Adicione um equipamento para começar</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>

                            {/* Atuadores Tab */}
                            <Tab eventKey="atuadores" title={`Atuadores (${atuadores.length})`}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0 text-success">
                                                <i className="bi bi-gear me-2"></i>
                                                Atuadores
                                            </h5>
                                            <Button variant="success" size="sm" onClick={onAddAtuador}>
                                                <i className="bi bi-plus-circle me-1"></i>
                                                Adicionar Atuador
                                            </Button>
                                        </div>
                                        {atuadores.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table striped bordered hover className="align-middle">
                                                    <thead className="bg-light">
                                                        <tr>
                                                            <th>Nome</th>
                                                            <th>Tipo</th>
                                                            <th>Status</th>
                                                            <th>Existe</th>
                                                            <th className="text-center" style={{ width: '120px' }}>Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {atuadores.map((atuador) => (
                                                            <tr key={atuador.id}>
                                                                <td className="fw-medium">{atuador.nome}</td>
                                                                <td>{atuador.tipo}</td>
                                                                <td>
                                                                    <Badge
                                                                        bg={
                                                                            atuador.estado === "OPERACIONAL" ? "success" :
                                                                                atuador.estado === "DEFEITO" ? "danger" :
                                                                                    atuador.estado === "MANUTENCAO" ? "warning" : "secondary"
                                                                        }
                                                                    >
                                                                        {atuador.estado || "DESCONHECIDO"}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Badge bg={atuador.existe ? "success" : "danger"}>
                                                                        {atuador.existe ? "Sim" : "Não"}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-center">
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="me-1"
                                                                        onClick={() => onEditAtuador(atuador)}
                                                                        title="Editar"
                                                                    >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteAtuador(atuador)}
                                                                        title="Excluir"
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-light rounded">
                                                <i className="bi bi-gear fs-1 text-muted mb-3"></i>
                                                <h6 className="text-muted">Nenhum atuador cadastrado</h6>
                                                <p className="text-muted mb-0">Adicione um atuador para começar</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>

                            {/* Sensores Tab */}
                            <Tab eventKey="sensores" title={`Sensores (${sensores.length})`}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0 text-info">
                                                <i className="bi bi-thermometer me-2"></i>
                                                Sensores
                                            </h5>
                                            <Button variant="info" size="sm" onClick={onAddSensor}>
                                                <i className="bi bi-plus-circle me-1"></i>
                                                Adicionar Sensor
                                            </Button>
                                        </div>
                                        {sensores.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table striped bordered hover className="align-middle">
                                                    <thead className="bg-light">
                                                        <tr>
                                                            <th>Nome</th>
                                                            <th>Tipo</th>
                                                            <th>Status</th>
                                                            <th>Última Ativação</th>
                                                            <th>Existe</th>
                                                            <th className="text-center" style={{ width: '120px' }}>Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sensores.map((sensor) => (
                                                            <tr key={sensor.id}>
                                                                <td className="fw-medium">{sensor.nome}</td>
                                                                <td>{sensor.tipo}</td>
                                                                <td>
                                                                    <Badge
                                                                        bg={
                                                                            sensor.estado === "OPERACIONAL" ? "success" :
                                                                                sensor.estado === "DEFEITO" ? "danger" :
                                                                                    sensor.estado === "MANUTENCAO" ? "warning" : "secondary"
                                                                        }
                                                                    >
                                                                        {sensor.estado || "DESCONHECIDO"}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    {sensor.ultimaAtivacao
                                                                        ? new Date(sensor.ultimaAtivacao).toLocaleDateString()
                                                                        : "N/A"}
                                                                </td>
                                                                <td>
                                                                    <Badge bg={sensor.existe ? "success" : "danger"}>
                                                                        {sensor.existe ? "Sim" : "Não"}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-center">
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="me-1"
                                                                        onClick={() => onEditSensor(sensor)}
                                                                        title="Editar"
                                                                    >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteSensor(sensor)}
                                                                        title="Excluir"
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-light rounded">
                                                <i className="bi bi-thermometer fs-1 text-muted mb-3"></i>
                                                <h6 className="text-muted">Nenhum sensor cadastrado</h6>
                                                <p className="text-muted mb-0">Adicione um sensor para começar</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        <i className="bi bi-x-circle me-1"></i>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </ComponentErrorBoundary>
    );
}