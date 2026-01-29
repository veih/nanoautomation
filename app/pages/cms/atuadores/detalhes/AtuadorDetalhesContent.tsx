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

import { Atuador } from "../../../../../types";

// Simple fetch hook for data fetching
function useFetchAtuador(id: string | null) {
    const [atuador, setAtuador] = useState<Atuador | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchAtuador = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/cmsApi/atuador/${id}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch actuator details: ${response.status}`);
                }

                const data = await response.json();
                setAtuador(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar detalhes do atuador";
                setError(errorMessage);
                console.error("Error fetching actuator:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAtuador();
    }, [id]);

    return { atuador, loading, error };
}

export default function AtuadorDetalhesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const atuadorId = searchParams?.get("id") || null;

    const { atuador, loading, error } = useFetchAtuador(atuadorId);

    // If no ID is provided, redirect to the main actuators page
    useEffect(() => {
        if (atuadorId === null) {
            router.push("/pages/cms/atuadores");
        }
    }, [atuadorId, router]);

    if (loading) {
        return <CmsTableSkeleton />;
    }

    if (error) {
        return (
            <ComponentErrorBoundary componentName="AtuadorDetalhes">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Erro ao carregar detalhes do atuador</h4>
                        <p>{error}</p>
                        <hr />
                        <Link href="/pages/cms/atuadores" className="btn btn-primary">
                            Voltar para Atuadores
                        </Link>
                    </div>
                </div>
            </ComponentErrorBoundary>
        );
    }

    if (!atuador) {
        return (
            <div className="container">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Atuador não encontrado</h4>
                    <p>Não foi possível encontrar o atuador solicitado.</p>
                    <hr />
                    <Link href="/pages/cms/atuadores" className="btn btn-primary">
                        Voltar para Atuadores
                    </Link>
                </div>
            </div>
        );
    }

    // Parse image paths if they exist for defective actuators
    let imagePaths: string[] = [];
    if (atuador.imagePaths) {
        try {
            const parsed = JSON.parse(atuador.imagePaths);
            if (Array.isArray(parsed)) {
                // Normalize path separators to forward slashes for URL compatibility
                imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
            }
        } catch (e) {
            console.error("Error parsing image paths:", e);
        }
    }

    return (
        <ComponentErrorBoundary componentName="AtuadorDetalhes">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h3 mb-0">
                            <i className="bi bi-gear me-2"></i>
                            Detalhes do Atuador: {atuador.nome}
                        </h1>
                        <p className="text-muted mb-0">Tipo: {atuador.tipo}</p>
                    </div>
                    <Link href="/pages/cms/atuadores" className="btn btn-secondary">
                        <i className="bi bi-arrow-left me-1"></i>
                        Voltar
                    </Link>
                </div>

                <CmsNavigationSubmenu isCollapsed={false} />
                <ToastContainer position="top-right" autoClose={2000} />

                {/* Atuador Details */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            Informações do Atuador
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td><strong>ID:</strong></td>
                                            <td>{atuador.id}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Nome:</strong></td>
                                            <td>{atuador.nome}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Tipo:</strong></td>
                                            <td>{atuador.tipo}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Status:</strong></td>
                                            <td>
                                                <span className={`badge bg-${atuador.estado === "OPERACIONAL" ? "success" :
                                                    atuador.estado === "DEFEITO" ? "danger" :
                                                        atuador.estado === "MANUTENCAO" ? "warning" : "secondary"
                                                    }`}>
                                                    {atuador.estado || "DESCONHECIDO"}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-6">
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td><strong>Equipamento:</strong></td>
                                            <td>
                                                {atuador.equipamento ? (
                                                    <Link href={`/pages/cms/detalhes?id=${atuador.equipamento.id}`}>
                                                        {atuador.equipamento.nome}
                                                    </Link>
                                                ) : "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Casa de Máquinas:</strong></td>
                                            <td>
                                                {atuador.equipamento?.cm ? (
                                                    <Link href={`/pages/cms/detalhes?id=${atuador.equipamento.cm.id}`}>
                                                        {atuador.equipamento.cm.nome}
                                                    </Link>
                                                ) : "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Descrição do Defeito:</strong></td>
                                            <td>{atuador.descricaoDefeito || "N/A"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images for defective actuators */}
                {atuador.estado === "DEFEITO" && imagePaths.length > 0 && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-images me-2"></i>
                                Imagens do Defeito
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {imagePaths.map((imagePath, index) => (
                                    <div key={index} className="col-md-4 mb-3">
                                        <Image
                                            src={`/api/cmsApi/atuador/serve-image?imagePath=${encodeURIComponent(imagePath)}`}
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
                    </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex justify-content-between">
                    <Link href={`/pages/cms/atuadores?id=${atuador.id}`} className="btn btn-primary">
                        <i className="bi bi-pencil me-1"></i>
                        Editar Atuador
                    </Link>
                </div>
            </div>
        </ComponentErrorBoundary>
    );
}