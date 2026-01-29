// app/components/PreventivaPhotoViewer.tsx
// Component for viewing photos from preventive maintenance stored in C:\preventivas

import { useState } from "react";
import { Modal, Button, Carousel } from "react-bootstrap";
import Image from "next/image";

interface FotoPreventiva {
    id: string;
    itemId: string;
    lojaLUC: string;
    tipoEquipamento: string;
    url: string; // Now contains full Windows path
    descricao: string;
    dataCaptura: string;
    tecnico: string;
}

interface PhotoViewerProps {
    fotos: FotoPreventiva[];
    show: boolean;
    onHide: () => void;
    titulo?: string;
}

export default function PreventivaPhotoViewer({
    fotos,
    show,
    onHide,
    titulo = "Fotos da Preventiva"
}: PhotoViewerProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Convert Windows path to API URL for serving
    const getPhotoUrl = (windowsPath: string) => {
        // Encode the Windows path for URL
        const encodedPath = encodeURIComponent(windowsPath);
        return `/api/preventivas/serve-photo?filepath=${encodedPath}`;
    };

    if (fotos.length === 0) {
        return (
            <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{titulo}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-5">
                    <i className="bi bi-image" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <p className="mt-3 text-muted">Nenhuma foto registrada para esta preventiva</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Fechar</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-images me-2"></i>
                    {titulo} ({fotos.length} fotos)
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Carousel
                    activeIndex={activeIndex}
                    onSelect={setActiveIndex}
                    interval={null}
                    indicators={true}
                    controls={fotos.length > 1}
                >
                    {fotos.map((foto, index) => (
                        <Carousel.Item key={foto.id}>
                            <div className="d-flex flex-column align-items-center">
                                <div className="position-relative" style={{ width: '100%', height: '500px' }}>
                                    <Image
                                        src={getPhotoUrl(foto.url)}
                                        alt={foto.descricao}
                                        fill
                                        className="object-fit-contain"
                                        unoptimized={true}
                                        onError={(e) => {
                                            console.error('Error loading image:', foto.url);
                                            // Show placeholder on error
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/api/placeholder?width=400&height=300&text=Imagem+não+encontrada';
                                        }}
                                    />
                                </div>
                                <div className="mt-3 text-center w-100">
                                    <h5>{foto.descricao}</h5>
                                    <div className="d-flex justify-content-center gap-3 text-muted small">
                                        <span>
                                            <i className="bi bi-geo-alt me-1"></i>
                                            {foto.lojaLUC}
                                        </span>
                                        <span>
                                            <i className="bi bi-tag me-1"></i>
                                            {foto.tipoEquipamento}
                                        </span>
                                        <span>
                                            <i className="bi bi-calendar me-1"></i>
                                            {new Date(foto.dataCaptura).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span>
                                            <i className="bi bi-person me-1"></i>
                                            {foto.tecnico}
                                        </span>
                                    </div>
                                    <p className="text-muted small mt-2">
                                        Foto {index + 1} de {fotos.length}
                                    </p>
                                    <div className="small text-muted">
                                        <i className="bi bi-folder me-1"></i>
                                        Local: {foto.url}
                                    </div>
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    <i className="bi bi-x-lg me-1"></i>
                    Fechar
                </Button>
                {fotos.length > 1 && (
                    <>
                        <Button
                            variant="outline-primary"
                            onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : fotos.length - 1))}
                            disabled={activeIndex === 0}
                        >
                            <i className="bi bi-arrow-left"></i>
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={() => setActiveIndex((prev) => (prev < fotos.length - 1 ? prev + 1 : 0))}
                            disabled={activeIndex === fotos.length - 1}
                        >
                            <i className="bi bi-arrow-right"></i>
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
}