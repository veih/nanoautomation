"use client";

import { useState, useRef, useEffect } from "react";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import Image from "next/image";

interface MobileCameraCaptureProps {
    show: boolean;
    onHide: () => void;
    onCapture: (imageData: string) => void;
    maxImages?: number;
}

function MobileCameraCapture({
    show,
    onHide,
    onCapture,
    maxImages = 5,
}: MobileCameraCaptureProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    // Clear state when modal closes
    useEffect(() => {
        if (!show) {
            setCapturedImages([]);
            setPreviewImages([]);
            setError(null);
        }
    }, [show]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);
        const totalImages = capturedImages.length + newFiles.length;

        if (totalImages > maxImages) {
            setError(`Você pode capturar no máximo ${maxImages} imagens.`);
            return;
        }

        const newPreviewImages: string[] = [];
        const newCapturedImages: string[] = [];

        let processedFiles = 0;

        newFiles.forEach((file) => {
            if (file.type.startsWith('image/')) {
                // Compress the image before converting to base64
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        const img = document.createElement('img');
                        img.src = event.target.result as string;
                        img.onload = () => {
                            // Create canvas for compression
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

                            // Calculate new dimensions (max 1920px width)
                            const maxWidth = 1920;
                            const scale = Math.min(1, maxWidth / img.width);
                            canvas.width = img.width * scale;
                            canvas.height = img.height * scale;

                            // Draw image on canvas
                            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                            // Convert to base64 with compression (0.8 quality)
                            const compressedData = canvas.toDataURL('image/jpeg', 0.8);

                            newPreviewImages.push(compressedData);
                            newCapturedImages.push(compressedData);
                            processedFiles++;

                            // When all files are processed, update state
                            if (processedFiles === newFiles.length) {
                                setPreviewImages(prev => [...prev, ...newPreviewImages]);
                                setCapturedImages(prev => [...prev, ...newCapturedImages]);
                                setError(null);
                            }
                        };
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const removeImage = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setCapturedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (capturedImages.length > 0) {
            // For loja images, we only want to save the most recent capture
            // Take the last captured image (most recent)
            const mostRecentImage = capturedImages[capturedImages.length - 1];
            onCapture(mostRecentImage);
        }
        handleClose();
    };

    const handleClose = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setCapturedImages([]);
        setPreviewImages([]);
        setError(null);
        onHide();
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            fullscreen="sm-down"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-camera me-2"></i>
                    Captura de Fotos
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-0">
                {error ? (
                    <Alert variant="danger" className="m-3">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                ) : null}

                {/* Native file input for camera capture */}
                <Form.Group className="m-3">
                    <Form.Control
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="d-none"
                    />
                    <Button
                        variant="primary"
                        onClick={triggerFileInput}
                        className="w-100"
                    >
                        <i className="bi bi-camera-fill me-2"></i>
                        Capturar Foto(s) com Câmera
                    </Button>
                </Form.Group>

                {/* Captured images preview */}
                {previewImages.length > 0 && (
                    <div className="p-3 border-top">
                        <h6 className="mb-3">Fotos Capturadas:</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {previewImages.map((image, index) => (
                                <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                                    <Image
                                        src={image}
                                        alt={`Captura ${index + 1}`}
                                        className="w-100 h-100 object-fit-cover rounded"
                                        width={100}
                                        height={100}
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
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={capturedImages.length === 0}
                >
                    Salvar Fotos ({capturedImages.length})
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export { MobileCameraCapture };
