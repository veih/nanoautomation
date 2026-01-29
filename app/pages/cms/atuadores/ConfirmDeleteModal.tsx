"use client";
import { Modal, Button } from "react-bootstrap";
import { Atuador } from "../../../../types";

interface Props {
    show: boolean;
    onHide: () => void;
    atuador?: Atuador | null;
    onDeleted: () => void;
}

export default function ConfirmDeleteModal({ show, onHide, atuador, onDeleted }: Props) {
    const handleDelete = async () => {
        if (!atuador) return;
        try {
            const res = await fetch(`/api/cmsApi/atuador/${atuador.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            onDeleted();
            onHide();
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir atuador");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar Exclusão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Tem certeza que deseja excluir <strong>{atuador?.nome}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Excluir</Button>
            </Modal.Footer>
        </Modal>
    );
}
