"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

import { ComponentErrorBoundary } from "../../../../components/ErrorBoundary";
import { CmsTableSkeleton } from "../../../../components/Loading";

import { Sensor, SensorStatus } from "../../../../../types";

// Simple fetch hook for data fetching
function useFetchSensor(id: string | null) {
    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchSensor = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/cmsApi/sensores/${id}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch sensor details: ${response.status}`);
                }

                const data = await response.json();
                setSensor(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar detalhes do sensor";
                setError(errorMessage);
                console.error("Error fetching sensor:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSensor();
    }, [id]);

    return { sensor, loading, error };
}

export default function SensorDetalhesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sensorId = searchParams?.get("id") || null;

    const { sensor, loading, error } = useFetchSensor(sensorId);

    // If no ID is provided, redirect to the main sensors page
    useEffect(() => {
        if (sensorId === null) {
            router.push("/pages/cms/sensores");
        }
    }, [sensorId, router]);

    // Parse image paths if they exist for defective sensors
    let imagePaths: string[] = [];
    if (sensor && sensor.imagePaths) {
        try {
            const parsed = JSON.parse(sensor.imagePaths);
            if (Array.isArray(parsed)) {
                // Normalize path separators to forward slashes for URL compatibility
                imagePaths = parsed.map(path => path.replace(/\\/g, '/'));
            }
        } catch (e) {
            console.error("Error parsing image paths:", e);
        }
    }

    if (loading) {
        return <CmsTableSkeleton />;
    }

    if (error) {
        return (
            <ComponentErrorBoundary componentName="SensorDetalhes">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Erro ao carregar detalhes do sensor</h4>
                        <p>{error}</p>
                        <hr />
                        <Link href="/pages/cms/sensores" className="btn btn-primary">
                            Voltar para Sensores
                        </Link>
                    </div>
                </div>
            </ComponentErrorBoundary>
        );
    }

    if (!sensor) {
        return (
            <div className="container">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Sensor não encontrado</h4>
                    <p>Não foi possível encontrar o sensor solicitado.</p>
                    <hr />
                    <Link href="/pages/cms/sensores" className="btn btn-primary">
                        Voltar para Sensores
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColorClass = (estado?: SensorStatus) => {
        switch (estado) {
            case SensorStatus.OPERACIONAL:
                return "success";
            case SensorStatus.DEFEITO:
                return "danger";
            case SensorStatus.MANUTENCAO:
                return "warning";
            case SensorStatus.DESCONHECIDO:
                return "secondary";
            default:
                return "secondary";
        }
    };

    return (
        <ComponentErrorBoundary componentName="SensorDetalhes">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h3 mb-0">
                            <i className="bi bi-activity me-2"></i>
                            Detalhes do Sensor: {sensor.nome}
                        </h1>
                        <p className="text-muted mb-0">Tipo: {sensor.tipo || "N/A"}</p>
                    </div>
                    <Link href="/pages/cms/sensores" className="btn btn-secondary">
                        <i className="bi bi-arrow-left me-1"></i>
                        Voltar
                    </Link>
                </div>

                <ToastContainer position="top-right" autoClose={2000} />

                {/* Sensor Details */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            Informações do Sensor
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td><strong>ID:</strong></td>
                                            <td>{sensor.id}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Nome:</strong></td>
                                            <td>{sensor.nome}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Tipo:</strong></td>
                                            <td>{sensor.tipo || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Status:</strong></td>
                                            <td>
                                                <span className={`badge bg-${getStatusColorClass(sensor.estado)}`}>
                                                    {sensor.estado || "DESCONHECIDO"}
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
                                                {sensor.equipamento ? (
                                                    <Link href={`/pages/cms/detalhes?id=${sensor.equipamento.id}`}>
                                                        {sensor.equipamento.nome}
                                                    </Link>
                                                ) : "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Casa de Máquinas:</strong></td>
                                            <td>
                                                {sensor.equipamento?.cm ? (
                                                    <Link href={`/pages/cms/detalhes?id=${sensor.equipamento.cm.id}`}>
                                                        {sensor.equipamento.cm.nome}
                                                    </Link>
                                                ) : "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Descrição do Defeito:</strong></td>
                                            <td>{sensor.descricaoDefeito || "N/A"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Gallery for Defective Sensors */}
                {sensor.estado === SensorStatus.DEFEITO && imagePaths.length > 0 && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-images me-2"></i>
                                Imagens do Defeito
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {imagePaths.map((path, index) => (
                                    <div key={index} className="col-md-3 mb-3">
                                        <Image
                                            src={`/api/serve-image?imagePath=${encodeURIComponent(path)}&module=cms`}
                                            alt={`Imagem do defeito ${index + 1}`}
                                            className="img-fluid img-thumbnail"
                                            width={200}
                                            height={200}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ComponentErrorBoundary>
    );
}
