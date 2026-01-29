/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Spinner, Alert, Table, ListGroup, Card } from "react-bootstrap";
// Importa o componente do botão de PDF
import PdfDefectiveAtuadoresButton from "../../../../components/PDFs/PdfDefectiveAtuadoresButton";
import CmsNavigationSubmenu from "../../../../components/navigation/CmsNavigationSubmenu";

// --- Interfaces (Devem ser as mesmas usadas em outros locais, idealmente de um arquivo compartilhado) ---
interface Atuador {
  id: string;
  nome: string;
  tipo: string;
  valorAtual: number;
  descricaoDefeito?: string;
  equipamentoId: string;
  // O 'equipamento' pode ser opcional ou não populado se a API não incluir
  equipamento?: Equipamento;
}

interface Sensor {
  id: string;
  nome: string;
  tipo?: string;
  valorAtual: number;
  equipamentoId: string;
  // O 'equipamento' pode ser opcional ou não populado se a API não incluir
  equipamento?: Equipamento;
}

interface Equipamento {
  id: string;
  nome: string;
  descricao?: string;
  cmId: string;
  atuadores: Atuador[];
  sensores: Sensor[];
  // O 'cm' pode ser opcional ou não populado se a API não incluir
  cm?: Cm;
}

interface Cm {
  id: string;
  nome: string;
  localizacao: string;
  equipamentos: Equipamento[];
}

// Este componente agora é a própria página, não recebe props de dados
export default function AtuadoresComDefeitoPage() {
  // Renomeado para seguir a convenção de página
  const [cmsData, setCmsData] = useState<Cm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os dados das Casas de Máquinas
  const fetchCms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Faz a requisição para a API que retorna os dados completos das CMs,
      // incluindo equipamentos, atuadores e sensores (com seus relacionamentos aninhados).
      const res = await fetch("/api/cmsApi/cms");
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Erro desconhecido ao buscar CMs." }));
        throw new Error(errorData.message || `Erro HTTP: ${res.status}`);
      }
      const result = await res.json();

      // Verifica se a resposta tem o formato esperado
      if (!result || !result.success || !Array.isArray(result.data)) {
        console.error("Formato de resposta inesperado:", result);
        throw new Error("Formato de dados inválido recebido da API");
      }

      const data: Cm[] = result.data;

      // Processa os dados para garantir que valorAtual seja um número
      const processedCms = data.map((cm) => ({
        ...cm,
        equipamentos: cm.equipamentos.map((eq) => ({
          ...eq,
          atuadores: eq.atuadores.map((atuador) => ({
            ...atuador,
            valorAtual:
              typeof atuador.valorAtual === "string"
                ? parseFloat(atuador.valorAtual)
                : atuador.valorAtual,
          })),
          sensores: eq.sensores.map((sensor) => ({
            ...sensor,
            valorAtual:
              typeof sensor.valorAtual === "string"
                ? parseFloat(sensor.valorAtual)
                : sensor.valorAtual,
          })),
        })),
      }));

      setCmsData(processedCms);
    } catch (err: any) {
      console.error("Erro ao buscar CMs para relatório de defeito:", err);
      setError(
        `Falha ao carregar dados para o relatório: ${err.message || "Erro de rede."
        }`
      );
      // Garante que cmsData seja um array vazio em caso de erro de fetch
      setCmsData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para carregar os dados na montagem do componente
  useEffect(() => {
    fetchCms();
  }, [fetchCms]);

  // Usa useMemo para processar os dados, obtendo uma lista de equipamentos
  // e verificando se cada um possui atuadores com defeito.
  const equipmentsWithDefectStatus = useMemo(() => {
    const result: (Equipamento & {
      cmNome: string;
      cmLocalizacao: string;
      hasDefectiveAtuator: boolean;
      defectiveAtuatorsDetails: Atuador[];
    })[] = [];

    const safeCmsData = cmsData || [];

    if (!Array.isArray(safeCmsData)) {
      console.error(
        "Erro crítico: cmsData não é um array (após fallback). Conteúdo:",
        safeCmsData
      );
      return []; // Retorna um array vazio para evitar o erro de forEach
    }

    safeCmsData.forEach((cm) => {
      if (cm.equipamentos && Array.isArray(cm.equipamentos)) {
        cm.equipamentos.forEach((eq) => {
          const defectiveAtuatorsInEq = (eq.atuadores || []).filter(
            (atuador) =>
              atuador.descricaoDefeito && atuador.descricaoDefeito.trim() !== ""
          );
          const hasDefective = defectiveAtuatorsInEq.length > 0;

          if (hasDefective) {
            result.push({
              ...eq,
              cmNome: cm.nome || "N/A",
              cmLocalizacao: cm.localizacao || "N/A",
              hasDefectiveAtuator: hasDefective,
              defectiveAtuatorsDetails: defectiveAtuatorsInEq,
            });
          }
        });
      }
    });

    return result;
  }, [cmsData]);

  // Novo useMemo para extrair e achatar todos os atuadores defeituosos
  const allDefectiveAtuadoresForPdf = useMemo(() => {
    const allAtuadores: Atuador[] = [];
    equipmentsWithDefectStatus.forEach((eq) => {
      allAtuadores.push(...eq.defectiveAtuatorsDetails);
    });
    return allAtuadores;
  }, [equipmentsWithDefectStatus]);

  // Novo useMemo para obter os tipos únicos de atuadores com defeito
  const uniqueDefectiveAtuatorTypes = useMemo(() => {
    const types = new Set<string>();
    allDefectiveAtuadoresForPdf.forEach(atuador => {
      if (atuador.tipo) {
        types.add(atuador.tipo);
      }
    });
    return Array.from(types);
  }, [allDefectiveAtuadoresForPdf]);


  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando dados...</span>
        </Spinner>
        <p className="mt-2">
          Carregando relatório de atuadores com defeito, por favor aguarde...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <Alert variant="danger">
          <Alert.Heading>Erro ao Carregar Dados</Alert.Heading>
          <p>{error}</p>
          <hr />
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <CmsNavigationSubmenu isCollapsed={false} />
      <h1 className="mb-4 text-center text-primary fw-bold">Relatório de Atuadores com Defeito</h1>
      <hr className="mb-4" />
      <div className="d-flex justify-content-center mt-2 mb-4">
        {/* Passa a lista de todos os atuadores defeituosos para o botão de PDF */}
        <PdfDefectiveAtuadoresButton />
      </div>

      {equipmentsWithDefectStatus.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhum equipamento com atuador defeituoso e descrição de defeito
          encontrada no momento.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead>
            <tr className="bg-primary text-white">
              <th>Atuadores C/ Defeito</th>
              <th>Tipo do Atuador</th>
              <th>Casa de Máquinas</th>
              <th>Piso</th>
              <th>Máquinas</th>
              <th>Descrição do Defeito</th>
            </tr>
          </thead>
          <tbody>
            {equipmentsWithDefectStatus.map((eq, index) => (
              <tr key={eq.id || index}>
                <td>
                  <ListGroup variant="flush">
                    {eq.defectiveAtuatorsDetails.map((atuador) => (
                      <ListGroup.Item
                        key={atuador.id}
                        className="py-1 px-0 bg-light border-0"
                      >
                        <small className="text-danger fw-bold">
                          {atuador.nome}
                        </small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </td>
                <td>
                  <ListGroup variant="flush">
                    {eq.defectiveAtuatorsDetails.map((atuador) => (
                      <ListGroup.Item
                        key={atuador.id}
                        className="py-1 px-0 bg-light border-0"
                      >
                        <small>
                          {atuador.tipo}
                        </small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </td>
                <td>{eq.cmNome}</td>
                <td>{eq.cmLocalizacao}</td>
                <td>{eq.nome}</td>
                <td>
                  <ListGroup variant="flush">
                    {eq.defectiveAtuatorsDetails.map((atuador) => (
                      <ListGroup.Item
                        key={atuador.id}
                        className="py-1 px-0 bg-light border-0"
                      >
                        <small className="text-danger">
                          {atuador.descricaoDefeito && atuador.descricaoDefeito.trim() !== ""
                            ? ` ${atuador.descricaoDefeito}`
                            : "N/A"}
                        </small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <hr />
      {/* Resumo do Relatório */}
      <div className="d-flex justify-content-center mt-4">
        <Card className="shadow-lg p-3 bg-light" style={{ minWidth: "300px" }}>
          <Card.Body>
            <Card.Title className="text-center text-primary fw-bold">Resumo do Relatório</Card.Title>
            <Card.Text className="text-muted text-center">
              Este relatório lista todos os atuadores que foram marcados com defeito,
              oferecendo uma visão geral rápida da situação.
            </Card.Text>
            <ListGroup variant="flush" className="mt-3">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                Total de Atuadores com Defeito:
                <span className="badge bg-danger rounded-pill fs-6">{allDefectiveAtuadoresForPdf.length}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                Total de Equipamentos Afetados:
                <span className="badge bg-secondary rounded-pill fs-6">{equipmentsWithDefectStatus.length}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center flex-column align-items-start">
                <div className="fw-bold mb-2">Tipos de Atuadores com Defeito:</div>
                <ul className="list-unstyled w-100 mb-0">
                  {uniqueDefectiveAtuatorTypes.length > 0 ? (
                    uniqueDefectiveAtuatorTypes.map((tipo, idx) => (
                      <li key={idx} className="d-flex justify-content-between align-items-center">
                        {tipo}
                        <span className="badge bg-info text-dark rounded-pill">
                          {allDefectiveAtuadoresForPdf.filter(atuador => atuador.tipo === tipo).length}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li>Nenhum tipo de atuador com defeito encontrado.</li>
                  )}
                </ul>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
