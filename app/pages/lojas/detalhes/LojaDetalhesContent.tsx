"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

import { ComponentErrorBoundary } from "@/app/components/ErrorBoundary";
import { CmsTableSkeleton } from "@/app/components/Loading";
import LojaNavigationSubmenu from "@/app/components/navigation/LojaNavigationSubmenu";

import { Loja } from "../../../../types";

// Simple fetch hook for data fetching
function useFetchLoja(id: string | null) {
    const [loja, setLoja] = useState<Loja | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLoja = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/lojasApi/lojas/${id}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch store details: ${response.status}`);
            }

            const data = await response.json();
            setLoja(data.data || data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao carregar detalhes da loja";
            setError(errorMessage);
            console.error("Error fetching loja:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLoja();
    }, [fetchLoja]);

    return { loja, loading, error, refetch: fetchLoja };
}

// Helper function to count items
function countItems(loja: Loja | null) {
    if (!loja) return { equipamentos: 0, atuadores: 0, sensores: 0, fireDetectionEquipment: 0 };

    const equipamentos = loja.equipamentosLoja?.length || 0;
    const atuadores = loja.atuadores?.length || 0;
    const sensores = loja.sensores?.length || 0;
    const fireDetectionEquipment = loja.fireDetectionEquipment?.length || 0;

    return { equipamentos, atuadores, sensores, fireDetectionEquipment };
}

export default function LojaDetalhesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lojaId = searchParams?.get("id") || null;

    const { loja, loading, error, refetch } = useFetchLoja(lojaId);
    const { equipamentos, atuadores, sensores, fireDetectionEquipment } = countItems(loja);

    // If no ID is provided, redirect to the main lojas page
    useEffect(() => {
        if (lojaId === null) {
            router.push("/pages/lojas");
        }
    }, [lojaId, router]);

    // Refresh data when the component becomes visible again (e.g., when navigating back from edit)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refetch();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refetch]);

    if (loading) {
        return <CmsTableSkeleton />;
    }

    if (error) {
        return (
            <ComponentErrorBoundary componentName="LojaDetalhes">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Erro ao carregar detalhes da loja</h4>
                        <p>{error}</p>
                        <hr />
                        <Link href="/pages/lojas" className="btn btn-primary">
                            Voltar para Lojas
                        </Link>
                    </div>
                </div>
            </ComponentErrorBoundary>
        );
    }

    if (!loja) {
        return (
            <div className="container">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Loja não encontrada</h4>
                    <p>Não foi possível encontrar a loja solicitada.</p>
                    <hr />
                    <Link href="/pages/lojas" className="btn btn-primary">
                        Voltar para Lojas
                    </Link>
                </div>
            </div>
        );
    }

    // Parse image paths if they exist for any defective equipment
    const defectiveEquipments = loja.equipamentosLoja?.filter(equip => equip.status === "DEFEITO") || [];
    const equipmentWithImages = defectiveEquipments.filter(equip => equip.imagePaths);

    // Parse image paths if they exist for any defective sensors
    const defectiveSensores = loja.sensores?.filter(sensor => sensor.estado === "DEFEITO") || [];
    const sensoresWithImages = defectiveSensores.filter(sensor => sensor.imagePaths);

    // Parse image paths if they exist for any defective actuators
    const defectiveAtuadores = loja.atuadores?.filter(atuador => atuador.estado === "DEFEITO") || [];
    const atuadoresWithImages = defectiveAtuadores.filter(atuador => atuador.imagePaths);

    return (
        <ComponentErrorBoundary componentName="LojaDetalhes">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h3 mb-0">
                            <i className="bi bi-shop me-2"></i>
                            Detalhes da Loja: {loja.nome}
                        </h1>
                        <p className="text-muted mb-0">LUC: {loja.LUC}</p>
                    </div>
                    <Link href="/pages/lojas" className="btn btn-secondary">
                        <i className="bi bi-arrow-left me-1"></i>
                        Voltar
                    </Link>
                </div>

                <LojaNavigationSubmenu isCollapsed={false} />
                <ToastContainer position="top-right" autoClose={2000} />

                {/* Store Summary Cards */}
                <div className="row mb-4 mt-4">
                    <div className="col-md-3 mb-3">
                        <div className="card bg-primary text-white h-100">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="bi bi-box-seam me-2"></i>
                                    Equipamentos
                                </h5>
                                <p className="card-text display-4">{equipamentos}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card bg-success text-white h-100">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="bi bi-gear me-2"></i>
                                    Atuadores
                                </h5>
                                <p className="card-text display-4">{atuadores}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card bg-info text-white h-100">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="bi bi-thermometer me-2"></i>
                                    Sensores
                                </h5>
                                <p className="card-text display-4">{sensores}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card bg-warning text-dark h-100">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="bi bi-fire me-2"></i>
                                    Detecção de Incêndio
                                </h5>
                                <p className="card-text display-4">{fireDetectionEquipment}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Image */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="bi bi-image me-2"></i>
                            Imagem da Loja
                        </h5>
                    </div>
                    <div className="card-body text-center">
                        <div className="bg-light d-inline-block" style={{ width: '300px', height: '200px' }}>
                            <Image
                                src={`/api/serve-image?module=lojas&imagePath=loja-${loja.id}.jpg`}
                                alt={`Imagem da loja ${loja.nome}`}
                                width={300}
                                height={200}
                                className="object-fit-cover rounded"
                                onError={(e) => {
                                    // Fallback to default icon if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const icon = document.createElement('div');
                                        icon.className = 'd-flex align-items-center justify-content-center h-100';
                                        icon.innerHTML = '<i class="bi bi-shop text-muted" style="font-size: 4rem;"></i>';
                                        parent.appendChild(icon);
                                    }
                                }}
                            />
                        </div>
                        <p className="mt-2 text-muted">Imagem da loja</p>
                    </div>
                </div>

                {/* Store Details */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            Informações da Loja
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td><strong>Nome:</strong></td>
                                            <td>{loja.nome}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>LUC:</strong></td>
                                            <td>{loja.LUC}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>ID Kron:</strong></td>
                                            <td>{loja.idKron || "N/A"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-6">
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td><strong>Localização:</strong></td>
                                            <td>{loja.localizacao || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Smart:</strong></td>
                                            <td>{loja.smart || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total de Equipamentos:</strong></td>
                                            <td>{equipamentos}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total de Atuadores:</strong></td>
                                            <td>{atuadores}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total de Sensores:</strong></td>
                                            <td>{sensores}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total de Equipamentos de Detecção de Incêndio:</strong></td>
                                            <td>{fireDetectionEquipment}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Equipment Images for Defective Equipment */}
                {equipmentWithImages.length > 0 && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-images me-2"></i>
                                Imagens dos Equipamentos com Defeito
                            </h5>
                        </div>
                        <div className="card-body">
                            {equipmentWithImages.map((equip) => {
                                let imagePaths: string[] = [];
                                if (equip.imagePaths) {
                                    try {
                                        const parsed = JSON.parse(equip.imagePaths);
                                        if (Array.isArray(parsed)) {
                                            // Normalize path separators to forward slashes for URL compatibility
                                            imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
                                        }
                                    } catch (e) {
                                        console.error("Error parsing image paths:", e);
                                    }
                                }

                                return (
                                    <div key={equip.id} className="mb-4">
                                        <h6 className="mb-3">{equip.nome}</h6>
                                        <div className="row">
                                            {imagePaths.map((imagePath, index) => (
                                                <div key={index} className="col-md-4 mb-3">
                                                    <Image
                                                        src={`/api/serve-image?imagePath=${encodeURIComponent(imagePath)}&module=lojas`}
                                                        alt={`Defeito ${index + 1} - ${equip.nome}`}
                                                        className="img-fluid"
                                                        width={200}
                                                        height={200}
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                        unoptimized={true}
                                                        onError={() => {
                                                            console.error(`Failed to load image: ${imagePath}`);
                                                            // Don't manipulate the src directly to avoid infinite loops
                                                            // The Image component will handle fallback automatically
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actuator Images for Defective Actuators */}
                {atuadoresWithImages.length > 0 && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-images me-2"></i>
                                Imagens dos Atuadores com Defeito
                            </h5>
                        </div>
                        <div className="card-body">
                            {atuadoresWithImages.map((atuador) => {
                                let imagePaths: string[] = [];
                                if (atuador.imagePaths) {
                                    try {
                                        const parsed = JSON.parse(atuador.imagePaths);
                                        if (Array.isArray(parsed)) {
                                            // Normalize path separators to forward slashes for URL compatibility
                                            imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
                                        }
                                    } catch (e) {
                                        console.error("Error parsing actuator image paths:", e);
                                    }
                                }

                                return (
                                    <div key={atuador.id} className="mb-4">
                                        <h6 className="mb-3">{atuador.nome} ({atuador.tipo})</h6>
                                        <div className="row">
                                            {imagePaths.map((imagePath, index) => (
                                                <div key={index} className="col-md-4 mb-3">
                                                    <Image
                                                        src={`/api/serve-image?imagePath=${encodeURIComponent(imagePath)}&module=atuadores-loja`}
                                                        alt={`Defeito ${index + 1} - ${atuador.nome}`}
                                                        className="img-fluid"
                                                        width={200}
                                                        height={200}
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                        unoptimized={true}
                                                        onError={() => {
                                                            console.error(`Failed to load image: ${imagePath}`);
                                                            // Don't manipulate the src directly to avoid infinite loops
                                                            // The Image component will handle fallback automatically
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Sensor Images for Defective Sensors */}
                {sensoresWithImages.length > 0 && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-images me-2"></i>
                                Imagens dos Sensores com Defeito
                            </h5>
                        </div>
                        <div className="card-body">
                            {sensoresWithImages.map((sensor) => {
                                let imagePaths: string[] = [];
                                if (sensor.imagePaths) {
                                    try {
                                        const parsed = JSON.parse(sensor.imagePaths);
                                        if (Array.isArray(parsed)) {
                                            // Normalize path separators to forward slashes for URL compatibility
                                            imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
                                        }
                                    } catch (e) {
                                        console.error("Error parsing sensor image paths:", e);
                                    }
                                }

                                return (
                                    <div key={sensor.id} className="mb-4">
                                        <h6 className="mb-3">{sensor.nome} ({sensor.tipo})</h6>
                                        <div className="row">
                                            {imagePaths.map((imagePath, index) => (
                                                <div key={index} className="col-md-4 mb-3">
                                                    <Image
                                                        src={`/api/serve-image?imagePath=${encodeURIComponent(imagePath)}&module=sensores-loja`}
                                                        alt={`Defeito ${index + 1} - ${sensor.nome}`}
                                                        className="img-fluid"
                                                        width={200}
                                                        height={200}
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                        unoptimized={true}
                                                        onError={() => {
                                                            console.error(`Failed to load image: ${imagePath}`);
                                                            // Don't manipulate the src directly to avoid infinite loops
                                                            // The Image component will handle fallback automatically
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* All Defect Images Consolidated View */}
                {(equipmentWithImages.length > 0 || atuadoresWithImages.length > 0 || sensoresWithImages.length > 0) && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-images me-2"></i>
                                Todas as Imagens de Defeitos
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* Equipment Defect Images */}
                            {equipmentWithImages.map((equip) => {
                                let imagePaths: string[] = [];
                                if (equip.imagePaths) {
                                    try {
                                        const parsed = JSON.parse(equip.imagePaths);
                                        if (Array.isArray(parsed)) {
                                            // Normalize path separators to forward slashes for URL compatibility
                                            imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
                                        }
                                    } catch (e) {
                                        console.error("Error parsing image paths:", e);
                                    }
                                }

                                return (
                                    <div key={`equip-${equip.id}`} className="mb-4">
                                        <h6 className="mb-3">Equipamento: {equip.nome}</h6>
                                        <div className="row">
                                            {imagePaths.map((imagePath, index) => (
                                                <div key={`equip-img-${index}`} className="col-md-4 mb-3">
                                                    <Image
                                                        src={`/api/serve-image?imagePath=${encodeURIComponent(imagePath)}&module=lojas`}
                                                        alt={`Defeito ${index + 1} - ${equip.nome}`}
                                                        className="img-fluid"
                                                        width={200}
                                                        height={200}
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                        unoptimized={true}
                                                        onError={() => {
                                                            console.error(`Failed to load image: ${imagePath}`);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Actuator Defect Images */}
                            {atuadoresWithImages.map((atuador) => {
                                let imagePaths: string[] = [];
                                if (atuador.imagePaths) {
                                    try {
                                        const parsed = JSON.parse(atuador.imagePaths);
                                        if (Array.isArray(parsed)) {
                                            // Normalize path separators to forward slashes for URL compatibility
                                            imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
                                        }
                                    } catch (e) {
                                        console.error("Error parsing actuator image paths:", e);
                                    }
                                }

                                return (
                                    <div key={`atuador-${atuador.id}`} className="mb-4">
                                        <h6 className="mb-3">Atuador: {atuador.nome} ({atuador.tipo})</h6>
                                        <div className="row">
                                            {imagePaths.map((imagePath, index) => (
                                                <div key={`atuador-img-${index}`} className="col-md-4 mb-3">
                                                    <Image
                                                        src={`/api/serve-image?imagePath=${encodeURIComponent(imagePath)}&module=atuadores-loja`}
                                                        alt={`Defeito ${index + 1} - ${atuador.nome}`}
                                                        className="img-fluid"
                                                        width={200}
                                                        height={200}
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                        unoptimized={true}
                                                        onError={() => {
                                                            console.error(`Failed to load image: ${imagePath}`);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Sensor Defect Images */}
                            {sensoresWithImages.map((sensor) => {
                                let imagePaths: string[] = [];
                                if (sensor.imagePaths) {
                                    try {
                                        const parsed = JSON.parse(sensor.imagePaths);
                                        if (Array.isArray(parsed)) {
                                            // Normalize path separators to forward slashes for URL compatibility
                                            imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
                                        }
                                    } catch (e) {
                                        console.error("Error parsing sensor image paths:", e);
                                    }
                                }

                                return (
                                    <div key={`sensor-${sensor.id}`} className="mb-4">
                                        <h6 className="mb-3">Sensor: {sensor.nome} ({sensor.tipo})</h6>
                                        <div className="row">
                                            {imagePaths.map((imagePath, index) => (
                                                <div key={`sensor-img-${index}`} className="col-md-4 mb-3">
                                                    <Image
                                                        src={`/api/serve-image?imagePath=${encodeURIComponent(imagePath)}&module=sensores-loja`}
                                                        alt={`Defeito ${index + 1} - ${sensor.nome}`}
                                                        className="img-fluid"
                                                        width={200}
                                                        height={200}
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                        unoptimized={true}
                                                        onError={() => {
                                                            console.error(`Failed to load image: ${imagePath}`);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Equipamentos Section */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bi bi-box-seam me-2"></i>
                            Equipamentos ({equipamentos})
                        </h5>
                    </div>
                    <div className="card-body">
                        {loja.equipamentosLoja && loja.equipamentosLoja.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Descrição</th>
                                            <th>Status</th>
                                            <th>Observação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loja.equipamentosLoja.map((equipamento) => (
                                            <tr key={equipamento.id}>
                                                <td>{equipamento.nome}</td>
                                                <td>{equipamento.tipo || "N/A"}</td>
                                                <td>{equipamento.descricao || "N/A"}</td>
                                                <td>
                                                    <span className={`badge bg-${equipamento.status === "OPERACIONAL" ? "success" :
                                                        equipamento.status === "MANUTENCAO" ? "warning" :
                                                            equipamento.status === "DESATIVADO" ? "secondary" : "danger"
                                                        }`}>
                                                        {equipamento.status || "DESCONHECIDO"}
                                                    </span>
                                                </td>
                                                <td>{equipamento.descricaoDefeito || "N/A"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="bi bi-box-seam fs-1 text-muted mb-2"></i>
                                <p className="mb-0">Nenhum equipamento cadastrado para esta loja.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Atuadores Section */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bi bi-gear me-2"></i>
                            Atuadores ({atuadores})
                        </h5>
                    </div>
                    <div className="card-body">
                        {loja.atuadores && loja.atuadores.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Equipamento</th>
                                            <th>Existe</th>
                                            <th>Status</th>
                                            <th>Observação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loja.atuadores.map((atuador) => (
                                            <tr key={atuador.id}>
                                                <td>{atuador.nome}</td>
                                                <td>{atuador.tipo}</td>
                                                <td>
                                                    {atuador.equipamentoLojaId
                                                        ? loja.equipamentosLoja?.find(e => e.id === atuador.equipamentoLojaId)?.nome || "N/A"
                                                        : "N/A"}
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${atuador.existe ? "success" : "danger"}`}>
                                                        {atuador.existe ? "Sim" : "Não"}
                                                    </span>
                                                </td>
                                                {atuador.existe && (
                                                    <>
                                                        <td>
                                                            <span className={`badge bg-${atuador.estado === "OPERACIONAL" ? "success" :
                                                                atuador.estado === "DEFEITO" ? "danger" :
                                                                    atuador.estado === "MANUTENCAO" ? "warning" : "secondary"
                                                                }`}>
                                                                {atuador.estado || "DESCONHECIDO"}
                                                            </span>
                                                        </td>
                                                        <td>{atuador.descricaoDefeito || "N/A"}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="bi bi-gear fs-1 text-muted mb-2"></i>
                                <p className="mb-0">Nenhum atuador cadastrado para esta loja.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sensores Section */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bi bi-thermometer me-2"></i>
                            Sensores ({sensores})
                        </h5>
                    </div>
                    <div className="card-body">
                        {loja.sensores && loja.sensores.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Equipamento</th>
                                            <th>Existe</th>
                                            <th>Status</th>
                                            <th>Última Ativação</th>
                                            <th>Observação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loja.sensores.map((sensor) => (
                                            <tr key={sensor.id}>
                                                <td>{sensor.nome}</td>
                                                <td>{sensor.tipo}</td>
                                                <td>
                                                    {sensor.equipamentoLojaId
                                                        ? loja.equipamentosLoja?.find(e => e.id === sensor.equipamentoLojaId)?.nome || "N/A"
                                                        : "N/A"}
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${sensor.existe ? "success" : "danger"}`}>
                                                        {sensor.existe ? "Sim" : "Não"}
                                                    </span>
                                                </td>
                                                {sensor.existe && (
                                                    <>
                                                        <td>
                                                            <span className={`badge bg-${sensor.estado === "OPERACIONAL" ? "success" :
                                                                sensor.estado === "DEFEITO" ? "danger" :
                                                                    sensor.estado === "MANUTENCAO" ? "warning" : "secondary"
                                                                }`}>
                                                                {sensor.estado || "DESCONHECIDO"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {sensor.ultimaAtivacao
                                                                ? new Date(sensor.ultimaAtivacao).toLocaleDateString()
                                                                : "N/A"}
                                                        </td>
                                                        <td>{sensor.descricaoDefeito || "N/A"}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="bi bi-thermometer fs-1 text-muted mb-2"></i>
                                <p className="mb-0">Nenhum sensor cadastrado para esta loja.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fire Detection Equipment Section */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bi bi-fire me-2"></i>
                            Equipamentos de Detecção de Incêndio ({fireDetectionEquipment})
                        </h5>
                    </div>
                    <div className="card-body">
                        {loja.fireDetectionEquipment && loja.fireDetectionEquipment.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Modelo</th>
                                            <th>Existe</th>
                                            <th>Comissionada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loja.fireDetectionEquipment.map((equipment) => (
                                            <tr key={equipment.id}>
                                                <td>{equipment.nome}</td>
                                                <td>{equipment.tipo}</td>
                                                <td>{equipment.modelo || "N/A"}</td>
                                                <td>
                                                    <span className={`badge bg-${equipment.existe ? "success" : "danger"}`}>
                                                        {equipment.existe ? "Sim" : "Não"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${equipment.comissionada ? "success" : "warning"}`}>
                                                        {equipment.comissionada ? "Sim" : "Não"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="bi bi-fire fs-1 text-muted mb-2"></i>
                                <p className="mb-0">Nenhum equipamento de detecção de incêndio cadastrado para esta loja.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ComponentErrorBoundary>
    );
}