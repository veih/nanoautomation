"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, Button, ButtonGroup, Badge, Alert } from "react-bootstrap";
import { ComponentErrorBoundary } from "@/app/components/ErrorBoundary";
import { MobileCameraCapture } from "./MobileCameraCapture";
import { Loja } from "../../../../../types";

interface LojaCardProps {
    loja: Loja;
    onEdit: (loja: Loja) => void;
    onDelete: (loja: Loja) => void;
    onViewDetails: (loja: Loja) => void;
    onImageCapture: (lojaId: string, imageData: string) => Promise<void>;
    imageUrl?: string | null;
}

function LojaCard({ loja, onEdit, onDelete, onViewDetails, onImageCapture, imageUrl }: LojaCardProps) {
    const [showCamera, setShowCamera] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const handleCaptureImage = useCallback(async (imageData: string) => {
        setImageLoading(true);
        setImageError(null);
        try {
            // For loja images, we only want to save the most recent capture
            // Even if multiple images were captured, we'll only process the last one
            if (Array.isArray(imageData)) {
                // If imageData is an array, take the last element
                const lastImage = imageData[imageData.length - 1];
                await onImageCapture(loja.id, lastImage);
            } else {
                // If it's a single image, process it normally
                await onImageCapture(loja.id, imageData);
            }
        } catch (error: unknown) {
            console.error("Error saving image:", error);
            setImageError("Erro ao salvar a imagem. Por favor, tente novamente.");
        } finally {
            setImageLoading(false);
            setShowCamera(false);
        }
    }, [loja.id, onImageCapture]);

    const handleRemoveImage = useCallback(async () => {
        if (window.confirm("Tem certeza que deseja remover a imagem desta loja?")) {
            setImageLoading(true);
            setImageError(null);
            try {
                // Call API to remove image
                const response = await fetch(`/api/lojas/remove-image`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ lojaId: loja.id }),
                });

                if (!response.ok) {
                    throw new Error('Failed to remove image');
                }

                // Refresh the page or update the image map
                window.location.reload();
            } catch (error: unknown) {
                console.error("Error removing image:", error);
                setImageError("Erro ao remover a imagem. Por favor, tente novamente.");
            } finally {
                setImageLoading(false);
            }
        }
    }, [loja.id]);

    const handleImageError = useCallback(() => {
        console.error(`Failed to load image for loja ${loja.id}`);
        // Instead of setting imageLoadError to true, we'll just log the error
        // This way the image will still be shown if the URL is valid
        // The error is logged but doesn't hide the image
    }, [loja.id]); // Added loja.id as dependency since it's used in the function

    const handleImageLoad = useCallback(() => {
        // Image loaded successfully, no need to do anything special here
    }, []);

    return (
        <ComponentErrorBoundary componentName="LojaCard">
            <Card className="shadow-sm h-100">
                <div className="position-relative" style={{ height: '200px' }}>
                    {/* Background icon always present */}
                    <div className="bg-light h-100 d-flex align-items-center justify-content-center">
                        <i className="bi bi-shop text-muted" style={{ fontSize: '3rem' }}></i>
                    </div>

                    {/* Image overlay - shown only if imageUrl exists */}
                    {imageUrl && (
                        <div className="position-absolute top-0 start-0 w-100 h-100">
                            {/* Using regular img tag instead of Next.js Image for dynamic images */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt={`Imagem da loja ${loja.nome}`}
                                className="object-fit-cover w-100 h-100"
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                            />
                        </div>
                    )}

                    {/* LUC Badge */}
                    <div className="position-absolute top-0 end-0 m-2">
                        <Badge bg="primary">{loja.LUC}</Badge>
                    </div>
                </div>
                <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-1">{loja.nome}</Card.Title>
                    <Card.Text className="text-muted small mb-2">
                        {loja.localizacao ? `Piso: ${loja.localizacao}` : "Localização não informada"}
                    </Card.Text>
                    <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">
                                {loja.equipamentosLoja?.length || 0} equipamentos
                            </small>
                            <small className="text-muted">
                                {loja.atuadores?.length || 0} atuadores
                            </small>
                            <small className="text-muted">
                                {loja.sensores?.length || 0} sensores
                            </small>
                        </div>
                        <ButtonGroup className="w-100">
                            <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => onViewDetails(loja)}
                                title="Detalhes"
                            >
                                <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => onEdit(loja)}
                                title="Editar"
                            >
                                <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => onDelete(loja)}
                                title="Excluir"
                            >
                                <i className="bi bi-trash"></i>
                            </Button>
                        </ButtonGroup>
                    </div>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-1">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowCamera(true)}
                            disabled={imageLoading}
                            title={imageUrl ? "Alterar Imagem" : "Adicionar Imagem"}
                        >
                            <i className={`bi bi-${imageUrl ? 'arrow-repeat' : 'camera'} me-1`}></i>
                            {imageUrl ? "Alterar" : "Capturar"}
                        </Button>
                        {imageUrl && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleRemoveImage}
                                disabled={imageLoading}
                                title="Remover Imagem"
                            >
                                <i className="bi bi-trash"></i>
                            </Button>
                        )}
                    </div>
                    {imageLoading && (
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    )}
                </Card.Footer>
            </Card>

            {/* Camera Modal */}
            <MobileCameraCapture
                show={showCamera}
                onHide={() => setShowCamera(false)}
                onCapture={handleCaptureImage}
                maxImages={1}
            />

            {/* Error Alert */}
            {imageError && (
                <Alert variant="danger" className="mt-2 mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {imageError}
                </Alert>
            )}
        </ComponentErrorBoundary>
    );
}

interface CardViewProps {
    data: Loja[];
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    onEdit: (item: Loja) => void;
    onDelete: (item: Loja) => void;
    onViewDetails: (item: Loja) => void;
    onImageCapture: (lojaId: string, imageData: string) => Promise<void>;
    title?: string;
    imageMap?: Record<string, string>;
}

export function CardView({
    data,
    loading = false,
    error = null,
    emptyMessage = "Nenhuma item encontrado",
    onEdit,
    onDelete,
    onViewDetails,
    onImageCapture,
    title,
    imageMap = {},
}: CardViewProps) {
    // Debug log to see what data and imageMap are being passed
    useEffect(() => {

    }, [data, imageMap]);

    if (error) {
        return (
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-grid me-2"></i>
                        {title}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Alert variant="danger" className="mb-0">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    if (data.length === 0 && !loading) {
        return (
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-grid me-2"></i>
                        {title}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Alert variant="info" className="text-center mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        {emptyMessage}
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    return (
        <ComponentErrorBoundary componentName="CardView">
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="bi bi-grid me-2"></i>
                        {title}
                    </h5>
                    <span className="badge bg-light text-dark">
                        {data.length} {data.length === 1 ? 'item' : 'itens'}
                    </span>
                </Card.Header>
                <Card.Body>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {data.map((loja) => {
                            const imageUrl = imageMap[loja.id] || null;
                            return (
                                <div key={loja.id} className="col">
                                    <LojaCard
                                        loja={loja}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onViewDetails={onViewDetails}
                                        onImageCapture={onImageCapture}
                                        imageUrl={imageUrl}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>
        </ComponentErrorBoundary>
    );
}
