"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

import { ComponentErrorBoundary } from "@/app/components/ErrorBoundary";
import { CmsTableSkeleton } from "@/app/components/Loading";
import CmsNavigationSubmenu from "@/app/components/navigation/CmsNavigationSubmenu";

import { Cm } from "../../../../types";

// Simple fetch hook for data fetching
function useFetchCm(id: string | null) {
    const [cm, setCm] = useState<Cm | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchCm = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/cmsApi/cms/${id}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch CM details: ${response.status}`);
                }

                const data = await response.json();
                setCm(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar detalhes da Casa de Máquinas";
                setError(errorMessage);
                console.error("Error fetching CM:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCm();
    }, [id]);

    return { cm, loading, error };
}

// Helper function to count items
function countItems(cm: Cm | null) {
    if (!cm) return { equipamentos: 0, atuadores: 0, sensores: 0 };

    const equipamentos = cm.equipamentos?.length || 0;

    // Count actuators from all equipment
    const atuadoresFromEquipments = cm.equipamentos?.reduce(
        (total, equip) => total + (equip.atuadores?.length || 0),
        0
    ) || 0;

    // Count sensors from all equipment
    const sensoresFromEquipments = cm.equipamentos?.reduce(
        (total, equip) => total + (equip.sensores?.length || 0),
        0
    ) || 0;

    return {
        equipamentos,
        atuadores: atuadoresFromEquipments,
        sensores: sensoresFromEquipments
    };
}

export default function CmDetalhesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cmId = searchParams?.get("id") || null;

    const { cm, loading, error } = useFetchCm(cmId);
    const { equipamentos, atuadores, sensores } = countItems(cm);

    // Add debug logging
    console.log('CM Data:', cm);

    // Add debug logging for counts
    console.log('Counts:', { equipamentos, atuadores, sensores });

    // If no ID is provided, redirect to the main cms page
    useEffect(() => {
        if (cmId === null) {
            router.push("/pages/cms");
        }
    }, [cmId, router]);

    if (loading) {
        return <CmsTableSkeleton />;
    }

    if (error) {
        return (
            <ComponentErrorBoundary componentName="CmDetalhes">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Erro ao carregar detalhes da Casa de Máquinas</h4>
                        <p>{error}</p>
                        <hr />
                        <Link href="/pages/cms" className="btn btn-primary">
                            Voltar para Casas de Máquinas
                        </Link>
                    </div>
                </div>
            </ComponentErrorBoundary>
        );
    }

    if (!cm) {
        return (
            <div className="container">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Casa de Máquinas não encontrada</h4>
                    <p>Não foi possível encontrar a Casa de Máquinas solicitada.</p>
                    <hr />
                    <Link href="/pages/cms" className="btn btn-primary">
                        Voltar para Casas de Máquinas
                    </Link>
                </div>
            </div>
        );
    }

    // Parse image paths if they exist for any defective equipment
    const defectiveEquipments = cm.equipamentos?.filter(equip => equip.status === "DEFEITO") || [];
    const equipmentWithImages = defectiveEquipments.filter(equip => equip.imagePaths);

    return (
        <ComponentErrorBoundary componentName="CmDetalhes">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h3 mb-0">
                            <i className="bi bi-building me-2"></i>
                            Detalhes da Casa de Máquinas: {cm.nome}
                        </h1>
                        <p className="text-muted mb-0">Localização: {cm.localizacao}</p>
                    </div>
                    <Link href="/pages/cms" className="btn btn-secondary">
                        <i className="bi bi-arrow-left me-1"></i>
                        Voltar
                    </Link>
                </div>
                <div className="mb-4">
                    <CmsNavigationSubmenu isCollapsed={false} />
                </div>

                <ToastContainer position="top-right" autoClose={2000} />

                {/* CM Summary Cards */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
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
                    <div className="col-md-4 mb-3">
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
                    <div className="col-md-4 mb-3">
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
                </div>

                {/* CM Details */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            Informações da Casa de Máquinas
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td><strong>Nome:</strong></td>
                                            <td>{cm.nome}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Localização:</strong></td>
                                            <td>{cm.localizacao || "N/A"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-6">
                                <table className="table table-borderless">
                                    <tbody>
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
                                                        src={`/api/serve-image?imagePath=${encodeURIComponent(imagePath)}&module=cms`}
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

                {/* Equipamentos Section */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bi bi-box-seam me-2"></i>
                            Equipamentos ({equipamentos})
                        </h5>
                    </div>
                    <div className="card-body">
                        {cm.equipamentos && cm.equipamentos.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Descrição</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cm.equipamentos.map((equipamento) => (
                                            <tr key={equipamento.id}>
                                                <td>{equipamento.nome}</td>
                                                <td>{equipamento.descricao || "N/A"}</td>
                                                <td>
                                                    <span className={`badge bg-${equipamento.status === "OPERACIONAL" ? "success" :
                                                        equipamento.status === "MANUTENCAO" ? "warning" :
                                                            equipamento.status === "DESATIVADO" ? "secondary" : "danger"
                                                        }`}>
                                                        {equipamento.status || "DESCONHECIDO"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="bi bi-box-seam fs-1 text-muted mb-2"></i>
                                <p className="mb-0">Nenhum equipamento cadastrado para esta Casa de Máquinas.</p>
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
                        {atuadores > 0 && cm.equipamentos ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Status</th>
                                            <th>Equipamento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cm.equipamentos.flatMap(equipamento =>
                                            equipamento.atuadores?.map(atuador => (
                                                <tr key={atuador.id}>
                                                    <td>{atuador.nome}</td>
                                                    <td>{atuador.tipo}</td>
                                                    <td>
                                                        <span className={`badge bg-${atuador.estado === "OPERACIONAL" ? "success" :
                                                            atuador.estado === "DEFEITO" ? "danger" :
                                                                atuador.estado === "MANUTENCAO" ? "warning" : "secondary"
                                                            }`}>
                                                            {atuador.estado || "DESCONHECIDO"}
                                                        </span>
                                                    </td>
                                                    <td>{equipamento.nome}</td>
                                                </tr>
                                            )) || []
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="bi bi-gear fs-1 text-muted mb-2"></i>
                                <p className="mb-0">Nenhum atuador cadastrado para esta Casa de Máquinas.</p>
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
                        {sensores > 0 && cm.equipamentos ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Status</th>
                                            <th>Equipamento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cm.equipamentos.flatMap(equipamento =>
                                            equipamento.sensores?.map(sensor => (
                                                <tr key={sensor.id}>
                                                    <td>{sensor.nome}</td>
                                                    <td>{sensor.tipo}</td>
                                                    <td>
                                                        <span className={`badge bg-${sensor.estado === "OPERACIONAL" ? "success" :
                                                            sensor.estado === "DEFEITO" ? "danger" :
                                                                sensor.estado === "MANUTENCAO" ? "warning" : "secondary"
                                                            }`}>
                                                            {sensor.estado || "DESCONHECIDO"}
                                                        </span>
                                                    </td>
                                                    <td>{equipamento.nome}</td>
                                                </tr>
                                            )) || []
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="bi bi-thermometer fs-1 text-muted mb-2"></i>
                                <p className="mb-0">Nenhum sensor cadastrado para esta Casa de Máquinas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ComponentErrorBoundary>
    );
}