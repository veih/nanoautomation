/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Garante que seja um Client Component

import { LOGO_BASE64 } from "@/app/img/logoBase64";
import React, { useState, useEffect, useMemo } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify"; // Importa toast e ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importa o CSS do react-toastify
import { Cm, Sensor, SensorStatus } from "../../../types";

// O componente não recebe mais sensoresData como prop
const PdfDefectiveSensoresButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cmsData, setCmsData] = useState<Cm[]>([]);
  const [loadingData, setLoadingData] = useState(true);
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

  // Efeito para carregar os dados na montagem do componente
  useEffect(() => {
    const fetchCmsData = async () => {
      setLoadingData(true);
      try {
        const res = await fetch("/api/cmsApi/cms"); // Endpoint da API
        if (!res.ok) {
          const errorBody = await res
            .json()
            .catch(() => ({ message: res.statusText }));
          throw new Error(errorBody.message || `Erro HTTP: ${res.status}`);
        }
        const result = await res.json();

        // Extract data from the API response format { success: boolean, data: T }
        const data: Cm[] = result.success ? result.data : result;

        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error("API response data is not an array:", data);
          throw new Error("Dados inválidos recebidos da API");
        }

        // Processa os dados para DERIVAR o campo 'estado' para os sensores
        const processedCms = data.map((cm) => ({
          ...cm,
          equipamentos:
            cm.equipamentos?.map((eq) => ({
              ...eq,
              sensores:
                eq.sensores?.map((sensor) => {
                  let derivedEstado = SensorStatus.OPERACIONAL; // Padrão

                  // Se a descrição do defeito estiver preenchida, é DEFEITO
                  if (
                    sensor.descricaoDefeito &&
                    sensor.descricaoDefeito.trim() !== ""
                  ) {
                    derivedEstado = SensorStatus.DEFEITO;
                  }
                  // Se o estado já vier como DEFEITO do backend, também é DEFEITO
                  else if (sensor.estado === SensorStatus.DEFEITO) {
                    derivedEstado = SensorStatus.DEFEITO;
                  }
                  // Caso contrário, permanece OPERACIONAL (ou outro status padrão)

                  return {
                    ...sensor,
                    descricaoDefeito: sensor.descricaoDefeito || undefined, // Garante que seja undefined se vazio
                    estado: derivedEstado, // Adiciona o estado derivado
                  };
                }) || [],
            })) || [],
        }));

        setCmsData(processedCms);
      } catch (err: unknown) {
        console.error("Erro ao buscar dados para PDF de Sensores:", err);
        setCmsData([]);
        toast.error(
          "Erro ao carregar dados para o PDF. Por favor, tente novamente."
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchCmsData();
  }, []); // Empty dependency array - only run on mount

  // Usa useMemo para processar os dados, obtendo a lista de sensores com defeito
  const allDefectiveSensoresForPdf = useMemo(() => {
    const allSensores: Sensor[] = [];
    const safeCmsData = cmsData || [];

    if (!Array.isArray(safeCmsData)) {
      console.error(
        "Erro: cmsData não é um array para processamento de PDF de Sensores. Conteúdo:",
        safeCmsData
      );
      return [];
    }

    safeCmsData.forEach((cm) => {
      if (cm.equipamentos && Array.isArray(cm.equipamentos)) {
        cm.equipamentos.forEach((eq) => {
          (eq.sensores || []) // Filtra sensores (não atuadores)
            .filter((sensor) => sensor.estado === SensorStatus.DEFEITO) // Condição de defeito para sensor baseada no 'estado' derivado
            .map((sensor) => ({
              ...sensor,
              equipamento: {
                id: eq.id,
                nome: eq.nome,
                descricao: eq.descricao,
                cmId: eq.cmId,
                cm: {
                  id: cm.id,
                  nome: cm.nome,
                  localizacao: cm.localizacao,
                },
              },
            }))
            .forEach((sensor) => allSensores.push(sensor));
        });
      }
    });
    return allSensores;
  }, [cmsData]);

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
        doc.text("Relatório de Sensores com Defeito", pageWidth / 2, titleY, {
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

      if (allDefectiveSensoresForPdf.length === 0) {
        pdf.setFontSize(12);
        pdf.text(
          "Nenhum sensor com defeito encontrado para gerar o relatório.",
          pageWidth / 2,
          yOffset + 20,
          { align: "center" }
        );
      } else {
        // --- Adiciona a lista detalhada de sensores com defeito ---
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        yOffset += 10;
        pdf.text("Detalhes dos Sensores com Defeito", margin, yOffset);
        yOffset += lineHeight * 2;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);

        allDefectiveSensoresForPdf.forEach((sensor, index) => {
          if (yOffset > pageHeight - 80) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
            yOffset += 10;
          }

          // Título do sensor
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(50, 50, 50);
          pdf.text(`${index + 1}. Sensor: ${sensor.nome}`, margin, yOffset);
          yOffset += lineHeight;

          // Detalhes do sensor
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);

          pdf.text(`   Tipo: ${sensor.tipo || "N/A"}`, margin, yOffset);
          yOffset += lineHeight;

          pdf.text(
            `   CM: ${sensor.equipamento?.cm?.nome || "N/A"} (${
              sensor.equipamento?.cm?.localizacao || "N/A"
            })`,
            margin,
            yOffset
          );
          yOffset += lineHeight;

          pdf.text(
            `   Equipamento: ${sensor.equipamento?.nome || "N/A"}`,
            margin,
            yOffset
          );
          yOffset += lineHeight;

          // Descrição do defeito em vermelho
          if (sensor.descricaoDefeito) {
            pdf.setTextColor(255, 0, 0);
            const defectText = pdf.splitTextToSize(
              `   Descrição do Defeito: ${sensor.descricaoDefeito}`,
              pageWidth - 2 * margin
            );
            pdf.text(defectText, margin, yOffset);
            yOffset += lineHeight * defectText.length;
          }

          pdf.setTextColor(50, 50, 50);
          yOffset += lineHeight; // Espaço entre os itens
        });

        // --- Adiciona o Resumo na última página ---
        if (yOffset > pageHeight - 120) {
          pdf.addPage();
          yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
          addFooter(pdf);
        }

        yOffset += 20;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        pdf.text("Resumo do Relatório", margin, yOffset);
        yOffset += lineHeight * 2;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(50, 50, 50);

        pdf.text(
          `Total de Sensores com Defeito: ${allDefectiveSensoresForPdf.length} unidades`,
          margin,
          yOffset
        );
        yOffset += lineHeight;
      }

      pdf.save("relatorio_sensores_com_defeito.pdf");
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
        variant="danger"
        onClick={generatePdf}
        disabled={
          isGenerating ||
          loadingData ||
          !isScriptLoaded ||
          allDefectiveSensoresForPdf.length === 0
        }
        className="mt-4 shadow-lg animated-bounce"
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
        ) : allDefectiveSensoresForPdf.length === 0 ? (
          "Nenhum sensor com defeito para gerar PDF"
        ) : (
          "Gerar PDF de Sensores com Defeito"
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

export default PdfDefectiveSensoresButton;
