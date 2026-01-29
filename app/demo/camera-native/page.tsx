"use client";

import { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { CameraCaptureButton } from "../../components/CameraCaptureButton";

export default function NativeCameraDemo() {
    const [singleImage, setSingleImage] = useState<string | null>(null);
    const [multipleImages, setMultipleImages] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSingleCapture = (images: string[]) => {
        if (images.length > 0) {
            setSingleImage(images[0]);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const handleMultipleCapture = (images: string[]) => {
        setMultipleImages(prev => [...prev, ...images]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const removeMultipleImage = (index: number) => {
        setMultipleImages(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllMultiple = () => {
        setMultipleImages([]);
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="text-center mb-4">
                        <i className="bi bi-camera me-2"></i>
                        Demonstração de Câmera Nativa
                    </h1>

                    <p className="text-center text-muted mb-5">
                        Esta página demonstra como usar a câmera nativa do dispositivo móvel para captura de imagens.
                        Funciona em dispositivos Android e iOS através do atributo <code>capture=&quot;environment&quot;</code>.
                    </p>

                    {showSuccess && (
                        <Alert variant="success" className="text-center">
                            <i className="bi bi-check-circle me-2"></i>
                            Imagem(ns) capturada(s) com sucesso!
                        </Alert>
                    )}

                    {/* Single Image Capture */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-camera me-2"></i>
                                Captura Única
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted">
                                Capture uma única imagem usando a câmera nativa do seu dispositivo.
                            </p>

                            <CameraCaptureButton
                                onCapture={handleSingleCapture}
                                maxImages={1}
                                buttonText="Capturar Foto"
                                buttonVariant="primary"
                                showPreview={true}
                                className="mb-3"
                            />

                            {singleImage && (
                                <div className="mt-3">
                                    <h6>Imagem Capturada:</h6>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={singleImage}
                                        alt="Captura única"
                                        className="img-fluid rounded border"
                                        style={{ maxHeight: '300px' }}
                                    />
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Multiple Images Capture */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-camera-reels me-2"></i>
                                Captura Múltipla
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted">
                                Capture múltiplas imagens (até 5) usando a câmera nativa.
                            </p>

                            <CameraCaptureButton
                                onCapture={handleMultipleCapture}
                                maxImages={5}
                                buttonText="Capturar Várias Fotos"
                                buttonVariant="success"
                                showPreview={false}
                                className="mb-3"
                            />

                            {multipleImages.length > 0 && (
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6>Fotos Capturadas ({multipleImages.length}/5):</h6>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={clearAllMultiple}
                                        >
                                            <i className="bi bi-trash me-1"></i>
                                            Limpar Todas
                                        </Button>
                                    </div>

                                    <div className="d-flex flex-wrap gap-3">
                                        {multipleImages.map((image, index) => (
                                            <div key={index} className="position-relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={image}
                                                    alt={`Captura ${index + 1}`}
                                                    className="rounded border"
                                                    style={{
                                                        width: '150px',
                                                        height: '150px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 translate-middle rounded-circle"
                                                    style={{ width: '28px', height: '28px', padding: '0' }}
                                                    onClick={() => removeMultipleImage(index)}
                                                >
                                                    <i className="bi bi-x"></i>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Technical Information */}
                    <Card className="shadow-sm">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-code-slash me-2"></i>
                                Como Funciona
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <h6>Implementação Técnica:</h6>
                            <pre className="bg-light p-3 rounded">
                                {`<input 
  type="file" 
  accept="image/*" 
  capture="environment"
  onChange={handleFileChange}
/>`}
                            </pre>

                            <h6 className="mt-3">Recursos:</h6>
                            <ul>
                                <li>Usa a câmera nativa do dispositivo móvel</li>
                                <li>Funciona em Android e iOS</li>
                                <li>Compressão automática de imagens</li>
                                <li>Validação de tipos de arquivo</li>
                                <li>Preview em tempo real</li>
                                <li>Suporte para múltiplas imagens</li>
                            </ul>

                            <h6 className="mt-3">Compatibilidade:</h6>
                            <ul>
                                <li><strong>Android:</strong> Chrome, Firefox, Samsung Internet</li>
                                <li><strong>iOS:</strong> Safari, Chrome</li>
                                <li><strong>Desktop:</strong> Fallback para seleção de arquivos</li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}