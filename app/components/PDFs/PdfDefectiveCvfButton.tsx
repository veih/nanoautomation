/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LOGO_BASE64 } from "@/app/img/logoBase64";
import React, { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Cvf, SensorTemperaturaStatus, SensorUmidadeStatus } from "../../../types";

interface PdfDefectiveCvfButtonProps {
    cvfsData: Cvf[];
}

const PdfDefectiveCvfButton: React.FC<PdfDefectiveCvfButtonProps> = ({ cvfsData }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

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

    // Helper function to display enum values in a readable format
    const formatSensorStatus = (status: string | undefined) => {
        if (!status) return "N/A";

        switch (status) {
            case SensorTemperaturaStatus.OPERACIONAL:
            case SensorUmidadeStatus.OPERACIONAL:
                return "Operacional";
            case SensorTemperaturaStatus.DEFEITO:
            case SensorUmidadeStatus.DEFEITO:
                return "Defeito";
            case SensorTemperaturaStatus.N_A:
            case SensorUmidadeStatus.N_A:
                return "N/A";
            default:
                return status;
        }
    };

    // Helper function to display AtuadorStatus values in a readable format
    const formatAtuadorStatus = (status: string | undefined) => {
        if (!status) return "N/A";

        switch (status) {
            case "OPERACIONAL":
                return "Operacional";
            case "DEFEITO":
                return "Defeito";
            case "MANUTENCAO":
                return "Manutenção";
            case "DESCONHECIDO":
                return "Desconhecido";
            default:
                return status;
        }
    };

    const generatePdf = async () => {
        if (!isScriptLoaded) {
            toast.error(
                "As bibliotecas de PDF ainda estão sendo carregadas. Por favor, aguarde."
            );
            return;
        }

        if (!cvfsData || cvfsData.length === 0) {
            toast.warn("Não há dados de CVFs com defeito para gerar o PDF.");
            return;
        }

        setIsGenerating(true);
        try {
            const { jsPDF } = (window as any).jspdf;
            const pdf = new jsPDF();

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 8;
            let yOffset = margin;
            const lineHeight = 7;

            const addPageHeader = (doc: any, pageNum: number) => {
                const logoHeaderWidth = 60;
                const logoHeaderHeight = 20;
                const logoHeaderX = margin;
                const logoHeaderY = margin;
                const watermarkWidth = 200;
                const watermarkHeight = 100;
                const watermarkX = (pageWidth - watermarkWidth) / 2;
                const watermarkY = (pageHeight - watermarkHeight) / 2;
                const watermarkOpacity = 0.1;

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
                    const GState = (jsPDF as any).GState || doc.GState;
                    doc.saveGraphicsState();
                    doc.setGState(new GState({ opacity: watermarkOpacity }));
                    doc.addImage(
                        LOGO_BASE64,
                        "PNG",
                        watermarkX,
                        watermarkY,
                        watermarkWidth,
                        watermarkHeight
                    );
                    doc.restoreGraphicsState();
                } else {
                    console.warn(
                        "Logo Base64 não encontrado ou é inválido. O logo e a marca d'água não serão adicionados."
                    );
                }

                // Position the title below the logo
                const titleY = logoHeaderY + logoHeaderHeight + 10; // 10px spacing below logo

                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.setTextColor(20, 20, 20);
                doc.text("Relatório de CVFs com Status Defeito", pageWidth / 2, titleY, {
                    align: "center",
                });

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                const fortzLocaleString = new Date().toLocaleString("pt-BR", {
                    timeZone: "America/Fortaleza",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });
                // Position the date and page number below the title
                const infoY = titleY + 15; // 15px spacing below title
                doc.text(`Gerado em: ${fortzLocaleString}`, margin, infoY);
                doc.text(`Página ${pageNum}`, pageWidth - margin, infoY, {
                    align: "right",
                });

                doc.setTextColor(0, 0, 0);
                // Return the Y position for the next content
                return infoY + 10; // 10px spacing below the info text
            };

            const addFooter = (doc: any) => {
                const footerY = doc.internal.pageSize.height - 25;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);

                doc.text("NANOAUTOMATION - Your Road to the Future", margin, footerY);
                doc.text(
                    `Fone: +55 (11) 3647-6266 | E-mail: contato@nanoautomation.com.br`,
                    margin,
                    footerY + 4
                );
                doc.text(
                    `CNPJ: 08.316.992-0001-72 | Site: www.nanoautomation.com.br`,
                    margin,
                    footerY + 8
                );
                doc.text(
                    `Av Queiroz Filho, 1700-Torre E-303/304 | CEP: 05319-000 Vila Leopoldina São Paulo/SP`,
                    margin,
                    footerY + 12
                );
                doc.setTextColor(0, 0, 0);
            };

            yOffset = addPageHeader(pdf, 1);
            addFooter(pdf);

            // Use the filtered data passed as props (already filtered for "DEFEITO" status)
            const defectiveCvfs = cvfsData;

            // Sort CVFs by vigaFria (E1, E2, etc.) first, then by piso (L1, L2, L3)
            const sortedDefectiveCvfs = [...defectiveCvfs].sort((a, b) => {
                // First sort by vigaFria
                const vigaFriaA = a.vigaFria || '';
                const vigaFriaB = b.vigaFria || '';

                if (vigaFriaA < vigaFriaB) return -1;
                if (vigaFriaA > vigaFriaB) return 1;

                // If vigaFria values are equal, sort by piso
                const pisoA = a.piso || '';
                const pisoB = b.piso || '';

                if (pisoA < pisoB) return -1;
                if (pisoA > pisoB) return 1;

                return 0;
            });

            // Calcula totais
            const totalComSensorTemperaturaDefeito = sortedDefectiveCvfs.filter(
                (cvf) => cvf.sensorTemperatura === SensorTemperaturaStatus.DEFEITO
            ).length;
            const totalComSensorUmidadeDefeito = sortedDefectiveCvfs.filter(
                (cvf) => cvf.sensorUmidade === SensorUmidadeStatus.DEFEITO
            ).length;
            const totalComAtuadorDefeito = sortedDefectiveCvfs.filter(
                (cvf) => cvf.atuador === "DEFEITO"
            ).length;

            if (sortedDefectiveCvfs.length === 0) {
                pdf.setFontSize(12);
                pdf.text(
                    "Nenhum CVF com status defeito encontrado para gerar o relatório.",
                    pageWidth / 2,
                    yOffset + 20,
                    { align: "center" }
                );
            } else {
                // --- Adiciona sumário estatístico ---
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(16);
                pdf.setTextColor(0, 0, 128);
                yOffset += 10;
                pdf.text("Resumo Estatístico", margin, yOffset);
                yOffset += lineHeight * 2;

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(12);
                pdf.setTextColor(50, 50, 50);

                pdf.text(`Sensor de Temperatura Defeito: ${totalComSensorTemperaturaDefeito}`, margin, yOffset);
                yOffset += lineHeight;
                pdf.text(`Sensor de Umidade Defeito: ${totalComSensorUmidadeDefeito}`, margin, yOffset);
                yOffset += lineHeight;
                pdf.text(`Atuador Defeito: ${totalComAtuadorDefeito}`, margin, yOffset);
                yOffset += lineHeight * 2;

                // --- Adiciona a lista detalhada de CVFs ---
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(16);
                pdf.setTextColor(0, 0, 128);
                pdf.text("Detalhes dos CVFs com Defeito", margin, yOffset);
                yOffset += lineHeight * 2;

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);
                pdf.setTextColor(50, 50, 50);

                sortedDefectiveCvfs.forEach((cvf, index) => {
                    if (yOffset > pageHeight - 80) {
                        pdf.addPage();
                        yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
                        addFooter(pdf);
                        yOffset += 10;
                    }

                    // Informações do CVF
                    pdf.setFont("helvetica", "bold");
                    pdf.setFontSize(14);

                    // Define a cor para vermelho (255, 0, 0) apenas para a linha "CVF"
                    pdf.setTextColor(255, 0, 0);
                    pdf.text(`${index + 1}. CVF`, margin, yOffset);
                    yOffset += lineHeight;

                    // Depois de desenhar o "CVF", você redefine a cor para cinza
                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(10);
                    pdf.setTextColor(50, 50, 50);

                    // Detalhes do CVF
                    const details = [
                        `Viga Fria: ${cvf.vigaFria || "N/A"}`,
                        `Piso: ${cvf.piso || "N/A"}`,
                        `Sensor de Temperatura: ${formatSensorStatus(cvf.sensorTemperatura)}`,
                        `Sensor de Umidade: ${formatSensorStatus(cvf.sensorUmidade)}`,
                        `Atuador: ${formatAtuadorStatus(cvf.atuador)}`,
                        `Localização do Quadro: ${cvf.localizacaoQuadro || "N/A"}`,
                        `Localização da Válvula: ${cvf.localizacaoValvula || "N/A"}`,
                        `Observações: ${cvf.observacoes || "N/A"}`,
                    ];

                    details.forEach((detail) => {
                        if (yOffset > pageHeight - 80) {
                            pdf.addPage();
                            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
                            addFooter(pdf);
                            yOffset += 10;
                        }
                        pdf.text(detail, margin + 5, yOffset);
                        yOffset += lineHeight;
                    });

                    yOffset += lineHeight; // Espaçamento entre CVFs
                });
            }

            // Salva o PDF
            const fileName = `relatorio-cvfs-defeito-${new Date().toISOString().split("T")[0]}.pdf`;
            pdf.save(fileName);
            toast.success("PDF gerado com sucesso!");
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast.error("Erro ao gerar PDF. Por favor, tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />
            <Button
                variant="danger"
                disabled={isGenerating || !cvfsData || cvfsData.length === 0}
                onClick={generatePdf}
                className="d-flex align-items-center"
            >
                {isGenerating ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                        />
                        <span>Gerando PDF...</span>
                    </>
                ) : (
                    <>
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        <span>PDF dos CVFs com Defeito ({cvfsData?.length || 0})</span>
                    </>
                )}
            </Button>
        </>
    );
};

export default PdfDefectiveCvfButton;