// app/pages/access-control-demo/ConfirmDeleteModal.tsx
import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";

import { BaseDevice } from "./types";

// Use the shared device type
type Device = BaseDevice;

interface ConfirmDeleteModalProps {
    show: boolean;
    device: Device | null;
    onHide: () => void;
    onDeleted: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    show,
    device,
    onHide,
    onDeleted,
}) => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Helper function to safely convert values
    const convertToString = (value: unknown): string => {
        if (value === undefined || value === null) return "";
        return String(value);
    };

    const handleDelete = async () => {
        if (!device) return;

        setLoading(true);
        setError(null);

        try {
            // Map device type to API type
            let deviceType = convertToString(device.type);
            if (deviceType === 'controller') deviceType = 'controller';
            if (deviceType === 'button') deviceType = 'button';
            if (deviceType === 'electromagnet') deviceType = 'electromagnet';
            if (deviceType === 'sensor') deviceType = 'sensor';

            const response = await fetch(
                `/api/access-control?deviceId=${convertToString(device.id)}&deviceType=${deviceType}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete device");
            }

            onDeleted();
            onHide();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete device"
            );
        } finally {
            setLoading(false);
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

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar Exclusão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {device && (
                    <p>
                        Tem certeza que deseja excluir o dispositivo{" "}
                        <strong>{convertToString(device.name)}</strong> ({getDeviceTypeLabel(convertToString(device.type))})?
                        Esta ação não pode ser desfeita.
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? "Excluindo..." : "Excluir"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmDeleteModal;
