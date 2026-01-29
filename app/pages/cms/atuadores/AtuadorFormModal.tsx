"use client";
import { Atuador, Equipamento, Cm, AtuadorStatus } from "../../../../types";
import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect, FormEvent, useRef } from "react";
import Image from "next/image";

interface Props {
    show: boolean;
    atuador: Atuador | null;
    onHide: () => void;
    onSaved: () => Promise<void>; // Função do pai para atualizar a lista
    equipamentos: Equipamento[];
    cms: Cm[];
}

export default function AtuadorFormModal({
    show,
    atuador,
    onHide,
    onSaved,
    equipamentos = [],
}: Props) {
    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("");
    const [equipamentoId, setEquipamentoId] = useState<string>("");
    const [descricaoDefeito, setDescricaoDefeito] = useState("");
    const [estado, setEstado] = useState<AtuadorStatus>(AtuadorStatus.OPERACIONAL);
    const [images, setImages] = useState<string[]>([]); // Base64 strings for images
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Refs for file inputs
    const mobileCameraRef = useRef<HTMLInputElement>(null);
    const fileUploadRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (atuador) {
            setNome(atuador.nome);
            setTipo(atuador.tipo);
            setEquipamentoId(atuador.equipamentoId);
            setDescricaoDefeito(atuador.descricaoDefeito || "");
            setEstado(atuador.estado || AtuadorStatus.OPERACIONAL);
            setImages([]); // Reset images when editing
        } else {
            setNome("");
            setTipo("");
            setEquipamentoId("");
            setDescricaoDefeito("");
            setEstado(AtuadorStatus.OPERACIONAL);
            setImages([]);
        }
    }, [atuador]);

    // Handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newImages: string[] = [...images];

            files.forEach((file) => {
                // Check file type
                if (!file.type.match('image.*')) {
                    setCameraError("Por favor, selecione apenas arquivos de imagem.");
                    return;
                }

                // Check file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    setCameraError("O tamanho da imagem não pode exceder 10MB.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        newImages.push(event.target.result as string);
                        setImages(newImages);
                        setCameraError(null);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Remove an image
    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Upload images first if actuator is defective
            let imagePaths: string[] = [];
            if (estado === AtuadorStatus.DEFEITO && images.length > 0) {
                const imageResponse = await fetch("/api/cmsApi/atuador/upload-image", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        atuadorId: atuador?.id,
                        images
                    }),
                });

                if (!imageResponse.ok) {
                    throw new Error("Failed to upload images");
                }

                const imageData = await imageResponse.json();
                imagePaths = imageData.data.imagePaths;
            }

            const payload = {
                nome,
                tipo,
                equipamentoId,
                estado,
                ...(estado === AtuadorStatus.DEFEITO && { descricaoDefeito }),
                imagePaths: imagePaths.length > 0 ? JSON.stringify(imagePaths) : undefined
            };

            const url = atuador
                ? `/api/cmsApi/atuador/${atuador.id}` // edição
                : "/api/cmsApi/atuador";             // criação
            const metodo = atuador ? "PUT" : "POST";

            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Erro ao salvar atuador:", res.status, errorText);
                return;
            }

            await onSaved(); // atualiza a lista no componente pai
            onHide();        // fecha o modal
        } catch (err) {
            console.error("Erro ao salvar atuador:", err);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{atuador ? "Editar Atuador" : "Novo Atuador"}</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Tipo</Form.Label>
                        <Form.Control
                            type="text"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value as AtuadorStatus)}
                        >
                            {Object.values(AtuadorStatus).map((s) => (
                                <option key={s} value={s}>
                                    {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {estado === AtuadorStatus.DEFEITO && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Descrição do Defeito</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={descricaoDefeito}
                                    onChange={(e) => setDescricaoDefeito(e.target.value)}
                                />
                            </Form.Group>

                            {/* Image upload for defective actuators */}
                            <Form.Group className="mb-3">
                                <Form.Label>Imagens do Defeito</Form.Label>

                                {/* Camera and file upload options */}
                                <div className="d-flex flex-column gap-2 mb-2">
                                    <div className="d-flex gap-2">
                                        {/* Mobile camera capture using accept="image/*" with capture attribute */}
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            multiple
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                            id={`mobileCameraCapture-${atuador?.id || 'new'}`}
                                            ref={mobileCameraRef}
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={() => mobileCameraRef.current?.click()}
                                        >
                                            <i className="bi bi-camera me-1"></i>
                                            Tirar Foto (Câmera)
                                        </Button>

                                        {/* File selection */}
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                            id={`imageUpload-${atuador?.id || 'new'}`}
                                            ref={fileUploadRef}
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={() => fileUploadRef.current?.click()}
                                        >
                                            <i className="bi bi-folder me-1"></i>
                                            Selecionar Imagens
                                        </Button>
                                    </div>

                                    {/* Camera access instructions for mobile */}
                                    <small className="text-muted">
                                        <i className="bi bi-info-circle me-1"></i>
                                        No celular, você pode tirar fotos diretamente da câmera
                                    </small>
                                </div>

                                {/* Error message */}
                                {cameraError && (
                                    <div className="alert alert-danger mt-2">
                                        {cameraError}
                                    </div>
                                )}

                                {/* Preview of selected images */}
                                {images.length > 0 && (
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <strong>Fotos Capturadas:</strong>
                                            <span className="badge bg-primary rounded-pill">{images.length}</span>
                                        </div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {images.map((image, index) => (
                                                <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                                                    <Image
                                                        src={image}
                                                        alt={`Foto ${index + 1}`}
                                                        width={100}
                                                        height={100}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="position-absolute top-0 end-0 translate-middle rounded-circle"
                                                        style={{ width: '24px', height: '24px', padding: '0' }}
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <i className="bi bi-x"></i>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Form.Group>
                        </>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Equipamento</Form.Label>
                        <Form.Select
                            value={equipamentoId}
                            onChange={(e) => setEquipamentoId(e.target.value)}
                            required
                        >
                            <option value="">Selecione um equipamento...</option>
                            {equipamentos.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.nome}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit">
                        {atuador ? "Salvar Alterações" : "Salvar Novo Atuador"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}