"use client";

import { Button, Form } from "react-bootstrap";
import { useNativeCamera } from "../hooks/useNativeCamera";
import { useState } from "react";

interface CameraCaptureButtonProps {
    onCapture: (images: string[]) => void;
    maxImages?: number;
    buttonText?: string;
    buttonVariant?: string;
    showPreview?: boolean;
    autoCompress?: boolean;
    maxWidth?: number;
    quality?: number;
    className?: string;
}

/**
 * Reusable button component for native mobile camera capture
 * Automatically handles camera access and image processing
 */
export function CameraCaptureButton({
    onCapture,
    maxImages = 1,
    buttonText = "Capturar com Câmera",
    buttonVariant = "primary",
    showPreview = false,
    autoCompress = true,
    maxWidth = 1920,
    quality = 0.8,
    className = ""
}: CameraCaptureButtonProps) {
    const [showFileInput, setShowFileInput] = useState(false);

    const {
        fileInputRef,
        previewImages,
        error,
        isCapturing,
        triggerCamera,
        handleFileChange,
        removeImage,
        clearAllImages
    } = useNativeCamera({
        maxImages,
        onImagesCaptured: onCapture,
        autoCompress,
        maxWidth,
        quality
    });

    const handleClick = () => {
        triggerCamera();
        setShowFileInput(true);
    };

    return (
        <div className={className}>
            {/* Hidden file input for camera capture */}
            {showFileInput && (
                <Form.Control
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    multiple={maxImages > 1}
                    className="d-none"
                />
            )}

            {/* Camera capture button */}
            <Button
                variant={buttonVariant}
                onClick={handleClick}
                disabled={isCapturing}
                className="d-flex align-items-center"
            >
                {isCapturing ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Capturando...
                    </>
                ) : (
                    <>
                        <i className="bi bi-camera me-2"></i>
                        {buttonText}
                    </>
                )}
            </Button>

            {/* Error display */}
            {error && (
                <div className="alert alert-danger mt-2 mb-0 d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {/* Preview of captured images (if enabled) */}
            {showPreview && previewImages.length > 0 && (
                <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Fotos Capturadas:</strong>
                        <div>
                            <span className="badge bg-primary rounded-pill me-2">
                                {previewImages.length}/{maxImages}
                            </span>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={clearAllImages}
                            >
                                <i className="bi bi-trash"></i> Limpar
                            </Button>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {previewImages.map((image, index) => (
                            <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={image}
                                    alt={`Captura ${index + 1}`}
                                    className="w-100 h-100 object-fit-cover rounded border"
                                    style={{ objectFit: 'cover' }}
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
        </div>
    );
}