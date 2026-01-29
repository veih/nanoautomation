/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Spinner, Alert, Table, Card } from "react-bootstrap";
import PdfDefectiveAtuadoresLojasButton from "../../../../components/PDFs/PdfDefectiveAtuadoresLojasButton";
import LojasNavigationSubmenu from "../../../../components/navigation/LojaNavigationSubmenu";
import { AtuadorStatus } from "../../../../../types";

// Interface para atuador com defeito com informações completas
interface AtuadorDefeitoCompleto {
  id: string;
  nome: string;
  tipo: string;
  descricaoDefeito?: string;
  existe?: boolean;
  motivoNaoExiste?: string;
  estado?: AtuadorStatus;
  valorAtual?: number;
  equipamentoNome?: string;
  lojaNome: string;
  lojaLUC: string;
  lojaLocalizacao?: string;
}

export default function AtuadoresComDefeitoPage() {
  const [atuadoresDefeito, setAtuadoresDefeito] = useState<
    AtuadorDefeitoCompleto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Função para buscar TODOS os atuadores e filtrar os com defeito
   */
  useEffect(() => {
    const fetchAtuadoresDefeito = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar atuadores de loja diretamente
        const atuadoresResponse = await fetch("/api/lojasApi/atuadores-loja");
        if (!atuadoresResponse.ok) {
          throw new Error(
            `Erro ao buscar atuadores: ${atuadoresResponse.status}`
          );
        }

        const atuadoresData = await atuadoresResponse.json();

        // Extrair atuadores do formato da API
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

        // Filtrar apenas atuadores com defeito
        const atuadoresComDefeito = todosAtuadores.filter((atuador: any) => {
          // Condição 1: Estado é DEFEITO (verificar diferentes possibilidades)
          const temEstadoDefeito =
            atuador.estado === "DEFEITO" ||
            atuador.estado === AtuadorStatus.DEFEITO ||
            atuador.status === "DEFEITO" ||
            atuador.status === AtuadorStatus.DEFEITO;

          // Condição 2: Tem descrição de defeito preenchida
          const temDescricaoDefeito =
            (atuador.descricaoDefeito &&
              atuador.descricaoDefeito.trim() !== "") ||
            (atuador.descricao_defeito &&
              atuador.descricao_defeito.trim() !== "");

          // Condição 3: Não existe (existe === false)
          const naoExiste =
            atuador.existe === false || atuador.exists === false;

          const ehDefeitouso =
            temEstadoDefeito || temDescricaoDefeito || naoExiste;

          return ehDefeitouso;
        });

        // Mapear informações completas
        const atuadoresCompletos: AtuadorDefeitoCompleto[] =
          atuadoresComDefeito.map((atuador: any) => {
            // Encontrar loja
            const loja = todasLojas.find(
              (l: any) => l.id === atuador.lojaId || l.id === atuador.loja_id
            );

            // Encontrar equipamento
            const equipamento = todosEquipamentos.find(
              (e: any) =>
                e.id === atuador.equipamentoLojaId ||
                e.id === atuador.equipamento_loja_id
            );

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
                equipamento?.nome ||
                equipamento?.name ||
                "Equipamento não encontrado",
              lojaNome: loja?.nome || loja?.name || "Loja não encontrada",
              lojaLUC: loja?.LUC || loja?.luc || "N/A",
              lojaLocalizacao: loja?.localizacao || loja?.localization || "N/A",
            };
          });

        setAtuadoresDefeito(atuadoresCompletos);
      } catch (err: any) {
        console.error("Erro ao buscar atuadores com defeito:", err);
        setError(
          `Falha ao carregar atuadores com defeito: ${err.message || "Erro desconhecido."
          }`
        );
        setAtuadoresDefeito([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAtuadoresDefeito();
  }, []);

  // Estatísticas dos atuadores com defeito
  const stats = useMemo(() => {
    const total = atuadoresDefeito.length;
    const porEstado = atuadoresDefeito.filter(
      (a) => a.estado === AtuadorStatus.DEFEITO
    ).length;
    const porDescricao = atuadoresDefeito.filter(
      (a) => a.descricaoDefeito && a.descricaoDefeito.trim() !== ""
    ).length;
    const naoExistem = atuadoresDefeito.filter(
      (a) => a.existe === false
    ).length;

    // Tipos únicos
    const tiposUnicos = [
      ...new Set(atuadoresDefeito.map((a) => a.tipo)),
    ].sort();

    return {
      total,
      porEstado,
      porDescricao,
      naoExistem,
      tiposUnicos,
    };
  }, [atuadoresDefeito]);

  // Função para determinar a razão do defeito
  const obterRazaoDefeito = (atuador: AtuadorDefeitoCompleto): string => {
    if (atuador.estado === AtuadorStatus.DEFEITO) {
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando dados...</span>
        </Spinner>
        <p className="mt-2">Carregando atuadores com defeito...</p>
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
        Relatório de Atuadores com Defeito
      </h1>
      <hr className="mb-4" />

      <div className="d-flex justify-content-center gap-3 mt-2 mb-4">
        <PdfDefectiveAtuadoresLojasButton key={Date.now()} />
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

      {/* Tabela de Atuadores com Defeito */}
      {atuadoresDefeito.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          Nenhum atuador com defeito foi encontrado no sistema.
        </Alert>
      ) : (
        <Card className="shadow">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Lista de Atuadores com Defeito ({atuadoresDefeito.length})
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
                {atuadoresDefeito.map((atuador, index) => (
                  <tr key={atuador.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong className="text-danger">{atuador.nome}</strong>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{atuador.tipo}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{atuador.lojaNome}</strong>
                        <br />
                        <small className="text-muted">
                          LUC: {atuador.lojaLUC} | {atuador.lojaLocalizacao}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="text-primary">
                        {atuador.equipamentoNome}
                      </span>
                    </td>
                    <td>
                      <span className="text-danger fw-bold">
                        {obterRazaoDefeito(atuador)}
                      </span>
                    </td>
                    <td>
                      {atuador.estado === AtuadorStatus.DEFEITO ? (
                        <span className="badge bg-danger">DEFEITO</span>
                      ) : atuador.existe === false ? (
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
              Resumo por Tipo de Atuador
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="row">
              {stats.tiposUnicos.map((tipo) => {
                const quantidade = atuadoresDefeito.filter(
                  (a) => a.tipo === tipo
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