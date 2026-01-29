/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LOGO_BASE64 } from "@/app/img/logoBase64";

// Import types
import {
    AccessController,
    RequestButton,
    Electromagnet,
    MagneticSensor
} from "../../../types/accessControl";
import { Cvf, AtuadorLoja, SensorLoja, Atuador, Sensor } from "../../../types";

interface DefectiveDevice {
    id: string;
    name: string;
    type: string;
    location?: string;
    lastUpdated?: string;
    dashboard: string;
    additionalInfo?: Record<string, any>;
}

const PDFGeradorTodosDefeitos: React.FC = () => {
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
                return "Centrais de Monitoramento";
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

    // Fetch data from all dashboard APIs
    const fetchAllDefectiveData = async () => {
        try {
            const defectiveDevices: DefectiveDevice[] = [];

            // Fetch Access Control Defective Data
            try {
                const accessControlResponse = await fetch('/api/access-control');
                if (accessControlResponse.ok) {
                    const accessControlData = await accessControlResponse.json();
                    const data = accessControlData.success ? accessControlData.data : accessControlData;

                    // Controllers with defects
                    const defectiveControllers = (data.controllers || []).filter(
                        (controller: AccessController) => controller.status === "DEFEITO"
                    );

                    defectiveControllers.forEach((controller: AccessController) => {
                        defectiveDevices.push({
                            id: controller.id,
                            name: controller.name,
                            type: "controller",
                            location: controller.location,
                            lastUpdated: controller.lastUpdated,
                            dashboard: "access-control",
                            additionalInfo: {
                                ipAddress: controller.ipAddress,
                                description: controller.description
                            }
                        });
                    });

                    // Buttons with defects
                    const defectiveButtons = (data.buttons || []).filter(
                        (button: RequestButton) => button.status === "DEFEITO"
                    );

                    defectiveButtons.forEach((button: RequestButton) => {
                        defectiveDevices.push({
                            id: button.id,
                            name: button.name,
                            type: "button",
                            location: button.location,
                            lastUpdated: button.lastUpdated,
                            dashboard: "access-control",
                            additionalInfo: {
                                buttonType: button.buttonType,
                                isPressed: button.isPressed,
                                lastPressed: button.lastPressed,
                                description: button.description
                            }
                        });
                    });

                    // Electromagnets with defects
                    const defectiveElectromagnets = (data.electromagnets || []).filter(
                        (electromagnet: Electromagnet) => electromagnet.status === "DEFEITO"
                    );

                    defectiveElectromagnets.forEach((electromagnet: Electromagnet) => {
                        defectiveDevices.push({
                            id: electromagnet.id,
                            name: electromagnet.name,
                            type: "electromagnet",
                            location: electromagnet.location,
                            lastUpdated: electromagnet.lastUpdated,
                            dashboard: "access-control",
                            additionalInfo: {
                                isLocked: electromagnet.isLocked,
                                lockStatus: electromagnet.lockStatus,
                                powerConsumption: electromagnet.powerConsumption,
                                description: electromagnet.description
                            }
                        });
                    });

                    // Sensors with defects
                    const defectiveSensors = (data.sensors || []).filter(
                        (sensor: MagneticSensor) => sensor.status === "DEFEITO"
                    );

                    defectiveSensors.forEach((sensor: MagneticSensor) => {
                        defectiveDevices.push({
                            id: sensor.id,
                            name: sensor.name,
                            type: "sensor",
                            location: sensor.location,
                            lastUpdated: sensor.lastUpdated,
                            dashboard: "access-control",
                            additionalInfo: {
                                sensorType: sensor.sensorType,
                                isClosed: sensor.isClosed,
                                lastTriggered: sensor.lastTriggered,
                                description: sensor.description
                            }
                        });
                    });
                }
            } catch (error) {
                console.error("Error fetching access control data:", error);
            }

            // Fetch CVF Defective Data
            try {
                const cvfResponse = await fetch('/api/cvf');
                if (cvfResponse.ok) {
                    const cvfData = await cvfResponse.json();
                    const cvfs = Array.isArray(cvfData) ? cvfData : (cvfData.cvfs || []);

                    const defectiveCvfs = cvfs.filter(
                        (cvf: Cvf) =>
                            cvf.sensorTemperatura === "DEFEITO" ||
                            cvf.sensorUmidade === "DEFEITO" ||
                            cvf.atuador === "DEFEITO"
                    );

                    defectiveCvfs.forEach((cvf: Cvf) => {
                        defectiveDevices.push({
                            id: cvf.id,
                            name: `${cvf.vigaFria || 'N/A'} - ${cvf.piso || 'N/A'}`,
                            type: "cvf",
                            location: `${cvf.localizacaoQuadro || 'N/A'} / ${cvf.localizacaoValvula || 'N/A'}`,
                            lastUpdated: new Date().toISOString(), // CVF doesn't seem to have lastUpdated field
                            dashboard: "cvf",
                            additionalInfo: {
                                vigaFria: cvf.vigaFria,
                                piso: cvf.piso,
                                sensorTemperatura: cvf.sensorTemperatura,
                                sensorUmidade: cvf.sensorUmidade,
                                atuador: cvf.atuador,
                                localizacaoQuadro: cvf.localizacaoQuadro,
                                localizacaoValvula: cvf.localizacaoValvula,
                                observacoes: cvf.observacoes
                            }
                        });
                    });
                }
            } catch (error) {
                console.error("Error fetching CVF data:", error);
            }

            // Fetch Lojas Defective Data
            try {
                const lojasResponse = await fetch('/api/lojasApi/lojas');
                if (lojasResponse.ok) {
                    const lojasData = await lojasResponse.json();
                    const lojas = Array.isArray(lojasData) ? lojasData : (lojasData.lojas || []);

                    lojas.forEach((loja: any) => {
                        // Check direct actuators
                        if (loja.atuadores && Array.isArray(loja.atuadores)) {
                            const defectiveAtuadores = loja.atuadores.filter(
                                (atuador: AtuadorLoja) => atuador.estado === "DEFEITO"
                            );

                            defectiveAtuadores.forEach((atuador: AtuadorLoja) => {
                                defectiveDevices.push({
                                    id: atuador.id,
                                    name: atuador.nome,
                                    type: "atuador-loja",
                                    location: loja.nome,
                                    lastUpdated: new Date().toISOString(), // AtuadorLoja doesn't have lastUpdated field
                                    dashboard: "lojas",
                                    additionalInfo: {
                                        tipo: atuador.tipo,
                                        valorAtual: atuador.valorAtual,
                                        descricaoDefeito: atuador.descricaoDefeito
                                    }
                                });
                            });
                        }

                        // Check direct sensors
                        if (loja.sensores && Array.isArray(loja.sensores)) {
                            const defectiveSensores = loja.sensores.filter(
                                (sensor: SensorLoja) => sensor.estado === "DEFEITO"
                            );

                            defectiveSensores.forEach((sensor: SensorLoja) => {
                                defectiveDevices.push({
                                    id: sensor.id,
                                    name: sensor.nome,
                                    type: "sensor-loja",
                                    location: loja.nome,
                                    lastUpdated: new Date().toISOString(), // SensorLoja doesn't have lastUpdated field
                                    dashboard: "lojas",
                                    additionalInfo: {
                                        tipo: sensor.tipo,
                                        estado: sensor.estado,
                                        descricaoDefeito: sensor.descricaoDefeito
                                    }
                                });
                            });
                        }

                        // Check detection equipment
                        if (loja.equipamentosDeteccao && Array.isArray(loja.equipamentosDeteccao)) {
                            const defectiveEquipamentos = loja.equipamentosDeteccao.filter(
                                (equipamento: any) => equipamento.estado === "DEFEITO"
                            );

                            defectiveEquipamentos.forEach((equipamento: any) => {
                                defectiveDevices.push({
                                    id: equipamento.id,
                                    name: equipamento.nome,
                                    type: "equipamento-deteccao",
                                    location: loja.nome,
                                    lastUpdated: new Date().toISOString(), // FireDetectionEquipmentLoja doesn't have lastUpdated field
                                    dashboard: "lojas",
                                    additionalInfo: {
                                        tipo: equipamento.tipo,
                                        estado: equipamento.estado,
                                        descricaoDefeito: equipamento.descricaoDefeito
                                    }
                                });
                            });
                        }

                        // Check equipment
                        if (loja.equipamentos && Array.isArray(loja.equipamentos)) {
                            const defectiveEquipamentos = loja.equipamentos.filter(
                                (equipamento: any) => equipamento.status === "DEFEITO"
                            );

                            defectiveEquipamentos.forEach((equipamento: any) => {
                                defectiveDevices.push({
                                    id: equipamento.id,
                                    name: equipamento.nome,
                                    type: "equipamento-loja",
                                    location: loja.nome,
                                    lastUpdated: new Date().toISOString(), // EquipamentoLoja doesn't have lastUpdated field
                                    dashboard: "lojas",
                                    additionalInfo: {
                                        tipo: equipamento.tipo,
                                        estado: equipamento.status,
                                        descricaoDefeito: equipamento.descricaoDefeito
                                    }
                                });
                            });
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching Lojas data:", error);
            }

            // Fetch CMS Defective Data
            try {
                const cmsResponse = await fetch('/api/cmsApi/cms');
                if (cmsResponse.ok) {
                    const cmsData = await cmsResponse.json();
                    const cmsList = Array.isArray(cmsData) ? cmsData : (cmsData.data || cmsData);

                    if (Array.isArray(cmsList)) {
                        cmsList.forEach((cms: any) => {
                            // Check actuators
                            if (cms.atuadores && Array.isArray(cms.atuadores)) {
                                const defectiveAtuadores = cms.atuadores.filter(
                                    (atuador: Atuador) => atuador.estado === "DEFEITO"
                                );

                                defectiveAtuadores.forEach((atuador: Atuador) => {
                                    defectiveDevices.push({
                                        id: atuador.id,
                                        name: atuador.nome,
                                        type: "atuador-cms",
                                        location: cms.nome,
                                        lastUpdated: new Date().toISOString(), // CMS actuators don't have lastUpdated field
                                        dashboard: "cms",
                                        additionalInfo: {
                                            tipo: atuador.tipo,
                                            valorAtual: atuador.valorAtual,
                                            descricaoDefeito: atuador.descricaoDefeito
                                        }
                                    });
                                });
                            }

                            // Check sensors
                            if (cms.sensores && Array.isArray(cms.sensores)) {
                                const defectiveSensores = cms.sensores.filter(
                                    (sensor: Sensor) => sensor.estado === "DEFEITO"
                                );

                                defectiveSensores.forEach((sensor: Sensor) => {
                                    defectiveDevices.push({
                                        id: sensor.id,
                                        name: sensor.nome,
                                        type: "sensor-cms",
                                        location: cms.nome,
                                        lastUpdated: new Date().toISOString(), // CMS sensors don't have lastUpdated field
                                        dashboard: "cms",
                                        additionalInfo: {
                                            tipo: sensor.tipo,
                                            estado: sensor.estado,
                                            descricaoDefeito: sensor.descricaoDefeito
                                        }
                                    });
                                });
                            }

                            // Check machines
                            if (cms.maquinas && Array.isArray(cms.maquinas)) {
                                cms.maquinas.forEach((maquina: any) => {
                                    // Check machine actuators
                                    if (maquina.atuadores && Array.isArray(maquina.atuadores)) {
                                        const defectiveAtuadores = maquina.atuadores.filter(
                                            (atuador: Atuador) => atuador.estado === "DEFEITO"
                                        );

                                        defectiveAtuadores.forEach((atuador: Atuador) => {
                                            defectiveDevices.push({
                                                id: atuador.id,
                                                name: atuador.nome,
                                                type: "atuador-cms",
                                                location: `${cms.nome} - ${maquina.nome}`,
                                                lastUpdated: new Date().toISOString(), // CMS actuators don't have lastUpdated field
                                                dashboard: "cms",
                                                additionalInfo: {
                                                    tipo: atuador.tipo,
                                                    valorAtual: atuador.valorAtual,
                                                    descricaoDefeito: atuador.descricaoDefeito
                                                }
                                            });
                                        });
                                    }

                                    // Check machine sensors
                                    if (maquina.sensores && Array.isArray(maquina.sensores)) {
                                        const defectiveSensores = maquina.sensores.filter(
                                            (sensor: Sensor) => sensor.estado === "DEFEITO"
                                        );

                                        defectiveSensores.forEach((sensor: Sensor) => {
                                            defectiveDevices.push({
                                                id: sensor.id,
                                                name: sensor.nome,
                                                type: "sensor-cms",
                                                location: `${cms.nome} - ${maquina.nome}`,
                                                lastUpdated: new Date().toISOString(), // CMS sensors don't have lastUpdated field
                                                dashboard: "cms",
                                                additionalInfo: {
                                                    tipo: sensor.tipo,
                                                    estado: sensor.estado,
                                                    descricaoDefeito: sensor.descricaoDefeito
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching CMS data:", error);
            }

            return defectiveDevices;
        } catch (error) {
            console.error("Error fetching defective data:", error);
            throw error;
        }
    };

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
                doc.text("Relatório Consolidado de Dispositivos com Defeito", pageWidth / 2, titleY, {
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

            // Fetch all defective devices
            const allDefectiveDevices = await fetchAllDefectiveData();

            // Group devices by dashboard
            const groupedDevices: Record<string, DefectiveDevice[]> = {};
            allDefectiveDevices.forEach(device => {
                if (!groupedDevices[device.dashboard]) {
                    groupedDevices[device.dashboard] = [];
                }
                groupedDevices[device.dashboard].push(device);
            });

            // Calculate totals
            const totalDefectiveDevices = allDefectiveDevices.length;

            if (allDefectiveDevices.length === 0) {
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
                            `Dashboard: ${formatDashboardName(device.dashboard)}`,
                            `Localização: ${device.location || "N/A"}`,
                            `Última Atualização: ${device.lastUpdated ? new Date(device.lastUpdated).toLocaleString("pt-BR") : "N/A"}`,
                        ];

                        // Add additional info if available
                        if (device.additionalInfo) {
                            Object.keys(device.additionalInfo).forEach(key => {
                                if (device.additionalInfo && device.additionalInfo[key] !== undefined && device.additionalInfo[key] !== null) {
                                    // Format the key for better readability
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    // Special handling for certain keys
                                    if (key === 'ultimaAtivacao' && device.additionalInfo[key]) {
                                        details.push(`${formattedKey}: ${new Date(device.additionalInfo[key]).toLocaleString("pt-BR")}`);
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
            const fileName = `relatorio-consolidado-dispositivos-defeito-${new Date().toISOString().split("T")[0]}.pdf`;
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
                        <span>PDF Consolidado de Todos os Defeitos</span>
                    </>
                )}
            </Button>
        </>
    );
};

export default PDFGeradorTodosDefeitos;