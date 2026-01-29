"use client";

import { Modal, Button } from "react-bootstrap";
import { Sensor } from "../../../../types";

interface Props {
  show: boolean;
  onHide: () => void;
  sensor?: Sensor | null;
  onDeleted: () => void;
}

export default function ConfirmDeleteModal({ show, onHide, sensor, onDeleted }: Props) {
  const handleDelete = async () => {
    if (!sensor) return;
    try {
      const res = await fetch(`/api/cmsApi/sensores/${sensor.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar sensor");
      onDeleted();
      onHide();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar sensor");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Exclusão</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Tem certeza que deseja excluir o sensor <strong>{sensor?.nome}</strong>? Esta ação é irreversível.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={handleDelete}>Excluir</Button>
      </Modal.Footer>
    </Modal>
  );
}
