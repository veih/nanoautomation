"use client";

import { useState, useEffect } from "react";
import "@/app/globals.css";
import { Card, Container, Row, Col, Button, Table, Modal, Form, Badge } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PreventivaPhotoViewer from "@/app/components/PreventivaPhotoViewer";
import { useNativeCamera } from "@/app/hooks/useNativeCamera";
import { Loja } from "@/types";

interface PreventivaLoja {
    id: string;
    lojaId: string;
    lojaNome: string;
    lojaLUC: string;
    dataAgendada: string;
    dataExecucao?: string;
    status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
    tecnico?: string;
    checklist: ChecklistItem[];
    fotos: FotoPreventiva[];
    observacoes?: string;
}

interface FotoPreventiva {
    id: string;
    itemId: string;
    lojaLUC: string;  // Added LUC identification
    tipoEquipamento: "SENSOR_TEMPERATURA" | "SENSOR_MOVIMENTO" | "BOTAO_PANICO" | "QUADRO_AUTOMACAO" | "OUTRO";
    url: string;
    descricao: string;
    mimeType?: string;  // MIME type for better file handling
    fileSize?: number;  // File size in bytes for metadata
    dataCaptura: string;
    tecnico: string;
}

interface ChecklistItem {
    id: string;
    categoria: "SENSOR" | "EQUIPAMENTO" | "GERAL";
    tipoEquipamento?: "SENSOR_TEMPERATURA" | "SENSOR_MOVIMENTO" | "BOTAO_PANICO" | "QUADRO_AUTOMACAO";
    descricao: string;
    concluido: boolean;
    observacao?: string;
    fotoObrigatoria: boolean; // Whether a photo is mandatory for this item
    fotoCapturada: boolean;
    lucReferencia?: string; // LUC where this item should be checked
}

// Interface for creating checklist items (without ID, as Prisma will auto-generate it)
interface ChecklistItemCreateInput {
    categoria: "SENSOR" | "EQUIPAMENTO" | "GERAL";
    tipoEquipamento?: "SENSOR_TEMPERATURA" | "SENSOR_MOVIMENTO" | "BOTAO_PANICO" | "QUADRO_AUTOMACAO";
    descricao: string;
    concluido: boolean;
    observacao?: string;
    fotoObrigatoria: boolean;
    fotoCapturada: boolean;
    lucReferencia?: string;
}

export default function PreventivaLojasPage() {
    const router = useRouter();
    const [preventivas, setPreventivas] = useState<PreventivaLoja[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPreventiva, setSelectedPreventiva] = useState<PreventivaLoja | null>(null);
    const [savedWorkInProgress, setSavedWorkInProgress] = useState<Record<string, PreventivaLoja>>(() => {
        // Load saved work from localStorage on initial render
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('preventivaWorkInProgress');
                return saved ? JSON.parse(saved) : {};
            } catch (error) {
                console.error('Error loading saved work from localStorage:', error);
                return {};
            }
        }
        return {};
    });
    const [currentItem, setCurrentItem] = useState<ChecklistItem | null>(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [showPhotoViewer, setShowPhotoViewer] = useState(false);
    const [photosToView, setPhotosToView] = useState<FotoPreventiva[]>([]);
    const [currentPreventivaForPhotos, setCurrentPreventivaForPhotos] = useState<PreventivaLoja | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [lojas, setLojas] = useState<Loja[]>([]);
    const [filteredLojas, setFilteredLojas] = useState<Loja[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        lojaId: '',
        lojaLUC: '',
        lojaNome: '',
        dataAgendada: '',
        tecnico: '',
        observacoes: ''
    });

    // Initialize camera hook for mobile photo capture
    const {
        fileInputRef,
        // capturedImages, // Not currently used
        previewImages,
        error: cameraError,
        isCapturing,
        triggerCamera,
        handleFileChange,
        clearAllImages
    } = useNativeCamera({
        maxImages: 1,
        onImagesCaptured: (images) => {
            if (images.length > 0 && currentItem && selectedPreventiva) {
                savePhotoWithImageData(images[0]);
            }
        },
        autoCompress: true,
        maxWidth: 1920,
        quality: 0.8
    });

    // Enhanced checklist with LUC-specific items and photo types
    const checklistTemplate: ChecklistItem[] = [
        // Temperature Sensors (2 items)
        {
            id: "temp-001",
            categoria: "SENSOR",
            tipoEquipamento: "SENSOR_TEMPERATURA",
            descricao: "Verificar funcionamento e calibração do sensor de temperatura ambiente",
            concluido: false,
            fotoObrigatoria: false,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        },
        {
            id: "temp-002",
            categoria: "SENSOR",
            tipoEquipamento: "SENSOR_TEMPERATURA",
            descricao: "Inspeção visual do sensor de temperatura",
            concluido: false,
            fotoObrigatoria: true,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        },

        // Motion Sensors (2 items)
        {
            id: "mov-001",
            categoria: "SENSOR",
            tipoEquipamento: "SENSOR_MOVIMENTO",
            descricao: "Testar detecção e sensibilidade do sensor de movimento",
            concluido: false,
            fotoObrigatoria: false,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        },
        {
            id: "mov-002",
            categoria: "SENSOR",
            tipoEquipamento: "SENSOR_MOVIMENTO",
            descricao: "Verificar ângulo de cobertura do sensor de movimento",
            concluido: false,
            fotoObrigatoria: true,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        },

        // Panic Buttons (2 items)
        {
            id: "panico-001",
            categoria: "SENSOR",
            tipoEquipamento: "BOTAO_PANICO",
            descricao: "Testar acionamento e resposta do sistema do botão de pânico",
            concluido: false,
            fotoObrigatoria: true,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        },
        {
            id: "panico-002",
            categoria: "SENSOR",
            tipoEquipamento: "BOTAO_PANICO",
            descricao: "Verificar sinalização e acessibilidade do botão de pânico",
            concluido: false,
            fotoObrigatoria: true,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        },

        // Automation Panel (3 items)
        {
            id: "quadro-001",
            categoria: "EQUIPAMENTO",
            tipoEquipamento: "QUADRO_AUTOMACAO",
            descricao: "Inspeção geral e limpeza do quadro de automação",
            concluido: false,
            fotoObrigatoria: true,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        },
        {
            id: "quadro-002",
            categoria: "EQUIPAMENTO",
            tipoEquipamento: "QUADRO_AUTOMACAO",
            descricao: "Verificar cabos e conexões do quadro de automação",
            concluido: false,
            fotoObrigatoria: true,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        },
        {
            id: "quadro-003",
            categoria: "EQUIPAMENTO",
            tipoEquipamento: "QUADRO_AUTOMACAO",
            descricao: "Testar funcionamento dos KRON do quadro de automação",
            concluido: false,
            fotoObrigatoria: true,
            fotoCapturada: false,
            lucReferencia: "" // Will be set per LUC
        }
    ];

    // Load preventives from database
    useEffect(() => {
        const loadPreventivas = async () => {
            try {
                const response = await fetch('/api/preventivas/lojas');
                if (response.ok) {
                    const result = await response.json();
                    setPreventivas(result.data || []);
                } else {
                    // Fallback to mock data if API fails
                    console.warn('Failed to load from API, using mock data');
                    const mockData: PreventivaLoja[] = [

                    ];
                    setPreventivas(mockData);
                }
            } catch (error) {
                console.error('Error loading preventives:', error);
                // Use mock data as fallback
                const mockData: PreventivaLoja[] = [

                ];
                setPreventivas(mockData);
            } finally {
                setLoading(false);
            }
        };

        loadPreventivas();
    }, []);

    // Load stores for creation form
    useEffect(() => {
        const loadLojas = async () => {
            try {
                // Try /api/lojas first (as requested)
                let response = await fetch('/api/lojas');
                let result;

                if (response.ok) {
                    result = await response.json();
                    // Check if the response has the expected structure
                    if (result.lojas) {
                        setLojas(result.lojas);
                        setFilteredLojas(result.lojas);
                        return;
                    } else if (Array.isArray(result)) {
                        // If it's a direct array of stores
                        setLojas(result);
                        setFilteredLojas(result);
                        return;
                    }
                }

                // Fallback to /api/lojasApi/lojas if /api/lojas doesn't work
                console.warn('Failed to load from /api/lojas, trying /api/lojasApi/lojas');
                response = await fetch('/api/lojasApi/lojas');
                if (response.ok) {
                    result = await response.json();
                    setLojas(result.lojas || []);
                    setFilteredLojas(result.lojas || []);
                } else {
                    console.error('Failed to load stores from both endpoints');
                }
            } catch (error) {
                console.error('Error loading stores:', error);
            }
        };

        loadLojas();
    }, []);

    // Sync saved work with localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('preventivaWorkInProgress', JSON.stringify(savedWorkInProgress));
            } catch (error) {
                console.error('Error saving work to localStorage:', error);
            }
        }
    }, [savedWorkInProgress]);

    // Filter stores based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredLojas(lojas);
        } else {
            const filtered = lojas.filter(loja =>
                loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loja.LUC.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLojas(filtered);
        }
    }, [searchTerm, lojas]);

    const handleExecutePreventiva = (preventiva: PreventivaLoja) => {
        // Check if there's saved work in progress for this preventiva
        const savedWork = savedWorkInProgress[preventiva.id];
        if (savedWork) {
            // Restore saved work
            setSelectedPreventiva(savedWork);
        } else {
            // Use original preventiva
            setSelectedPreventiva(preventiva);
        }
        setShowModal(true);
    };

    const handleItemCheck = async (itemId: string) => {
        if (selectedPreventiva) {
            const updatedChecklist = selectedPreventiva.checklist.map(item =>
                item.id === itemId ? { ...item, concluido: !item.concluido } : item
            );

            const updatedPreventiva = { ...selectedPreventiva, checklist: updatedChecklist };
            setSelectedPreventiva(updatedPreventiva);

            // Update in main state
            const updatedPreventivas = preventivas.map(p =>
                p.id === selectedPreventiva.id ? updatedPreventiva : p
            );
            setPreventivas(updatedPreventivas);

            try {
                // Save checklist update to database
                const response = await fetch(`/api/preventivas/lojas/${selectedPreventiva.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: selectedPreventiva.id,
                        checklist: updatedChecklist
                    })
                });

                if (response.ok) {
                    console.log("Checklist item updated in database");
                } else {
                    console.warn("Failed to update checklist item in database");
                }
            } catch (error) {
                console.error("Error updating checklist:", error);
                // Continue with local update
            }
        }
    };

    const handleTakePhoto = (item: ChecklistItem) => {
        setCurrentItem(item);
        // Clear any previous images
        clearAllImages();
        setShowCameraModal(true);
    };

    const savePhotoWithImageData = async (imageData: string) => {
        if (currentItem && selectedPreventiva) {
            // Map tipoEquipamento
            const tipoEquipamentoMap: Record<string, FotoPreventiva['tipoEquipamento']> = {
                "SENSOR_TEMPERATURA": "SENSOR_TEMPERATURA",
                "SENSOR_MOVIMENTO": "SENSOR_MOVIMENTO",
                "BOTAO_PANICO": "BOTAO_PANICO",
                "QUADRO_AUTOMACAO": "QUADRO_AUTOMACAO"
            };

            const tipoEquipamento = currentItem.tipoEquipamento ?
                tipoEquipamentoMap[currentItem.tipoEquipamento] || "OUTRO" : "OUTRO";

            try {
                // Save photo to filesystem (C:\preventivas)
                console.log(`Uploading photo for item ${currentItem.id} to LUC ${selectedPreventiva.lojaLUC}`);

                const uploadPayload = {
                    imageData: imageData,
                    lojaLUC: selectedPreventiva.lojaLUC,
                    itemId: currentItem.id,
                    tipoEquipamento: tipoEquipamento,
                    descricao: `${currentItem.descricao} - ${selectedPreventiva.lojaLUC}`
                };

                console.log("Upload payload:", {
                    ...uploadPayload,
                    imageData: uploadPayload.imageData.substring(0, 50) + '...' // Truncate for logging
                });

                const uploadResponse = await fetch('/api/preventivas/lojas/upload-photo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(uploadPayload)
                });

                let photoUrl = imageData; // fallback to base64
                let fileInfo = null;

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    photoUrl = uploadResult.data.filepath; // Use filepath instead of fileUrl
                    fileInfo = uploadResult.data;
                    console.log("Photo saved to filesystem:", {
                        ...fileInfo,
                        filepath: fileInfo.filepath.substring(0, 50) + '...'
                    });
                } else {
                    const errorResult = await uploadResponse.json();
                    console.error("Failed to save photo to filesystem:", errorResult);
                    toast.error(`Erro ao salvar foto no sistema: ${errorResult.error}`);
                    return; // Stop execution if file save fails
                }

                // Create photo record with filesystem path and metadata
                const newFoto: FotoPreventiva = {
                    id: `foto-${Date.now()}`,
                    itemId: currentItem.id,
                    lojaLUC: selectedPreventiva.lojaLUC,
                    tipoEquipamento: tipoEquipamento,
                    url: photoUrl, // This will be Windows path
                    descricao: `${currentItem.descricao} - ${selectedPreventiva.lojaLUC}`,
                    mimeType: fileInfo?.mimeType || 'image/jpeg',
                    fileSize: fileInfo?.fileSize || 0,
                    dataCaptura: new Date().toISOString(),
                    tecnico: "Técnico Atual"
                };

                // Update item status
                const updatedChecklist = selectedPreventiva.checklist.map(item =>
                    item.id === currentItem.id ? { ...item, fotoCapturada: true } : item
                );

                // Add photo to preventiva
                const updatedFotos = [...selectedPreventiva.fotos, newFoto];
                const updatedPreventiva = {
                    ...selectedPreventiva,
                    checklist: updatedChecklist,
                    fotos: updatedFotos
                };

                setSelectedPreventiva(updatedPreventiva);

                // Update in main state
                const updatedPreventivas = preventivas.map(p =>
                    p.id === selectedPreventiva.id ? updatedPreventiva : p
                );
                setPreventivas(updatedPreventivas);

                // Also save photo metadata to database with additional fields
                const photoMetadata = {
                    preventivaLojaId: selectedPreventiva.id,
                    itemId: currentItem.id,
                    lojaLUC: selectedPreventiva.lojaLUC,
                    tipoEquipamento: tipoEquipamento,
                    url: photoUrl,
                    descricao: `${currentItem.descricao} - ${selectedPreventiva.lojaLUC}`,
                    mimeType: fileInfo?.mimeType || 'image/jpeg',
                    fileSize: fileInfo?.fileSize || 0,
                    dataCaptura: new Date().toISOString(),
                    tecnico: "Técnico Atual"
                };

                const photoPayload = {
                    id: selectedPreventiva.id,
                    fotos: [photoMetadata]
                };

                console.log("Sending photo metadata to database:", {
                    ...photoMetadata,
                    url: photoMetadata.url.substring(0, 50) + '...'
                });

                try {
                    const dbResponse = await fetch(`/api/preventivas/lojas/${selectedPreventiva.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(photoPayload)
                    });

                    if (dbResponse.ok) {
                        const dbResult = await dbResponse.json();
                        console.log("Photo metadata saved to database successfully:", dbResult);
                        toast.success(`Foto salva com sucesso no banco de dados!`);
                    } else {
                        const errorResult = await dbResponse.json();
                        console.error("Failed to save photo metadata to database:", errorResult);
                        toast.warn(`Foto salva localmente mas falhou ao salvar no banco: ${errorResult.error}`);
                    }
                } catch (dbError) {
                    console.error("Database error when saving photo metadata:", dbError);
                    toast.warn("Foto salva localmente mas erro ao conectar com o banco de dados");
                }

                toast.success(`Foto capturada e salva em C:\\preventivas\\${selectedPreventiva.lojaLUC}!`);
                setShowCameraModal(false);
                setCurrentItem(null);

            } catch (error) {
                console.error("Error saving photo:", error);
                toast.error("Erro ao salvar foto no sistema de arquivos");
            }
        }
    };

    // const handleSavePhoto = () => {
    //     // This function was previously used for simulating photo capture
    //     // but is now replaced by savePhotoWithImageData which handles actual image data
    // };

    const handleSaveExecution = async () => {
        if (selectedPreventiva) {
            console.log("Attempting to save execution...");
            console.log("Selected preventiva:", selectedPreventiva);
            console.log("Completed items:", selectedPreventiva.checklist.filter(item => item.concluido).length);
            console.log("Items with mandatory photos:", selectedPreventiva.checklist.filter(item => item.fotoObrigatoria && item.concluido).length);
            console.log("Photos captured:", selectedPreventiva.checklist.filter(item => item.fotoObrigatoria && item.fotoCapturada).length);

            // Check if at least one item is completed
            const completedItems = selectedPreventiva.checklist.filter(item => item.concluido);
            if (completedItems.length === 0) {
                toast.error("Complete pelo menos um item do checklist antes de concluir!");
                return;
            }

            // Check if all completed items that require photos have them captured
            const itensComFotoObrigatoria = completedItems.filter(item => item.fotoObrigatoria);
            const fotosCapturadas = itensComFotoObrigatoria.filter(item => item.fotoCapturada).length;

            console.log("Required photos for completed items:", itensComFotoObrigatoria.length);
            console.log("Captured photos:", fotosCapturadas);

            if (fotosCapturadas < itensComFotoObrigatoria.length) {
                toast.error("Todas as fotos obrigatórias dos itens concluídos devem ser capturadas antes de concluir!");
                return;
            }

            try {
                // Prepare data for API
                const updateData = {
                    id: selectedPreventiva.id,
                    status: "CONCLUIDA",
                    dataExecucao: new Date().toISOString().split('T')[0],
                    tecnico: "Técnico Atual", // This would come from auth context in real app
                    checklist: selectedPreventiva.checklist,
                    fotos: selectedPreventiva.fotos,
                    observacoes: selectedPreventiva.observacoes
                };

                // Save to database
                const response = await fetch(`/api/preventivas/lojas/${selectedPreventiva.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Successfully saved to database:", result);

                    // Update local state
                    const updatedPreventivas = preventivas.map(p =>
                        p.id === selectedPreventiva.id
                            ? { ...result.data, checklist: result.data.checklist || p.checklist, fotos: result.data.fotos || p.fotos }
                            : p
                    );
                    setPreventivas(updatedPreventivas);

                    toast.success("Preventiva concluída e salva com sucesso!");
                    // Clear saved work since it's been properly saved
                    if (selectedPreventiva) {
                        setSavedWorkInProgress(prev => {
                            const newSaved = { ...prev };
                            delete newSaved[selectedPreventiva.id];
                            return newSaved;
                        });
                        // Also clear from localStorage
                        if (typeof window !== 'undefined') {
                            try {
                                const currentSaved = localStorage.getItem('preventivaWorkInProgress');
                                if (currentSaved) {
                                    const savedObj = JSON.parse(currentSaved);
                                    delete savedObj[selectedPreventiva.id];
                                    localStorage.setItem('preventivaWorkInProgress', JSON.stringify(savedObj));
                                }
                            } catch (error) {
                                console.error('Error clearing saved work from localStorage:', error);
                            }
                        }
                    }
                    setShowModal(false);
                    setSelectedPreventiva(null);
                } else {
                    const errorData = await response.json();
                    console.error("Failed to save to database:", errorData);
                    toast.error(`Erro ao salvar: ${errorData.error || 'Falha desconhecida'}`);
                }
            } catch (error) {
                console.error("Error saving execution:", error);
                toast.error("Erro de conexão ao salvar preventiva");

                // Fallback: update local state only
                const updatedPreventivas = preventivas.map(p =>
                    p.id === selectedPreventiva.id
                        ? { ...p, status: "CONCLUIDA" as const, dataExecucao: new Date().toISOString().split('T')[0] }
                        : p
                );
                setPreventivas(updatedPreventivas);
                toast.info("Preventiva concluída localmente (sem conexão)");
                // Clear saved work since it's been properly saved locally
                if (selectedPreventiva) {
                    setSavedWorkInProgress(prev => {
                        const newSaved = { ...prev };
                        delete newSaved[selectedPreventiva.id];
                        return newSaved;
                    });
                    // Also clear from localStorage
                    if (typeof window !== 'undefined') {
                        try {
                            const currentSaved = localStorage.getItem('preventivaWorkInProgress');
                            if (currentSaved) {
                                const savedObj = JSON.parse(currentSaved);
                                delete savedObj[selectedPreventiva.id];
                                localStorage.setItem('preventivaWorkInProgress', JSON.stringify(savedObj));
                            }
                        } catch (error) {
                            console.error('Error clearing saved work from localStorage:', error);
                        }
                    }
                }
                setShowModal(false);
                setSelectedPreventiva(null);
            }
        }
    };

    const handleViewPhotos = (preventiva: PreventivaLoja) => {
        setPhotosToView(preventiva.fotos);
        setCurrentPreventivaForPhotos(preventiva);
        setShowPhotoViewer(true);
    };

    const handleDeletePreventiva = async (preventiva: PreventivaLoja) => {
        if (preventiva.status !== "PENDENTE") {
            toast.error("Apenas preventivas com status PENDENTE podem ser excluídas");
            return;
        }

        try {
            const response = await fetch(`/api/preventivas/lojas/${preventiva.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove from local state
                const updatedPreventivas = preventivas.filter(p => p.id !== preventiva.id);
                setPreventivas(updatedPreventivas);
                toast.success(`Preventiva de ${preventiva.lojaNome} excluída com sucesso!`);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao excluir preventiva');
            }
        } catch (error) {
            console.error('Error deleting preventive:', error);
            toast.error('Erro de conexão ao excluir preventiva');
        }
    };

    const handleCreatePreventiva = () => {
        // Reset form data
        setFormData({
            lojaId: '',
            lojaLUC: '',
            lojaNome: '',
            dataAgendada: '',
            tecnico: '',
            observacoes: ''
        });
        // Reset search and filtered stores
        setSearchTerm('');
        setFilteredLojas(lojas);
        setShowCreateModal(true);
    };

    const handleStoreSelect = (storeId: string) => {
        const selectedLoja = (filteredLojas || []).find(loja => loja.id === storeId);
        if (selectedLoja) {
            setFormData({
                ...formData,
                lojaId: selectedLoja.id,
                lojaLUC: selectedLoja.LUC,
                lojaNome: selectedLoja.nome
            });
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.lojaId || !formData.lojaLUC || !formData.dataAgendada) {
            toast.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            // Create checklist items based on template (without IDs so Prisma can auto-generate them)
            const checklistItems: ChecklistItemCreateInput[] = checklistTemplate.map(item => ({
                categoria: item.categoria,
                tipoEquipamento: item.tipoEquipamento,
                descricao: item.descricao,
                concluido: item.concluido,
                observacao: item.observacao,
                fotoObrigatoria: item.fotoObrigatoria,
                fotoCapturada: item.fotoCapturada,
                lucReferencia: formData.lojaLUC
            }));

            // Create new preventive
            const response = await fetch('/api/preventivas/lojas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lojaId: formData.lojaId,
                    lojaLUC: formData.lojaLUC,
                    lojaNome: formData.lojaNome,
                    dataAgendada: formData.dataAgendada,
                    tecnico: formData.tecnico || null,
                    observacoes: formData.observacoes || null,
                    checklist: checklistItems
                })
            });

            if (response.ok) {
                const result = await response.json();

                // Add to local state (transform checklist items to include IDs)
                const checklistWithIds = checklistItems.map((item, index) => ({
                    ...item,
                    id: `temp-${Date.now()}-${index}` // Temporary ID for local state
                })) as ChecklistItem[];

                const newPreventiva: PreventivaLoja = {
                    id: result.data.id,
                    lojaId: formData.lojaId,
                    lojaNome: formData.lojaNome,
                    lojaLUC: formData.lojaLUC,
                    dataAgendada: formData.dataAgendada,
                    status: 'PENDENTE',
                    tecnico: formData.tecnico || undefined,
                    checklist: checklistWithIds,
                    fotos: []
                };

                setPreventivas([newPreventiva, ...preventivas]);
                setShowCreateModal(false);
                toast.success(`Preventiva criada com sucesso para ${formData.lojaNome} (${formData.lojaLUC})!`);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao criar preventiva');
            }
        } catch (error) {
            console.error('Error creating preventive:', error);
            toast.error('Erro ao criar preventiva');
        }
    };

    const getCategoriaBadge = (categoria: string) => {
        const badges: Record<string, { variant: string, text: string }> = {
            "SENSOR": { variant: "info", text: "Sensor" },
            "EQUIPAMENTO": { variant: "warning", text: "Equipamento" },
            "GERAL": { variant: "secondary", text: "Geral" }
        };
        const badge = badges[categoria] || { variant: "secondary", text: categoria };
        return <Badge bg={badge.variant}>{badge.text}</Badge>;
    };

    // const getTipoEquipamentoBadge = (tipo: FotoPreventiva['tipoEquipamento']) => {
    //     // This function was used to display equipment type badges
    //     // but is currently not being used in the UI
    //     /*
    //     const badges: Record<string, { variant: string, text: string, icon: string }> = {
    //         "SENSOR_TEMPERATURA": { variant: "info", text: "Temperatura", icon: "thermometer" },
    //         "SENSOR_MOVIMENTO": { variant: "warning", text: "Movimento", icon: "activity" },
    //         "BOTAO_PANICO": { variant: "danger", text: "Pânico", icon: "exclamation-triangle" },
    //         "QUADRO_AUTOMACAO": { variant: "primary", text: "Automação", icon: "cpu" },
    //         "OUTRO": { variant: "secondary", text: "Outro", icon: "question" }
    //     };
    //     const badge = badges[tipo] || badges.OUTRO;
    //     return (
    //         <Badge bg={badge.variant} className="d-inline-flex align-items-center">
    //             <i className={`bi bi-${badge.icon} me-1`}></i>
    //             {badge.text}
    //         </Badge>
    //     );
    //     */
    // };

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-2">Carregando preventivas...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">
                        <i className="bi bi-shop me-2"></i>
                        Preventiva de Lojas
                    </h1>
                    <p className="text-muted mb-0">
                        Gestão de manutenção preventiva das lojas - Sensores e Equipamentos
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-info" href="/pages/preventivas/lojas/fotos">
                        <i className="bi bi-images me-1"></i>
                        Galeria de Fotos
                    </Button>
                    <Button variant="outline-primary" onClick={handleCreatePreventiva}>
                        <i className="bi bi-plus-circle me-1"></i>
                        Nova Preventiva
                    </Button>
                    <Button variant="secondary" onClick={() => router.push("/pages/preventivas")}>
                        <i className="bi bi-arrow-left me-1"></i>
                        Voltar
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="bg-primary text-white">
                        <Card.Body>
                            <Card.Title className="h5">Pendentes</Card.Title>
                            <Card.Text className="display-4">
                                {preventivas.filter(p => p.status === "PENDENTE").length}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-warning text-dark">
                        <Card.Body>
                            <Card.Title className="h5">Em Andamento</Card.Title>
                            <Card.Text className="display-4">
                                {preventivas.filter(p => p.status === "EM_ANDAMENTO").length}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-success text-white">
                        <Card.Body>
                            <Card.Title className="h5">Concluídas</Card.Title>
                            <Card.Text className="display-4">
                                {preventivas.filter(p => p.status === "CONCLUIDA").length}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-info text-white">
                        <Card.Body>
                            <Card.Title className="h5">Total Itens</Card.Title>
                            <Card.Text className="display-4">
                                {preventivas.reduce((total, p) => total + p.checklist.length, 0)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Preventivas Table */}
            <Card>
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        <i className="bi bi-list me-2"></i>
                        Lista de Preventivas
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Table striped hover responsive>
                        <thead>
                            <tr>
                                <th>Loja</th>
                                <th>LUC</th>
                                <th>Data Agendada</th>
                                <th>Data Execução</th>
                                <th>Status</th>
                                <th>Técnico</th>
                                <th>Itens Concluídos</th>
                                <th>Fotos</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preventivas.map((preventiva) => {
                                const concluidos = preventiva.checklist.filter(item => item.concluido).length;
                                const total = preventiva.checklist.length;

                                return (
                                    <tr key={preventiva.id}>
                                        <td>
                                            <strong>{preventiva.lojaNome}</strong>
                                        </td>
                                        <td>{preventiva.lojaLUC}</td>
                                        <td>{new Date(preventiva.dataAgendada).toLocaleDateString()}</td>
                                        <td>
                                            {preventiva.dataExecucao
                                                ? new Date(preventiva.dataExecucao).toLocaleDateString()
                                                : "-"
                                            }
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className={`badge bg-${preventiva.status === "PENDENTE" ? "warning" :
                                                    preventiva.status === "EM_ANDAMENTO" ? "primary" :
                                                        preventiva.status === "CONCLUIDA" ? "success" : "danger"
                                                    }`}>
                                                    {preventiva.status}
                                                </span>
                                                {savedWorkInProgress[preventiva.id] && (
                                                    <span
                                                        className="badge bg-info"
                                                        title="Trabalho em progresso salvo"
                                                    >
                                                        <i className="bi bi-save me-1"></i>
                                                        Salvo
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{preventiva.tecnico || "-"}</td>
                                        <td>
                                            <div>
                                                <span className="text-muted small">{concluidos}/{total}</span>
                                                <div className="progress" style={{ height: '5px' }}>
                                                    <div
                                                        className="progress-bar"
                                                        role="progressbar"
                                                        style={{ width: `${(concluidos / total) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {preventiva.fotos.length > 0 ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline-info"
                                                    onClick={() => handleViewPhotos(preventiva)}
                                                >
                                                    <i className="bi bi-images me-1"></i>
                                                    {preventiva.fotos.length} fotos
                                                </Button>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {preventiva.status === "PENDENTE" && (
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleExecutePreventiva(preventiva)}
                                                    >
                                                        <i className="bi bi-play-circle me-1"></i>
                                                        Executar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => handleDeletePreventiva(preventiva)}
                                                    >
                                                        <i className="bi bi-trash me-1"></i>
                                                        Excluir
                                                    </Button>
                                                </div>
                                            )}
                                            {preventiva.status === "CONCLUIDA" && (
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-secondary"
                                                        onClick={() => handleViewPhotos(preventiva)}
                                                    >
                                                        <i className="bi bi-eye me-1"></i>
                                                        Ver Fotos
                                                    </Button>
                                                    <Button size="sm" variant="outline-primary">
                                                        <i className="bi bi-file-text me-1"></i>
                                                        Relatório
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Execution Modal */}
            <Modal
                show={showModal}
                onHide={() => {
                    // Save work in progress before closing
                    if (selectedPreventiva) {
                        setSavedWorkInProgress(prev => ({
                            ...prev,
                            [selectedPreventiva.id]: selectedPreventiva
                        }));
                    }
                    setShowModal(false);
                }}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Executar Preventiva - {selectedPreventiva?.lojaNome}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPreventiva && (
                        <div>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h5>Dados da Loja</h5>
                                    <p><strong>Nome:</strong> {selectedPreventiva.lojaNome}</p>
                                    <p><strong>LUC:</strong> {selectedPreventiva.lojaLUC}</p>
                                    <p><strong>Data Agendada:</strong> {new Date(selectedPreventiva.dataAgendada).toLocaleDateString()}</p>
                                </Col>
                                <Col md={6}>
                                    <h5>Progresso</h5>
                                    <div className="d-flex align-items-center">
                                        <span className="me-2">
                                            {selectedPreventiva.checklist.filter(item => item.concluido).length}/
                                            {selectedPreventiva.checklist.length} itens
                                        </span>
                                        <div className="progress flex-grow-1">
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{
                                                    width: `${(selectedPreventiva.checklist.filter(item => item.concluido).length / selectedPreventiva.checklist.length) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <h5>Checklist de Preventiva</h5>
                            <div className="table-responsive">
                                <Table striped bordered>
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: "10%" }}>Categoria</th>
                                            <th style={{ width: "50%" }}>Descrição</th>
                                            <th style={{ width: "15%" }}>Status</th>
                                            <th style={{ width: "15%" }}>Foto</th>
                                            <th style={{ width: "10%" }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPreventiva.checklist.map((item) => (
                                            <tr key={item.id}>
                                                <td>{getCategoriaBadge(item.categoria)}</td>
                                                <td>{item.descricao}</td>
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={item.concluido}
                                                        onChange={() => handleItemCheck(item.id)}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    {item.fotoObrigatoria ? (
                                                        item.fotoCapturada ? (
                                                            <Badge bg="success">
                                                                <i className="bi bi-camera-fill me-1"></i>
                                                                Capturada
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="warning" text="dark">
                                                                <i className="bi bi-camera me-1"></i>
                                                                Pendente
                                                            </Badge>
                                                        )
                                                    ) : (
                                                        <Badge bg="secondary">Não Requerida</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.fotoObrigatoria && !item.fotoCapturada && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => handleTakePhoto(item)}
                                                        >
                                                            <i className="bi bi-camera me-1"></i>
                                                            Tirar Foto
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            <Form.Group className="mt-3">
                                <Form.Label><strong>Observações Gerais:</strong></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Adicione observações sobre a execução da preventiva..."
                                    defaultValue={selectedPreventiva.observacoes || ""}
                                />
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            // Save work in progress before closing
                            if (selectedPreventiva) {
                                setSavedWorkInProgress(prev => ({
                                    ...prev,
                                    [selectedPreventiva.id]: selectedPreventiva
                                }));
                            }
                            setShowModal(false);
                        }}
                    >
                        Cancelar
                    </Button>
                    <div className="d-flex flex-column align-items-end">
                        <Button
                            variant="primary"
                            onClick={handleSaveExecution}
                            disabled={!selectedPreventiva || selectedPreventiva.checklist.filter(item => item.concluido).length === 0}
                            className="mb-2"
                        >
                            <i className="bi bi-check-circle me-1"></i>
                            Salvar e Concluir Preventiva
                        </Button>
                        {(!selectedPreventiva || selectedPreventiva.checklist.filter(item => item.concluido).length === 0) && (
                            <small className="text-muted">
                                <i className="bi bi-info-circle me-1"></i>
                                Marque pelo menos um item como concluído para habilitar este botão
                            </small>
                        )}
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Camera Modal with Native Mobile Support */}
            <Modal show={showCameraModal} onHide={() => setShowCameraModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-camera me-2"></i>
                        Capturar Foto - {currentItem?.descricao}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentItem && (
                        <div>
                            <div className="text-center mb-4">
                                <h6>{selectedPreventiva?.lojaNome} ({selectedPreventiva?.lojaLUC})</h6>
                                <p className="text-muted">{currentItem.descricao}</p>
                            </div>

                            {/* Camera Interface */}
                            <div className="border rounded p-4 mb-4 bg-light text-center">
                                {isCapturing ? (
                                    <div>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Processando...</span>
                                        </div>
                                        <p className="mt-2">Processando imagem...</p>
                                    </div>
                                ) : previewImages.length > 0 ? (
                                    <div>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={previewImages[0]}
                                            alt="Preview"
                                            className="img-fluid rounded mb-3"
                                            style={{ maxHeight: '300px' }}
                                        />
                                        <p className="text-success">
                                            <i className="bi bi-check-circle me-1"></i>
                                            Imagem capturada com sucesso!
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <i className="bi bi-camera-fill" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                        <p className="mt-3 mb-1">Pronto para capturar foto</p>
                                        <p className="text-muted small mb-3">
                                            Clique no botão abaixo para abrir a câmera do seu dispositivo
                                        </p>
                                    </div>
                                )}

                                {/* Hidden file input for camera access */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment" // This triggers native camera on mobile
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />

                                {cameraError && (
                                    <div className="alert alert-danger mt-3">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        {cameraError}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-center gap-2">
                                {previewImages.length === 0 ? (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={triggerCamera}
                                        disabled={isCapturing}
                                    >
                                        <i className="bi bi-camera me-2"></i>
                                        {isCapturing ? 'Capturando...' : 'Abrir Câmera'}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={clearAllImages}
                                        >
                                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                                            Recapturar
                                        </Button>
                                        <Button
                                            variant="success"
                                            onClick={() => savePhotoWithImageData(previewImages[0])}
                                        >
                                            <i className="bi bi-check-lg me-1"></i>
                                            Confirmar Foto
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="alert alert-info mt-4">
                                <h6 className="alert-heading">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Instruções para captura
                                </h6>
                                <ul className="mb-0 small">
                                    <li>Certifique-se de ter boa iluminação</li>
                                    <li>Posicione a câmera perpendicular ao equipamento</li>
                                    <li>Inclua etiquetas ou identificadores visíveis quando possível</li>
                                    <li>Evite reflexos e sombras excessivas</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowCameraModal(false);
                            clearAllImages();
                        }}
                    >
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Creation Modal */}
            <Modal show={showCreateModal} onHide={() => {
                setShowCreateModal(false);
                // Reset search when closing modal
                setSearchTerm('');
                setFilteredLojas(lojas);
            }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-plus-circle me-2"></i>
                        Criar Nova Preventiva
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleFormSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Loja *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Buscar loja por nome ou LUC..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="mb-2"
                                    />
                                    <Form.Select
                                        value={formData.lojaId}
                                        onChange={(e) => handleStoreSelect(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione uma loja</option>
                                        {(filteredLojas || []).map(loja => (
                                            <option key={loja.id} value={loja.id}>
                                                {loja.nome} ({loja.LUC})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>LUC</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.lojaLUC}
                                        readOnly
                                        placeholder="Será preenchido automaticamente"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Nome da Loja</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.lojaNome}
                                        readOnly
                                        placeholder="Será preenchido automaticamente"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Data Agendada *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.dataAgendada}
                                        onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Técnico Responsável</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.tecnico}
                                        onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                                        placeholder="Nome do técnico"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Observações</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={formData.observacoes}
                                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                        placeholder="Observações adicionais sobre a preventiva"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Checklist Automático:</strong> Serão criados automaticamente 9 itens de checklist
                            (2 sensores de temperatura, 2 sensores de movimento, 2 botões de pânico e 3 itens do quadro de automação)
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            setShowCreateModal(false);
                            // Reset search when canceling
                            setSearchTerm('');
                            setFilteredLojas(lojas);
                        }}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            <i className="bi bi-save me-1"></i>
                            Criar Preventiva
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Updated photo viewer modal */}
            <PreventivaPhotoViewer
                fotos={photosToView}
                show={showPhotoViewer}
                onHide={() => {
                    setShowPhotoViewer(false);
                    setCurrentPreventivaForPhotos(null);
                }}
                titulo={`Fotos da Preventiva - ${currentPreventivaForPhotos ?
                    `${currentPreventivaForPhotos.lojaNome} (${currentPreventivaForPhotos.lojaLUC})` :
                    'Sem fotos'}`}
            />

            <ToastContainer />
        </Container>
    );
}