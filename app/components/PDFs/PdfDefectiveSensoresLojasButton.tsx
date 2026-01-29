/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Garante que seja um Client Component

import { LOGO_BASE64 } from "@/app/img/logoBase64";
import { SensorDefeitoCompleto, SensorStatus } from "../../../types";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

/**
 * Props for the PDF button component
 */
interface PdfDefectiveSensoresLojasButtonProps {
  /**
   * Optional filtered data to use instead of fetching all data
   */
  filteredData?: SensorDefeitoCompleto[];
}

/**
 * Componente de botão para gerar um relatório em PDF de sensores com defeito das lojas.
 * O componente busca seus próprios dados das APIs de loja e gera o PDF de forma autônoma.
 */
const PdfDefectiveSensoresLojasButton: React.FC<PdfDefectiveSensoresLojasButtonProps> = ({ filteredData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sensoresData, setSensoresData] = useState<SensorDefeitoCompleto[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  /**
   * Efeito para carregar dinamicamente as bibliotecas jsPDF.
   */
  useEffect(() => {
    const loadScripts = () => {
      // Load jsPDF first
      const jspdfScript = document.createElement("script");
      jspdfScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      jspdfScript.onload = () => {
        // Then load jspdf autotable plugin
        const autoTableScript = document.createElement("script");
        autoTableScript.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js";
        autoTableScript.onload = () => {
          setIsScriptLoaded(true);
        };
        autoTableScript.onerror = () => {
          // If autotable fails to load, still set as loaded since we have fallback
          console.warn("Failed to load jspdf-autotable, using fallback");
          setIsScriptLoaded(true);
        };
        document.head.appendChild(autoTableScript);
      };
      jspdfScript.onerror = () => {
        console.error("Failed to load jsPDF");
      };
      document.head.appendChild(jspdfScript);
    };

    loadScripts();
  }, []);

  /**
   * Função para buscar sensores com defeito diretamente das APIs de loja.
   */
  const fetchSensoresData = useCallback(async () => {
    // If filtered data is provided, use it instead of fetching
    if (filteredData) {
      setSensoresData(filteredData);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    try {
      // Buscar sensores de loja
      const sensoresResponse = await fetch("/api/lojasApi/sensores-loja");
      if (!sensoresResponse.ok) {
        throw new Error(
          `Erro ao buscar sensores: ${sensoresResponse.status}`
        );
      }

      const sensoresData = await sensoresResponse.json();
      let todosSensores = [];
      if (sensoresData && typeof sensoresData === "object") {
        if (sensoresData.success && sensoresData.data) {
          todosSensores =
            sensoresData.data.sensores || sensoresData.data || [];
        } else if (sensoresData.sensores) {
          todosSensores = sensoresData.sensores;
        } else if (Array.isArray(sensoresData)) {
          todosSensores = sensoresData;
        }
      }

      // Buscar lojas
      const lojasResponse = await fetch("/api/lojasApi/lojas");
      let todasLojas = [];
      if (lojasResponse.ok) {
        const lojasData = await lojasResponse.json();
        if (lojasData && typeof lojasData === "object") {
          if (lojasData.success && lojasData.data) {
            todasLojas = lojasData.data.lojas || lojasData.data || [];
          } else if (lojasData.lojas) {
            todasLojas = lojasData.lojas;
          } else if (Array.isArray(lojasData)) {
            todasLojas = lojasData;
          }
        }
      }

      // Buscar equipamentos
      const equipamentosResponse = await fetch(
        "/api/lojasApi/equipamentos-loja"
      );
      let todosEquipamentos = [];
      if (equipamentosResponse.ok) {
        const equipamentosData = await equipamentosResponse.json();
        if (equipamentosData && typeof equipamentosData === "object") {
          if (equipamentosData.success && equipamentosData.data) {
            todosEquipamentos =
              equipamentosData.data.equipamentos || equipamentosData.data || [];
          } else if (equipamentosData.equipamentos) {
            todosEquipamentos = equipamentosData.equipamentos;
          } else if (Array.isArray(equipamentosData)) {
            todosEquipamentos = equipamentosData;
          }
        }
      }

      // Filtrar sensores com defeito
      const sensoresComDefeito = todosSensores.filter((sensor: any) => {
        const temEstadoDefeito =
          sensor.estado === "DEFEITO" || sensor.status === "DEFEITO";
        const temDescricaoDefeito =
          (sensor.descricaoDefeito &&
            sensor.descricaoDefeito.trim() !== "") ||
          (sensor.descricao_defeito &&
            sensor.descricao_defeito.trim() !== "");
        const naoExiste = sensor.existe === false || sensor.exists === false;
        return temEstadoDefeito || temDescricaoDefeito || naoExiste;
      });

      // Mapear informações completas
      const sensoresCompletos: SensorDefeitoCompleto[] =
        sensoresComDefeito.map((sensor: any) => {
          const loja = todasLojas.find(
            (l: any) => l.id === sensor.lojaId || l.id === sensor.loja_id
          );
          const equipamento = todosEquipamentos.find(
            (e: any) =>
              e.id === sensor.equipamentoLojaId ||
              e.id === sensor.equipamento_loja_id
          );

          return {
            id: sensor.id,
            nome: sensor.nome || sensor.name,
            tipo: sensor.tipo || sensor.type,
            descricaoDefeito:
              sensor.descricaoDefeito || sensor.descricao_defeito,
            existe:
              sensor.existe !== undefined ? sensor.existe : sensor.exists,
            motivoNaoExiste:
              sensor.motivoNaoExiste || sensor.motivo_nao_existe,
            estado: sensor.estado || sensor.status,
            valorAtual: sensor.valorAtual || sensor.valor_atual,
            equipamentoNome:
              equipamento?.nome ||
              equipamento?.name ||
              "Equipamento não encontrado",
            lojaNome: loja?.nome || loja?.name || "Loja não encontrada",
            lojaLUC: loja?.LUC || loja?.luc || "N/A",
            lojaLocalizacao: loja?.localizacao || loja?.localization || "N/A",
          };
        });

      setSensoresData(sensoresCompletos);
    } catch (err: any) {
      console.error("Erro ao buscar dados para PDF:", err);
      setSensoresData([]);
    } finally {
      setLoadingData(false);
    }
  }, [filteredData]);

  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchSensoresData();
  }, [fetchSensoresData, filteredData]);

  // Agrupar sensores por loja
  const sensoresPorLoja = useMemo(() => {
    const grupos = new Map<string, SensorDefeitoCompleto[]>();

    sensoresData.forEach((sensor) => {
      const lojaKey = `${sensor.lojaNome} (${sensor.lojaLUC})`;
      if (!grupos.has(lojaKey)) {
        grupos.set(lojaKey, []);
      }
      grupos.get(lojaKey)!.push(sensor);
    });

    // Converter para array e ordenar por nome da loja
    return Array.from(grupos.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([loja, sensores]) => ({ loja, sensores }));
  }, [sensoresData]);

  // Obter tipos únicos de sensores
  const uniqueDefectiveSensorTypes = useMemo(() => {
    const types = new Set<string>();
    sensoresData.forEach((sensor) => {
      if (sensor.tipo) {
        types.add(sensor.tipo);
      }
    });
    return Array.from(types);
  }, [sensoresData]);

  // Contar equipamentos afetados
  const affectedEquipmentsCount = useMemo(() => {
    const equipmentNames = new Set<string>();
    sensoresData.forEach((sensor) => {
      if (sensor.equipamentoNome) {
        equipmentNames.add(sensor.equipamentoNome);
      }
    });
    return equipmentNames.size;
  }, [sensoresData]);

  // Função para obter a razão do defeito
  const obterRazaoDefeito = (sensor: SensorDefeitoCompleto): string => {
    if (sensor.estado === SensorStatus.DEFEITO) {
      return sensor.descricaoDefeito || "Status: DEFEITO";
    }
    if (sensor.existe === false) {
      return sensor.motivoNaoExiste || "Sensor não existe";
    }
    if (sensor.descricaoDefeito && sensor.descricaoDefeito.trim() !== "") {
      return sensor.descricaoDefeito;
    }
    return "Motivo não especificado";
  };

  // Função auxiliar para truncar texto longo
  const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  // Função auxiliar para formatar estado do sensor
  const formatEstadoSensor = (estado: string | undefined): string => {
    if (!estado) return "N/A";

    const estadoMap: Record<string, string> = {
      "DEFEITO": "DEFECTIVE",
      "OPERACIONAL": "OPERATIONAL",
      "MANUTENCAO": "MAINTENANCE",
      "NÃO EXISTE": "DOES NOT EXIST"
    };

    return estadoMap[estado.toUpperCase()] || estado;
  };

  /**
   * Função para gerar o arquivo PDF.
   */
  const generatePdf = async () => {
    if (!isScriptLoaded) {
      toast.error(
        "As bibliotecas de PDF ainda estão sendo carregadas. Por favor, aguarde."
      );
      return;
    }

    if (!sensoresData || sensoresData.length === 0) {
      return toast.warning("Não há sensores com defeito para gerar PDF");
    }

    setIsGenerating(true);

    try {
      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yOffset = 30;
      const lineHeight = 7;
      const sectionSpacing = 10;

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
        }
      };

      const addPageHeader = (doc: any, pageNum: number, title: string = "Relatório de Sensores com Defeito") => {
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
        doc.text(title, pageWidth / 2, titleY, {
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

      // Criar capa na página 0 (primeira página)
      // Adicionar um gradiente de fundo sutil
      // pdf.setFillColor(248, 249, 250); // Very light gray
      // pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // // Adicionar bordas decorativas
      // pdf.setDrawColor(220, 220, 220); // Light gray border
      // pdf.setLineWidth(0.5);
      // pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Adicionar logo grande centralizada
      // if (LOGO_BASE64) {
      //   const logoWidth = 140;
      //   const logoHeight = 60;
      //   const logoX = (pageWidth - logoWidth) / 2;
      //   const logoY = 80;

      //   pdf.addImage(
      //     LOGO_BASE64,
      //     "PNG",
      //     logoX,
      //     logoY,
      //     logoWidth,
      //     logoHeight
      //   );
      // }

      // Título principal com destaque
      // pdf.setFont("helvetica", "bold");
      // pdf.setFontSize(36);
      // pdf.setTextColor(25, 118, 210); // Blue color
      // pdf.text("RELATÓRIO DE SENSORES", pageWidth / 2, 170, { align: "center" });

      // pdf.setFontSize(36);
      // pdf.setTextColor(211, 47, 47); // Red color for emphasis
      // pdf.text("COM DEFEITO", pageWidth / 2, 195, { align: "center" });

      // // Linha divisória
      // pdf.setDrawColor(211, 47, 47); // Red color
      // pdf.setLineWidth(2);
      // pdf.line(pageWidth / 2 - 80, 210, pageWidth / 2 + 80, 210);

      // // Subtítulo informativo
      // pdf.setFont("helvetica", "normal");
      // pdf.setFontSize(18);
      // pdf.setTextColor(100, 100, 100); // Gray color
      // pdf.text("Análise Completa de Equipamentos em Lojas", pageWidth / 2, 240, { align: "center" });

      // // Informações do relatório
      // pdf.setFontSize(14);
      // pdf.setTextColor(60, 60, 60);

      // const reportInfo = [
      //   `Total de Sensores com Defeito: ${sensoresData.length}`,
      //   `Lojas Afetadas: ${sensoresPorLoja.length}`,
      //   `Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`
      // ];

      // reportInfo.forEach((info, index) => {
      //   pdf.text(info, pageWidth / 2, 270 + (index * 20), { align: "center" });
      // });

      // Informações da empresa na parte inferior
      pdf.setFontSize(12);
      pdf.setTextColor(25, 118, 210); // Blue color
      pdf.text("NANOAUTOMATION", pageWidth / 2, pageHeight - 80, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100); // Gray color
      pdf.text("Your Road to the Future", pageWidth / 2, pageHeight - 65, { align: "center" });

      pdf.setFontSize(8);
      pdf.text("Av Queiroz Filho, 1700 - Torre E-303/304", pageWidth / 2, pageHeight - 50, { align: "center" });
      pdf.text("Vila Leopoldina - São Paulo/SP - CEP: 05319-000", pageWidth / 2, pageHeight - 42, { align: "center" });
      pdf.text("Fone: +55 (11) 3647-6266 | E-mail: contato@nanoautomation.com.br", pageWidth / 2, pageHeight - 34, { align: "center" });

      // Adicionar marca d'água na capa também
      if (LOGO_BASE64) {
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.1 }));
        pdf.addImage(
          LOGO_BASE64,
          "PNG",
          pageWidth / 2 - 100,
          pageHeight / 2 - 50,
          200,
          100
        );
        pdf.restoreGraphicsState();
      }

      // Adicionar nova página para o conteúdo (não é mais necessário adicionar uma página em branco)
      pdf.addPage();

      // Adicionar cabeçalho na segunda página (conteúdo real) - página 1
      yOffset = addPageHeader(pdf, 1);
      addFooter(pdf);
      addWatermark(pdf);
      yOffset += 20;

      // --- Adicionar estatísticas gerais ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 128);
      pdf.text("Resumo Executivo", margin, yOffset);
      yOffset += lineHeight + sectionSpacing;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(50, 50, 50);

      pdf.text(
        `Total de Sensores com Defeito: ${sensoresData.length}`,
        margin,
        yOffset
      );
      yOffset += lineHeight;

      pdf.text(
        `Total de Lojas Afetadas: ${sensoresPorLoja.length}`,
        margin,
        yOffset
      );
      yOffset += lineHeight;

      pdf.text(
        `Total de Equipamentos Afetados: ${affectedEquipmentsCount}`,
        margin,
        yOffset
      );
      yOffset += lineHeight;

      pdf.text(
        `Tipos Únicos de Sensores com Defeito: ${uniqueDefectiveSensorTypes.length}`,
        margin,
        yOffset
      );
      yOffset += lineHeight + sectionSpacing;

      // Adicionar estatísticas por estado
      const estadoStats = sensoresData.reduce((acc, sensor) => {
        const estado = sensor.estado || "N/A";
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 128);
      pdf.text("Distribuição por Estado", margin, yOffset);
      yOffset += lineHeight + 5;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);

      Object.entries(estadoStats).forEach(([estado, count], index) => {
        pdf.text(
          `${index + 1}. ${formatEstadoSensor(estado)}: ${count} sensor(es)`,
          margin + 5,
          yOffset
        );
        yOffset += lineHeight;

        if (yOffset > pageHeight - 80) {
          pdf.addPage();
          yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
          addFooter(pdf);
          yOffset += 10;
        }
      });
      yOffset += sectionSpacing;

      // --- Adicionar lista de tipos de sensores ---
      if (uniqueDefectiveSensorTypes.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 128);
        pdf.text("Tipos de Sensores com Defeito", margin, yOffset);
        yOffset += lineHeight + 5;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);

        uniqueDefectiveSensorTypes.forEach((tipo, index) => {
          const quantidade = sensoresData.filter((s) => s.tipo === tipo).length;
          pdf.text(
            `${index + 1}. ${tipo} (${quantidade} unid.)`,
            margin + 5,
            yOffset
          );
          yOffset += lineHeight;

          if (yOffset > pageHeight - 80) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
            yOffset += 10;
          }
        });
        yOffset += sectionSpacing;
      }

      // --- Adicionar tabela resumo de todos os sensores com defeito ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 128);
      pdf.text("Lista Completa de Sensores com Defeito", margin, yOffset);
      yOffset += lineHeight + sectionSpacing;

      // Criar tabela resumo
      const headers = ["#", "Nome", "Tipo", "Loja (LUC)", "Equipamento", "Estado", "Defeito"];
      const data = sensoresData.map((sensor, index) => [
        (index + 1).toString(),
        truncateText(sensor.nome, 20),
        truncateText(sensor.tipo, 15),
        truncateText(`${sensor.lojaNome} (${sensor.lojaLUC})`, 25),
        truncateText(sensor.equipamentoNome || "N/A", 20),
        formatEstadoSensor(sensor.estado),
        truncateText(obterRazaoDefeito(sensor), 30)
      ]);

      // Adicionar tabela usando jspdf-autotable (se disponível)
      try {
        // Verificar se autoTable está disponível
        if (typeof (pdf as any).autoTable === 'function') {
          (pdf as any).autoTable({
            head: [headers],
            body: data,
            startY: yOffset,
            styles: {
              fontSize: 8,
              cellPadding: 2
            },
            headStyles: {
              fillColor: [0, 0, 128],
              textColor: [255, 255, 255]
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240]
            },
            pageBreak: 'auto',
            columnStyles: {
              0: { cellWidth: 10 }, // #
              1: { cellWidth: 25 }, // Nome
              2: { cellWidth: 20 }, // Tipo
              3: { cellWidth: 35 }, // Loja (LUC)
              4: { cellWidth: 25 }, // Equipamento
              5: { cellWidth: 20 }, // Estado
              6: { cellWidth: 40 }  // Defeito
            }
          });

          yOffset = (pdf as any).lastAutoTable.finalY + sectionSpacing;
        } else {
          // Fallback para tabela manual se autoTable não estiver disponível
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);

          // Cabeçalho da tabela
          const headerY = yOffset;
          const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 90, margin + 115, margin + 135];
          headers.forEach((header, i) => {
            pdf.text(truncateText(header, 15), xPositions[i] || margin + (i * 20), headerY);
          });

          yOffset += lineHeight + 2;

          // Linha separadora
          pdf.line(margin, yOffset, pageWidth - margin, yOffset);
          yOffset += 5;

          // Dados da tabela
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);

          data.forEach((row) => {
            if (yOffset > pageHeight - 80) {
              pdf.addPage();
              yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Lista Completa de Sensores com Defeito (continuação)");
              addFooter(pdf);
              yOffset += 20;

              // Re-imprimir cabeçalho da tabela na nova página
              pdf.setFont("helvetica", "bold");
              const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 90, margin + 115, margin + 135];
              headers.forEach((header, i) => {
                pdf.text(truncateText(header, 15), xPositions[i] || margin + (i * 20), yOffset);
              });
              yOffset += lineHeight + 2;
              pdf.line(margin, yOffset, pageWidth - margin, yOffset);
              yOffset += 5;
              pdf.setFont("helvetica", "normal");
            }

            row.forEach((cell, cellIndex) => {
              const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 90, margin + 115, margin + 135];
              pdf.text(truncateText(cell, 15), xPositions[cellIndex] || margin + (cellIndex * 20), yOffset);
            });

            yOffset += lineHeight + 2;
          });

          yOffset += sectionSpacing;
        }
      } catch (error) {
        console.warn("Erro ao gerar tabela automática, usando método manual:", error);
        // Fallback para tabela manual
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);

        // Cabeçalho da tabela
        const headerY = yOffset;
        headers.forEach((header, i) => {
          const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 90, margin + 115, margin + 135];
          pdf.text(truncateText(header, 15), xPositions[i] || margin + (i * 20), headerY);
        });

        yOffset += lineHeight + 2;

        // Linha separadora
        pdf.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 5;

        // Dados da tabela
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);

        data.forEach((row) => {
          if (yOffset > pageHeight - 80) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Lista Completa de Sensores com Defeito (continuação)");
            addFooter(pdf);
            yOffset += 20;

            // Re-imprimir cabeçalho da tabela na nova página
            pdf.setFont("helvetica", "bold");
            const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 90, margin + 115, margin + 135];
            headers.forEach((header, i) => {
              pdf.text(truncateText(header, 15), xPositions[i] || margin + (i * 20), yOffset);
            });
            yOffset += lineHeight + 2;
            pdf.line(margin, yOffset, pageWidth - margin, yOffset);
            yOffset += 5;
            pdf.setFont("helvetica", "normal");
          }

          row.forEach((cell, cellIndex) => {
            const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 90, margin + 115, margin + 135];
            pdf.text(truncateText(cell, 15), xPositions[cellIndex] || margin + (cellIndex * 20), yOffset);
          });

          yOffset += lineHeight + 2;
        });

        yOffset += sectionSpacing;
      }

      // --- Adicionar detalhes por loja ---
      pdf.addPage();
      yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Detalhamento por Loja");
      addFooter(pdf);
      yOffset += 20;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 128);
      pdf.text("Detalhamento por Loja", margin, yOffset);
      yOffset += lineHeight + sectionSpacing;

      sensoresPorLoja.forEach(({ loja, sensores }, lojaIndex) => {
        if (yOffset > pageHeight - 100) {
          pdf.addPage();
          yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Detalhamento por Loja (continuação)");
          addFooter(pdf);
          yOffset += 20;
        }

        // Nome da loja
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 100, 0);
        pdf.text(`${lojaIndex + 1}. ${loja}`, margin, yOffset);
        yOffset += lineHeight + 5;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(50, 50, 50);
        pdf.text(
          `Total de Sensores com Defeito: ${sensores.length}`,
          margin + 5,
          yOffset
        );
        yOffset += lineHeight + 5;

        // Tabela de sensores da loja
        const lojaHeaders = ["#", "Nome", "Tipo", "Equipamento", "Estado", "Defeito"];
        const lojaData = sensores.map((sensor, index) => [
          (index + 1).toString(),
          truncateText(sensor.nome, 20),
          truncateText(sensor.tipo, 15),
          truncateText(sensor.equipamentoNome || "N/A", 20),
          formatEstadoSensor(sensor.estado),
          truncateText(obterRazaoDefeito(sensor), 30)
        ]);

        try {
          if (typeof (pdf as any).autoTable === 'function') {
            (pdf as any).autoTable({
              head: [lojaHeaders],
              body: lojaData,
              startY: yOffset,
              styles: {
                fontSize: 8,
                cellPadding: 2
              },
              headStyles: {
                fillColor: [0, 100, 0],
                textColor: [255, 255, 255]
              },
              alternateRowStyles: {
                fillColor: [240, 240, 240]
              },
              pageBreak: 'auto',
              columnStyles: {
                0: { cellWidth: 10 }, // #
                1: { cellWidth: 25 }, // Nome
                2: { cellWidth: 20 }, // Tipo
                3: { cellWidth: 25 }, // Equipamento
                4: { cellWidth: 20 }, // Estado
                5: { cellWidth: 40 }  // Defeito
              }
            });

            yOffset = (pdf as any).lastAutoTable.finalY + sectionSpacing;
          } else {
            // Fallback para tabela manual
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);

            // Cabeçalho da tabela
            const headerY = yOffset;
            const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 80, margin + 100];
            lojaHeaders.forEach((header, i) => {
              pdf.text(truncateText(header, 15), xPositions[i] || margin + (i * 20), headerY);
            });

            yOffset += lineHeight + 2;

            // Linha separadora
            pdf.line(margin, yOffset, pageWidth - margin, yOffset);
            yOffset += 5;

            // Dados da tabela
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);

            lojaData.forEach((row) => {
              if (yOffset > pageHeight - 80) {
                pdf.addPage();
                yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, `Detalhamento - ${loja} (continuação)`);
                addFooter(pdf);
                yOffset += 20;

                // Re-imprimir cabeçalho da tabela na nova página
                pdf.setFont("helvetica", "bold");
                const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 80, margin + 100];
                lojaHeaders.forEach((header, i) => {
                  pdf.text(truncateText(header, 15), xPositions[i] || margin + (i * 20), yOffset);
                });
                yOffset += lineHeight + 2;
                pdf.line(margin, yOffset, pageWidth - margin, yOffset);
                yOffset += 5;
                pdf.setFont("helvetica", "normal");
              }

              const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 80, margin + 100];
              row.forEach((cell, cellIndex) => {
                pdf.text(truncateText(cell, 15), xPositions[cellIndex] || margin + (cellIndex * 20), yOffset);
              });

              yOffset += lineHeight + 2;
            });

            yOffset += sectionSpacing;
          }
        } catch (error) {
          console.warn("Erro ao gerar tabela da loja, usando método manual:", error);
          // Fallback para tabela manual
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);

          // Cabeçalho da tabela
          const headerY = yOffset;
          const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 80, margin + 100];
          lojaHeaders.forEach((header, i) => {
            pdf.text(truncateText(header, 15), xPositions[i] || margin + (i * 20), headerY);
          });

          yOffset += lineHeight + 2;

          // Linha separadora
          pdf.line(margin, yOffset, pageWidth - margin, yOffset);
          yOffset += 5;

          // Dados da tabela
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);

          lojaData.forEach((row) => {
            if (yOffset > pageHeight - 80) {
              pdf.addPage();
              yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, `Detalhamento - ${loja} (continuação)`);
              addFooter(pdf);
              yOffset += 20;

              // Re-imprimir cabeçalho da tabela na nova página
              pdf.setFont("helvetica", "bold");
              const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 80, margin + 100];
              lojaHeaders.forEach((header, i) => {
                pdf.text(truncateText(header, 15), xPositions[i] || margin + (i * 20), yOffset);
              });
              yOffset += lineHeight + 2;
              pdf.line(margin, yOffset, pageWidth - margin, yOffset);
              yOffset += 5;
              pdf.setFont("helvetica", "normal");
            }

            const xPositions = [margin, margin + 10, margin + 35, margin + 55, margin + 80, margin + 100];
            row.forEach((cell, cellIndex) => {
              pdf.text(truncateText(cell, 15), xPositions[cellIndex] || margin + (cellIndex * 20), yOffset);
            });

            yOffset += lineHeight + 2;
          });

          yOffset += sectionSpacing;
        }

        yOffset += sectionSpacing * 2;
      });

      // Adicionar uma nova página para começar a mostrar sensores individuais
      pdf.addPage();
      yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Detalhamento Individual dos Sensores");
      addFooter(pdf);
      yOffset += 20;

      // --- Adicionar informações detalhadas de cada sensor em páginas separadas ---
      for (let i = 0; i < sensoresData.length; i++) {
        const sensor = sensoresData[i];

        // Para o primeiro sensor, não adicionamos uma nova página pois já estamos na nova página
        if (i > 0) {
          pdf.addPage();
          yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Detalhamento Individual dos Sensores (continuação)");
          addFooter(pdf);
          yOffset += 20;
        }

        // Título do sensor
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        pdf.text(`Sensor #${i + 1}: ${sensor.nome}`, margin, yOffset);
        yOffset += 15;

        // Seção de Identificação
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Identificação", margin, yOffset);
        yOffset += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        const identificacaoLines = [
          `Nome: ${sensor.nome || "N/A"}`,
          `Tipo: ${sensor.tipo || "N/A"}`,
          `ID: ${sensor.id || "N/A"}`
        ];

        for (const line of identificacaoLines) {
          if (yOffset > pageHeight - 50) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Detalhamento Individual dos Sensores (continuação)");
            addFooter(pdf);
            yOffset += 20;
          }
          pdf.text(line, margin + 5, yOffset);
          yOffset += lineHeight + 1;
        }
        yOffset += 5;

        // Seção de Localização
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Localização", margin, yOffset);
        yOffset += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        const localizacaoLines = [
          `Loja: ${sensor.lojaNome || "N/A"}`,
          `LUC: ${sensor.lojaLUC || "N/A"}`,
          `Localização: ${sensor.lojaLocalizacao || "N/A"}`,
          `Equipamento: ${sensor.equipamentoNome || "N/A"}`
        ];

        for (const line of localizacaoLines) {
          if (yOffset > pageHeight - 50) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Detalhamento Individual dos Sensores (continuação)");
            addFooter(pdf);
            yOffset += 20;
          }
          pdf.text(line, margin + 5, yOffset);
          yOffset += lineHeight + 1;
        }
        yOffset += 5;

        // Seção de Status
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Status", margin, yOffset);
        yOffset += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        const statusLines = [
          `Estado: ${formatEstadoSensor(sensor.estado) || "N/A"}`,
          `Existe: ${sensor.existe !== undefined ? (sensor.existe ? "Sim" : "Não") : "N/A"}`,
          `Valor Atual: ${sensor.valorAtual !== undefined ? sensor.valorAtual : "N/A"}`,
          `Última Ativação: ${sensor.ultimaAtivacao ? new Date(sensor.ultimaAtivacao).toLocaleDateString("pt-BR") : "N/A"}`
        ];

        for (const line of statusLines) {
          if (yOffset > pageHeight - 50) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Detalhamento Individual dos Sensores (continuação)");
            addFooter(pdf);
            yOffset += 20;
          }
          pdf.text(line, margin + 5, yOffset);
          yOffset += lineHeight + 1;
        }
        yOffset += 5;

        // Seção de Defeito
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Informações do Defeito", margin, yOffset);
        yOffset += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        const defeitoLines = [
          `Descrição do Defeito: ${truncateText(obterRazaoDefeito(sensor), 80)}`,
        ];

        if (sensor.existe === false && sensor.motivoNaoExiste) {
          defeitoLines.push(`Motivo de Não Existência: ${truncateText(sensor.motivoNaoExiste, 80)}`);
        }

        const maxTextWidth = pageWidth - 2 * margin;

        for (const line of defeitoLines) {
          if (yOffset > pageHeight - 50) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Detalhamento Individual dos Sensores (continuação)");
            addFooter(pdf);
            yOffset += 20;
          }

          const splitted = pdf.splitTextToSize(line, maxTextWidth - 10);
          for (const textLine of splitted) {
            pdf.text(textLine, margin + 5, yOffset);
            yOffset += lineHeight + 1;
          }
        }
      }

      // Adicionar página final com recomendações
      pdf.addPage();
      yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Recomendações e Próximos Passos");
      addFooter(pdf);
      yOffset += 20;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 128);
      pdf.text("Recomendações", margin, yOffset);
      yOffset += 15;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);

      const recomendacoes = [
        "1. Verifique imediatamente os sensores listados neste relatório.",
        "2. Priorize a manutenção dos sensores com estado DEFECTIVE.",
        `3. Total de ${sensoresData.length} sensores requerem atenção.`,
        `4. ${sensoresPorLoja.length} lojas estão afetadas por problemas de sensores.`,
        "5. Considere agendar visitas técnicas para as lojas com maior número de sensores defeituosos.",
        "6. Mantenha este relatório como registro das intervenções realizadas.",
        "7. Após a manutenção, atualize o status dos sensores no sistema."
      ];

      for (const recomendacao of recomendacoes) {
        if (yOffset > pageHeight - 50) {
          pdf.addPage();
          yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Recomendações e Próximos Passos (continuação)");
          addFooter(pdf);
          yOffset += 20;
        }

        pdf.text(recomendacao, margin, yOffset);
        yOffset += lineHeight + 2;
      }

      yOffset += 20;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 128);
      pdf.text("Contato para Suporte", margin, yOffset);
      yOffset += 12;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      const contatoInfo = [
        "Equipe de Manutenção: manutencao@nanoautomation.com.br",
        "Suporte Técnico: suporte@nanoautomation.com.br",
        "Telefone: +55 (11) 3647-6266"
      ];

      for (const info of contatoInfo) {
        if (yOffset > pageHeight - 50) {
          pdf.addPage();
          yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages() - 1, "Recomendações e Próximos Passos (continuação)");
          addFooter(pdf);
          yOffset += 20;
        }

        pdf.text(info, margin, yOffset);
        yOffset += lineHeight + 1;
      }

      pdf.save("relatorio_sensores_com_defeito_lojas.pdf");
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
          sensoresData.length === 0
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
        ) : sensoresData.length === 0 ? (
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

export default PdfDefectiveSensoresLojasButton;
