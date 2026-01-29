/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LOGO_BASE64 } from "@/app/img/logoBase64";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Spinner, Modal, Form, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

/**
 * Interface for Ocorrência Concluída
 */
interface OcorrenciaConcluida {
    id: string;
    descricao: string;
    solucao: string;
    colaborador: string;
    status: "ANDAMENTO" | "CONCLUIDO";
    createdAt: string;
    updatedAt: string;
    imagePaths?: string;
}

/**
 * Componente de botão para gerar um relatório em PDF de ocorrências concluídas.
 * O componente busca seus próprios dados das APIs e gera o PDF de forma autônoma.
 */
const PdfOcorrenciasConcluidasButton: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [ocorrenciasData, setOcorrenciasData] = useState<OcorrenciaConcluida[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [colaboradores, setColaboradores] = useState<string[]>([]);
    const [filtros, setFiltros] = useState({
        colaborador: "",
        dataInicio: "",
        dataFim: ""
    });

    const getImageBase64 = (url: string): Promise<string> =>
        new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status}`);
                }
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            } catch (err) {
                reject(err);
            }
        });

    /**
     * Efeito para carregar dinamicamente as bibliotecas jsPDF.
     */
    useEffect(() => {
        const loadScripts = () => {
            const jspdfScript = document.createElement("script");
            jspdfScript.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            jspdfScript.onload = () => {
                setIsScriptLoaded(true);
            };
            document.head.appendChild(jspdfScript);
        };

        loadScripts();
    }, []);

    /**
     * Função para buscar ocorrências concluídas diretamente da API.
     */
    const fetchOcorrenciasData = useCallback(async () => {
        setLoadingData(true);
        try {
            const response = await fetch("/api/ocorrencias");
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao buscar ocorrências: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log("API Response:", result); // Debug: Log the API response

            // Handle different response formats
            let ocorrencias = [];
            if (typeof result === "object" && result !== null) {
                if (Array.isArray(result)) {
                    // Direct array format
                    ocorrencias = result;
                } else if ("success" in result) {
                    // Standardized API response format
                    if (result.success) {
                        // Check if data is an array or nested object
                        if (Array.isArray(result.data)) {
                            ocorrencias = result.data;
                        } else if (result.data && typeof result.data === "object") {
                            // Handle nested data structure (data.data)
                            if (Array.isArray(result.data.data)) {
                                ocorrencias = result.data.data;
                            } else {
                                // If data is an object but not an array, try to get its values
                                ocorrencias = Object.values(result.data);
                            }
                        }
                    } else {
                        throw new Error(result.error?.message || "Erro na resposta da API");
                    }
                } else if ("data" in result) {
                    // Legacy format with data property
                    if (Array.isArray(result.data)) {
                        ocorrencias = result.data;
                    } else if (result.data && typeof result.data === "object") {
                        // Handle nested data structure
                        if (Array.isArray(result.data.data)) {
                            ocorrencias = result.data.data;
                        } else {
                            // If data is an object but not an array, try to get its values
                            ocorrencias = Object.values(result.data);
                        }
                    }
                } else {
                    // Try to convert object to array
                    ocorrencias = Object.values(result);
                }
            }

            console.log("Processed ocorrencias:", ocorrencias); // Debug: Log processed data

            // Ensure ocorrencias is an array before filtering
            if (!Array.isArray(ocorrencias)) {
                console.warn("Ocorrencias is not an array, setting to empty array");
                ocorrencias = [];
            }

            // Filtrar apenas ocorrências concluídas
            const ocorrenciasConcluidas = ocorrencias.filter(
                (o: any) => o.status && o.status === "CONCLUIDO"
            );

            // Parse image paths if they exist
            const ocorrenciasTransformadas = ocorrenciasConcluidas.map((o: any) => {
                let imagePaths = [];
                if (o.imagePaths) {
                    try {
                        if (typeof o.imagePaths === 'string') {
                            imagePaths = JSON.parse(o.imagePaths);
                        } else if (Array.isArray(o.imagePaths)) {
                            imagePaths = o.imagePaths;
                        }
                    } catch (parseError) {
                        console.warn("Error parsing image paths for occurrence:", o.id, parseError);
                        imagePaths = [];
                    }
                }
                return {
                    ...o,
                    imagePaths
                };
            });

            setOcorrenciasData(ocorrenciasTransformadas);

            // Extrair lista única de colaboradores para o filtro
            const colaboradoresUnicos = Array.from(
                new Set(ocorrenciasTransformadas.map((o: any) => o.colaborador))
            ).filter((colab): colab is string => typeof colab === 'string');
            setColaboradores(colaboradoresUnicos);
        } catch (err: any) {
            console.error("Erro ao buscar dados para PDF:", err);
            toast.error("Erro ao buscar dados para PDF: " + (err.message || err));
            setOcorrenciasData([]);
        } finally {
            setLoadingData(false);
        }
    }, []);

    // Carregar dados na montagem do componente
    useEffect(() => {
        fetchOcorrenciasData();
    }, [fetchOcorrenciasData]);

    const generatePdf = useCallback(async () => {
        if (!isScriptLoaded) {
            toast.error(
                "As bibliotecas de PDF ainda estão sendo carregadas. Por favor, aguarde."
            );
            return;
        }

        // Aplicar filtros aos dados
        let dadosFiltrados = [...ocorrenciasData];

        // Filtrar por colaborador
        if (filtros.colaborador) {
            dadosFiltrados = dadosFiltrados.filter(
                ocorrencia => ocorrencia.colaborador === filtros.colaborador
            );
        }

        // Filtrar por data de criação
        if (filtros.dataInicio) {
            const dataInicio = new Date(filtros.dataInicio);
            dadosFiltrados = dadosFiltrados.filter(
                ocorrencia => new Date(ocorrencia.createdAt) >= dataInicio
            );
        }

        if (filtros.dataFim) {
            // Adicionar um dia para incluir o dia final completo
            const dataFim = new Date(filtros.dataFim);
            dataFim.setDate(dataFim.getDate() + 1);
            dadosFiltrados = dadosFiltrados.filter(
                ocorrencia => new Date(ocorrencia.createdAt) < dataFim
            );
        }

        if (dadosFiltrados.length === 0) {
            return toast.warning("Não há ocorrências concluídas com os filtros aplicados");
        }

        setIsGenerating(true);

        try {
            const { jsPDF } = (window as any).jspdf;
            const pdf = new jsPDF();
            const margin = 15;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yOffset = 30;
            const lineHeight = 7;

            // Função para adicionar marca d'água
            const addWatermark = (doc: any) => {
                if (LOGO_BASE64) {
                    const totalPages = doc.internal.getNumberOfPages();
                    for (let i = 1; i <= totalPages; i++) {
                        doc.setPage(i);
                        doc.saveGraphicsState();
                        doc.setGState(new doc.GState({ opacity: 0.1 }));
                        doc.addImage(
                            LOGO_BASE64,
                            "PNG",
                            pageWidth / 2 - 100,
                            pageHeight / 2 - 50,
                            200,
                            100
                        );
                        doc.restoreGraphicsState();
                    }
                    doc.setPage(1); // Voltar para a primeira página
                }
            };

            // Função para adicionar cabeçalho da página
            const addPageHeader = (doc: any, pageNum: number) => {
                const logoHeaderWidth = 60;
                const logoHeaderHeight = 20;
                const logoHeaderX = margin;
                const logoHeaderY = margin;

                if (
                    LOGO_BASE64 &&
                    LOGO_BASE64.length > 50 &&
                    LOGO_BASE64.startsWith("data:image")
                ) {
                    doc.addImage(
                        LOGO_BASE64,
                        "PNG",
                        logoHeaderX,
                        logoHeaderY,
                        logoHeaderWidth,
                        logoHeaderHeight
                    );
                }

                // Título do documento
                doc.setFont("helvetica", "normal");
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 139); // Azul marinho
                doc.text("Relatório de Ocorrências Concluídas", pageWidth / 2, margin + 10, {
                    align: "center",
                });

                // Linha separadora
                doc.setDrawColor(0, 0, 139);
                doc.line(margin, margin + 25, pageWidth - margin, margin + 25);

                // Número da página
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(
                    `Página ${pageNum}`,
                    pageWidth - margin,
                    pageHeight - margin,
                    { align: "right" }
                );

                return margin + 35; // Retornar a posição Y após o cabeçalho
            };

            // Função para adicionar rodapé
            const addFooter = (doc: any) => {
                const footerY = pageHeight - margin;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Gerado em: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`,
                    margin,
                    footerY
                );
            };

            // Adicionar cabeçalho na primeira página
            yOffset = addPageHeader(pdf, 1);
            addFooter(pdf);

            // Informações gerais e filtros aplicados
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.text(`Total de ocorrências concluídas: ${dadosFiltrados.length}`, margin, yOffset);
            yOffset += lineHeight;

            // Mostrar filtros aplicados
            if (filtros.colaborador || filtros.dataInicio || filtros.dataFim) {
                pdf.setFontSize(10);
                pdf.text("Filtros aplicados:", margin, yOffset);
                yOffset += lineHeight;

                if (filtros.colaborador) {
                    pdf.text(`  Colaborador: ${filtros.colaborador}`, margin, yOffset);
                    yOffset += lineHeight;
                }

                if (filtros.dataInicio) {
                    pdf.text(`  Data de início: ${new Date(filtros.dataInicio).toLocaleDateString("pt-BR")}`, margin, yOffset);
                    yOffset += lineHeight;
                }

                if (filtros.dataFim) {
                    pdf.text(`  Data de fim: ${new Date(filtros.dataFim).toLocaleDateString("pt-BR")}`, margin, yOffset);
                    yOffset += lineHeight;
                }

                yOffset += lineHeight;
            }

            // Data do relatório
            pdf.setFontSize(10);
            pdf.text(
                `Relatório gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
                margin,
                yOffset
            );
            yOffset += lineHeight * 2;

            // Detalhes das ocorrências
            pdf.setFontSize(14);
            pdf.text("Detalhes das Ocorrências Concluídas", margin, yOffset);
            yOffset += lineHeight * 2;

            pdf.setFontSize(10);

            // Processar cada ocorrência filtrada
            for (let i = 0; i < dadosFiltrados.length; i++) {
                const ocorrencia = dadosFiltrados[i];

                // Verificar se precisa de uma nova página
                if (yOffset > pageHeight - 80) {
                    pdf.addPage();
                    const pageNum = pdf.internal.getNumberOfPages();
                    yOffset = addPageHeader(pdf, pageNum);
                    addFooter(pdf);
                    yOffset += 10;
                }

                // Número da ocorrência
                pdf.setFontSize(12);
                pdf.text(`${i + 1}. Ocorrência`, margin, yOffset);
                yOffset += lineHeight;

                // Resetar fonte para o restante
                pdf.setFontSize(10);

                // Informações da ocorrência
                const infoLines = [
                    `Data de criação: ${new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR")} ${new Date(ocorrencia.createdAt).toLocaleTimeString("pt-BR")}`,
                    `Data de conclusão: ${new Date(ocorrencia.updatedAt).toLocaleDateString("pt-BR")} ${new Date(ocorrencia.updatedAt).toLocaleTimeString("pt-BR")}`,
                    `Colaborador: ${ocorrencia.colaborador}`,
                    `Descrição: ${ocorrencia.descricao}`,
                    `Solução: ${ocorrencia.solucao}`,
                ];

                // Adicionar informações da ocorrência
                infoLines.forEach((line) => {
                    const splitted = pdf.splitTextToSize(line, pageWidth - 2 * margin);
                    splitted.forEach((textLine: string) => {
                        if (yOffset > pageHeight - 80) {
                            pdf.addPage();
                            const pageNum = pdf.internal.getNumberOfPages();
                            yOffset = addPageHeader(pdf, pageNum);
                            addFooter(pdf);
                            yOffset += 10;
                        }
                        pdf.text(textLine, margin, yOffset);
                        yOffset += lineHeight;
                    });
                });

                // Adicionar informações de imagens se existirem
                if (ocorrencia.imagePaths && ocorrencia.imagePaths.length > 0) {
                    yOffset += lineHeight;
                    pdf.setFontSize(10);
                    pdf.text(`Imagens associadas (${ocorrencia.imagePaths.length} imagem(s)):`, margin, yOffset);
                    yOffset += lineHeight;

                    // Ajustar o tamanho e layout com base no número de imagens
                    const numImages = ocorrencia.imagePaths.length;

                    // Definir dimensões com base no número de imagens
                    let imgWidth, imgHeight, imagesPerRow;

                    if (numImages === 1) {
                        // Para 1 imagem, usar tamanho 150x150
                        imgWidth = 150;
                        imgHeight = 150;
                        imagesPerRow = 1;
                    } else if (numImages === 2) {
                        // Para 2 imagens, usar tamanho 70x70 cada
                        imgWidth = 70;
                        imgHeight = 70;
                        imagesPerRow = 2;
                    } else {
                        // Para 3 ou mais imagens, manter o layout de grade (4 colunas) com tamanho menor
                        imgWidth = (pageWidth - 5 * margin) / 4;
                        imgHeight = 40;
                        imagesPerRow = 4;
                    }

                    let col = 0;
                    let rowHeight = 0;
                    const imgSpacing = 5;

                    // Processar cada imagem
                    for (const imageUrl of ocorrencia.imagePaths) {
                        if (yOffset + imgHeight > pageHeight - 50) {
                            pdf.addPage();
                            const pageNum = pdf.internal.getNumberOfPages();
                            yOffset = addPageHeader(pdf, pageNum);
                            addFooter(pdf);
                        }

                        const xPos = margin + col * (imgWidth + margin);

                        try {
                            const base64 = await getImageBase64(imageUrl);
                            pdf.addImage(
                                base64,
                                "JPEG",
                                xPos,
                                yOffset,
                                imgWidth,
                                imgHeight
                            );
                        } catch (err) {
                            console.warn("Erro ao carregar imagem:", imageUrl, err);
                            pdf.setFontSize(10);
                            pdf.text(
                                "Imagem não disponível",
                                xPos,
                                yOffset + imgHeight / 2
                            );
                            pdf.setFontSize(10);
                        }

                        col++;
                        rowHeight = Math.max(rowHeight, imgHeight);

                        if (col >= imagesPerRow) {
                            col = 0;
                            yOffset += rowHeight + imgSpacing;
                            rowHeight = 0;
                        }
                    }

                    if (col > 0) {
                        yOffset += rowHeight + imgSpacing;
                    }

                    pdf.setFontSize(10);
                } else {
                    yOffset += lineHeight;
                    pdf.text("Nenhuma imagem anexada", margin, yOffset);
                    yOffset += lineHeight * 2;
                }

                // Espaço entre ocorrências
                yOffset += lineHeight;
            }

            // Adicionar marca d'água em todas as páginas
            addWatermark(pdf);

            // Salvar o PDF
            pdf.save(`ocorrencias_concluidas_${new Date().toISOString().split('T')[0]}.pdf`);

            toast.success("PDF gerado com sucesso!");
        } catch (err: any) {
            console.error("Erro ao gerar PDF:", err);
            toast.error("Erro ao gerar PDF: " + (err.message || err));
        } finally {
            setIsGenerating(false);
        }
    }, [isScriptLoaded, ocorrenciasData, filtros]);

    // Função para lidar com mudanças nos filtros
    const handleFiltroChange = (campo: string, valor: string) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Função para aplicar os filtros
    const aplicarFiltros = () => {
        setShowModal(false);
        generatePdf();
    };

    // Função para limpar os filtros
    const limparFiltros = () => {
        setFiltros({
            colaborador: "",
            dataInicio: "",
            dataFim: ""
        });
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />
            <Button
                variant="danger"
                onClick={() => setShowModal(true)}
                disabled={loadingData || isGenerating}
                className="d-flex align-items-center"
            >
                {loadingData ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                        />
                        Carregando dados...
                    </>
                ) : isGenerating ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                        />
                        Gerando PDF...
                    </>
                ) : !isScriptLoaded ? (
                    "Carregando bibliotecas..."
                ) : ocorrenciasData.length === 0 ? (
                    <>
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        Gerar PDF (Nenhuma ocorrência concluída)
                    </>
                ) : (
                    <>
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        Gerar PDF de Ocorrências Concluídas ({ocorrenciasData.length})
                    </>
                )}
            </Button>

            {/* Modal de Filtros */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-funnel me-2"></i>
                        Filtros para Relatório de Ocorrências Concluídas
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={12} className="mb-3">
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
                        </Row>

                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label>Data de Início</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filtros.dataInicio}
                                    onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
                                />
                            </Col>

                            <Col md={6} className="mb-3">
                                <Form.Label>Data de Fim</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filtros.dataFim}
                                    onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
                                />
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between">
                            <Button variant="secondary" onClick={limparFiltros}>
                                Limpar Filtros
                            </Button>
                            <div>
                                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                                    Cancelar
                                </Button>
                                <Button variant="primary" onClick={aplicarFiltros}>
                                    Gerar PDF
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default PdfOcorrenciasConcluidasButton;