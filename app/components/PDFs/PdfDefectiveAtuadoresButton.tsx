/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Garante que seja um Client Component

import { LOGO_BASE64 } from "@/app/img/logoBase64";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

// Interface para atuador com defeito com informações completas
interface AtuadorDefeitoCompleto {
  id: string;
  nome: string;
  tipo: string;
  descricaoDefeito?: string;
  existe?: boolean;
  motivoNaoExiste?: string;
  estado?: string;
  valorAtual?: number;
  equipamentoNome?: string;
  cmNome: string;
  cmLocalizacao?: string;
}

/**
 * Componente de botão para gerar um relatório em PDF de atuadores com defeito.
 * O componente busca seus próprios dados das APIs e gera o PDF de forma autônoma.
 */
const PdfDefectiveAtuadoresButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [atuadoresData, setAtuadoresData] = useState<AtuadorDefeitoCompleto[]>(
    []
  );
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

  /**
   * Função para buscar atuadores com defeito diretamente das APIs.
   */
  const fetchAtuadoresData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Buscar atuadores
      const atuadoresResponse = await fetch("/api/cmsApi/atuador");
      if (!atuadoresResponse.ok) {
        throw new Error(
          `Erro ao buscar atuadores: ${atuadoresResponse.status}`
        );
      }

      const atuadoresResult = await atuadoresResponse.json();
      let todosAtuadores = [];
      if (atuadoresResult && typeof atuadoresResult === "object") {
        if (Array.isArray(atuadoresResult)) {
          todosAtuadores = atuadoresResult;
        } else if (atuadoresResult.success && atuadoresResult.data) {
          todosAtuadores = Array.isArray(atuadoresResult.data)
            ? atuadoresResult.data
            : [];
        }
      }

      // Buscar equipamentos (maquinas)
      const equipamentosResponse = await fetch("/api/cmsApi/maquinas");
      let todosEquipamentos = [];
      if (equipamentosResponse.ok) {
        const equipamentosResult = await equipamentosResponse.json();
        if (equipamentosResult && typeof equipamentosResult === "object") {
          if (Array.isArray(equipamentosResult)) {
            todosEquipamentos = equipamentosResult;
          } else if (equipamentosResult.success && equipamentosResult.data) {
            todosEquipamentos = Array.isArray(equipamentosResult.data)
              ? equipamentosResult.data
              : [];
          }
        }
      }

      // Buscar CMs
      const cmsResponse = await fetch("/api/cmsApi/cms");
      let todosCms = [];
      if (cmsResponse.ok) {
        const cmsResult = await cmsResponse.json();
        if (cmsResult && typeof cmsResult === "object") {
          if (Array.isArray(cmsResult)) {
            todosCms = cmsResult;
          } else if (cmsResult.success && cmsResult.data) {
            todosCms = Array.isArray(cmsResult.data)
              ? cmsResult.data
              : [];
          }
        }
      }

      // Filtrar atuadores com defeito
      const atuadoresComDefeito = todosAtuadores.filter((atuador: any) => {
        const temEstadoDefeito =
          atuador.estado === "DEFEITO" || atuador.status === "DEFEITO";
        const temDescricaoDefeito =
          (atuador.descricaoDefeito &&
            atuador.descricaoDefeito.trim() !== "") ||
          (atuador.descricao_defeito &&
            atuador.descricao_defeito.trim() !== "");
        const naoExiste = atuador.existe === false || atuador.exists === false;
        return temEstadoDefeito || temDescricaoDefeito || naoExiste;
      });

      // Mapear informações completas
      const atuadoresCompletos: AtuadorDefeitoCompleto[] =
        atuadoresComDefeito.map((atuador: any) => {
          // Primeiro tenta encontrar o equipamento diretamente do atuador
          let equipamento = atuador.equipamento;

          // Se não estiver no atuador, busca na lista de equipamentos
          if (!equipamento && atuador.equipamentoId) {
            equipamento = todosEquipamentos.find(
              (e: any) =>
                e.id === atuador.equipamentoId || e.id === atuador.equipamento_id
            );
          }

          // Tenta encontrar a CM
          let cm = null;
          if (equipamento) {
            // Primeiro tenta encontrar a CM diretamente do equipamento
            cm = equipamento.cm;

            // Se não estiver no equipamento, busca na lista de CMs
            if (!cm && (equipamento.cmId || equipamento.cm_id)) {
              cm = todosCms.find(
                (c: any) =>
                  c.id === equipamento.cmId || c.id === equipamento.cm_id
              );
            }
          }

          return {
            id: atuador.id,
            nome: atuador.nome || atuador.name,
            tipo: atuador.tipo || atuador.type,
            descricaoDefeito:
              atuador.descricaoDefeito || atuador.descricao_defeito,
            existe:
              atuador.existe !== undefined ? atuador.existe : atuador.exists,
            motivoNaoExiste:
              atuador.motivoNaoExiste || atuador.motivo_nao_existe,
            estado: atuador.estado || atuador.status,
            valorAtual: atuador.valorAtual || atuador.valor_atual,
            equipamentoNome:
              (equipamento?.nome ||
                equipamento?.name ||
                "Equipamento não encontrado"),
            cmNome: (cm?.nome || cm?.name || "CM não encontrada"),
            cmLocalizacao: (cm?.localizacao || cm?.localization || "N/A"),
          };
        });

      setAtuadoresData(atuadoresCompletos);
    } catch (err: any) {
      console.error("Erro ao buscar dados para PDF:", err);
      toast.error("Erro ao carregar dados para o PDF: " + err.message);
      setAtuadoresData([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchAtuadoresData();
  }, [fetchAtuadoresData]);

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
  const obterRazaoDefeito = (atuador: AtuadorDefeitoCompleto): string => {
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

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(20, 20, 20);
        doc.text("Relatório de Atuadores com Defeito", pageWidth / 2, 35, {
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
        doc.text(`Gerado em: ${fortzLocaleString}`, margin, 45);
        doc.text(`Página ${pageNum}`, pageWidth - margin, 45, {
          align: "right",
        });

        doc.setTextColor(0, 0, 0);
        return 55;
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
        // --- Adiciona a lista detalhada de atuadores ---
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        yOffset += 10;
        pdf.text("Detalhes dos Atuadores com Defeito", margin, yOffset);
        yOffset += lineHeight * 2;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);

        atuadoresData.forEach((atuador, index) => {
          if (yOffset > pageHeight - 80) {
            pdf.addPage();
            yOffset = addPageHeader(pdf, pdf.internal.getNumberOfPages());
            addFooter(pdf);
            yOffset += 10;
          }

          // Título do atuador
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(50, 50, 50);
          pdf.text(`${index + 1}. Atuador: ${atuador.nome}`, margin, yOffset);
          yOffset += lineHeight;

          // Detalhes do atuador
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);

          pdf.text(`   Tipo: ${atuador.tipo}`, margin, yOffset);
          yOffset += lineHeight;

          pdf.text(
            `   CM: ${atuador.cmNome} (${atuador.cmLocalizacao})`,
            margin,
            yOffset
          );
          yOffset += lineHeight;

          pdf.text(
            `   Equipamento: ${atuador.equipamentoNome}`,
            margin,
            yOffset
          );
          yOffset += lineHeight;

          // Razão do defeito em vermelho
          const razaoDefeito = obterRazaoDefeito(atuador);
          pdf.setTextColor(255, 0, 0);
          const defectText = pdf.splitTextToSize(
            `   Motivo do Defeito: ${razaoDefeito}`,
            pageWidth - 2 * margin
          );
          pdf.text(defectText, margin, yOffset);
          yOffset += lineHeight * defectText.length;

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
        yOffset += lineHeight * 2;

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

      pdf.save("relatorio_atuadores_com_defeito.pdf");
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
        disabled={isGenerating || loadingData || !isScriptLoaded}
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
        ) : !isScriptLoaded ? (
          "Carregando bibliotecas..."
        ) : atuadoresData.length === 0 ? (
          <>
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Gerar PDF (Nenhum defeito encontrado)
          </>
        ) : (
          <>
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Gerar PDF de Atuadores com Defeito ({atuadoresData.length})
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

export default PdfDefectiveAtuadoresButton;
