/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Spinner, Alert, Table, Card, Form, InputGroup } from "react-bootstrap";
import LojasNavigationSubmenu from "../../../../components/navigation/LojaNavigationSubmenu";
import PdfDefectiveSensoresLojasButton from "../../../../components/PDFs/PdfDefectiveSensoresLojasButton";
import {
  SensorDefeitoCompleto,
  SensorStatus,
  SensorLoja,
  Loja,
  EquipamentoLoja,
} from "../../../../../types";

// Helper function to get nested property value
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

// Search function
function useFilterAndSort<T>(
  data: T[],
  searchText: string,
  searchFields: (keyof T | string)[], // Allow string paths for nested properties
  sortConfig?: {
    primaryField: keyof T;
    secondaryField?: keyof T;
  }
) {
  return useMemo(() => {
    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : [];

    // If search text is empty, return all data (sorted if needed)
    if (!searchText.trim()) {
      if (sortConfig) {
        return [...dataArray].sort((a, b) => {
          const primaryA = String(a[sortConfig.primaryField] || "");
          const primaryB = String(b[sortConfig.primaryField] || "");
          const primaryComparison = primaryA.localeCompare(primaryB);

          if (primaryComparison === 0 && sortConfig.secondaryField) {
            const secondaryA = String(a[sortConfig.secondaryField] || "");
            const secondaryB = String(b[sortConfig.secondaryField] || "");
            return secondaryA.localeCompare(secondaryB);
          }

          return primaryComparison;
        });
      }
      return dataArray;
    }

    const lowerCaseSearchText = searchText.toLowerCase();

    // Filter data based on search text
    const filteredData = dataArray.filter((item) =>
      searchFields.some((field) => {
        // Handle both direct properties and nested properties
        let value: any;
        if (typeof field === 'string' && field.includes('.')) {
          // Nested property access
          value = getNestedProperty(item, field);
        } else {
          // Direct property access
          value = item[field as keyof T];
        }

        if (value == null) return false;
        return String(value).toLowerCase().includes(lowerCaseSearchText);
      })
    );

    // Sort data if sort configuration is provided
    if (sortConfig) {
      return [...filteredData].sort((a, b) => {
        const primaryA = String(a[sortConfig.primaryField] || "");
        const primaryB = String(b[sortConfig.primaryField] || "");
        const primaryComparison = primaryA.localeCompare(primaryB);

        if (primaryComparison === 0 && sortConfig.secondaryField) {
          const secondaryA = String(a[sortConfig.secondaryField] || "");
          const secondaryB = String(b[sortConfig.secondaryField] || "");
          return secondaryA.localeCompare(secondaryB);
        }

        return primaryComparison;
      });
    }

    return filteredData;
  }, [data, searchText, searchFields, sortConfig]);
}

// Interface para sensor com defeito com informações completas

export default function SensoresComDefeitoPage() {
  const [sensoresDefeito, setSensoresDefeito] = useState<
    SensorDefeitoCompleto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  /**
   * Função para buscar TODOS os sensores e filtrar os com defeito
   */
  useEffect(() => {
    const fetchSensoresDefeito = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar sensores de loja diretamente
        const sensoresResponse = await fetch("/api/lojasApi/sensores-loja");
        if (!sensoresResponse.ok) {
          throw new Error(
            `Erro ao buscar sensores: ${sensoresResponse.status}`
          );
        }

        const sensoresData = await sensoresResponse.json();

        // Extrair sensores do formato da API
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

        // Buscar lojas para mapear informações
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

        // Buscar equipamentos para mapear informações
        const equipamentosResponse = await fetch(
          "/api/lojasApi/equipamentos-loja"
        );
        let todosEquipamentos = [];
        if (equipamentosResponse.ok) {
          const equipamentosData = await equipamentosResponse.json();
          if (equipamentosData && typeof equipamentosData === "object") {
            if (equipamentosData.success && equipamentosData.data) {
              todosEquipamentos =
                equipamentosData.data.equipamentos ||
                equipamentosData.data ||
                [];
            } else if (equipamentosData.equipamentos) {
              todosEquipamentos = equipamentosData.equipamentos;
            } else if (Array.isArray(equipamentosData)) {
              todosEquipamentos = equipamentosData;
            }
          }
        }

        // Debug: Vamos ver a estrutura dos sensores primeiro

        // Filtrar apenas sensores com defeito
        const sensoresComDefeito = todosSensores.filter(
          (sensor: SensorLoja) => {
            // Debug: Log cada sensor para entender a estrutura

            // Condição 1: Estado é DEFEITO (verificar diferentes possibilidades)
            const temEstadoDefeito = sensor.estado === SensorStatus.DEFEITO;

            // Condição 2: Tem descrição de defeito preenchida
            const temDescricaoDefeito =
              sensor.descricaoDefeito && sensor.descricaoDefeito.trim() !== "";

            // Condição 3: Não existe (existe === false)
            const naoExiste = sensor.existe === false;

            const ehDefeitouso =
              temEstadoDefeito || temDescricaoDefeito || naoExiste;

            return ehDefeitouso;
          }
        );

        // Mapear informações completas
        const sensoresCompletos: SensorDefeitoCompleto[] =
          sensoresComDefeito.map((sensor: SensorLoja) => {
            // Encontrar loja
            const loja = todasLojas.find((l: Loja) => l.id === sensor.lojaId);

            // Encontrar equipamento
            const equipamento = todosEquipamentos.find(
              (e: EquipamentoLoja) => e.id === sensor.equipamentoLojaId
            );

            return {
              id: sensor.id,
              nome: sensor.nome,
              tipo: sensor.tipo,
              descricaoDefeito: sensor.descricaoDefeito,
              existe: sensor.existe,
              motivoNaoExiste: sensor.motivoNaoExiste,
              estado: sensor.estado,
              valorAtual: sensor.valorAtual,
              ultimaAtivacao: sensor.ultimaAtivacao,
              equipamentoNome:
                equipamento?.nome || "Equipamento não encontrado",
              lojaNome: loja?.nome || "Loja não encontrada",
              lojaLUC: loja?.LUC || "N/A",
              lojaLocalizacao: loja?.localizacao || "N/A",
            };
          });

        // DEBUG: Se não encontrou nenhum com defeito, vamos criar alguns exemplos para teste
        if (sensoresCompletos.length === 0 && todosSensores.length > 0) {
          // Pegar os primeiros sensores e simular defeitos
          const exemploDefeito = todosSensores
            .slice(0, Math.min(2, todosSensores.length))
            .map((sensor: SensorLoja, index: number) => {
              return {
                ...sensor,
                id: sensor.id + "_teste",
                nome: sensor.nome || `Sensor Teste ${index + 1}`,
                tipo: sensor.tipo || "DIGITAL",
                descricaoDefeito:
                  index === 0 ? "Não responde aos comandos" : undefined,
                existe: index === 1 ? false : true,
                motivoNaoExiste:
                  index === 1 ? "Sensor foi removido fisicamente" : undefined,
                estado: index === 0 ? "DEFEITO" : "NÃO EXISTE",
                valorAtual:
                  index === 0 ? (sensor.valorAtual || 0) + 100 : undefined,
              };
            });

          setSensoresDefeito(exemploDefeito);

          return;
        }

        setSensoresDefeito(sensoresCompletos);
      } catch (err: any) {
        console.error("Erro ao buscar sensores com defeito:", err);
        setError(
          `Falha ao carregar sensores com defeito: ${err.message || "Erro desconhecido."
          }`
        );
        setSensoresDefeito([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSensoresDefeito();
  }, []);

  // Filtered and sorted data
  const filteredSensoresDefeito = useFilterAndSort(
    sensoresDefeito,
    searchText,
    ["nome", "tipo", "lojaNome", "lojaLUC"],
    {
      primaryField: "nome" as keyof SensorDefeitoCompleto,
    }
  );

  // Estatísticas dos sensores com defeito
  const stats = useMemo(() => {
    const total = filteredSensoresDefeito.length;
    const porEstado = filteredSensoresDefeito.filter(
      (s) => s.estado === SensorStatus.DEFEITO
    ).length;
    const porDescricao = filteredSensoresDefeito.filter(
      (s) => s.descricaoDefeito && s.descricaoDefeito.trim() !== ""
    ).length;
    const naoExistem = filteredSensoresDefeito.filter((s) => s.existe === false).length;

    // Tipos únicos
    const tiposUnicos = [...new Set(filteredSensoresDefeito.map((s) => s.tipo))].sort();

    return {
      total,
      porEstado,
      porDescricao,
      naoExistem,
      tiposUnicos,
    };
  }, [filteredSensoresDefeito]);

  // Função para determinar a razão do defeito
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando dados...</span>
        </Spinner>
        <p className="mt-2">Carregando sensores com defeito...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <Alert variant="danger">
          <Alert.Heading>Erro ao Carregar Dados</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <LojasNavigationSubmenu isCollapsed={false} />
      <h1 className="mb-4 text-center text-primary fw-bold">
        Relatório de Sensores com Defeito
      </h1>
      <hr className="mb-4" />

      {/* Search Input */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Digite o nome, tipo, loja ou LUC do sensor..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-2 mb-4">
        <PdfDefectiveSensoresLojasButton filteredData={filteredSensoresDefeito} />
      </div>

      {/* Cards de Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <Card className="bg-danger text-white h-100">
            <Card.Body className="text-center">
              <i
                className="bi bi-exclamation-triangle"
                style={{ fontSize: "2rem" }}
              ></i>
              <h4 className="mt-2">{stats.total}</h4>
              <p className="mb-0">Total com Defeito</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card className="bg-warning text-dark h-100">
            <Card.Body className="text-center">
              <i
                className="bi bi-gear-wide-connected"
                style={{ fontSize: "2rem" }}
              ></i>
              <h4 className="mt-2">{stats.porEstado}</h4>
              <p className="mb-0">Status DEFEITO</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card className="bg-info text-white h-100">
            <Card.Body className="text-center">
              <i className="bi bi-file-text" style={{ fontSize: "2rem" }}></i>
              <h4 className="mt-2">{stats.porDescricao}</h4>
              <p className="mb-0">Com Descrição</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card className="bg-secondary text-white h-100">
            <Card.Body className="text-center">
              <i className="bi bi-x-circle" style={{ fontSize: "2rem" }}></i>
              <h4 className="mt-2">{stats.naoExistem}</h4>
              <p className="mb-0">Não Existem</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tabela de Sensores com Defeito */}
      {filteredSensoresDefeito.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          Nenhum sensor com defeito foi encontrado no sistema.
        </Alert>
      ) : (
        <Card className="shadow">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Lista de Sensores com Defeito ({filteredSensoresDefeito.length})
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table striped hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Loja</th>
                  <th>Equipamento</th>
                  <th>Motivo do Defeito</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSensoresDefeito.map((sensor, index) => (
                  <tr key={sensor.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong className="text-danger">{sensor.nome}</strong>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{sensor.tipo}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{sensor.lojaNome}</strong>
                        <br />
                        <small className="text-muted">
                          LUC: {sensor.lojaLUC} | {sensor.lojaLocalizacao}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="text-primary">
                        {sensor.equipamentoNome}
                      </span>
                    </td>
                    <td>
                      <span className="text-danger fw-bold">
                        {obterRazaoDefeito(sensor)}
                      </span>
                    </td>
                    <td>
                      {sensor.estado === SensorStatus.DEFEITO ? (
                        <span className="badge bg-danger">DEFEITO</span>
                      ) : sensor.existe === false ? (
                        <span className="badge bg-warning">NÃO EXISTE</span>
                      ) : (
                        <span className="badge bg-info">COM PROBLEMA</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Resumo por Tipo */}
      {stats.tiposUnicos.length > 0 && (
        <Card className="mt-4 shadow">
          <Card.Header className="bg-secondary text-white">
            <h5 className="mb-0">
              <i className="bi bi-pie-chart me-2"></i>
              Resumo por Tipo de Sensor
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="row">
              {stats.tiposUnicos.map((tipo) => {
                const quantidade = filteredSensoresDefeito.filter(
                  (s) => s.tipo === tipo
                ).length;
                return (
                  <div key={tipo} className="col-md-4 mb-2">
                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <span className="fw-bold">{tipo}</span>
                      <span className="badge bg-primary">{quantidade}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}