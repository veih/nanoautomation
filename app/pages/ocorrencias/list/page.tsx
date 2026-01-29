"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Alert, Tabs, Tab, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PdfOcorrenciasConcluidasButton from "@/app/components/PDFs/PdfOcorrenciasConcluidasButton";

interface Ocorrencia {
    id: string;
    descricao: string;
    solucao: string;
    colaborador: string;
    status: "ANDAMENTO" | "CONCLUIDO";
    createdAt: string;
    updatedAt: string;
    imagePaths?: string; // Add image paths property as string (JSON)
}

export default function OcorrenciasListPage() {
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completingOcorrencia, setCompletingOcorrencia] = useState<Ocorrencia | null>(null);
    const [solution, setSolution] = useState("");
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [images, setImages] = useState<Record<string, string[]>>({});
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [colaboradores, setColaboradores] = useState<string[]>([]);
    const [filtros, setFiltros] = useState({
        colaborador: "",
        dataInicio: "",
        dataFim: ""
    });
    const router = useRouter();

    // Ref to track processed speech results and prevent duplication
    const processedResultsRef = useRef<Set<string>>(new Set());

    // Check if browser supports speech recognition
    const isSpeechSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;

    const fetchOcorrencias = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/ocorrencias");
            if (!response.ok) {
                throw new Error("Falha ao carregar ocorrências");
            }
            const result = await response.json();

            // Handle the nested data structure
            let ocorrenciasData: Ocorrencia[] = [];
            if (result && result.data) {
                if (Array.isArray(result.data)) {
                    ocorrenciasData = result.data;
                } else if (result.data.data && Array.isArray(result.data.data)) {
                    ocorrenciasData = result.data.data;
                }
            }

            setOcorrencias(ocorrenciasData);

            // Extract unique collaborators for filter dropdown
            const colaboradoresUnicos = Array.from(
                new Set(ocorrenciasData.map(oc => oc.colaborador))
            ).filter((colab): colab is string => typeof colab === 'string');
            setColaboradores(colaboradoresUnicos);

            // Initialize images state with existing image paths from database
            const initialImages: Record<string, string[]> = {};
            ocorrenciasData.forEach(ocorrencia => {
                // Try to parse imagePaths from the occurrence data
                if (ocorrencia.imagePaths) {
                    try {
                        const parsedPaths = JSON.parse(ocorrencia.imagePaths);
                        if (Array.isArray(parsedPaths)) {
                            initialImages[ocorrencia.id] = parsedPaths;
                        } else {
                            initialImages[ocorrencia.id] = [];
                        }
                    } catch {
                        // If parsing fails, initialize with empty array
                        initialImages[ocorrencia.id] = [];
                    }
                } else {
                    initialImages[ocorrencia.id] = [];
                }
            });
            setImages(initialImages);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOcorrencias();
    }, []);

    const handleComplete = (ocorrencia: Ocorrencia) => {
        setCompletingOcorrencia(ocorrencia);
        setSolution(ocorrencia.solucao || "");
        setUpdateError(null);
        setIsListening(false);
    };

    const confirmComplete = async () => {
        if (!completingOcorrencia || !solution.trim()) {
            setUpdateError("Solução é obrigatória");
            return;
        }

        try {
            setUpdating(true);

            // Update the existing occurrence to mark as completed using the new endpoint
            const response = await fetch(`/api/ocorrencias/${completingOcorrencia.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    solucao: solution,
                    imagePaths: images[completingOcorrencia.id] || []
                }),
            });

            if (!response.ok) {
                throw new Error("Falha ao completar ocorrência");
            }

            // Refresh the list
            await fetchOcorrencias();
            setCompletingOcorrencia(null);
            setSolution("");
        } catch (err) {
            setUpdateError(err instanceof Error ? err.message : "Erro ao completar ocorrência");
        } finally {
            setUpdating(false);
        }
    };

    // Speech recognition functionality
    const toggleSpeechRecognition = () => {
        if (!isSpeechSupported) return;

        if (isListening) {
            // Stop listening
            if (window.hasOwnProperty('webkitSpeechRecognition')) {
                const SpeechRecognition = (window as { webkitSpeechRecognition: new () => { stop: () => void } }).webkitSpeechRecognition;
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.stop();
            }
            setIsListening(false);
            // Clear processed results when stopping
            processedResultsRef.current.clear();
        } else {
            // Start listening
            const SpeechRecognition = (window as { webkitSpeechRecognition: new () => unknown }).webkitSpeechRecognition;
            const recognition = new SpeechRecognition() as unknown as {
                continuous: boolean;
                interimResults: boolean;
                lang: string;
                onresult: (event: unknown) => void;
                onerror: (event: unknown) => void;
                onend: () => void;
                start: () => void
            };
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'pt-BR';

            // Track the last result index to avoid processing the same results multiple times
            let lastResultIndex = 0;

            recognition.onresult = (event: unknown) => {
                const speechEvent = event as { resultIndex: number; results: { isFinal: boolean;[index: number]: { transcript: string } }[] };

                // Only process new results that haven't been processed before
                if (speechEvent.resultIndex >= lastResultIndex) {
                    let finalTranscript = '';

                    // Process only final results to avoid duplication
                    for (let i = Math.max(speechEvent.resultIndex, lastResultIndex); i < speechEvent.results.length; i++) {
                        if (speechEvent.results[i].isFinal) {
                            finalTranscript += speechEvent.results[i][0].transcript + ' ';
                        }
                    }

                    // Update the last result index
                    lastResultIndex = speechEvent.resultIndex + speechEvent.results.length;

                    // If we have a final transcript, append it to the solution
                    if (finalTranscript.trim()) {
                        setSolution((prev) => prev + (prev ? ' ' : '') + finalTranscript.trim());
                    }
                }
            };

            recognition.onerror = (event: unknown) => {
                const errorEvent = event as { error: string };
                console.error('Speech recognition error', errorEvent.error);
                setIsListening(false);
                // Reset the last result index on error
                lastResultIndex = 0;
            };

            recognition.onend = () => {
                setIsListening(false);
                // Reset the last result index when recognition ends
                lastResultIndex = 0;
            };

            recognition.start();
            setIsListening(true);
            // Clear the solution when starting speech recognition for a clean slate
            setSolution("");
        }
    };

    // Function to handle filter changes
    const handleFiltroChange = (campo: string, valor: string) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Function to clear filters
    const limparFiltros = () => {
        setFiltros({
            colaborador: "",
            dataInicio: "",
            dataFim: ""
        });
    };

    // Apply filters to occurrences
    const aplicarFiltros = (ocorrencias: Ocorrencia[]) => {
        return ocorrencias.filter(ocorrencia => {
            // Filter by collaborator
            if (filtros.colaborador && ocorrencia.colaborador !== filtros.colaborador) {
                return false;
            }

            // Filter by date range
            const dataOcorrencia = new Date(ocorrencia.createdAt);
            
            if (filtros.dataInicio) {
                const dataInicio = new Date(filtros.dataInicio);
                if (dataOcorrencia < dataInicio) {
                    return false;
                }
            }
            
            if (filtros.dataFim) {
                // Add one day to include the entire end date
                const dataFim = new Date(filtros.dataFim);
                dataFim.setDate(dataFim.getDate() + 1);
                if (dataOcorrencia >= dataFim) {
                    return false;
                }
            }

            return true;
        });
    };

    // Filter occurrences by status and apply search filters
    const ocorrenciasAndamento = aplicarFiltros(ocorrencias.filter(oc => oc.status === "ANDAMENTO"));
    const ocorrenciasConcluidas = aplicarFiltros(ocorrencias.filter(oc => oc.status === "CONCLUIDO"));

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to handle image selection/capture
    const handleImageCapture = async (ocorrenciaId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target?.result as string;

            try {
                // Upload image to server
                const response = await fetch('/api/ocorrencias/upload-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ocorrenciaId,
                        imageData,
                        imageIndex: images[ocorrenciaId]?.length || 0
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    // Update local state with new image
                    const newImages = [...(images[ocorrenciaId] || []), result.imageUrl];
                    setImages(prev => ({
                        ...prev,
                        [ocorrenciaId]: newImages
                    }));

                    // Update image paths in backend
                    await fetch(`/api/ocorrencias/update-images?id=${ocorrenciaId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            imagePaths: newImages
                        }),
                    });
                } else {
                    setUpdateError(result.error || 'Failed to upload image');
                }
            } catch (err) {
                setUpdateError('Failed to upload image');
                console.error('Error uploading image:', err);
            }
        };
        reader.readAsDataURL(file);

        // Reset input
        event.target.value = '';
    };

    // Function to open image in fullscreen
    const openFullscreenImage = (imageUrl: string) => {
        // Add some debugging
        console.log('Opening image:', imageUrl);
        if (!imageUrl) {
            console.error('No image URL provided');
            return;
        }
        setFullscreenImage(imageUrl);
    };

    // Function to close fullscreen image
    const closeFullscreenImage = () => {
        setFullscreenImage(null);
    };

    return (
        <div className="container-fluid py-4">
            <Card className="shadow mb-4">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        <i className="bi bi-list-check me-2"></i>
                        Lista de Ocorrências
                    </h4>
                    <div className="d-flex gap-2">
                        <PdfOcorrenciasConcluidasButton />
                        <Button
                            variant="light"
                            onClick={() => router.push('/pages/ocorrencias')}
                        >
                            <i className="bi bi-plus-circle me-1"></i>
                            Nova Ocorrência
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                            <p className="mt-2">Carregando ocorrências...</p>
                        </div>
                    ) : (
                        <>
                            {/* Filtros */}
                            <Card className="mb-3">
                                <Card.Header className="bg-light">
                                    <h6 className="mb-0">
                                        <i className="bi bi-funnel me-2"></i>
                                        Filtros de Pesquisa
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={4} className="mb-3">
                                            <Form.Label>Colaborador</Form.Label>
                                            <Form.Select
                                                value={filtros.colaborador}
                                                onChange={(e) => handleFiltroChange("colaborador", e.target.value)}
                                            >
                                                <option value="">Todos os colaboradores</option>
                                                {colaboradores.map((colaborador, index) => (
                                                    <option key={index} value={colaborador}>
                                                        {colaborador}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Form.Label>Data de Início</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filtros.dataInicio}
                                                onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
                                            />
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Form.Label>Data de Fim</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filtros.dataFim}
                                                onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-end">
                                        <Button variant="secondary" onClick={limparFiltros}>
                                            <i className="bi bi-x-circle me-1"></i>
                                            Limpar Filtros
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Tabs defaultActiveKey="andamento" id="ocorrencias-tabs" className="mb-3">
                                <Tab eventKey="andamento" title={
                                    <span>
                                        Em Andamento <Badge bg="primary">{ocorrenciasAndamento.length}</Badge>
                                    </span>
                                }>
                                    {ocorrenciasAndamento.length > 0 ? (
                                        <div className="table-responsive">
                                            <Table striped bordered hover>
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Data</th>
                                                        <th>Descrição</th>
                                                        <th>Colaborador</th>
                                                        <th>Solução</th>
                                                        <th>Imagens</th>
                                                        <th>Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ocorrenciasAndamento.map((ocorrencia) => (
                                                        <tr key={ocorrencia.id}>
                                                            <td>{formatDate(ocorrencia.createdAt)}</td>
                                                            <td>{ocorrencia.descricao}</td>
                                                            <td>{ocorrencia.colaborador}</td>
                                                            <td>{ocorrencia.solucao || "-"}</td>
                                                            <td>
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    {images[ocorrencia.id]?.map((image, index) => (
                                                                        <div key={index} className="position-relative">
                                                                            <div
                                                                                style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                                                                                className="rounded border"
                                                                                onClick={() => openFullscreenImage(image)}
                                                                            >
                                                                                <Image
                                                                                    src={image}
                                                                                    alt={`Ocorrência ${index + 1}`}
                                                                                    width={50}
                                                                                    height={50}
                                                                                    style={{ objectFit: 'cover' }}
                                                                                    onError={() => {
                                                                                        console.error('Error loading image:', image);
                                                                                        // Optionally set a default image
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        capture="environment"
                                                                        className="d-none"
                                                                        id={`imageCapture-${ocorrencia.id}`}
                                                                        onChange={(e) => handleImageCapture(ocorrencia.id, e)}
                                                                    />
                                                                    <label
                                                                        htmlFor={`imageCapture-${ocorrencia.id}`}
                                                                        className="btn btn-outline-primary btn-sm"
                                                                    >
                                                                        <i className="bi bi-camera"></i>
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    onClick={() => handleComplete(ocorrencia)}
                                                                >
                                                                    <i className="bi bi-check-circle me-1"></i>
                                                                    Concluir
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <Alert variant="info" className="text-center">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Nenhuma ocorrência em andamento encontrada.
                                        </Alert>
                                    )}
                                </Tab>
                                <Tab eventKey="concluidas" title={
                                    <span>
                                        Concluídas <Badge bg="success">{ocorrenciasConcluidas.length}</Badge>
                                    </span>
                                }>
                                    {ocorrenciasConcluidas.length > 0 ? (
                                        <div className="table-responsive">
                                            <Table striped bordered hover>
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Data</th>
                                                        <th>Descrição</th>
                                                        <th>Colaborador</th>
                                                        <th>Solução</th>
                                                        <th>Imagens</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ocorrenciasConcluidas.map((ocorrencia) => (
                                                        <tr key={ocorrencia.id}>
                                                            <td>{formatDate(ocorrencia.createdAt)}</td>
                                                            <td>{ocorrencia.descricao}</td>
                                                            <td>{ocorrencia.colaborador}</td>
                                                            <td>{ocorrencia.solucao}</td>
                                                            <td>
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    {images[ocorrencia.id]?.map((image, index) => (
                                                                        <div key={index} className="position-relative">
                                                                            <div
                                                                                style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                                                                                className="rounded border"
                                                                                onClick={() => openFullscreenImage(image)}
                                                                            >
                                                                                <Image
                                                                                    src={image}
                                                                                    alt={`Ocorrência ${index + 1}`}
                                                                                    width={50}
                                                                                    height={50}
                                                                                    style={{ objectFit: 'cover' }}
                                                                                    onError={() => {
                                                                                        console.error('Error loading image:', image);
                                                                                        // Optionally set a default image
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <Alert variant="info" className="text-center">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Nenhuma ocorrência concluída encontrada.
                                        </Alert>
                                    )}
                                </Tab>
                            </Tabs>
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Modal para concluir ocorrência */}
            <Modal show={!!completingOcorrencia} onHide={() => setCompletingOcorrencia(null)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        <i className="bi bi-check-circle me-2"></i>
                        Concluir Ocorrência
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {completingOcorrencia && (
                        <div className="mb-3">
                            <h6>Descrição:</h6>
                            <p>{completingOcorrencia.descricao}</p>
                            <h6>Colaborador:</h6>
                            <p>{completingOcorrencia.colaborador}</p>
                        </div>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Solução <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="d-flex">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                placeholder="Descreva a solução aplicada..."
                                required
                                className="me-2"
                            />
                            {isSpeechSupported && (
                                <Button
                                    variant={isListening ? "danger" : "primary"}
                                    onClick={toggleSpeechRecognition}
                                    disabled={!isSpeechSupported}
                                    className="d-flex align-items-center"
                                >
                                    <i className={`bi ${isListening ? "bi-mic-mute" : "bi-mic"} me-1`}></i>
                                    {isListening ? "Parar" : "Falar"}
                                </Button>
                            )}
                        </div>
                        {isListening && (
                            <div className="mt-2">
                                <span className="badge bg-success">
                                    <i className="bi bi-mic me-1"></i>
                                    Ouvindo...
                                </span>
                            </div>
                        )}
                        {!isSpeechSupported && (
                            <Alert variant="warning" className="mt-2 p-2">
                                <small>
                                    Seu navegador não suporta reconhecimento de voz
                                </small>
                            </Alert>
                        )}
                    </Form.Group>
                    {updateError && (
                        <Alert variant="danger">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {updateError}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setCompletingOcorrencia(null)}
                        disabled={updating}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        onClick={confirmComplete}
                        disabled={updating || !solution.trim()}
                    >
                        {updating ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-1"></i>
                                Concluir
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Fullscreen Image Modal */}
            <Modal
                show={!!fullscreenImage}
                onHide={closeFullscreenImage}
                centered
                size="lg"
                dialogClassName="modal-90w"
            >
                <Modal.Header closeButton className="bg-dark">
                    <Modal.Title className="text-white">
                        <i className="bi bi-image me-2"></i>
                        Visualização da Imagem
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0 bg-dark d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
                    {fullscreenImage && (
                        <div style={{
                            maxHeight: '70vh',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            borderRadius: '4px'
                        }}>
                            <Image
                                src={fullscreenImage}
                                alt="Fullscreen view"
                                width={800}
                                height={600}
                                style={{
                                    maxHeight: '70vh',
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-dark">
                    <Button variant="secondary" onClick={closeFullscreenImage}>
                        <i className="bi bi-x-circle me-1"></i>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}