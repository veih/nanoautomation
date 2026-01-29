/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LOGO_BASE64 } from "@/app/img/logoBase64";

interface DefectiveDevice {
    id: string;
    name: string;
    type: string;
    location?: string;
    lastUpdated?: string;
    dashboard: string;
    additionalInfo?: Record<string, any>;
}

// Helper function to display dashboard name in a readable format
const formatDashboardName = (dashboard: string) => {
    switch (dashboard) {
        case "access-control":
            return "Controle de Acesso";
        case "cvf":
            return "Sistema CVF";
        case "lojas":
            return "Monitoramento de Lojas";
        case "cms":
            return "Casa de Máquinas";
        case "sdai":
            return "Sistema SDAI";
        default:
            return dashboard;
    }
};

// Helper function to display device type in a readable format
const formatDeviceType = (type: string) => {
    switch (type) {
        case "controller":
            return "Controlador";
        case "button":
            return "Botão de Solicitação";
        case "electromagnet":
            return "Eletroímã";
        case "sensor":
            return "Sensor Magnético";
        case "cvf":
            return "Unidade CVF";
        case "atuador-loja":
            return "Atuador de Loja";
        case "sensor-loja":
            return "Sensor de Loja";
        case "atuador-cms":
            return "Atuador de CM";
        case "sensor-cms":
            return "Sensor de CM";
        default:
            return type;
    }
};

// Helper function to format date safely
const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString("pt-BR");
    } catch {
        return 'Data inválida';
    }
};

const PdfDefeitosButton: React.FC<{ defectiveDevices: DefectiveDevice[] }> = ({ defectiveDevices }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    /**
     * Efeito para carregar dinamicamente as bibliotecas jsPDF.
     */
    React.useEffect(() => {
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

    const generatePdf = async () => {
        if (!isScriptLoaded) {
            toast.error(
                "As bibliotecas de PDF ainda estão sendo carregadas. Por favor, aguarde."
            );
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
                doc.text("Relatório de Dispositivos com Defeito", pageWidth / 2, titleY, {
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

            // Group devices by dashboard
            const groupedDevices: Record<string, DefectiveDevice[]> = {};
            defectiveDevices.forEach(device => {
                if (!groupedDevices[device.dashboard]) {
                    groupedDevices[device.dashboard] = [];
                }
                groupedDevices[device.dashboard].push(device);
            });

            // Calculate totals
            const totalDefectiveDevices = defectiveDevices.length;

            if (defectiveDevices.length === 0) {
                pdf.setFontSize(12);
                pdf.text(
                    "Nenhum dispositivo com status defeito encontrado para gerar o relatório.",
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

                pdf.text(`Total de Dispositivos com Defeito: ${totalDefectiveDevices}`, margin, yOffset);
                yOffset += lineHeight * 2;

                // Show count by dashboard
                Object.keys(groupedDevices).forEach(dashboard => {
                    const count = groupedDevices[dashboard].length;
                    pdf.text(`${formatDashboardName(dashboard)}: ${count}`, margin + 10, yOffset);
                    yOffset += lineHeight;
                });

                yOffset += lineHeight;

                // --- Adiciona a lista detalhada de dispositivos por dashboard ---
                Object.keys(groupedDevices).forEach(dashboard => {
                    if (yOffset > pageHeight - 80) {
                        pdf.addPage();
                        yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
                        addFooter(pdf);
                        yOffset += 10;
                    }

                    pdf.setFont("helvetica", "bold");
                    pdf.setFontSize(16);
                    pdf.setTextColor(0, 0, 128);
                    pdf.text(`Dispositivos com Defeito - ${formatDashboardName(dashboard)}`, margin, yOffset);
                    yOffset += lineHeight * 2;

                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(10);
                    pdf.setTextColor(50, 50, 50);

                    groupedDevices[dashboard].forEach((device, index) => {
                        if (yOffset > pageHeight - 80) {
                            pdf.addPage();
                            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
                            addFooter(pdf);
                            yOffset += 10;
                        }

                        // Informações do dispositivo
                        pdf.setFont("helvetica", "bold");
                        pdf.setFontSize(14);

                        // Define a cor para vermelho (255, 0, 0) apenas para a linha do dispositivo
                        pdf.setTextColor(255, 0, 0);
                        pdf.text(`${index + 1}. ${device.name || "Dispositivo sem nome"}`, margin, yOffset);
                        yOffset += lineHeight;

                        // Depois de desenhar o nome, você redefine a cor para cinza
                        pdf.setFont("helvetica", "normal");
                        pdf.setFontSize(10);
                        pdf.setTextColor(50, 50, 50);

                        // Detalhes do dispositivo
                        const details = [
                            `Tipo: ${formatDeviceType(device.type)}`,
                            `Localização: ${device.location || "N/A"}`,
                            `Última Atualização: ${formatDate(device.lastUpdated)}`,
                        ];

                        // Add additional info if available
                        if (device.additionalInfo) {
                            Object.keys(device.additionalInfo).forEach(key => {
                                if (device.additionalInfo && device.additionalInfo[key] !== undefined && device.additionalInfo[key] !== null) {
                                    // Format the key for better readability
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    // Special handling for certain keys
                                    if (key === 'ultimaAtivacao' && device.additionalInfo[key]) {
                                        details.push(`${formattedKey}: ${formatDate(device.additionalInfo[key])}`);
                                    } else {
                                        details.push(`${formattedKey}: ${device.additionalInfo[key]}`);
                                    }
                                }
                            });
                        }

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

                        yOffset += lineHeight; // Espaçamento entre dispositivos
                    });

                    yOffset += lineHeight; // Extra spacing between dashboards
                });
            }

            // Salva o PDF
            const fileName = `relatorio-dispositivos-defeito-${new Date().toISOString().split("T")[0]}.pdf`;
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
                disabled={isGenerating}
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
                        <span>Gerar PDF</span>
                    </>
                )}
            </Button>
        </>
    );
};

export default PdfDefeitosButton;