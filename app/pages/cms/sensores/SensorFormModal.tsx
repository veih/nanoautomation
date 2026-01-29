"use client";

import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Sensor, SensorStatus, Equipamento, Cm } from "../../../../types";

interface Props {
    show: boolean;
    onHide: () => void;
    onSaved: () => void;
    sensor?: Sensor | null;
    equipamentos: Equipamento[];
    cms: Cm[];
}

export default function SensorFormModal({ show, onHide, onSaved, sensor, equipamentos, cms }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("");
    const [estado, setEstado] = useState<SensorStatus>(SensorStatus.OPERACIONAL);
    const [descricaoDefeito, setDescricaoDefeito] = useState("");
    const [equipamentoId, setEquipamentoId] = useState("");
    const [selectedCmId, setSelectedCmId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Clean up preview URLs
    useEffect(() => {
        return () => {
            previewUrls.forEach(URL.revokeObjectURL);
        };
    }, [previewUrls]);

    useEffect(() => {
        if (sensor) {
            setNome(sensor.nome);
            setTipo(sensor.tipo || "");
            setEstado(sensor.estado || SensorStatus.OPERACIONAL);
            setDescricaoDefeito(sensor.descricaoDefeito || "");
            setEquipamentoId(sensor.equipamentoId);
            if (sensor.equipamento?.cmId) setSelectedCmId(sensor.equipamento.cmId);
        } else {
            setNome("");
            setTipo("");
            setEstado(SensorStatus.OPERACIONAL);
            setDescricaoDefeito("");
            setEquipamentoId("");
            setSelectedCmId("");
        }
        // Clear images when modal opens/closes
        setImages([]);
        setPreviewUrls([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [sensor, show]);

    const equipamentosFiltrados = selectedCmId ? equipamentos.filter(e => e.cmId === selectedCmId) : equipamentos;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(files);

            // Create preview URLs
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(newPreviewUrls);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        if (previewUrls[index]) {
            URL.revokeObjectURL(previewUrls[index]);
            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome || !tipo || !equipamentoId) return;

        setIsSubmitting(true);

        try {
            // First, create/update the sensor without images
            const metodo = sensor ? "PUT" : "POST";
            const url = sensor ? `/api/cmsApi/sensores/${sensor.id}` : "/api/cmsApi/sensores";

            // Prepare sensor data with proper typing
            const sensorData: {
                nome: string;
                tipo: string;
                estado: SensorStatus;
                equipamentoId: string;
                descricaoDefeito?: string;
            } = {
                nome,
                tipo,
                estado,
                equipamentoId
            };

            // Handle descricaoDefeito based on state
            if (estado === SensorStatus.DEFEITO) {
                sensorData.descricaoDefeito = descricaoDefeito || "Defeito não especificado.";
            }

            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sensorData),
            });

            if (!res.ok) throw new Error("Erro ao salvar sensor");

            const savedSensor = await res.json();

            // Then, upload images if any and sensor is in DEFEITO status
            if (images.length > 0 && estado === SensorStatus.DEFEITO) {
                const formData = new FormData();
                images.forEach((file) => {
                    formData.append('images', file);
                });
                formData.append('sensorId', savedSensor.id);

                const uploadRes = await fetch('/api/cmsApi/sensores/upload-image', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Erro ao fazer upload das imagens');
                }
            }

            onSaved();
            onHide();
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar sensor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{sensor ? "Editar Sensor" : "Novo Sensor"}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Tipo</Form.Label>
                        <Form.Control type="text" value={tipo} onChange={e => setTipo(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select value={estado} onChange={e => setEstado(e.target.value as SensorStatus)} required>
                            {Object.values(SensorStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    {(estado === SensorStatus.DEFEITO || (sensor?.estado === SensorStatus.DEFEITO)) && (
                        <Form.Group className="mb-3">
                            <Form.Label>Descrição do Defeito</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={descricaoDefeito}
                                onChange={e => setDescricaoDefeito(e.target.value)}
                            />
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>CM</Form.Label>
                        <Form.Select value={selectedCmId} onChange={e => { setSelectedCmId(e.target.value); setEquipamentoId(""); }}>
                            <option value="">Selecione uma CM...</option>
                            {cms.map(cm => <option key={cm.id} value={cm.id}>{cm.nome}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Equipamento</Form.Label>
                        <Form.Select value={equipamentoId} onChange={e => setEquipamentoId(e.target.value)} disabled={!selectedCmId}>
                            <option value="">Selecione um Equipamento...</option>
                            {equipamentosFiltrados.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
                        </Form.Select>
                    </Form.Group>

                    {estado === SensorStatus.DEFEITO && (
                        <Form.Group className="mb-3">
                            <Form.Label>Imagens do Defeito</Form.Label>
                            <p className="text-muted">
                                Tire fotos do defeito para documentação (apenas quando o status for DEFEITO)
                            </p>
                            {previewUrls.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="position-relative">
                                            <Image
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                width={100}
                                                height={100}
                                                style={{ objectFit: 'cover' }}
                                                className="img-thumbnail"
                                            />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0"
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                onChange={handleImageChange}
                                ref={fileInputRef}
                            />
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? <Spinner animation="border" size="sm" /> : (sensor ? "Salvar Alterações" : "Salvar")}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}