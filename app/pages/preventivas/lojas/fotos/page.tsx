// app/pages/preventivas/lojas/fotos/page.tsx
// Photo gallery organized by LUC and equipment type

"use client";

import { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button, Tabs, Tab, Badge, Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PreventivaPhotoViewer from "@/app/components/PreventivaPhotoViewer";

interface FotoGaleria {
    id: string;
    itemId: string;
    lojaLUC: string;
    lojaNome: string;
    tipoEquipamento: "SENSOR_TEMPERATURA" | "SENSOR_MOVIMENTO" | "BOTAO_PANICO" | "QUADRO_AUTOMACAO" | "OUTRO";
    url: string;
    descricao: string;
    dataCaptura: string;
    tecnico: string;
}

export default function GaleriaFotosLojas() {
    const router = useRouter();
    const [fotos, setFotos] = useState<FotoGaleria[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFoto, setSelectedFoto] = useState<FotoGaleria | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showPhotoViewer, setShowPhotoViewer] = useState(false);
    const [photosToView, setPhotosToView] = useState<FotoGaleria[]>([]);

    // Convert Windows path to API URL for serving
    const getPhotoUrl = (windowsPath: string) => {
        // Encode the Windows path for URL
        const encodedPath = encodeURIComponent(windowsPath);
        return `/api/preventivas/serve-photo?filepath=${encodedPath}`;
    };

    // Fetch real data from API
    useEffect(() => {
        const fetchFotos = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/preventivas/lojas/fotos?limit=100');

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setFotos(result.data);
                    } else {
                        console.error('API returned error:', result.error);
                    }
                } else {
                    console.error('Failed to fetch photos:', response.status);
                }
            } catch (error) {
                console.error('Error fetching photos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFotos();
    }, []);

    const getLUCs = () => {
        return Array.from(new Set(fotos.map(foto => foto.lojaLUC))).sort();
    };

    const getFotosPorLUC = (luc: string) => {
        return fotos.filter(foto => foto.lojaLUC === luc);
    };

    const getFotosPorTipo = (luc: string, tipo: FotoGaleria['tipoEquipamento']) => {
        return fotos.filter(foto => foto.lojaLUC === luc && foto.tipoEquipamento === tipo);
    };

    const getTipoBadge = (tipo: FotoGaleria['tipoEquipamento']) => {
        const config = {
            "SENSOR_TEMPERATURA": { variant: "info", text: "Temperatura", icon: "thermometer" },
            "SENSOR_MOVIMENTO": { variant: "warning", text: "Movimento", icon: "activity" },
            "BOTAO_PANICO": { variant: "danger", text: "Pânico", icon: "exclamation-triangle" },
            "QUADRO_AUTOMACAO": { variant: "primary", text: "Automação", icon: "cpu" },
            "OUTRO": { variant: "secondary", text: "Outro", icon: "question" }
        }[tipo];

        return (
            <Badge bg={config.variant} className="d-inline-flex align-items-center">
                <i className={`bi bi-${config.icon} me-1`}></i>
                {config.text}
            </Badge>
        );
    };

    const handleViewFoto = (foto: FotoGaleria) => {
        setSelectedFoto(foto);
        setShowModal(true);
    };

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-2">Carregando galeria de fotos...</p>
            </Container>
        );
    }

    if (fotos.length === 0) {
        return (
            <Container className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h3 mb-0">
                            <i className="bi bi-images me-2"></i>
                            Galeria de Fotos - Preventiva de Lojas
                        </h1>
                        <p className="text-muted mb-0">
                            Fotos organizadas por LUC e tipo de equipamento
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => router.push("/pages/preventivas/lojas")}>
                        <i className="bi bi-arrow-left me-1"></i>
                        Voltar
                    </Button>
                </div>

                <Card className="text-center py-5">
                    <Card.Body>
                        <i className="bi bi-image" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                        <h3 className="mt-3">Nenhuma foto encontrada</h3>
                        <p className="text-muted">
                            Ainda não há fotos registradas nas preventivas de lojas.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => router.push("/pages/preventivas/lojas")}
                            className="mt-3"
                        >
                            <i className="bi bi-plus-circle me-1"></i>
                            Registrar Nova Preventiva
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">
                        <i className="bi bi-images me-2"></i>
                        Galeria de Fotos - Preventiva de Lojas
                    </h1>
                    <p className="text-muted mb-0">
                        Fotos organizadas por LUC e tipo de equipamento
                    </p>
                </div>
                <Button variant="secondary" onClick={() => router.push("/pages/preventivas/lojas")}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                </Button>
            </div>

            <Tabs defaultActiveKey={getLUCs()[0]} className="mb-4">
                {getLUCs().map(luc => {
                    const fotosLUC = getFotosPorLUC(luc);
                    const lojaNome = fotosLUC[0]?.lojaNome || luc;

                    return (
                        <Tab
                            eventKey={luc}
                            title={
                                <span>
                                    <i className="bi bi-shop me-1"></i>
                                    {luc} ({fotosLUC.length} fotos)
                                </span>
                            }
                            key={luc}
                        >
                            <div className="mb-4">
                                <h4 className="d-flex align-items-center">
                                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                                    {lojaNome}
                                    <Badge bg="secondary" className="ms-2">
                                        {fotosLUC.length} fotos registradas
                                    </Badge>
                                </h4>
                            </div>

                            {/* Photos by Equipment Type */}
                            <Row>
                                {["SENSOR_TEMPERATURA", "SENSOR_MOVIMENTO", "BOTAO_PANICO", "QUADRO_AUTOMACAO"].map(tipo => {
                                    const fotosTipo = getFotosPorTipo(luc, tipo as FotoGaleria['tipoEquipamento']);
                                    if (fotosTipo.length === 0) return null;

                                    return (
                                        <Col md={6} lg={3} className="mb-4" key={tipo}>
                                            <Card>
                                                <Card.Header className="bg-light">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        {getTipoBadge(tipo as FotoGaleria['tipoEquipamento'])}
                                                        <Badge bg="secondary">{fotosTipo.length}</Badge>
                                                    </div>
                                                </Card.Header>
                                                <Card.Body>
                                                    <div className="d-grid gap-2">
                                                        {fotosTipo.slice(0, 2).map(foto => (
                                                            <div
                                                                key={foto.id}
                                                                className="position-relative cursor-pointer"
                                                                onClick={() => handleViewFoto(foto)}
                                                                style={{ height: '120px' }}
                                                            >
                                                                <Image
                                                                    src={getPhotoUrl(foto.url)}
                                                                    alt={foto.descricao}
                                                                    fill
                                                                    className="object-fit-cover rounded border"
                                                                    unoptimized={true}
                                                                    onError={(e) => {
                                                                        console.error('Error loading thumbnail:', foto.url);
                                                                        // Show placeholder on error
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.src = '/api/placeholder?width=200&height=120&text=Imagem+não+encontrada';
                                                                    }}
                                                                />
                                                                <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2 small">
                                                                    {new Date(foto.dataCaptura).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {fotosTipo.length > 2 && (
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // Filter photos for modal view
                                                                    setPhotosToView(fotosTipo);
                                                                    setShowPhotoViewer(true);
                                                                }}
                                                            >
                                                                <i className="bi bi-plus-circle me-1"></i>
                                                                +{fotosTipo.length - 2} fotos
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Tab>
                    );
                })}
            </Tabs>

            {/* Photo Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedFoto && (
                            <div>
                                <div className="d-flex align-items-center">
                                    {getTipoBadge(selectedFoto.tipoEquipamento)}
                                    <span className="ms-2">{selectedFoto.lojaLUC}</span>
                                </div>
                                <div className="small text-muted mt-1">
                                    {selectedFoto.lojaNome}
                                </div>
                            </div>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedFoto && (
                        <div>
                            <div className="position-relative mx-auto mb-3" style={{ width: '100%', height: '400px' }}>
                                <Image
                                    src={getPhotoUrl(selectedFoto.url)}
                                    alt={selectedFoto.descricao}
                                    fill
                                    className="object-fit-contain"
                                    unoptimized={true}
                                    onError={(e) => {
                                        console.error('Error loading photo detail:', selectedFoto.url);
                                        // Show placeholder on error
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/api/placeholder?width=400&height=300&text=Imagem+não+encontrada';
                                    }}
                                />
                            </div>
                            <h5>{selectedFoto.descricao}</h5>
                            <div className="d-flex justify-content-center gap-3 mt-3">
                                <span className="text-muted">
                                    <i className="bi bi-calendar me-1"></i>
                                    {new Date(selectedFoto.dataCaptura).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-muted">
                                    <i className="bi bi-person me-1"></i>
                                    {selectedFoto.tecnico}
                                </span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Photo Viewer Modal */}
            <PreventivaPhotoViewer
                fotos={photosToView}
                show={showPhotoViewer}
                onHide={() => setShowPhotoViewer(false)}
                titulo={`Fotos - ${photosToView.length > 0 ?
                    `${photosToView[0].lojaNome} (${photosToView[0].lojaLUC}) - ${photosToView[0].tipoEquipamento}` :
                    'Sem fotos'}`}
            />
        </Container>
    );
}