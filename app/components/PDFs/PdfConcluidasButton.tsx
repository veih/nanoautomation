/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LOGO_BASE64 } from "@/app/img/logoBase64";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { CorretivaConcluida } from "../../../types";
import PeriodSelectionModal from "./PeriodSelectionModal";

/**
 * Componente de botão para gerar um relatório em PDF de corretivas concluídas.
 * O componente busca seus próprios dados das APIs e gera o PDF de forma autônoma.
 */
const PdfConcluidasButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [corretivasData, setCorretivasData] = useState<CorretivaConcluida[]>(
    []
  );
  const [loadingData, setLoadingData] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
   * Função para buscar corretivas concluídas diretamente da API.
   */
  const fetchCorretivasData = useCallback(async () => {
    setLoadingData(true);
    try {
      const response = await fetch("/api/corretivas");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar corretivas: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Handle both standardized and legacy response formats
      let corretivas = [];
      if (typeof result === "object" && result !== null) {
        if (Array.isArray(result)) {
          corretivas = result;
        } else if ("success" in result) {
          if (result.success) {
            corretivas = result.data || [];
          } else {
            throw new Error(result.error?.message || "Erro na resposta da API");
          }
        } else {
          corretivas = result;
        }
      }

      // Filtrar apenas corretivas concluídas
      const corretivasConcluidas = corretivas.filter(
        (c: any) => c.status === "CONCLUIDO" || c.dataConclusao
      );

      // Transformar fotos para o formato esperado
      const corretivasTransformadas = corretivasConcluidas.map((c: any) => ({
        ...c,
        fotos: c.fotocorretiva && Array.isArray(c.fotocorretiva) 
          ? c.fotocorretiva.map((f: any) => ({ url: f.url })) 
          : []
      }));

      setCorretivasData(corretivasTransformadas);
    } catch (err: any) {
      console.error("Erro ao buscar dados para PDF:", err);
      toast.error("Erro ao buscar dados para PDF: " + (err.message || err));
      setCorretivasData([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchCorretivasData();
  }, [fetchCorretivasData]);

  const getImageBase64 = (url: string): Promise<string> =>
    new Promise(async (resolve, reject) => {
      try {
        // Handle Cloudinary URLs properly
        let imageUrl = url;
        // If it's a Cloudinary URL, ensure it's in the correct format
        if (url.includes('cloudinary')) {
          // Remove any existing transformations
          imageUrl = url.replace(/\/v\d+\/image\/upload\/.*?\//, '/image/upload/');
        }

        const response = await fetch(imageUrl);
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

  // Função para obter a imagem da capa em base64
  const getCoverImageBase64 = async (): Promise<string | null> => {
    try {
      // Tentar carregar a imagem da pasta public
      const response = await fetch('/img/Capa-rio-mar.JPG');
      if (!response.ok) {
        console.warn('Imagem da capa não encontrada: /img/Capa-rio-mar.JPG');
        return null;
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Erro ao carregar imagem da capa:', err);
      return null;
    }
  };

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const handlePeriodSelect = (month: string, year: string) => {
    generatePdf(month, year);
  };

  const generatePdf = useCallback(async (month: string, year: string) => {
    if (!isScriptLoaded) {
      toast.error(
        "As bibliotecas de PDF ainda estão sendo carregadas. Por favor, aguarde."
      );
      return;
    }

    if (!corretivasData || corretivasData.length === 0) {
      return toast.warning("Não há corretivas concluídas para gerar PDF");
    }

    setIsGenerating(true);

    try {
      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF();
      const margin = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yOffset = 30;
      const lineHeight = 6;
      const imgSpacing = 5;

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

      // Adicionar página de capa
      const addCoverPage = async (doc: any) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(20, 20, 20);
        doc.text(
          "Relatório de Corretivas Concluídas",
          pageWidth / 2,
          70, // Positioned below the logo and cover image
          {
            align: "center",
          }
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
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
        doc.text(
          `Gerado em: ${fortzLocaleString}`,
          pageWidth / 2,
          90, // Positioned below the title
          {
            align: "center",
          }
        );

        // Adicionar logo na capa, se disponível (no topo)
        if (
          LOGO_BASE64 &&
          LOGO_BASE64.length > 50 &&
          LOGO_BASE64.startsWith("data:image")
        ) {
          doc.addImage(
            LOGO_BASE64,
            "PNG",
            pageWidth / 2 - 30,
            20, // Posicionado no topo
            60,
            30
          );
        }

        // Adicionar imagem da capa, se disponível
        try {
          const coverImageBase64 = await getCoverImageBase64();
          if (coverImageBase64) {
            // Adicionar a imagem da capa abaixo do logo
            const imgWidth = 180; // Largura da imagem
            const imgHeight = 120; // Altura da imagem
            const imgX = (pageWidth - imgWidth) / 2; // Centralizar horizontalmente
            const imgY = 60; // Posicionar abaixo do logo (logo ends at y=50)

            doc.addImage(
              coverImageBase64,
              "JPEG",
              imgX,
              imgY,
              imgWidth,
              imgHeight
            );
          }
        } catch (err) {
          console.warn("Erro ao adicionar imagem da capa:", err);
        }

        // Adicionar o período selecionado acima do rodapé
        if (month && year) {
          const months = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
          ];
          const monthName = months[parseInt(month) - 1];
          doc.setFont("helvetica", "normal");
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(
            `Período referente: ${monthName} de ${year}`,
            pageWidth / 2,
            pageHeight - 35,
            { align: "center" }
          );
        }

        // Não adicionamos uma nova página aqui, a próxima página será a primeira página de conteúdo
      };

      // Adicionar página de capa
      await addCoverPage(pdf);

      // Adicionar segunda capa
      pdf.addPage();
      // Adicionar logo na segunda capa, se disponível (no topo)
      if (
        LOGO_BASE64 &&
        LOGO_BASE64.length > 50 &&
        LOGO_BASE64.startsWith("data:image")
      ) {
        pdf.addImage(
          LOGO_BASE64,
          "PNG",
          pageWidth / 2 - 30,
          20, // Posicionado no topo
          60,
          30
        );
      }

      // Adicionar conteúdo na segunda capa
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(20, 20, 20);
      pdf.text("CLIENTE:", margin, 70);

      pdf.setFontSize(14);
      pdf.text("RioMar Fortaleza Shopping", margin, 80);

      pdf.setFontSize(12);
      pdf.text("Aos Srs.: Gilvan Menelau, Diego Athayde e Lucas Moreira", margin, 90);

      pdf.text("Técnicos Responsáveis:", margin, 120);
      pdf.text("• Fernandes Santos", margin + 10, 130);
      pdf.text("• Marcelo Evangelista", margin + 10, 140);

      pdf.text("Coordenador Responsável: Janderson Diego", margin, 155);
      pdf.text("Gerente Responsável: Gustavo Correia", margin, 165);

      pdf.text("Resumo:", margin, 180);
      const resumoText = "Esse relatório tem o objetivo de indicar as atividades e condições técnicas do sistema gerido pela equipe da NANOAUTOMATION no Shopping Riomar Fortaleza. São descritas e ilustradas as atividades realizadas na manutenção preventiva/ corretiva/preditiva a fim de manter o ambiente funcional e sinalizar novas demandas para aprimoramento tecnológico e satisfação completa do cliente.";
      const resumoLines = pdf.splitTextToSize(resumoText, pageWidth - 2 * margin);
      for (let i = 0; i < resumoLines.length; i++) {
        pdf.text(resumoLines[i], margin, 190 + (i * 7));
      }

      pdf.text("Sistemas abrangidos pela Manutenção:", margin, 240);
      pdf.text("✓ Sistema de Supervisão e controle Predial (SSCP):", margin + 10, 250);
      pdf.text("✓ Sistema de Detecção e Alarme á Incêndio (SDAI):", margin + 10, 260);
      pdf.text("✓ Sistema de Controle de Acesso (SCA):", margin + 10, 270);
      pdf.text("✓ Sistema de Medição de Energia (IMS)", margin + 10, 280);

      // Adicionar quarta capa para a tabela de equipamentos
      pdf.addPage();
      // Adicionar logo na quarta capa, se disponível (no topo)
      if (
        LOGO_BASE64 &&
        LOGO_BASE64.length > 50 &&
        LOGO_BASE64.startsWith("data:image")
      ) {
        pdf.addImage(
          LOGO_BASE64,
          "PNG",
          pageWidth / 2 - 30,
          20, // Posicionado no topo
          60,
          30
        );
      }

      // Título da tabela

      // Cabeçalhos da tabela
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8); // Ajustado o tamanho da fonte dos cabeçalhos para ser consistente
      pdf.setTextColor(0, 0, 0);

      const headers = ["TIPO", "SISTEMA", "UNIDADE", "QTDE"];
      const headerY = 70;
      const rowHeight = 6;
      const colWidths = [60, 40, 45, 20];
      const tableX = (pageWidth - (colWidths.reduce((a, b) => a + b, 0))) / 2;

      // Desenhar cabeçalhos com fundo branco e bordas pretas
      for (let i = 0; i < headers.length; i++) {
        const x = tableX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        // Preencher fundo do cabeçalho com branco
        pdf.setFillColor(255, 255, 255);
        pdf.rect(x, headerY - 5, colWidths[i], rowHeight, 'F');
        // Borda preta da célula
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(x, headerY - 5, colWidths[i], rowHeight);
        // Texto do cabeçalho (preto)
        pdf.text(headers[i], x + colWidths[i] / 2, headerY + 2, { align: "center" }); // Ajustado a posição Y para centralizar melhor
      }

      // Linha horizontal abaixo dos cabeçalhos
      pdf.setDrawColor(0, 0, 0);
      pdf.line(tableX, headerY + 1, tableX + colWidths.reduce((a, b) => a + b, 0), headerY + 1);

      // Dados da tabela
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(0, 0, 0);

      const equipmentData = [
        ["CENTRAL DE INCÊNDIO", "SDAI", "SHOPPING", "3"],
        ["PAINEL REPETIDOR", "SDAI", "SHOPPING", "1"],
        ["FONTE REMOTA", "SDAI", "SHOPPING", "33"],
        ["DETECTORES ENDEREÇÁVEIS", "SDAI", "SHOPPING", "1391"],
        ["ACIONADOR MANUAL", "SDAI", "SHOPPING", "333"],
        ["MÓDULOS ENDEREÇÁVEIS", "SDAI", "SHOPPING", "1967"],
        ["SINALIZADOR ÁUDIO VISUAL", "SDAI", "SHOPPING", "331"],
        ["CTR-LOJA", "SCP", "SHOPPING", "374"],
        ["CTR-SHOPPING", "SCP", "SHOPPING", "128"],
        ["ATUADOR-LOJA", "SCP", "SHOPPING", "374"],
        ["CONTROLADOR", "SCP", "SHOPPING", "1097"],
        ["GERENCIADORA (BCM)", "SCP", "SHOPPING", "27"],
        ["ATUADOR-CM/CVF", "SCP", "SHOPPING", "251"],
        ["SENSORES", "SCP", "SHOPPING", "603"],
        ["GERENCIADOR (SMART-GATE M)", "GESTAL", "SHOPPING", "27"],
        ["MEDIDORES DE ENERGIA", "GESTAL", "SHOPPING", "384"],
        ["CONTROLADORA DE ACESSO", "SCA", "SHOPPING", "108"],
        ["ELETROIMÁ", "SCA", "SHOPPING", "123"],
        ["BOTÃO DE REQUÍSIÇÃO DE SAÍDA", "SCA", "SHOPPING", "106"],
        ["ELETROIMÁ (ESCADA DE EMERGÊNCIA)", "SCA", "SHOPPING", "36"],
        ["SENSOR MAGNÉTICO (ESCADA DE EMERGÊNCIA)", "SCA", "SHOPPING", "36"],
        ["CONTROLADORA DE ACESSO", "SCA", "TEATRO", "8"],
        ["ELETROIMÁ", "SCA", "TEATRO", "8"],
        ["BOTÃO DE REQUÍSIÇÃO DE SAÍDA", "SCA", "TEATRO", "8"],
        ["CENTRAL DE INCÊNDIO", "SDAI", "TEATRO", "1"],
        ["PAINEL REPETIDOR", "SDAI", "TEATRO", "1"],
        ["EQUIPAMENTOS SDAI", "SDAI", "TEATRO", "124"],
        ["ATUADOR-CM", "SCP", "TEATRO", "12"],
        ["SENSORES", "SCP", "TEATRO", "44"],
        ["CENTRAL DE INCÊNDIO", "SDAI", "IJCPM", "1"],
        ["EQUIPAMENTOS SDAI", "SDAI", "IJCPM", "22"]
      ];

      let currentY = headerY + rowHeight - 1;

      // Processar todas as linhas sem quebra de página
      for (let rowIndex = 0; rowIndex < equipmentData.length; rowIndex++) {
        const row = equipmentData[rowIndex];
        // Fundo branco para todas as linhas
        pdf.setFillColor(255, 255, 255);

        // Desenhar dados da linha com fundo branco e bordas pretas
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          const cell = row[cellIndex];
          const x = tableX + colWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);
          // Preencher fundo da célula com branco
          pdf.setFillColor(255, 255, 255);
          pdf.rect(x, currentY - 5, colWidths[cellIndex], rowHeight, 'F');
          // Borda preta da célula
          pdf.setDrawColor(0, 0, 0);
          pdf.rect(x, currentY - 5, colWidths[cellIndex], rowHeight);
          // Texto da célula (preto)
          pdf.setTextColor(0, 0, 0);
          pdf.text(cell, x + colWidths[cellIndex] / 2, currentY + 1, { align: "center" });
        }

        currentY += rowHeight;
      }

      // Linhas horizontais pretas entre as linhas
      pdf.setDrawColor(0, 0, 0);
      let lineY = headerY + 1;
      for (let i = 0; i <= equipmentData.length; i++) {
        pdf.line(tableX, lineY, tableX + colWidths.reduce((a, b) => a + b, 0), lineY);
        lineY += rowHeight;
      }

      // Total
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      // Preencher fundo do total com branco
      pdf.setFillColor(255, 255, 255);
      pdf.rect(tableX, currentY - 5, colWidths.slice(0, 3).reduce((a, b) => a + b, 0), rowHeight, 'F');
      pdf.rect(tableX + colWidths.slice(0, 3).reduce((a, b) => a + b, 0), currentY - 5, colWidths[3], rowHeight, 'F');
      // Bordas pretas do total
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(tableX, currentY - 5, colWidths.slice(0, 3).reduce((a, b) => a + b, 0), rowHeight);
      pdf.rect(tableX + colWidths.slice(0, 3).reduce((a, b) => a + b, 0), currentY - 5, colWidths[3], rowHeight);
      // Texto do total (preto)
      pdf.setTextColor(0, 0, 0);
      pdf.text("TOTAL", tableX + (colWidths.slice(0, 3).reduce((a, b) => a + b, 0)) / 2, currentY + 1, { align: "center" });
      pdf.text("7962", tableX + colWidths.slice(0, 3).reduce((a, b) => a + b, 0) + colWidths[3] / 2, currentY + 1, { align: "center" });

      // Resetar cores para padrão
      pdf.setDrawColor(0, 0, 0);
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(255, 255, 255);

      const addPageHeader = (doc: any, pageNum: number) => {
        // Adjust page number to account for cover pages
        const displayPageNum = pageNum - 4; // Subtract 4 for the 4 cover pages (removed one)

        const logoHeaderWidth = 60;
        const logoHeaderHeight = 30;
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

        // Only add the title if this is not the third or fourth cover page (pages 3 and 4)
        if (pageNum !== 3 && pageNum !== 4) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          doc.setTextColor(20, 20, 20);
          doc.text("Relatório de Corretivas Concluídas", pageWidth / 2, titleY, {
            align: "center",
          });
        }

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
        // Only show page number for content pages (after cover pages)
        if (displayPageNum > 0) {
          doc.text(`Página ${displayPageNum}`, pageWidth - margin, infoY, {
            align: "right",
          });
        }

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

      // Adicionar uma nova página para informações
      pdf.addPage();
      let infoYOffset = addPageHeader(pdf, 5); // This will be page 5 (4 cover pages + 1 info page)
      addFooter(pdf);

      // Título da página de informações
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(0, 60, 120);
      pdf.text("Informações do Relatório", pageWidth / 2, infoYOffset, { align: "center" });
      infoYOffset += 20;

      // Informações detalhadas
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);

      const infoContent = [
        "Este relatório contém todas as corretivas concluídas registradas no sistema.",
        "",
        `Total de corretivas concluídas: ${corretivasData.length}`,
        "",
        "O relatório está organizado da seguinte forma:",
        "1. Capa inicial",
        "2. Informações do cliente",
        "3. Tabela de equipamentos",
        "4. Esta página de informações",
        "5. Páginas individuais para cada corretiva concluída",
        "6. Cada página de corretiva contém:",
        "   - Informações detalhadas da corretiva",
        "   - Fotos associadas à corretiva (quando disponíveis)",
        "",
        "Data e hora do sistema: " + new Date().toLocaleString("pt-BR", {
          timeZone: "America/Fortaleza",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        "",
        "Este documento foi gerado automaticamente pelo sistema NANOAUTOMATION."
      ];

      const maxTextWidth = pageWidth - 2 * margin;

      for (const line of infoContent) {
        const splitted = pdf.splitTextToSize(line, maxTextWidth);
        for (const textLine of splitted) {
          if (infoYOffset > pageHeight - 50) {
            pdf.addPage();
            infoYOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
          }
          pdf.text(textLine, margin, infoYOffset);
          infoYOffset += lineHeight + 2;
        }
      }

      // Adicionar uma nova página para o conteúdo das corretivas
      pdf.addPage();

      // Remover o resumo estatístico e começar diretamente com as corretivas
      // Loop de corretivas - cada corretiva em uma página separada
      for (let i = 0; i < corretivasData.length; i++) {
        const c = corretivasData[i];

        // Para a primeira corretiva, não adicionamos uma nova página pois já estamos na primeira página de conteúdo
        if (i > 0) {
          pdf.addPage();
        }

        // Page number should account for the 4 cover pages and the info page
        const pageNum = i + 1 + 5; // 4 cover pages + 1 info page + current page
        yOffset = addPageHeader(pdf, pageNum);
        addFooter(pdf);

        // Título
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 60, 120);
        pdf.text(`Corretiva #${i + 1}`, margin, yOffset);
        yOffset += 15;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text(`Local: ${c.local}`, margin, yOffset);
        yOffset += 12;

        // Informações
        const infoLines = [
          `Colaborador: ${c.colaborador || "N/A"}`,
          `Solicitante: ${c.solicitante}`,
          `Solicitação: ${c.solicitacao}`,
          `Descrição: ${c.descricao}`,
          `Data Inicial: ${new Date(c.data).toLocaleDateString("pt-BR")}`,
          `Data Conclusão: ${c.dataConclusao
            ? new Date(c.dataConclusao).toLocaleDateString("pt-BR")
            : "-"
          }`,
        ];

        const maxTextWidth = pageWidth - 2 * margin;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        for (const line of infoLines) {
          const splitted = pdf.splitTextToSize(line, maxTextWidth);
          for (const textLine of splitted) {
            if (yOffset > pageHeight - 50) {
              pdf.addPage();
              yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
              addFooter(pdf);
            }
            pdf.text(textLine, margin, yOffset);
            yOffset += lineHeight + 2;
          }
        }

        yOffset += 10;

        // Seção de Fotos
        if (c.fotos && c.fotos.length > 0) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text("Fotos:", margin, yOffset);
          yOffset += 10;

          // Ajustar o tamanho e layout com base no número de imagens
          const numImages = c.fotos.length;

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

          // Acessar as URLs das fotos corretamente
          for (const foto of c.fotos) {
            const url = foto.url; // Acessar a URL corretamente do objeto foto
            if (yOffset + imgHeight > pageHeight - 50) {
              pdf.addPage();
              yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
              addFooter(pdf);
            }

            const xPos = margin + col * (imgWidth + margin);

            try {
              const base64 = await getImageBase64(url);
              pdf.addImage(
                base64,
                "JPEG",
                xPos,
                yOffset,
                imgWidth,
                imgHeight
              );
            } catch (err) {
              console.warn("Erro ao carregar imagem:", url, err);
              pdf.setFont("helvetica", "italic");
              pdf.setFontSize(8);
              pdf.setTextColor(100, 100, 100);
              pdf.text(
                "Imagem não disponível",
                xPos,
                yOffset + imgHeight / 2
              );
              pdf.setTextColor(0, 0, 0);
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(11);
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
        }
      }

      // Adicionar marca d'água em todas as páginas
      addWatermark(pdf);

      pdf.save("corretivas_concluidas.pdf");
      toast.success("PDF gerado com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao gerar PDF: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [isScriptLoaded, corretivasData]);

  return (
    <>
      <Button
        variant="success"
        onClick={handleGenerateClick}
        disabled={
          isGenerating ||
          !isScriptLoaded ||
          loadingData ||
          corretivasData.length === 0
        }
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
        ) : loadingData ? (
          "Carregando dados..."
        ) : !isScriptLoaded ? (
          "Carregando bibliotecas..."
        ) : corretivasData.length === 0 ? (
          "Nenhum dado para gerar PDF"
        ) : (
          `Gerar PDF de Corretivas Concluídas (${corretivasData.length})`
        )}
      </Button>
      <PeriodSelectionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onGenerate={handlePeriodSelect}
      />
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

export default PdfConcluidasButton;