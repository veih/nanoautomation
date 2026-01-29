/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Spinner, Alert, Table, ListGroup } from "react-bootstrap";
import { useRouter } from "next/navigation";
import CmsNavigationSubmenuProps from "./../../../../components/navigation/CmsNavigationSubmenu";
// Importa o novo componente de botão de PDF para sensores (autocontido)
import PdfDefectiveSensoresButton from "../../../../components/PDFs/PdfDefectiveSensoresButton";

// NOVO: Enum para o status do Sensor, alinhado com o Prisma
enum SensorStatus {
  OPERACIONAL = "OPERACIONAL",
  DEFEITO = "DEFEITO",
  MANUTENCAO = "MANUTENCAO",
  DESCONHECIDO = "DESCONHECIDO",
}

// --- Interfaces (replicadas para garantir que esta página seja autocontida) ---
interface Atuador {
  id: string;
  nome: string;
  tipo: string;
  valorAtual: number;
  descricaoDefeito?: string;
  equipamentoId: string;
  equipamento?: Equipamento;
}

interface Sensor {
  id: string;
  nome: string;
  tipo?: string;
  // REMOVIDO: valorAtual: number;
  estado?: SensorStatus; // ATUALIZADO: Adicionado o campo estado para Sensor
  descricaoDefeito?: string; // Adicionado para consistência, se o backend o enviar
  equipamentoId: string;
  equipamento?: {
    // 'equipamento' pode ser opcional
    id: string;
    nome: string;
    cm?: {
      id: string;
      nome: string;
      localizacao: string;
    };
  };
}

interface Equipamento {
  id: string;
  nome: string;
  descricao?: string;
  cmId: string;
  atuadores: Atuador[];
  sensores: Sensor[];
  cm?: Cm;
}

interface Cm {
  id: string;
  nome: string;
  localizacao: string;
  equipamentos: Equipamento[];
}

export default function SensoresComDefeitoPage() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  // REMOVIDO: const [Cms, setCms] = useState<Cm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchSensores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assumindo que /api/cmsApi/sensores retorna todos os sensores com seus relacionamentos
      const res = await fetch("/api/cmsApi/sensores");
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Erro desconhecido ao buscar sensores." }));
        throw new Error(errorData.message || `Erro HTTP: ${res.status}`);
      }
      const data: Sensor[] = await res.json();
      // Processa os dados para garantir que 'estado' tenha um valor padrão
      const processedData = data.map((sensor) => ({
        ...sensor,
        estado: sensor.estado || SensorStatus.DESCONHECIDO,
      }));
      setSensores(processedData);
    } catch (err: any) {
      console.error("Erro ao buscar sensores:", err);
      setError(
        `Falha ao carregar sensores: ${
          err.message || "Erro de rede. Tente novamente mais tarde."
        }`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // REMOVIDO: fetchCms function as it's no longer needed

  useEffect(() => {
    fetchSensores();
    // REMOVIDO: fetchCms() from dependencies
  }, [fetchSensores]);

  // Filtra e ordena os sensores com defeito
  const sensoresDefeituosos = useMemo(() => {
    return sensores
      .filter((sensor) => sensor.estado === SensorStatus.DEFEITO) // ATUALIZADO: Condição de defeito para sensor baseada no 'estado'
      .sort((a, b) => {
        // Ordena por nome da CM, depois por nome do Equipamento, depois por nome do Sensor
        const cmNameA = a.equipamento?.cm?.nome || "ZZZ_N/A";
        const cmNameB = b.equipamento?.cm?.nome || "ZZZ_N/A";
        const cmCompare = cmNameA.localeCompare(cmNameB);
        if (cmCompare !== 0) return cmCompare;

        const eqNameA = a.equipamento?.nome || "ZZZ_N/A";
        const eqNameB = b.equipamento?.nome || "ZZZ_N/A";
        const eqCompare = eqNameA.localeCompare(eqNameB);
        if (eqCompare !== 0) return eqCompare;

        return a.nome.localeCompare(b.nome);
      });
  }, [sensores]);

  return (
    <div className="container py-4">
      <CmsNavigationSubmenuProps isCollapsed={false} />
      <h1 className="mb-4 mt-4 text-center">Sensores com Defeito</h1>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      <div className="mt-4 mb-4">
        {/* O botão de PDF para sensores com defeito agora busca seus próprios dados */}
        <PdfDefectiveSensoresButton />
      </div>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando Sensores...</span>
          </Spinner>
          <p className="mt-2 text-muted">
            Carregando sensores com defeito, por favor aguarde...
          </p>
        </div>
      ) : sensoresDefeituosos.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhum sensor com defeito encontrado.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead>
            {/* CORREÇÃO: Removendo espaços em branco entre <tr> e <th> para evitar erro de hidratação */}
            <tr><th>#</th><th>Sensores</th><th>Tipo</th><th>Status</th><th>Máquinas</th><th>Casa de Máquinas</th><th>Piso</th></tr>
          </thead>
          <tbody>
            {sensoresDefeituosos.map((sensor, index) => (
              // CORREÇÃO: Removendo espaços em branco entre <tr> e <td> para evitar erro de hidratação
              <tr key={sensor.id}><td>{index + 1}</td><td>{sensor.nome}</td><td>{sensor.tipo || "N/A"}</td><td>
                  {/* ATUALIZADO: Renderização do status com base no campo 'estado' */}
                  {(() => {
                    switch (sensor.estado) {
                      case SensorStatus.OPERACIONAL:
                        return <span className="text-success">Operacional</span>;
                      case SensorStatus.DEFEITO:
                        return <span className="text-danger fw-bold">DEFEITO</span>;
                      case SensorStatus.MANUTENCAO:
                        return <span className="text-warning">Manutenção</span>;
                      case SensorStatus.DESCONHECIDO:
                        return <span className="text-muted">Desconhecido</span>;
                      default:
                        return <span className="text-muted">N/A</span>;
                    }
                  })()}
                </td><td>{sensor.equipamento?.nome || "N/A"}</td><td>{sensor.equipamento?.cm?.nome || "N/A"}</td><td>{sensor.equipamento?.cm?.localizacao || "N/A"}</td></tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
