"use client";
import { Button, ButtonGroup, Table } from "react-bootstrap";
import Link from "next/link";
import { Atuador, AtuadorStatus } from "../../../../types";

interface Props {
    atuadores: Atuador[];
    abrirModalEdicao: (atuador: Atuador) => void;
    setShowModal: (show: boolean) => void;
    handleShowConfirmModal: (atuador: Atuador) => void;
    setShowConfirmModal: (show: boolean) => void;
}

export default function AtuadoresTable({
    atuadores,
    abrirModalEdicao,
    handleShowConfirmModal,
}: Props) {
    const getStatusColorClass = (estado?: AtuadorStatus) => {
        switch (estado) {
            case AtuadorStatus.OPERACIONAL:
                return "text-success";
            case AtuadorStatus.DEFEITO:
                return "text-danger";
            case AtuadorStatus.MANUTENCAO:
                return "text-warning";
            case AtuadorStatus.DESCONHECIDO:
                return "text-muted";
            default:
                return "";
        }
    };

    // Parse image paths if they exist
    const getImageCount = (atuador: Atuador): number => {
        if (!atuador.imagePaths) return 0;

        try {
            const parsed = JSON.parse(atuador.imagePaths);
            if (Array.isArray(parsed)) {
                return parsed.length;
            }
        } catch (e) {
            console.error("Error parsing image paths:", e);
        }

        return 0;
    };

    return (
        <Table striped bordered hover responsive className="shadow-sm">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Estágio</th>
                    <th>Tipo</th>
                    <th>Máquina</th>
                    <th>Casa de Máquinas</th>
                    <th>Piso</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Imagens</th>
                    <th className="text-center">Ações</th>
                </tr>
            </thead>
            <tbody>
                {atuadores.map((a, index) => (
                    <tr key={a.id}>
                        <td>{index + 1}</td>
                        <td>{a.nome}</td>
                        <td>{a.tipo}</td>
                        <td>{a.equipamento?.nome || "N/A"}</td>
                        <td>{a.equipamento?.cm?.nome || "N/A"}</td>
                        <td>{a.equipamento?.cm?.localizacao || "N/A"}</td>
                        <td className={`text-center ${getStatusColorClass(a.estado)}`}>
                            {a.estado || "N/A"}
                            {a.estado === AtuadorStatus.DEFEITO && a.descricaoDefeito
                                ? ` (${a.descricaoDefeito})`
                                : ""}
                        </td>
                        <td className="text-center">
                            {a.estado === AtuadorStatus.DEFEITO && getImageCount(a) > 0 && (
                                <span className="badge bg-info">
                                    <i className="bi bi-image me-1"></i>
                                    {getImageCount(a)}
                                </span>
                            )}
                        </td>
                        <td className="text-center">
                            <ButtonGroup size="sm">
                                <Link href={`/pages/cms/atuadores/detalhes?id=${a.id}`} passHref>
                                    <Button variant="outline-info" className="me-1">
                                        🔍 Detalhes
                                    </Button>
                                </Link>
                                <Button variant="outline-primary" onClick={() => abrirModalEdicao(a)} className="me-1">
                                    ✏️ Editar
                                </Button>
                                <Button variant="danger" onClick={() => handleShowConfirmModal(a)}>
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