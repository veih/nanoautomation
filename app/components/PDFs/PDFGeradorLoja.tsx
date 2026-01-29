/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Garante que seja um Client Component

import React, { useState, useEffect, useCallback } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify"; // Importa toast e ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importa o CSS do react-toastify
import { LOGO_BASE64 } from "../../img/logoBase64"; // Certifique-se de que este arquivo e o LOGO_BASE64 existem
import { Loja, EquipamentoLoja, AtuadorLoja, SensorLoja } from "../../../types";

interface PDFGeradorLojaProps {
  lojasData: Loja[];
}

const PDFGeradorLoja: React.FC<PDFGeradorLojaProps> = ({ lojasData }) => {
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
        doc.text("Relatório de Detalhes das Lojas", pageWidth / 2, titleY, {
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

      if (lojasData.length === 0) {
        pdf.setFontSize(12);
        pdf.text(
          "Nenhuma loja encontrada para gerar o relatório.",
          pageWidth / 2,
          yOffset + 20,
          { align: "center" }
        );
      } else {
        // --- Adiciona a lista detalhada de lojas ---
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        yOffset += 10;
        pdf.text("Detalhes das Lojas", margin, yOffset);
        yOffset += lineHeight * 2;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);

        lojasData.forEach((loja, index) => {
          if (yOffset > pageHeight - 80) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
            yOffset += 10;
          }

          // Informações da Loja
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.setTextColor(0, 100, 0);
          pdf.text(
            `${index + 1}. Loja: ${loja.nome} (LUC: ${loja.LUC})`,
            margin,
            yOffset
          );
          yOffset += lineHeight;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(50, 50, 50);
          pdf.text(
            `   Localização: ${loja.localizacao || "N/A"}`,
            margin,
            yOffset
          );
          yOffset += lineHeight;
          pdf.text(`   Smart: ${loja.smart || "N/A"}`, margin, yOffset);
          yOffset += lineHeight * 2;

          const totalEquipamentos = loja.equipamentosLoja?.length || 0;
          const totalAtuadores =
            (loja.equipamentosLoja?.reduce(
              (acc, eq) => acc + (eq.atuadoresLoja?.length || 0),
              0
            ) || 0) + (loja.atuadores?.length || 0);
          const totalSensores =
            (loja.equipamentosLoja?.reduce(
              (acc, eq) => acc + (eq.sensoresLoja?.length || 0),
              0
            ) || 0) + (loja.sensores?.length || 0);

          pdf.text(
            `   Total de Equipamentos: ${totalEquipamentos}`,
            margin,
            yOffset
          );
          yOffset += lineHeight;
          pdf.text(`   Total de Atuadores: ${totalAtuadores}`, margin, yOffset);
          yOffset += lineHeight;
          pdf.text(`   Total de Sensores: ${totalSensores}`, margin, yOffset);
          yOffset += lineHeight * 2;

          // Detalhes dos Equipamentos de Loja
          if (loja.equipamentosLoja && loja.equipamentosLoja.length > 0) {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(
              `   Equipamentos (${loja.equipamentosLoja.length}):`,
              margin + 5,
              yOffset
            );
            yOffset += lineHeight;

            loja.equipamentosLoja.forEach((eq) => {
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
              pdf.text(
                `        Descrição: ${eq.descricao || "N/A"}`,
                margin + 15,
                yOffset
              );
              yOffset += lineHeight;
              pdf.text(
                `        Status: ${eq.status || "N/A"}`,
                margin + 15,
                yOffset
              );
              yOffset += lineHeight * 1.5;

              // Detalhes dos Atuadores do Equipamento
              if (eq.atuadoresLoja && eq.atuadoresLoja.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(10);
                pdf.text(
                  `        Atuadores (${eq.atuadoresLoja.length}):`,
                  margin + 15,
                  yOffset
                );
                yOffset += lineHeight;

                eq.atuadoresLoja.forEach((atuador) => {
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
                    `          - ${atuador.nome} (Tipo: ${atuador.tipo})`,
                    margin + 20,
                    yOffset
                  );
                  yOffset += lineHeight;
                  pdf.text(
                    `            Valor Atual: ${atuador.valorAtual || "N/A"}`,
                    margin + 25,
                    yOffset
                  );
                  yOffset += lineHeight;

                  const isDefeito =
                    (atuador.existe === false ||
                      (atuador.valorAtual !== undefined &&
                        atuador.valorAtual <= 0)) &&
                    (atuador.descricaoDefeito?.trim() !== "" ||
                      atuador.motivoNaoExiste);

                  if (isDefeito) {
                    pdf.setTextColor(255, 0, 0);
                    pdf.setFont("helvetica", "bold");
                    const defectText = atuador.descricaoDefeito
                      ? `DEFEITO: ${atuador.descricaoDefeito}`
                      : atuador.motivoNaoExiste
                      ? `NÃO EXISTE: ${atuador.motivoNaoExiste}`
                      : "DEFEITO";
                    pdf.text(defectText, margin + 25, yOffset);
                    pdf.setTextColor(50, 50, 50);
                    pdf.setFont("helvetica", "normal");
                    yOffset += lineHeight;
                  }
                });
                yOffset += lineHeight;
              }

              // Detalhes dos Sensores do Equipamento
              if (eq.sensoresLoja && eq.sensoresLoja.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(10);
                pdf.text(
                  `        Sensores (${eq.sensoresLoja.length}):`,
                  margin + 15,
                  yOffset
                );
                yOffset += lineHeight;

                eq.sensoresLoja.forEach((sensor) => {
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
                  pdf.text(
                    `            Valor Atual: ${sensor.valorAtual || "N/A"}`,
                    margin + 25,
                    yOffset
                  );
                  yOffset += lineHeight;
                  pdf.text(
                    `            Última Ativação: ${
                      sensor.ultimaAtivacao || "N/A"
                    }`,
                    margin + 25,
                    yOffset
                  );
                  yOffset += lineHeight;

                  const isDefeito =
                    (sensor.existe === false ||
                      (sensor.valorAtual !== undefined &&
                        sensor.valorAtual <= 0)) &&
                    (sensor.motivoNaoExiste?.trim() !== "" ||
                      sensor.motivoNaoExiste);

                  if (isDefeito) {
                    pdf.setTextColor(255, 0, 0);
                    pdf.setFont("helvetica", "bold");
                    const defectText = sensor.motivoNaoExiste
                      ? `NÃO EXISTE: ${sensor.motivoNaoExiste}`
                      : "DEFEITO";
                    pdf.text(defectText, margin + 25, yOffset);
                    pdf.setTextColor(50, 50, 50);
                    pdf.setFont("helvetica", "normal");
                    yOffset += lineHeight;
                  }
                });
                yOffset += lineHeight;
              }
            });
            yOffset += lineHeight;
          }

          // Detalhes dos Atuadores Diretos da Loja
          if (loja.atuadores && loja.atuadores.length > 0) {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(
              `   Atuadores Diretos (${loja.atuadores.length}):`,
              margin + 5,
              yOffset
            );
            yOffset += lineHeight;

            loja.atuadores.forEach((atuador) => {
              if (yOffset > pageHeight - 100) {
                pdf.addPage();
                yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
                addFooter(pdf);
                yOffset += 10;
              }

              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(10);
              pdf.text(
                `      • ${atuador.nome} (Tipo: ${atuador.tipo})`,
                margin + 10,
                yOffset
              );
              yOffset += lineHeight;
              pdf.text(
                `        Valor Atual: ${atuador.valorAtual || "N/A"}`,
                margin + 15,
                yOffset
              );
              yOffset += lineHeight;

              const isDefeito =
                (atuador.existe === false ||
                  (atuador.valorAtual !== undefined &&
                    atuador.valorAtual <= 0)) &&
                (atuador.descricaoDefeito?.trim() !== "" ||
                  atuador.motivoNaoExiste);

              if (isDefeito) {
                pdf.setTextColor(255, 0, 0);
                pdf.setFont("helvetica", "bold");
                const defectText = atuador.descricaoDefeito
                  ? `DEFEITO: ${atuador.descricaoDefeito}`
                  : atuador.motivoNaoExiste
                  ? `NÃO EXISTE: ${atuador.motivoNaoExiste}`
                  : "DEFEITO";
                pdf.text(defectText, margin + 15, yOffset);
                pdf.setTextColor(50, 50, 50);
                pdf.setFont("helvetica", "normal");
                yOffset += lineHeight;
              }
            });
            yOffset += lineHeight;
          }

          // Detalhes dos Sensores Diretos da Loja
          if (loja.sensores && loja.sensores.length > 0) {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(
              `   Sensores Diretos (${loja.sensores.length}):`,
              margin + 5,
              yOffset
            );
            yOffset += lineHeight;

            loja.sensores.forEach((sensor) => {
              if (yOffset > pageHeight - 100) {
                pdf.addPage();
                yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
                addFooter(pdf);
                yOffset += 10;
              }

              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(10);
              pdf.text(
                `      • ${sensor.nome} (Tipo: ${sensor.tipo})`,
                margin + 10,
                yOffset
              );
              yOffset += lineHeight;
              pdf.text(
                `        Valor Atual: ${sensor.valorAtual || "N/A"}`,
                margin + 15,
                yOffset
              );
              yOffset += lineHeight;
              pdf.text(
                `        Última Ativação: ${sensor.ultimaAtivacao || "N/A"}`,
                margin + 15,
                yOffset
              );
              yOffset += lineHeight;

              const isDefeito =
                (sensor.existe === false ||
                  (sensor.valorAtual !== undefined &&
                    sensor.valorAtual <= 0)) &&
                (sensor.motivoNaoExiste?.trim() !== "" || // Changed from descricaoDefeito to motivoNaoExiste
                  sensor.motivoNaoExiste); // Changed from descricaoDefeito to motivoNaoExiste

              if (isDefeito) {
                pdf.setTextColor(255, 0, 0);
                pdf.setFont("helvetica", "bold");
                const defectText = sensor.motivoNaoExiste // Changed from descricaoDefeito to motivoNaoExiste
                  ? `NÃO EXISTE: ${sensor.motivoNaoExiste}` // Changed from descricaoDefeito to motivoNaoExiste
                  : "DEFEITO";
                pdf.text(defectText, margin + 15, yOffset);
                pdf.setTextColor(50, 50, 50);
                pdf.setFont("helvetica", "normal");
                yOffset += lineHeight;
              }
            });
            yOffset += lineHeight;
          }

          yOffset += lineHeight; // Espaço entre lojas
        });
      }

      pdf.save("relatorio_detalhes_lojas.pdf");
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
        disabled={isGenerating || !isScriptLoaded || lojasData.length === 0}
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
        ) : lojasData.length === 0 ? (
          "Nenhum dado para gerar PDF"
        ) : (
          "Gerar PDF dos Detalhes das Lojas"
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

export default PDFGeradorLoja;
