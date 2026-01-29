/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Garante que seja um Client Component

import React, { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify"; // Importa toast e ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importa o CSS do react-toastify
import { LOGO_BASE64 } from "../../img/logoBase64"; // Certifique-se de que este arquivo e o LOGO_BASE64 existem
import { Cm, Equipamento, Sensor, SensorStatus } from "../../../types";

interface PDFGeradorSdaiProps {
  cmsData: Cm[];
}

const PDFGeradorSdai: React.FC<PDFGeradorSdaiProps> = ({ cmsData }) => {
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
        doc.text("Relatório de Sensores SDAI", pageWidth / 2, titleY, {
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

      // Calcula totais
      const totalCms = cmsData.length;
      const totalEquipamentos = cmsData.reduce(
        (acc, cm) => acc + (cm.equipamentos?.length || 0),
        0
      );
      const totalSensores = cmsData.reduce(
        (acc, cm) =>
          acc +
          (cm.equipamentos?.reduce(
            (eqAcc, eq) => eqAcc + (eq.sensores?.length || 0),
            0
          ) || 0),
        0
      );
      const sensoresComDefeito = cmsData.reduce(
        (acc, cm) =>
          acc +
          (cm.equipamentos?.reduce(
            (eqAcc, eq) =>
              eqAcc +
              (eq.sensores?.filter((s) => s.estado === SensorStatus.DEFEITO)
                .length || 0),
            0
          ) || 0),
        0
      );

      if (cmsData.length === 0) {
        pdf.setFontSize(12);
        pdf.text(
          "Nenhuma Casa de Máquinas encontrada para gerar o relatório.",
          pageWidth / 2,
          yOffset + 20,
          { align: "center" }
        );
      } else {
        // --- Adiciona o Resumo na primeira página ---
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        yOffset += 10;
        pdf.text("Resumo do Relatório", margin, yOffset);
        yOffset += lineHeight * 2;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(50, 50, 50);

        pdf.text(`Total de CMs: ${totalCms}`, margin, yOffset);
        yOffset += lineHeight;
        pdf.text(
          `Total de Equipamentos: ${totalEquipamentos}`,
          margin,
          yOffset
        );
        yOffset += lineHeight;
        pdf.text(`Total de Sensores SDAI: ${totalSensores}`, margin, yOffset);
        yOffset += lineHeight;
        pdf.text(
          `Sensores com Defeito: ${sensoresComDefeito}`,
          margin,
          yOffset
        );
        yOffset += lineHeight * 2;

        // --- Adiciona a lista detalhada de CMs ---
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        pdf.text("Detalhes por Casa de Máquinas", margin, yOffset);
        yOffset += lineHeight * 2;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);

        cmsData.forEach((cm, index) => {
          if (yOffset > pageHeight - 80) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
            yOffset += 10;
          }

          // Informações da CM
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.setTextColor(0, 100, 0);
          pdf.text(
            `${index + 1}. CM: ${cm.nome} (${cm.localizacao})`,
            margin,
            yOffset
          );
          yOffset += lineHeight * 2;

          const totalEqCm = cm.equipamentos?.length || 0;
          const totalSensoresCm =
            cm.equipamentos?.reduce(
              (acc, eq) => acc + (eq.sensores?.length || 0),
              0
            ) || 0;
          const sensoresDefeitoCm =
            cm.equipamentos?.reduce(
              (acc, eq) =>
                acc +
                (eq.sensores?.filter((s) => s.estado === SensorStatus.DEFEITO)
                  .length || 0),
              0
            ) || 0;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text(`   Total de Equipamentos: ${totalEqCm}`, margin, yOffset);
          yOffset += lineHeight;
          pdf.text(`   Total de Sensores: ${totalSensoresCm}`, margin, yOffset);
          yOffset += lineHeight;
          pdf.text(
            `   Sensores com Defeito: ${sensoresDefeitoCm}`,
            margin,
            yOffset
          );
          yOffset += lineHeight * 2;

          // Detalhes dos Equipamentos
          if (cm.equipamentos && cm.equipamentos.length > 0) {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(
              `   Equipamentos (${cm.equipamentos.length}):`,
              margin + 5,
              yOffset
            );
            yOffset += lineHeight;

            cm.equipamentos.forEach((eq) => {
              if (yOffset > pageHeight - 100) {
                pdf.addPage();
                yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
                addFooter(pdf);
                yOffset += 10;
              }

              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(10);
              pdf.text(`      • ${eq.nome}`, margin + 10, yOffset);
              yOffset += lineHeight;

              // Detalhes dos Sensores
              if (eq.sensores && eq.sensores.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(10);
                pdf.text(
                  `        Sensores SDAI (${eq.sensores.length}):`,
                  margin + 15,
                  yOffset
                );
                yOffset += lineHeight;

                eq.sensores.forEach((sensor) => {
                  if (yOffset > pageHeight - 100) {
                    pdf.addPage();
                    yOffset = addPageHeader(
                      pdf,
                      pdf.internal.getNumberOfPages()
                    );
                    addFooter(pdf);
                    yOffset += 10;
                  }

                  pdf.setFont("helvetica", "normal");
                  pdf.setFontSize(9);
                  pdf.text(
                    `          - ${sensor.nome} (Tipo: ${sensor.tipo})`,
                    margin + 20,
                    yOffset
                  );
                  yOffset += lineHeight;

                  // Status do sensor
                  let statusText = "Operacional";
                  let textColor = [0, 128, 0]; // Verde

                  if (sensor.estado === SensorStatus.DEFEITO) {
                    statusText = "DEFEITO";
                    textColor = [255, 0, 0]; // Vermelho
                  } else if (sensor.estado === SensorStatus.MANUTENCAO) {
                    statusText = "MANUTENÇÃO";
                    textColor = [255, 165, 0]; // Laranja
                  } else if (sensor.estado === SensorStatus.DESCONHECIDO) {
                    statusText = "DESCONHECIDO";
                    textColor = [128, 128, 128]; // Cinza
                  }

                  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
                  pdf.setFont("helvetica", "bold");
                  pdf.text(
                    `            Status: ${statusText}`,
                    margin + 25,
                    yOffset
                  );
                  pdf.setTextColor(50, 50, 50);
                  pdf.setFont("helvetica", "normal");
                  yOffset += lineHeight;

                  if (
                    sensor.estado === SensorStatus.DEFEITO &&
                    sensor.descricaoDefeito
                  ) {
                    pdf.setTextColor(255, 0, 0);
                    pdf.setFont("helvetica", "bold");
                    const defectText = pdf.splitTextToSize(
                      `            Descrição do Defeito: ${sensor.descricaoDefeito}`,
                      pageWidth - margin * 2 - 30
                    );
                    defectText.forEach((line: string) => {
                      pdf.text(line, margin + 25, yOffset);
                      yOffset += lineHeight;
                    });
                    pdf.setTextColor(50, 50, 50);
                    pdf.setFont("helvetica", "normal");
                  }
                });
                yOffset += lineHeight;
              } else {
                pdf.setFont("helvetica", "italic");
                pdf.setFontSize(9);
                pdf.text(
                  "        Nenhum sensor SDAI encontrado",
                  margin + 15,
                  yOffset
                );
                yOffset += lineHeight * 1.5;
              }
            });
            yOffset += lineHeight;
          } else {
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(10);
            pdf.text("   Nenhum equipamento encontrado", margin + 5, yOffset);
            yOffset += lineHeight * 2;
          }

          yOffset += lineHeight; // Espaço entre CMs
        });
      }

      pdf.save("relatorio_sensores_sdai.pdf");
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error(
        "Ocorreu um erro ao gerar o PDF. Por favor, tente novamente."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={generatePdf}
        disabled={isGenerating || !isScriptLoaded || cmsData.length === 0}
        className="mt-4 shadow-lg animated-bounce"
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
            Gerando PDF...
          </>
        ) : !isScriptLoaded ? (
          "Carregando bibliotecas..."
        ) : cmsData.length === 0 ? (
          "Nenhum dado para gerar PDF"
        ) : (
          "Gerar PDF de Sensores SDAI"
        )}
      </Button>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default PDFGeradorSdai;
