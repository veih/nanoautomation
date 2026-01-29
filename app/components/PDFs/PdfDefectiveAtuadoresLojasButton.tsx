/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Garante que seja um Client Component

import { LOGO_BASE64 } from "@/app/img/logoBase64";
import { AtuadorDefeitoLojasCompleto } from "../../../types";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Componente de botão para gerar um relatório em PDF de atuadores com defeito das lojas.
 * O componente busca seus próprios dados das APIs de lojas e gera o PDF de forma autônoma.
 */
const PdfDefectiveAtuadoresLojasButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [atuadoresData, setAtuadoresData] = useState<
    AtuadorDefeitoLojasCompleto[]
  >([]);
  const [loadingData, setLoadingData] = useState(true);

  /**
   * Função para buscar atuadores com defeito diretamente das APIs de loja.
   */
  const fetchAtuadoresData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Buscar atuadores de loja
      const atuadoresResponse = await fetch("/api/lojasApi/atuadores-loja");
      if (!atuadoresResponse.ok) {
        throw new Error(
          `Erro ao buscar atuadores: ${atuadoresResponse.status}`
        );
      }

      const atuadoresData = await atuadoresResponse.json();
      let todosAtuadores = [];
      if (atuadoresData && typeof atuadoresData === "object") {
        if (atuadoresData.success && atuadoresData.data) {
          todosAtuadores =
            atuadoresData.data.atuadores || atuadoresData.data || [];
        } else if (atuadoresData.atuadores) {
          todosAtuadores = atuadoresData.atuadores;
        } else if (Array.isArray(atuadoresData)) {
          todosAtuadores = atuadoresData;
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

      // Filtrar atuadores com defeito - improved logic
      const atuadoresComDefeito = todosAtuadores.filter((atuador: any) => {
        // Normalize the status values
        const estado = atuador.estado || atuador.status || "";
        const descricaoDefeito = atuador.descricaoDefeito || atuador.descricao_defeito || "";
        const existe = atuador.existe !== undefined ? atuador.existe : atuador.exists;

        // Check for defect conditions
        const isDefectiveState = estado === "DEFEITO";
        const hasDefectDescription = descricaoDefeito && descricaoDefeito.trim() !== "";
        const doesNotExist = existe === false;

        // Return true if any defect condition is met
        return isDefectiveState || hasDefectDescription || doesNotExist;
      });

      // Mapear informações completas
      const atuadoresCompletos: AtuadorDefeitoLojasCompleto[] =
        atuadoresComDefeito.map((atuador: any) => {
          // Ensure we have valid data for loja and equipamento lookups
          const lojaId = atuador.lojaId || atuador.loja_id;
          const equipamentoId = atuador.equipamentoLojaId || atuador.equipamento_loja_id;

          const loja = lojaId ? todasLojas.find(
            (l: any) => l.id === lojaId
          ) : null;

          const equipamento = equipamentoId ? todosEquipamentos.find(
            (e: any) => e.id === equipamentoId
          ) : null;

          return {
            id: atuador.id || "ID não disponível",
            nome: atuador.nome || atuador.name || "Nome não disponível",
            tipo: atuador.tipo || atuador.type || "Tipo não disponível",
            descricaoDefeito:
              atuador.descricaoDefeito || atuador.descricao_defeito || "",
            existe:
              atuador.existe !== undefined ? atuador.existe : atuador.exists,
            motivoNaoExiste:
              atuador.motivoNaoExiste || atuador.motivo_nao_existe || "",
            estado: atuador.estado || atuador.status || "DESCONHECIDO",
            valorAtual: atuador.valorAtual || atuador.valor_atual || 0,
            equipamentoNome:
              equipamento?.nome ||
              equipamento?.name ||
              "Equipamento não encontrado",
            lojaNome: loja?.nome || loja?.name || "Loja não encontrada",
            lojaLUC: loja?.LUC || loja?.luc || "N/A",
            lojaLocalizacao: loja?.localizacao || loja?.localization || "N/A",
          };
        });

      setAtuadoresData(atuadoresCompletos);
    } catch (err: any) {
      console.error("Erro ao buscar dados para PDF:", err);
      toast.error("Erro ao carregar dados para o PDF: " + (err.message || "Erro desconhecido"));
      setAtuadoresData([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchAtuadoresData();
  }, [fetchAtuadoresData]);

  // Agrupar atuadores por loja
  const atuadoresPorLoja = useMemo(() => {
    const grupos = new Map<string, AtuadorDefeitoLojasCompleto[]>();

    atuadoresData.forEach((atuador) => {
      const lojaKey = `${atuador.lojaNome} (${atuador.lojaLUC})`;
      if (!grupos.has(lojaKey)) {
        grupos.set(lojaKey, []);
      }
      grupos.get(lojaKey)!.push(atuador);
    });

    // Converter para array e ordenar por nome da loja
    return Array.from(grupos.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([loja, atuadores]) => ({ loja, atuadores }));
  }, [atuadoresData]);

  // Obter tipos únicos de atuadores
  const uniqueDefectiveAtuatorTypes = useMemo(() => {
    const types = new Set<string>();
    atuadoresData.forEach((atuador) => {
      if (atuador.tipo) {
        types.add(atuador.tipo);
      }
    });
    return Array.from(types);
  }, [atuadoresData]);

  // Contar equipamentos afetados
  const affectedEquipmentsCount = useMemo(() => {
    const equipmentNames = new Set<string>();
    atuadoresData.forEach((atuador) => {
      if (atuador.equipamentoNome) {
        equipmentNames.add(atuador.equipamentoNome);
      }
    });
    return equipmentNames.size;
  }, [atuadoresData]);

  // Função para obter a razão do defeito
  const obterRazaoDefeito = (atuador: AtuadorDefeitoLojasCompleto): string => {
    if (atuador.estado === "DEFEITO") {
      return atuador.descricaoDefeito || "Status: DEFEITO";
    }
    if (atuador.existe === false) {
      return atuador.motivoNaoExiste || "Atuador não existe";
    }
    if (atuador.descricaoDefeito && atuador.descricaoDefeito.trim() !== "") {
      return atuador.descricaoDefeito;
    }
    return "Motivo não especificado";
  };

  /**
   * Função para gerar o arquivo PDF.
   */
  const generatePdf = async () => {
    if (loadingData) {
      toast.warn("Aguarde o carregamento dos dados antes de gerar o PDF.");
      return;
    }

    if (atuadoresData.length === 0) {
      toast.warn("Não há dados de atuadores com defeito para gerar o PDF.");
      return;
    }

    setIsGenerating(true);
    try {
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
          doc.saveGraphicsState();
          doc.setGState(new (doc as any).GState({ opacity: watermarkOpacity }));
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
        doc.text(
          "Relatório de Atuadores com Defeito por Loja",
          pageWidth / 2,
          titleY,
          {
            align: "center",
          }
        );

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

      if (atuadoresData.length === 0) {
        pdf.setFontSize(12);
        pdf.text(
          "Nenhum atuador com defeito encontrado para gerar o relatório.",
          pageWidth / 2,
          yOffset + 20,
          { align: "center" }
        );
      } else {
        // --- Adiciona a lista detalhada de atuadores organizados por loja ---
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        yOffset += 10;
        pdf.text("Atuadores com Defeito Organizados por Loja", margin, yOffset);
        yOffset += lineHeight * 2;

        let contadorGlobal = 1;

        atuadoresPorLoja.forEach((grupo) => {
          // Cabeçalho da loja
          if (yOffset > pageHeight - 100) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
            yOffset += 10;
          }

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.setTextColor(0, 100, 0);
          pdf.text(`LOJA: ${grupo.loja}`, margin, yOffset);
          yOffset += lineHeight;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            `Total de atuadores com defeito nesta loja: ${grupo.atuadores.length}`,
            margin,
            yOffset
          );
          yOffset += lineHeight * 2;

          pdf.setTextColor(50, 50, 50);

          // Listar atuadores da loja
          grupo.atuadores.forEach((atuador) => {
            if (yOffset > pageHeight - 80) {
              pdf.addPage();
              yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
              addFooter(pdf);
              yOffset += 10;
            }

            // Título do atuador
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.setTextColor(50, 50, 50);
            pdf.text(
              `${contadorGlobal}. Atuador: ${atuador.nome}`,
              margin + 5,
              yOffset
            );
            yOffset += lineHeight;
            contadorGlobal++;

            // Detalhes do atuador
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);

            pdf.text(`     Tipo: ${atuador.tipo}`, margin + 5, yOffset);
            yOffset += lineHeight;

            pdf.text(
              `     Localização: ${atuador.lojaLocalizacao}`,
              margin + 5,
              yOffset
            );
            yOffset += lineHeight;

            pdf.text(
              `     Equipamento: ${atuador.equipamentoNome}`,
              margin + 5,
              yOffset
            );
            yOffset += lineHeight;

            // Razão do defeito em vermelho
            const razaoDefeito = obterRazaoDefeito(atuador);
            pdf.setTextColor(255, 0, 0);
            const defectText = pdf.splitTextToSize(
              `     Motivo do Defeito: ${razaoDefeito}`,
              pageWidth - 2 * margin - 10
            );
            pdf.text(defectText, margin + 5, yOffset);
            yOffset += lineHeight * defectText.length;

            pdf.setTextColor(50, 50, 50);
            yOffset += lineHeight * 0.5; // Espaço menor entre atuadores
          });

          yOffset += lineHeight; // Espaço entre lojas
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
          `Total de Atuadores com Defeito: ${atuadoresData.length} unidades`,
          margin,
          yOffset
        );
        yOffset += lineHeight;
        pdf.text(
          `Total de Equipamentos Afetados: ${affectedEquipmentsCount} unidades`,
          margin,
          yOffset
        );
        yOffset += lineHeight;
        pdf.text(
          `Total de Lojas Afetadas: ${atuadoresPorLoja.length} unidades`,
          margin,
          yOffset
        );
        yOffset += lineHeight * 2;

        // Resumo por loja
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("Resumo por Loja:", margin, yOffset);
        yOffset += lineHeight;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        atuadoresPorLoja.forEach((grupo) => {
          if (yOffset > pageHeight - 60) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
            yOffset += 10;
          }
          pdf.text(
            `• ${grupo.loja}: ${grupo.atuadores.length} atuadores com defeito`,
            margin,
            yOffset
          );
          yOffset += lineHeight;
        });

        yOffset += lineHeight;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("Tipos de Atuadores com Defeito:", margin, yOffset);
        yOffset += lineHeight;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);

        uniqueDefectiveAtuatorTypes.forEach((tipo) => {
          if (yOffset > pageHeight - 60) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
            yOffset += 10;
          }
          const count = atuadoresData.filter(
            (atuador) => atuador.tipo === tipo
          ).length;
          pdf.text(`• ${tipo}: ${count} unidades`, margin, yOffset);
          yOffset += lineHeight;
        });
      }

      pdf.save("relatorio_atuadores_defeito_por_loja.pdf");
      toast.success("PDF gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      toast.error(
        "Ocorreu um erro ao gerar o PDF: " + (error.message || "Erro desconhecido")
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
        disabled={isGenerating || loadingData}
        className="mt-4 shadow-lg"
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
        ) : atuadoresData.length === 0 ? (
          <>
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Gerar PDF (Nenhum defeito encontrado)
          </>
        ) : (
          <>
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Gerar PDF por Lojas ({atuadoresData.length} defeitos)
          </>
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

export default PdfDefectiveAtuadoresLojasButton;