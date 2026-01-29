// app/pages/access-control-demo/DeviceFormModal.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import Image from "next/image";

import { BaseDevice } from "./types";

// Use the shared device type
type Device = BaseDevice;

interface DeviceFormData {
    type: string;
    name: string;
    status: string;
    location: string;
    description: string;
    controllerId: string;
    buttonType: string;
    isPressed: boolean;
    electromagnetType: string;
    isLocked: boolean;
    lockStatus: string;
    powerConsumption: number;
    sensorType: string;
    isClosed: boolean;
    // Image handling
    images: string[]; // Base64 strings
}

interface DeviceFormModalProps {
    show: boolean;
    device: Device | null;
    onHide: () => void;
    onSaved: () => void;
}

const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
    show,
    device,
    onHide,
    onSaved,
}) => {
    const isEditing = !!device;
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<DeviceFormData>({
        type: "controller",
        name: "",
        status: "OPERACIONAL",
        location: "",
        description: "",
        controllerId: "",
        buttonType: "ENTRY",
        isPressed: false,
        electromagnetType: "",
        isLocked: false,
        lockStatus: "LOCKED",
        powerConsumption: 0,
        sensorType: "DOOR",
        isClosed: true,
        images: []
    });

    // Camera state
    // const [showCamera, setShowCamera] = useState<boolean>(false); // Commented out as it's not used
    const videoRef = useRef<HTMLVideoElement>(null);
    // const canvasRef = useRef<HTMLCanvasElement>(null); // Commented out as it's not used
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Helper function to safely convert values
    const convertToString = (value: unknown): string => {
        if (value === undefined || value === null) return "";
        return String(value);
    };

    const convertToBoolean = (value: unknown): boolean => {
        if (value === undefined || value === null) return false;
        if (typeof value === "boolean") return value;
        if (typeof value === "string") return value.toLowerCase() === "true";
        if (typeof value === "number") return value !== 0;
        return Boolean(value);
    };

    const convertToNumber = (value: unknown): number => {
        if (value === undefined || value === null) return 0;
        if (typeof value === "number") return value;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    // Populate form when editing
    useEffect(() => {
        if (isEditing && device) {
            setFormData({
                type: convertToString(device.type) || "controller",
                name: convertToString(device.name) || "",
                status: convertToString(device.status) || "OPERACIONAL",
                location: convertToString(device.location) || "",
                description: convertToString(device.description) || "",
                controllerId: convertToString(device.controllerId) || "",

                buttonType: convertToString(device.buttonType) || "ENTRY",
                isPressed: convertToBoolean(device.isPressed),
                electromagnetType: convertToString(device.electromagnetType) || "",
                isLocked: convertToBoolean(device.isLocked),
                lockStatus: convertToString(device.lockStatus) || "LOCKED",
                powerConsumption: convertToNumber(device.powerConsumption),
                sensorType: convertToString(device.sensorType) || "DOOR",
                isClosed: device.isClosed !== undefined ? convertToBoolean(device.isClosed) : true,
                images: []
            });
        } else {
            // Reset form for new device
            setFormData({
                type: "controller",
                name: "",
                status: "OPERACIONAL",
                location: "",
                description: "",
                controllerId: "",
                buttonType: "ENTRY",
                isPressed: false,
                electromagnetType: "",
                isLocked: false,
                lockStatus: "LOCKED",
                powerConsumption: 0,
                sensorType: "DOOR",
                isClosed: true,
                images: []
            });
        }

        // Reset camera state when form changes
        // if (showCamera) {
        //     stopCamera();
        // }
    }, [isEditing, device]);

    // Initialize camera (simplified version - just use device camera)
    // const initCamera = async () => {
    //     // For mobile devices, we'll just trigger the native camera
    //     document.getElementById('mobileCameraCapture')?.click();
    // };

    // Capture photo from camera
    // const capturePhoto = () => {
    //     console.log("Capturing photo...");
    //     if (videoRef.current && canvasRef.current) {
    //         const video = videoRef.current;
    //         const canvas = canvasRef.current;
    //         const context = canvas.getContext('2d');

    //         if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
    //             console.log("Video is ready, capturing frame...");
    //             // Set canvas dimensions to match video
    //             canvas.width = video.videoWidth || video.clientWidth;
    //             canvas.height = video.videoHeight || video.clientHeight;

    //             console.log(`Canvas size: ${canvas.width}x${canvas.height}`);

    //             // Draw video frame to canvas
    //             context.drawImage(video, 0, 0, canvas.width, canvas.height);

    //             // Convert to base64 with good quality
    //             const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    //             console.log("Photo captured, data URL length:", dataUrl.length);

    //             // Validate that we actually captured an image
    //             if (dataUrl && dataUrl.length > 100) { // Basic validation
    //                 // Add to images array
    //                 setFormData(prev => ({
    //                     ...prev,
    //                     images: [...prev.images, dataUrl]
    //                 }));

    //                 console.log("Photo added to state");
    //             } else {
    //                 console.error("Failed to capture valid image");
    //                 const errorMsg = "Falha ao capturar a imagem. Tente novamente.";
    //                 setCameraError(errorMsg);
    //                 setError(errorMsg);
    //                 return;
    //             }

    //             // Stop camera after capture
    //             stopCamera();
    //         } else {
    //             // Video is not ready, show error
    //             const errorMsg = "A câmera ainda não está pronta. Aguarde um momento e tente novamente.";
    //             console.warn(errorMsg);
    //             setCameraError(errorMsg);
    //         }
    //     } else {
    //         console.error("Video or canvas ref is null");
    //         const errorMsg = "Erro ao acessar a câmera. Por favor, recarique a página e tente novamente.";
    //         setCameraError(errorMsg);
    //         setError(errorMsg);
    //     }
    // };

    // Stop camera
    // const stopCamera = () => {  // Commented out as it's not used
    //     if (streamRef.current) {
    //         streamRef.current.getTracks().forEach(track => {
    //             track.stop();
    //         });
    //         streamRef.current = null;
    //     }

    //     // Note: We can't remove specific event listeners here because we don't have references to the
    //     // inline functions created in initCamera. The cleanup will happen in the useEffect hooks.

    //     setShowCamera(false);
    //     setCameraError(null);
    // };

    // Handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newImages: string[] = [...formData.images];

            files.forEach((file) => {
                // Check file type
                if (!file.type.match('image.*')) {
                    setError("Por favor, selecione apenas arquivos de imagem.");
                    return;
                }

                // Check file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    setError("O tamanho da imagem não pode exceder 10MB.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        newImages.push(event.target.result as string);
                        setFormData(prev => ({
                            ...prev,
                            images: newImages
                        }));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Remove an image
    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Upload images first if device is defective
            let imagePaths: string[] = [];
            if (formData.status === "DEFEITO" && formData.images.length > 0) {
                const imageResponse = await fetch("/api/access-control/upload-image", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        deviceId: isEditing ? device!.id : undefined, // This is now properly handled by the API
                        deviceType: formData.type,
                        images: formData.images
                    }),
                });

                if (!imageResponse.ok) {
                    const errorData = await imageResponse.json();
                    throw new Error(errorData.error?.message || "Failed to upload images");
                }

                const imageData = await imageResponse.json();
                imagePaths = imageData.data.imagePaths;
            }

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `/api/access-control?deviceId=${device!.id}&deviceType=${device!.type}`
                : "/api/access-control";

            // Prepare the data to send based on device type
            let requestData: Record<string, string | boolean | number | undefined> = {
                type: formData.type,
                name: formData.name,
                status: formData.status,
                location: formData.location,
                description: formData.description,
                imagePaths: imagePaths.length > 0 ? JSON.stringify(imagePaths) : undefined
            };

            // Add type-specific fields
            switch (formData.type) {
                case "controller":
                    // No additional fields for controller
                    break;
                case "button":
                    requestData = {
                        ...requestData,
                        controllerId: formData.controllerId || undefined, // Make it optional
                        buttonType: formData.buttonType,
                        isPressed: formData.isPressed,
                    };
                    break;
                case "electromagnet":
                    requestData = {
                        ...requestData,
                        controllerId: formData.controllerId || undefined, // Make it optional
                        isLocked: formData.isLocked,
                        lockStatus: formData.lockStatus,
                        powerConsumption: formData.powerConsumption,
                    };
                    break;
                case "sensor":
                    requestData = {
                        ...requestData,
                        controllerId: formData.controllerId || undefined, // Make it optional
                        sensorType: formData.sensorType,
                        isClosed: formData.isClosed,
                    };
                    break;
            }

            // Add ID for editing
            if (isEditing) {
                requestData.id = device!.id;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error?.message || `Failed to ${isEditing ? "update" : "create"} device`
                );
            }

            onSaved();
            onHide();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : `Failed to ${isEditing ? "update" : "create"} device`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const target = e.target;
        const { name, type } = target;

        // Handle different input types
        let value: string | boolean;
        if (type === "checkbox") {
            value = (target as HTMLInputElement).checked;
        } else {
            value = target.value;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Define the user interaction handler with useCallback
    const handleUserInteraction = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.play()
                .then(() => {
                    console.log("Video played successfully after user interaction");
                    setCameraError(null);
                })
                .catch(err => {
                    console.warn("Still unable to play video:", err);
                    setCameraError("Não foi possível iniciar a câmera. Verifique as permissões.");
                });
        }
        // Remove the event listeners after first interaction
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('mousedown', handleUserInteraction);
    }, []);

    // Clean up camera on unmount and when modal is hidden
    useEffect(() => {
        const cleanup = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
                streamRef.current = null;
            }

            // Remove all possible event listeners
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('mousedown', handleUserInteraction);
        };

        // Cleanup when component unmounts
        return cleanup;
    }, [handleUserInteraction]);

    // Additional cleanup when modal is hidden
    useEffect(() => {
        if (!show) {
            // Modal is being hidden, cleanup camera
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
                streamRef.current = null;
            }
            setFormData(prev => ({
                ...prev,
                images: []
            }));

            // Remove all possible event listeners
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('mousedown', handleUserInteraction);
        }
    }, [show, handleUserInteraction]);

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditing ? "Editar Dispositivo" : "Adicionar Novo Dispositivo"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {cameraError && <Alert variant="warning">{cameraError}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Tipo de Dispositivo</Form.Label>
                        <Form.Select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            disabled={isEditing}
                        >
                            <option value="controller">Controlador</option>
                            <option value="button">Botão de Solicitação</option>
                            <option value="electromagnet">Eletroímã</option>
                            <option value="sensor">Sensor Magnético</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="OPERACIONAL">Operacional</option>
                            <option value="DEFEITO">Defeito</option>
                            <option value="MANUTENCAO">Manutenção</option>
                            <option value="N_A">Não Disponível</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Localização</Form.Label>
                        <Form.Control
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* Image upload for defective devices */}
                    {formData.status === "DEFEITO" && (
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
                                        id="mobileCameraCapture"
                                    />
                                    <Button
                                        variant="primary"
                                        onClick={() => document.getElementById('mobileCameraCapture')?.click()}
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
                                        id="imageUpload"
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={() => document.getElementById('imageUpload')?.click()}
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

                            {/* Preview of selected images */}
                            {formData.images.length > 0 && (
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <strong>Fotos Capturadas:</strong>
                                        <span className="badge bg-primary rounded-pill">{formData.images.length}</span>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {formData.images.map((image, index) => (
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
                    )}

                    {/* Fields for devices that connect to a controller */}
                    {(formData.type === "button" ||
                        formData.type === "electromagnet" ||
                        formData.type === "sensor") && (
                            <Form.Group className="mb-3">
                                <Form.Label>ID do Controlador (Opcional)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="controllerId"
                                    value={formData.controllerId}
                                    onChange={handleChange}
                                    placeholder="Deixe em branco se não estiver conectado a um controlador"
                                />
                            </Form.Group>
                        )}

                    {/* Button specific fields */}
                    {formData.type === "button" && (
                        <>
                            <Form.Group className="mb-33">
                                <Form.Label>Tipo de Botão</Form.Label>
                                <Form.Select
                                    name="buttonType"
                                    value={formData.buttonType}
                                    onChange={handleChange}
                                >
                                    <option value="ENTRY">Entrada</option>
                                    <option value="EXIT">Saída</option>
                                    <option value="EMERGENCY">Emergência</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    name="isPressed"
                                    label="Está Pressionado"
                                    checked={formData.isPressed}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </>
                    )}

                    {/* Electromagnet specific fields */}
                    {formData.type === "electromagnet" && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    name="isLocked"
                                    label="Está Bloqueado"
                                    checked={formData.isLocked}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Status do Bloqueio</Form.Label>
                                <Form.Select
                                    name="lockStatus"
                                    value={formData.lockStatus}
                                    onChange={handleChange}
                                >
                                    <option value="LOCKED">Bloqueado</option>
                                    <option value="UNLOCKED">Desbloqueado</option>
                                    <option value="LOCKING">Bloqueando</option>
                                    <option value="UNLOCKING">Desbloqueando</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Consumo de Energia (W)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="powerConsumption"
                                    value={formData.powerConsumption}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </>
                    )}

                    {/* Sensor specific fields */}
                    {formData.type === "sensor" && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Tipo de Sensor</Form.Label>
                                <Form.Select
                                    name="sensorType"
                                    value={formData.sensorType}
                                    onChange={handleChange}
                                >
                                    <option value="DOOR">Porta</option>
                                    <option value="WINDOW">Janela</option>
                                    <option value="GATE">Portão</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    name="isClosed"
                                    label="Está Fechado"
                                    checked={formData.isClosed}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Salvando..."
                            : isEditing
                                ? "Atualizar Dispositivo"
                                : "Adicionar Dispositivo"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default DeviceFormModal;