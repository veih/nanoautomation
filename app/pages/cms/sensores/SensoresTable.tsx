"use client";

import { Table, Button, ButtonGroup } from "react-bootstrap";
import { Sensor, SensorStatus } from "../../../../types";
import Link from "next/link";

interface Props {
    sensores: Sensor[];
    abrirModalEdicao: (sensor: Sensor) => void;
    confirmarDelecao: (sensor: Sensor) => void;
}

export default function SensoresTable({ sensores, abrirModalEdicao, confirmarDelecao }: Props) {
    const getStatusColorClass = (estado?: SensorStatus) => {
        switch (estado) {
            case SensorStatus.OPERACIONAL:
                return "text-success";
            case SensorStatus.DEFEITO:
                return "text-danger";
            case SensorStatus.MANUTENCAO:
                return "text-warning";
            case SensorStatus.DESCONHECIDO:
                return "text-muted";
            default:
                return "";
        }
    };

    return (
        <Table striped bordered hover responsive className="shadow-sm">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Máquina</th>
                    <th>CM</th>
                    <th>Localização</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Imagens</th>
                    <th className="text-center">Ações</th>
                </tr>
            </thead>
            <tbody>
                {sensores.map((s, index) => (
                    <tr key={s.id}>
                        <td>{index + 1}</td>
                        <td>{s.nome}</td>
                        <td>{s.tipo || "N/A"}</td>
                        <td>{s.equipamento?.nome || "N/A"}</td>
                        <td>{s.equipamento?.cm?.nome || "N/A"}</td>
                        <td>{s.equipamento?.cm?.localizacao || "N/A"}</td>
                        <td className={`text-center ${getStatusColorClass(s.estado)}`}>
                            {s.estado || "N/A"}
                        </td>
                        <td className="text-center">
                            {s.estado === SensorStatus.DEFEITO && s.imagePaths && JSON.parse(s.imagePaths).length > 0 ? (
                                <span className="badge bg-primary">
                                    {JSON.parse(s.imagePaths).length} imagem(s)
                                </span>
                            ) : s.estado === SensorStatus.DEFEITO ? (
                                <span className="badge bg-secondary">Sem imagens</span>
                            ) : null}
                        </td>
                        <td className="text-center">
                            <ButtonGroup size="sm">
                                <Link href={`/pages/cms/sensores/detalhes?id=${s.id}`} passHref>
                                    <Button variant="outline-info" size="sm">
                                        👁️ Detalhes
                                    </Button>
                                </Link>
                                <Button variant="outline-primary" onClick={() => abrirModalEdicao(s)}>
                                    ✏️ Editar
                                </Button>
                                <Button variant="danger" onClick={() => confirmarDelecao(s)}>
                                    🗑️ Excluir
                                </Button>
                            </ButtonGroup>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}