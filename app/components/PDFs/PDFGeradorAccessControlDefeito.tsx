/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AccessController, RequestButton, Electromagnet, MagneticSensor } from "../../../types/accessControl";
import { formatStatus, addPageHeader, addFooter, imageUrlToBase64 } from "@/app/components/PDFs/pdfUtils";

interface PDFGeradorAccessControlDefeitoProps {
    devices: {
        controllers: AccessController[];
        buttons: RequestButton[];
        electromagnets: Electromagnet[];
        sensors: MagneticSensor[];
    };
    onClose?: () => void; // Add onClose callback
}



const PDFGeradorAccessControlDefeito: React.FC<PDFGeradorAccessControlDefeitoProps> = ({ devices, onClose }) => {
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


            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 8;
            let yOffset = margin;
            const lineHeight = 7;

            yOffset = addPageHeader(pdf, 1, "Relatório de Dispositivos com Defeito");
            addFooter(pdf);

            // Filter devices with "DEFEITO" status
            const defectiveControllers = devices.controllers.filter(
                (controller) => controller.status === "DEFEITO"
            );
            const defectiveButtons = devices.buttons.filter(
                (button) => button.status === "DEFEITO"
            );
            const defectiveElectromagnets = devices.electromagnets.filter(
                (electromagnet) => electromagnet.status === "DEFEITO"
            );
            const defectiveSensors = devices.sensors.filter(
                (sensor) => sensor.status === "DEFEITO"
            );

            // Collect all image paths from defective devices
            const allImagePaths: { deviceId: string; deviceName: string; imagePath: string; deviceType: string }[] = [];

            // Collect images from controllers
            defectiveControllers.forEach(controller => {
                if (controller.imagePaths) {
                    try {
                        const parsed = JSON.parse(controller.imagePaths);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(imagePath => {
                                // Normalize path separators to forward slashes for URL compatibility
                                const normalizedPath = imagePath.replace(/\\/g, '/');
                                allImagePaths.push({
                                    deviceId: controller.id,
                                    deviceName: controller.name,
                                    imagePath: normalizedPath,
                                    deviceType: "Controlador"
                                });
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing image paths for controller:", controller.id, e);
                    }
                }
            });

            // Collect images from buttons
            defectiveButtons.forEach(button => {
                if (button.imagePaths) {
                    try {
                        const parsed = JSON.parse(button.imagePaths);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(imagePath => {
                                // Normalize path separators to forward slashes for URL compatibility
                                const normalizedPath = imagePath.replace(/\\/g, '/');
                                allImagePaths.push({
                                    deviceId: button.id,
                                    deviceName: button.name,
                                    imagePath: normalizedPath,
                                    deviceType: "Botão"
                                });
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing image paths for button:", button.id, e);
                    }
                }
            });

            // Collect images from electromagnets
            defectiveElectromagnets.forEach(electromagnet => {
                if (electromagnet.imagePaths) {
                    try {
                        const parsed = JSON.parse(electromagnet.imagePaths);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(imagePath => {
                                // Normalize path separators to forward slashes for URL compatibility
                                const normalizedPath = imagePath.replace(/\\/g, '/');
                                allImagePaths.push({
                                    deviceId: electromagnet.id,
                                    deviceName: electromagnet.name,
                                    imagePath: normalizedPath,
                                    deviceType: "Eletroímã"
                                });
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing image paths for electromagnet:", electromagnet.id, e);
                    }
                }
            });

            // Collect images from sensors
            defectiveSensors.forEach(sensor => {
                if (sensor.imagePaths) {
                    try {
                        const parsed = JSON.parse(sensor.imagePaths);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(imagePath => {
                                // Normalize path separators to forward slashes for URL compatibility
                                const normalizedPath = imagePath.replace(/\\/g, '/');
                                allImagePaths.push({
                                    deviceId: sensor.id,
                                    deviceName: sensor.name,
                                    imagePath: normalizedPath,
                                    deviceType: "Sensor"
                                });
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing image paths for sensor:", sensor.id, e);
                    }
                }
            });

            // Add content for controllers
            if (defectiveControllers.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                yOffset += 10;
                if (yOffset > pageHeight - 50) {
                    pdf.addPage();
                    yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                    addFooter(pdf);
                }
                pdf.text("Controladores com Defeito", margin, yOffset);
                yOffset += 10;

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);

                defectiveControllers.forEach((controller) => {
                    if (yOffset > pageHeight - 50) {
                        pdf.addPage();
                        yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                        addFooter(pdf);
                    }

                    const controllerInfo = [
                        `ID: ${controller.id}`,
                        `Nome: ${controller.name}`,
                        `Localização: ${controller.location || "N/A"}`,
                        `Status: ${formatStatus(controller.status)}`,
                        `IP: ${controller.ipAddress || "N/A"}`,
                        `Última Atualização: ${controller.lastUpdated || "N/A"}`,
                        `Descrição: ${controller.description || "N/A"}`
                    ];

                    controllerInfo.forEach((info) => {
                        if (yOffset > pageHeight - 30) {
                            pdf.addPage();
                            yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                            addFooter(pdf);
                        }
                        pdf.text(info, margin, yOffset);
                        yOffset += lineHeight;
                    });

                    yOffset += 5; // Space between devices
                });
            }

            // Add content for buttons
            if (defectiveButtons.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                yOffset += 10;
                if (yOffset > pageHeight - 50) {
                    pdf.addPage();
                    yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                    addFooter(pdf);
                }
                pdf.text("Botões com Defeito", margin, yOffset);
                yOffset += 10;

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);

                defectiveButtons.forEach((button) => {
                    if (yOffset > pageHeight - 50) {
                        pdf.addPage();
                        yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                        addFooter(pdf);
                    }

                    const buttonInfo = [
                        `ID: ${button.id}`,
                        `Nome: ${button.name}`,
                        `Localização: ${button.location || "N/A"}`,
                        `Status: ${formatStatus(button.status)}`,
                        `Tipo: ${button.buttonType || "N/A"}`,
                        `Pressionado: ${button.isPressed ? "Sim" : "Não"}`,
                        `Última Pressão: ${button.lastPressed || "N/A"}`,
                        `Última Atualização: ${button.lastUpdated || "N/A"}`,
                        `Descrição: ${button.description || "N/A"}`
                    ];

                    buttonInfo.forEach((info) => {
                        if (yOffset > pageHeight - 30) {
                            pdf.addPage();
                            yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                            addFooter(pdf);
                        }
                        pdf.text(info, margin, yOffset);
                        yOffset += lineHeight;
                    });

                    yOffset += 5; // Space between devices
                });
            }

            // Add content for electromagnets
            if (defectiveElectromagnets.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                yOffset += 10;
                if (yOffset > pageHeight - 50) {
                    pdf.addPage();
                    yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                    addFooter(pdf);
                }
                pdf.text("Eletroímãs com Defeito", margin, yOffset);
                yOffset += 10;

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);

                defectiveElectromagnets.forEach((electromagnet) => {
                    if (yOffset > pageHeight - 50) {
                        pdf.addPage();
                        yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                        addFooter(pdf);
                    }

                    const electromagnetInfo = [
                        `ID: ${electromagnet.id}`,
                        `Nome: ${electromagnet.name}`,
                        `Localização: ${electromagnet.location || "N/A"}`,
                        `Status: ${formatStatus(electromagnet.status)}`,
                        `Travado: ${electromagnet.isLocked ? "Sim" : "Não"}`,
                        `Status da Trava: ${electromagnet.lockStatus || "N/A"}`,
                        `Consumo: ${electromagnet.powerConsumption || "N/A"} W`,
                        `Última Atualização: ${electromagnet.lastUpdated || "N/A"}`,
                        `Descrição: ${electromagnet.description || "N/A"}`
                    ];

                    electromagnetInfo.forEach((info) => {
                        if (yOffset > pageHeight - 30) {
                            pdf.addPage();
                            yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                            addFooter(pdf);
                        }
                        pdf.text(info, margin, yOffset);
                        yOffset += lineHeight;
                    });

                    yOffset += 5; // Space between devices
                });
            }

            // Add content for sensors
            if (defectiveSensors.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                yOffset += 10;
                if (yOffset > pageHeight - 50) {
                    pdf.addPage();
                    yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                    addFooter(pdf);
                }
                pdf.text("Sensores com Defeito", margin, yOffset);
                yOffset += 10;

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);

                defectiveSensors.forEach((sensor) => {
                    if (yOffset > pageHeight - 50) {
                        pdf.addPage();
                        yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                        addFooter(pdf);
                    }

                    const sensorInfo = [
                        `ID: ${sensor.id}`,
                        `Nome: ${sensor.name}`,
                        `Localização: ${sensor.location || "N/A"}`,
                        `Status: ${formatStatus(sensor.status)}`,
                        `Tipo: ${sensor.sensorType || "N/A"}`,
                        `Fechado: ${sensor.isClosed ? "Sim" : "Não"}`,
                        `Última Ativação: ${sensor.lastTriggered || "N/A"}`,
                        `Última Atualização: ${sensor.lastUpdated || "N/A"}`,
                        `Descrição: ${sensor.description || "N/A"}`
                    ];

                    sensorInfo.forEach((info) => {
                        if (yOffset > pageHeight - 30) {
                            pdf.addPage();
                            yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                            addFooter(pdf);
                        }
                        pdf.text(info, margin, yOffset);
                        yOffset += lineHeight;
                    });

                    yOffset += 5; // Space between devices
                });
            }

            // Add images section if there are any images
            if (allImagePaths.length > 0) {
                pdf.addPage();
                yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                addFooter(pdf);

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                yOffset += 10;
                if (yOffset > pageHeight - 50) {
                    pdf.addPage();
                    yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                    addFooter(pdf);
                }
                pdf.text(`Imagens dos Dispositivos com Defeito (${allImagePaths.length} imagens)`, margin, yOffset);
                yOffset += 15;

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);

                // Process images and add them to PDF
                for (let i = 0; i < allImagePaths.length; i++) {
                    const image = allImagePaths[i];
                    const imageUrl = `${window.location.origin}/api/serve-image?imagePath=${encodeURIComponent(image.imagePath)}&module=access-control`;

                    if (yOffset > pageHeight - 120) {
                        pdf.addPage();
                        yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                        addFooter(pdf);
                        yOffset += 15;
                    }

                    // Add image info
                    pdf.text(`Dispositivo: ${image.deviceName} (${image.deviceType})`, margin, yOffset);
                    yOffset += 7;
                    pdf.text(`ID: ${image.deviceId}`, margin, yOffset);
                    yOffset += 10;

                    try {
                        // Convert image to base64 and add to PDF
                        const base64Image = await imageUrlToBase64(imageUrl);

                        // Use fixed dimensions that maintain aspect ratio
                        const width = 60;  // Fixed width
                        const height = 80;  // Fixed height

                        if (yOffset + height > pageHeight - 30) {
                            pdf.addPage();
                            yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                            addFooter(pdf);
                            yOffset += 15;
                        }

                        pdf.addImage(base64Image, "JPEG", margin, yOffset, width, height);
                        yOffset += height + 10;
                    } catch (error) {
                        console.error("Error adding image to PDF:", error);
                        pdf.text("[Erro ao carregar imagem]", margin, yOffset);
                        yOffset += 10;
                    }

                    yOffset += 5; // Space between images

                    // Add a new page after every 2 images to avoid overcrowding
                    if ((i + 1) % 2 === 0 && i < allImagePaths.length - 1) {
                        pdf.addPage();
                        yOffset = addPageHeader(pdf, pdf.getNumberOfPages(), "Relatório de Dispositivos com Defeito");
                        addFooter(pdf);
                        yOffset += 15;
                    }
                }
            }

            // Save the PDF
            pdf.save("dispositivos-com-defeito.pdf");
            toast.success("PDF gerado com sucesso!");

            // Close the modal after successful PDF generation
            if (onClose) {
                setTimeout(() => {
                    onClose();
                }, 2000); // Close after 2 seconds to allow user to see the success message
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Erro ao gerar PDF. Por favor, tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Button
                    variant="secondary"
                    onClick={generatePdf}
                    disabled={isGenerating}
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
            </div>
        </>
    );
};

export default PDFGeradorAccessControlDefeito;