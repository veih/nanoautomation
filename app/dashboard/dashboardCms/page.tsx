"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Form,
  Alert,
  Modal,
  Button,
  Dropdown,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { 
  PieChart, 
  Pie, 
  Tooltip, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";

// Import types from the shared types file instead of defining locally
import {
  Cm,
  AtuadorStatus,
  SensorStatus,
} from "../../../types";

// Components
import PdfGeneratorButton from "../../components/PDFs/PdfGeneratorButton";
import CmsNavigationSubmenu from "../../components/navigation/CmsNavigationSubmenu";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";
import { CmsTableSkeleton } from "../../components/Loading";

// Local hooks to replace lib/hooks (removed due to infinite callback issues)
function useFetch<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      // Handle both standardized and legacy response formats
      if (
        typeof result === "object" &&
        result !== null &&
        "success" in result
      ) {
        if (!result.success) {
          throw new Error(result.error?.message || "API Error");
        }
        setData(result.data || null);
      } else {
        setData(result);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

function useForm<T>(
  initialValues: T,
  validate?: (values: T) => Record<string, string>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const setValue = (field: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
  };

  const handleSubmit = (onSubmit: (values: T) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const validationErrors = validate ? validate(values) : {};
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        await onSubmit(values);
      }
    };
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    setValue,
    handleSubmit,
    reset,
  };
}

function useAsyncOperation() {
  const [loading, setLoading] = React.useState(false);

  const execute = React.useCallback(
    async (operation: () => Promise<unknown>) => {
      setLoading(true);
      try {
        const result = await operation();
        return result;
      } catch (error: unknown) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    execute,
    loading,
  };
}

// Utilities
import { equipamentoSchema } from "../../../lib/validations";

// Enums and types are now imported from "../../../types"

export default function CasaDeMaquinas() {
  const router = useRouter();

  // Using custom hooks for data fetching and state management
  const {
    data: cms,
    loading,
    error,
    refetch,
  } = useFetch<Cm[]>("/api/cmsApi/cms");
  const { execute: executeOperation, loading: operationLoading } =
    useAsyncOperation();

  // Modal states
  const {
    isOpen: showEquipamentoModal,
    close: closeEquipamentoModal,
  } = useModal();

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showGraphs, setShowGraphs] = useState(false);
  const [editEquipamentoId, setEditEquipamentoId] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<'name' | 'location' | 'equipments' | 'actuators' | 'sensors'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Form management for equipment editing
  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm({ nome: "" }, (values) => {
    const result = equipamentoSchema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });
    return errors;
  });

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        refetch();
        setLastUpdated(new Date());
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refetch]);

  // Inject custom table styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .rounded-table {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .sticky-header th {
        position: sticky;
        top: 0;
        z-index: 10;
        backdrop-filter: blur(10px);
      }
      
      .sortable-header {
        transition: all 0.2s ease;
        user-select: none;
        cursor: pointer;
      }
      
      .sortable-header:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-1px);
      }
      
      .table-row-hover {
        transition: all 0.2s ease;
      }
      
      .table-row-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        z-index: 1;
        position: relative;
      }
      
      .btn-icon-only {
        width: 36px;
        height: 36px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .btn-icon-only i {
        font-size: 1.1rem;
      }
      
      .table-group-divider > tr:not(:last-child) > td {
        border-bottom: 1px solid rgba(0,0,0,0.05);
      }
      
      @media (max-width: 768px) {
        .table-responsive {
          font-size: 0.85rem;
        }
        
        .btn-icon-only {
          width: 32px;
          height: 32px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Process and filter CMS data
  const cmsProcessados = useMemo(() => {
    if (!cms || !Array.isArray(cms)) return [];

    // Process the data to ensure proper structure and type compatibility
    const processedCms: Cm[] = cms.map((cm) => {
      // Ensure cm has the correct structure
      return {
        id: cm.id,
        nome: cm.nome,
        localizacao: cm.localizacao,
        equipamentos: (cm.equipamentos || []).map((eq) => {
          // Ensure equipamento has the correct structure
          return {
            id: eq.id,
            nome: eq.nome,
            descricao: eq.descricao,
            cmId: eq.cmId,
            status: eq.status,
            // Avoid circular references by not including the nested cm property
            cm: undefined,
            atuadores: (eq.atuadores || []).map((atuador) => {
              // Ensure atuador has the correct structure with required estado
              return {
                id: atuador.id,
                nome: atuador.nome,
                tipo: atuador.tipo,
                equipamentoId: atuador.equipamentoId,
                // Avoid circular references by not including the nested equipamento property
                equipamento: undefined,
                valorAtual: atuador.valorAtual,
                descricaoDefeito: atuador.descricaoDefeito,
                // Ensure estado is never undefined since the imported type requires it
                estado: atuador.estado || AtuadorStatus.DESCONHECIDO
              };
            }),
            sensores: (eq.sensores || []).map((sensor) => {
              // Ensure sensor has the correct structure
              return {
                id: sensor.id,
                nome: sensor.nome,
                tipo: sensor.tipo || "", // Ensure tipo is never undefined
                equipamentoId: sensor.equipamentoId,
                // Avoid circular references by not including the nested equipamento property
                equipamento: undefined,
                valorAtual: sensor.valorAtual,
                descricaoDefeito: sensor.descricaoDefeito,
                estado: sensor.estado || SensorStatus.DESCONHECIDO
              };
            })
          };
        })
      };
    });

    let filteredCms = processedCms;

    // Filter by search text (CM name or location)
    const lowerCaseSearchText = searchText.toLowerCase();
    if (lowerCaseSearchText) {
      filteredCms = filteredCms.filter(
        (cm) =>
          cm.nome.toLowerCase().includes(lowerCaseSearchText) ||
          cm.localizacao.toLowerCase().includes(lowerCaseSearchText)
      );
    }

    // Sort by selected criteria
    return [...filteredCms]
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.nome.localeCompare(b.nome);
            break;
          case 'location':
            comparison = a.localizacao.localeCompare(b.localizacao);
            break;
          case 'equipments':
            comparison = (a.equipamentos?.length || 0) - (b.equipamentos?.length || 0);
            break;
          case 'actuators':
            const atuadoresA = a.equipamentos?.reduce((acc, eq) => acc + (eq.atuadores?.length || 0), 0) || 0;
            const atuadoresB = b.equipamentos?.reduce((acc, eq) => acc + (eq.atuadores?.length || 0), 0) || 0;
            comparison = atuadoresA - atuadoresB;
            break;
          case 'sensors':
            const sensoresA = a.equipamentos?.reduce((acc, eq) => acc + (eq.sensores?.length || 0), 0) || 0;
            const sensoresB = b.equipamentos?.reduce((acc, eq) => acc + (eq.sensores?.length || 0), 0) || 0;
            comparison = sensoresA - sensoresB;
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      })
      .map((cm) => ({
        ...cm,
        equipamentos: [...(cm.equipamentos || [])]
          .sort((eqA, eqB) => eqA.nome.localeCompare(eqB.nome))
          .map((eq) => ({
            ...eq,
            atuadores: [...(eq.atuadores || [])].sort((atuA, atuB) =>
              atuA.nome.localeCompare(atuB.nome)
            ),
            sensores: [...(eq.sensores || [])].sort((senA, senB) =>
              senA.nome.localeCompare(senB.nome)
            ),
          })),
      }));
  }, [cms, searchText, sortBy, sortOrder]);

  // Calculate advanced metrics using useMemo for performance
  const totals = useMemo(() => {
    const totalEquipamentos = cmsProcessados.reduce(
      (acc, cm) => acc + cm.equipamentos.length,
      0
    );
    const totalAtuadores = cmsProcessados.reduce(
      (acc, cm) =>
        acc +
        cm.equipamentos.reduce((a, eq) => a + (eq.atuadores?.length || 0), 0),
      0
    );
    const totalSensores = cmsProcessados.reduce(
      (acc, cm) =>
        acc +
        cm.equipamentos.reduce((a, eq) => a + (eq.sensores?.length || 0), 0),
      0
    );
    
    // Calculate health metrics
    const operationalAtuadores = cmsProcessados.flatMap((cm) =>
      cm.equipamentos.flatMap(
        (eq) => eq.atuadores?.filter((a) => a.estado === AtuadorStatus.OPERACIONAL) || []
      )
    ).length;
    
    const operationalSensores = cmsProcessados.flatMap((cm) =>
      cm.equipamentos.flatMap(
        (eq) => eq.sensores?.filter((s) => s.estado === SensorStatus.OPERACIONAL) || []
      )
    ).length;
    
    const healthScore = totalAtuadores + totalSensores > 0 
      ? Math.round(((operationalAtuadores + operationalSensores) / (totalAtuadores + totalSensores)) * 100)
      : 100;

    const atuadoresComDefeito = cmsProcessados.flatMap((cm) =>
      cm.equipamentos.flatMap(
        (eq) =>
          eq.atuadores?.filter(
            (atuador) =>
              atuador.estado === AtuadorStatus.DEFEITO ||
              (atuador.descricaoDefeito &&
                atuador.descricaoDefeito.trim() !== "")
          ) || []
      )
    );

    const sensoresComDefeito = cmsProcessados.flatMap((cm) =>
      cm.equipamentos.flatMap(
        (eq) =>
          eq.sensores?.filter(
            (sensor) =>
              sensor.estado === SensorStatus.DEFEITO ||
              (sensor.descricaoDefeito && sensor.descricaoDefeito.trim() !== "")
          ) || []
      )
    );

    return {
      totalEquipamentos,
      totalAtuadores,
      totalSensores,
      atuadoresComDefeito,
      sensoresComDefeito,
      operationalAtuadores,
      operationalSensores,
      healthScore,
    };
  }, [cmsProcessados]);

  // Enhanced chart data with health metrics
  const enhancedChartData = useMemo(() => {
    const allAtuadores = cmsProcessados.flatMap((cm) =>
      cm.equipamentos.flatMap((eq) => eq.atuadores)
    );
    const allSensores = cmsProcessados.flatMap((cm) =>
      cm.equipamentos.flatMap((eq) => eq.sensores)
    );

    // Status distribution
    const atuadoresStatusData = [
      {
        name: "Operacional",
        value: allAtuadores.filter(
          (a) => a.estado === AtuadorStatus.OPERACIONAL
        ).length,
        color: "#28a745",
      },
      {
        name: "Defeito",
        value: allAtuadores.filter((a) => a.estado === AtuadorStatus.DEFEITO)
          .length,
        color: "#dc3545",
      },
      {
        name: "Manutenção",
        value: allAtuadores.filter((a) => a.estado === AtuadorStatus.MANUTENCAO)
          .length,
        color: "#ffc107",
      },
      {
        name: "Desconhecido",
        value: allAtuadores.filter(
          (a) => a.estado === AtuadorStatus.DESCONHECIDO
        ).length,
        color: "#6c757d",
      },
    ].filter((d) => d.value > 0);

    const sensoresStatusData = [
      {
        name: "Operacional",
        value: allSensores.filter((s) => s.estado === SensorStatus.OPERACIONAL)
          .length,
        color: "#28a745",
      },
      {
        name: "Defeito",
        value: allSensores.filter((s) => s.estado === SensorStatus.DEFEITO)
          .length,
        color: "#dc3545",
      },
      {
        name: "Manutenção",
        value: allSensores.filter((s) => s.estado === SensorStatus.MANUTENCAO)
          .length,
        color: "#ffc107",
      },
      {
        name: "Desconhecido",
        value: allSensores.filter((s) => s.estado === SensorStatus.DESCONHECIDO)
          .length,
        color: "#6c757d",
      },
    ].filter((d) => d.value > 0);

    // Health trend data (simulated for demonstration)
    const healthTrendData = [
      { day: 'Seg', health: 85 },
      { day: 'Ter', health: 87 },
      { day: 'Qua', health: 82 },
      { day: 'Qui', health: 89 },
      { day: 'Sex', health: totals.healthScore },
    ];

    return { 
      atuadoresStatusData, 
      sensoresStatusData,
      healthTrendData
    };
  }, [cmsProcessados, totals.healthScore]);



  const fecharModalEquipamento = useCallback(() => {
    setEditEquipamentoId(null);
    resetForm();
    closeEquipamentoModal();
  }, [resetForm, closeEquipamentoModal]);

  // Form submission
  const onSubmit = handleSubmit(async (formData) => {
    if (!editEquipamentoId) return;

    await executeOperation(
      async () => {
        const res = await fetch(`/api/cmsApi/maquinas/${editEquipamentoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: formData.nome }),
        });

        if (!res.ok) {
          const error = await res
            .json()
            .catch(() => ({ message: res.statusText }));
          throw new Error(error.message || "Erro ao salvar máquina");
        }

        await refetch();
        fecharModalEquipamento();
        return res.json();
      }
    );
  });

  const handleGerenciarDetalhesEquipamento = useCallback(() => {
    if (editEquipamentoId) {
      fecharModalEquipamento();
      router.push(`/cms/maquinas`);
    }
  }, [editEquipamentoId, fecharModalEquipamento, router]);

  // Custom tooltip and label rendering functions
  const renderCustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
          <p className="label fw-bold">{`${data.name}`}</p>
          <p className="desc mb-0">{`Quantidade: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (props: { name?: string; value?: number; }) => {
    const { name, value } = props;
    if (value === undefined || name === undefined) return null;
    return `${name}: ${value}`;
  };



  // Add this new function for handling view details
  const handleViewDetails = useCallback((cm: Cm) => {
    router.push(`/pages/cms/detalhes?id=${cm.id}`);
  }, [router]);

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Dashboard CMS">
      <div className="container py-1">

        <CmsNavigationSubmenu isCollapsed={false} />

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4 flex-wrap gap-2">
          <h1 className="text-primary mb-0">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard Geral de Monitoramento
          </h1>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center">
              <Form.Check 
                type="switch"
                id="auto-refresh"
                label="Auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="me-3"
              />
              {autoRefresh && (
                <small className="text-muted">
                  Última atualização: {lastUpdated.toLocaleTimeString()}
                </small>
              )}
            </div>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={refetch}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Atualizar
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Quick Stats Summary */}
        <Row className="mb-4 g-3">
          <Col xs={12}>
            <Card className="border-0 bg-light">
              <Card.Body>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-circle-fill text-danger me-2" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="fw-bold text-danger">Problemas Críticos</div>
                      <div className="small">
                        {totals.atuadoresComDefeito.length + totals.sensoresComDefeito.length} dispositivos com defeito
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="fw-bold text-success">Operacionais</div>
                      <div className="small">
                        {totals.operationalAtuadores + totals.operationalSensores} dispositivos funcionando
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <i className="bi bi-speedometer2 text-info me-2" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="fw-bold text-info">Eficiência</div>
                      <div className="small">
                        {totals.healthScore}% do sistema operacional
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search Filter */}
        <Row className="mb-4 g-3 justify-content-center">
          <Col md={6}>
            <Form.Group controlId="searchCmOrLocation">
              <Form.Control
                className="text-primary search-input"
                type="text"
                placeholder="Digite o nome da CM ou Piso..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Health Score Card */}
        <Row className="mb-4 g-3">
          {/* <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm bg-gradient-primary text-white">
              <Card.Body className="text-center py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <i className="bi bi-heart-pulse" style={{ fontSize: "2.5rem" }}></i>
                  </div>
                  <Badge bg={totals.healthScore >= 90 ? 'success' : totals.healthScore >= 70 ? 'warning' : 'danger'} className="fs-6">
                    {totals.healthScore >= 90 ? 'Excelente' : totals.healthScore >= 70 ? 'Bom' : 'Crítico'}
                  </Badge>
                </div>
                <Card.Title className="h5 mb-3">Saúde do Sistema</Card.Title>
                <div className="mb-3">
                  <ProgressBar 
                    now={totals.healthScore} 
                    variant={totals.healthScore >= 90 ? 'success' : totals.healthScore >= 70 ? 'warning' : 'danger'}
                    style={{ height: '10px' }}
                  />
                </div>
                <div className="fs-2 fw-bold">{totals.healthScore}%</div>
                <small>Operacional: {totals.operationalAtuadores + totals.operationalSensores}/{totals.totalAtuadores + totals.totalSensores}</small>
              </Card.Body>
            </Card>
          </Col> */}
          
          {/* Summary Cards */}
          <Col xs={6} sm={4} md={2}>
            <Card
              bg="primary"
              text="white"
              className="mb-3 shadow-sm cursor-pointer h-100"
              onClick={() => router.push("/pages/cms")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center d-flex flex-column justify-content-center">
                <i
                  className="bi bi-building"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">
                  Casas de Máquinas
                </Card.Title>
                <Card.Text className="fs-4 fw-bold mb-0">
                  {cmsProcessados.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={2}>
            <Card
              bg="success"
              text="white"
              className="mb-3 shadow-sm cursor-pointer h-100"
              onClick={() => router.push("/pages/cms/maquinas")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center d-flex flex-column justify-content-center">
                <i className="bi bi-gear" style={{ fontSize: "2rem" }}></i>
                <Card.Title className="h6 mt-2">Máquinas</Card.Title>
                <Card.Text className="fs-4 fw-bold mb-0">
                  {totals.totalEquipamentos}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={2}>
            <Card
              bg="info"
              text="white"
              className="mb-3 shadow-sm cursor-pointer h-100"
              onClick={() => router.push("/pages/cms/atuadores")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center d-flex flex-column justify-content-center">
                <i
                  className="bi bi-lightning"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">Atuadores</Card.Title>
                <Card.Text className="fs-4 fw-bold mb-0">
                  {totals.totalAtuadores}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={2}>
            <Card
              bg="warning"
              text="dark"
              className="mb-3 shadow-sm cursor-pointer h-100"
              onClick={() => router.push("/pages/cms/sensores")}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center d-flex flex-column justify-content-center">
                <i
                  className="bi bi-activity"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">Sensores</Card.Title>
                <Card.Text className="fs-4 fw-bold mb-0">
                  {totals.totalSensores}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={2}>
            <Card
              bg="danger"
              text="white"
              className="mb-3 shadow-sm cursor-pointer h-100"
              onClick={() =>
                router.push("/pages/cms/atuadores/atuadores-defeito")
              }
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center d-flex flex-column justify-content-center">
                <i
                  className="bi bi-exclamation-triangle"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">
                  Atuadores C/ Defeito
                </Card.Title>
                <Card.Text className="fs-4 fw-bold mb-0">
                  {totals.atuadoresComDefeito.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} sm={4} md={2}>
            <Card
              bg="danger"
              text="white"
              className="mb-3 shadow-sm cursor-pointer h-100"
              onClick={() =>
                router.push("/pages/cms/sensores/sensores-defeito")
              }
              style={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Card.Body className="text-center d-flex flex-column justify-content-center">
                <i
                  className="bi bi-exclamation-triangle"
                  style={{ fontSize: "2rem" }}
                ></i>
                <Card.Title className="h6 mt-2">
                  Sensores C/ Defeito
                </Card.Title>
                <Card.Text className="fs-4 fw-bold mb-0">
                  {totals.sensoresComDefeito.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Advanced Controls */}
        <Row className="mb-4 g-3 align-items-center">
          <Col md={6}>
            <div className="d-flex justify-content-center">
              <Button
                variant="outline-secondary"
                onClick={() => setShowGraphs(!showGraphs)}
                className="btn-enhanced"
              >
                <i
                  className={`bi ${showGraphs ? "bi-eye-slash" : "bi-eye"
                    } me-2`}
                ></i>
                {showGraphs ? "Esconder Gráficos" : "Mostrar Gráficos"}
              </Button>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-end gap-2">
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" size="sm">
                  Ordenar por: {sortBy === 'name' ? 'Nome' : 
                               sortBy === 'location' ? 'Localização' : 
                               sortBy === 'equipments' ? 'Máquinas' : 
                               sortBy === 'actuators' ? 'Atuadores' : 'Sensores'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSortBy('name')}>Nome</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('location')}>Localização</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('equipments')}>Máquinas</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('actuators')}>Atuadores</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('sensors')}>Sensores</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'}-alt`}></i>
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Enhanced Charts Section */}
        {showGraphs && (
          <ComponentErrorBoundary componentName="Gráficos de Status">
            <Row className="mb-4 g-3">
              <Col xs={12}>
                <h4 className="text-secondary mt-4 mb-3">
                  <i className="bi bi-bar-chart me-2"></i>
                  Análise Avançada de Desempenho
                </h4>
              </Col>
              
              {/* Health Trend Chart */}
              <Col xs={12}>
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-success text-white">
                    <h5 className="mb-0 text-center">
                      <i className="bi bi-graph-up me-2"></i>
                      Tendência de Saúde do Sistema
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={enhancedChartData.healthTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Saúde']} 
                          labelFormatter={(label) => `Dia: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="health" name="Saúde (%)" fill="#28a745" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>

              {/* Combined Status Overview */}
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0 text-center">
                      <i className="bi bi-lightning me-2"></i>
                      Distribuição de Status - Atuadores
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {totals.totalAtuadores > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={enhancedChartData.atuadoresStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            label={renderLabel}
                            labelLine={false}
                          >
                            {enhancedChartData.atuadoresStatusData.map(
                              (entry: { color: string }, index: number) => (
                                <Cell
                                  key={`cell-atuador-${index}`}
                                  fill={entry.color}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip content={renderCustomTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-secondary py-5">
                        <i
                          className="bi bi-info-circle"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <h5 className="mt-3 mb-0">
                          Nenhum atuador encontrado.
                        </h5>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Sensors Status Chart */}
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Header className="bg-warning text-dark">
                    <h5 className="mb-0 text-center">
                      <i className="bi bi-activity me-2"></i>
                      Distribuição de Status - Sensores
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {totals.totalSensores > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={enhancedChartData.sensoresStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            label={renderLabel}
                            labelLine={false}
                          >
                            {enhancedChartData.sensoresStatusData.map(
                              (entry: { color: string }, index: number) => (
                                <Cell
                                  key={`cell-sensor-${index}`}
                                  fill={entry.color}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip content={renderCustomTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-secondary py-5">
                        <i
                          className="bi bi-info-circle"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <h5 className="mt-3 mb-0">
                          Nenhum sensor encontrado.
                        </h5>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </ComponentErrorBoundary>
        )}

        {/* Enhanced CMS Details Table */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h4 className="text-secondary mb-0">
            <i className="bi bi-table me-2"></i>
            Resumo Detalhado por Casa de Máquinas
          </h4>
          <div className="d-flex gap-2">
            <PdfGeneratorButton cmsData={cmsProcessados} />
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => {
                // Export to CSV functionality could be added here
                console.log('Export CSV clicked');
              }}
            >
              <i className="bi bi-file-earmark-spreadsheet me-1"></i>
              Exportar CSV
            </Button>
          </div>
        </div>

        {cmsProcessados.length === 0 ? (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            Nenhuma Casa de Máquinas encontrada com os filtros aplicados.
          </Alert>
        ) : (
          <ComponentErrorBoundary componentName="Tabela de CMS">
            <div className="table-responsive">
              <Table hover className="shadow-sm rounded-table">
                <thead className="bg-gradient-primary text-white sticky-header">
                  <tr>
                    <th 
                      className="cursor-pointer sortable-header"
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>
                          <i className="bi bi-building me-2"></i>
                          Casa de Máquinas
                        </span>
                        {sortBy === 'name' && (
                          <i className={`bi ms-2 ${sortOrder === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'}`}></i>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer sortable-header"
                      onClick={() => {
                        setSortBy('location');
                        setSortOrder(sortBy === 'location' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>
                          <i className="bi bi-geo-alt me-2"></i>
                          Piso
                        </span>
                        {sortBy === 'location' && (
                          <i className={`bi ms-2 ${sortOrder === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'}`}></i>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer sortable-header text-center"
                      onClick={() => {
                        setSortBy('equipments');
                        setSortOrder(sortBy === 'equipments' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>
                          <i className="bi bi-gear me-2"></i>
                          Máquinas
                        </span>
                        {sortBy === 'equipments' && (
                          <i className={`bi ms-2 ${sortOrder === 'asc' ? 'bi-sort-numeric-down' : 'bi-sort-numeric-up'}`}></i>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer sortable-header text-center"
                      onClick={() => {
                        setSortBy('actuators');
                        setSortOrder(sortBy === 'actuators' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>
                          <i className="bi bi-lightning me-2"></i>
                          Atuadores
                        </span>
                        {sortBy === 'actuators' && (
                          <i className={`bi ms-2 ${sortOrder === 'asc' ? 'bi-sort-numeric-down' : 'bi-sort-numeric-up'}`}></i>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer sortable-header text-center"
                      onClick={() => {
                        setSortBy('sensors');
                        setSortOrder(sortBy === 'sensors' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>
                          <i className="bi bi-activity me-2"></i>
                          Sensores
                        </span>
                        {sortBy === 'sensors' && (
                          <i className={`bi ms-2 ${sortOrder === 'asc' ? 'bi-sort-numeric-down' : 'bi-sort-numeric-up'}`}></i>
                        )}
                      </div>
                    </th>
                    <th className="text-center">
                      <i className="bi bi-list-ul me-2"></i>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="table-group-divider">
                  {cmsProcessados.map((cm, index) => {
                    const atuadoresTotalCm = cm.equipamentos.reduce(
                      (acc, eq) => acc + (eq.atuadores?.length || 0),
                      0
                    );
                    const sensoresTotalCm = cm.equipamentos.reduce(
                      (acc, eq) => acc + (eq.sensores?.length || 0),
                      0
                    );
                    
                    // Calculate health percentage for this CM
                    const totalDevices = atuadoresTotalCm + sensoresTotalCm;
                    const operationalAtuadores = cm.equipamentos.flatMap(eq => 
                      eq.atuadores?.filter(a => a.estado === AtuadorStatus.OPERACIONAL) || []
                    ).length;
                    const operationalSensores = cm.equipamentos.flatMap(eq => 
                      eq.sensores?.filter(s => s.estado === SensorStatus.OPERACIONAL) || []
                    ).length;
                    const healthPercentage = totalDevices > 0 
                      ? Math.round(((operationalAtuadores + operationalSensores) / totalDevices) * 100)
                      : 100;
                    
                    return (
                      <tr 
                        key={cm.id} 
                        className={`table-row-hover ${index % 2 === 0 ? 'table-light' : ''}`}
                      >
                        <td className="fw-bold text-primary">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-building-fill me-2 text-primary"></i>
                            {cm.nome}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary">
                            <i className="bi bi-geo-alt me-1"></i>
                            {cm.localizacao}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span className="badge bg-success fs-6 px-3 py-2">
                              <i className="bi bi-gear me-1"></i>
                              {cm.equipamentos.length}
                            </span>
                            <small className="text-muted mt-1">Máquinas</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span className="badge bg-info fs-6 px-3 py-2">
                              <i className="bi bi-lightning me-1"></i>
                              {atuadoresTotalCm}
                            </span>
                            <small className="text-muted mt-1">Atuadores</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                              <i className="bi bi-activity me-1"></i>
                              {sensoresTotalCm}
                            </span>
                            <small className="text-muted mt-1">Sensores</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column gap-2 align-items-center">
                            <div className="d-flex gap-2 justify-content-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetails(cm)}
                                title="Ver detalhes desta Casa de Máquinas"
                                className="btn-icon-only"
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => router.push(`/pages/cms/maquinas?cmId=${cm.id}`)}
                                title="Gerenciar máquinas"
                                className="btn-icon-only"
                              >
                                <i className="bi bi-gear"></i>
                              </Button>
                            </div>
                            <div className="mt-2">
                              <div className="d-flex align-items-center justify-content-center">
                                <span className={`badge ${healthPercentage >= 90 ? 'bg-success' : healthPercentage >= 70 ? 'bg-warning text-dark' : 'bg-danger'} fs-7`}>
                                  <i className={`bi ${healthPercentage >= 90 ? 'bi-heart-fill' : healthPercentage >= 70 ? 'bi-heart-half' : 'bi-heartbreak'}`}></i>
                                  {healthPercentage}%
                                </span>
                              </div>
                              <small className="text-muted">Saúde</small>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </ComponentErrorBoundary>
        )}

        {/* Equipment Edit Modal */}
        <ComponentErrorBoundary componentName="Modal de Equipamento">
          <Modal
            show={showEquipamentoModal}
            onHide={fecharModalEquipamento}
            centered
          >
            <Modal.Header closeButton className="bg-light">
              <Modal.Title>
                <i className="bi bi-gear me-2"></i>
                Editar Equipamento
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit} className="form-enhanced">
              <Modal.Body>
                {error && (
                  <Alert variant="danger" className="mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form.Group
                  className="mb-3"
                  controlId="editEquipamentoNome"
                >
                  <Form.Label>
                    Nome do Equipamento{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formValues.nome}
                    onChange={(e) => setValue("nome", e.target.value)}
                    isInvalid={!!formErrors.nome}
                    placeholder="Nome do equipamento"
                    required
                  />
                  {formErrors.nome && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.nome}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Alert variant="info" className="mt-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Para gerenciar atuadores e sensores específicos deste
                  equipamento, clique no botão Gerenciar Detalhes abaixo.
                </Alert>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={fecharModalEquipamento}
                  disabled={operationLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="info"
                  onClick={handleGerenciarDetalhesEquipamento}
                  className="me-auto"
                  disabled={operationLoading}
                >
                  <i className="bi bi-gear me-2"></i>
                  Gerenciar Atuadores/Sensores
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={operationLoading}
                  className="btn-enhanced"
                >
                  {operationLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check me-2"></i>
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </ComponentErrorBoundary>
      </div>
    </ComponentErrorBoundary>
  );
}
