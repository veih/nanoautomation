"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

import { ComponentErrorBoundary } from "@/app/components/ErrorBoundary";
import { CmsTableSkeleton } from "@/app/components/Loading";

import { AccessController, RequestButton, Electromagnet, MagneticSensor } from "../../../../types/accessControl";

// Simple fetch hook for related devices
function useFetchRelatedDevices(name: string | null, status: string | null) {
    const [devices, setDevices] = useState<(AccessController | RequestButton | Electromagnet | MagneticSensor)[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!name || !status) {
            setLoading(false);
            return;
        }

        const fetchDevices = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/access-control?name=${encodeURIComponent(name)}&status=${status}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch related devices: ${response.status}`);
                }

                const data = await response.json();
                setDevices(data.data || []);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dispositivos relacionados";
                setError(errorMessage);
                console.error("Error fetching related devices:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, [name, status]);

    return { devices, loading, error };
}

// Define a type for defect history entries
interface DefectHistoryEntry {
    timestamp: string;
    oldStatus: string;
    newStatus: string;
    message: string;
}

// Fetch defect history
function useFetchDefectHistory(deviceId: string | null) {
    const [history, setHistory] = useState<DefectHistoryEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!deviceId) {
            setLoading(false);
            return;
        }

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/access-control/defect-history?deviceId=${deviceId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch defect history: ${response.status}`);
                }

                const data = await response.json();
                setHistory(data.data.history);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar histórico de defeitos";
                setError(errorMessage);
                console.error("Error fetching defect history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [deviceId]);

    return { history, loading, error };
}

// Helper function to get device type label
function getDeviceTypeLabel(type: string) {
    switch (type) {
        case 'controller': return 'Controlador';
        case 'button': return 'Botão';
        case 'electromagnet': return 'Eletroímã';
        case 'sensor': return 'Sensor';
        default: return type;
    }
}

// Helper function to get status label
function getStatusLabel(status: string) {
    switch (status) {
        case 'OPERACIONAL': return 'Operacional';
        case 'DEFEITO': return 'Defeito';
        case 'MANUTENCAO': return 'Manutenção';
        case 'N_A': return 'Não Disponível';
        default: return status;
    }
}

// Helper function to get status variant for Bootstrap
function getStatusVariant(status: string) {
    switch (status) {
        case 'OPERACIONAL': return 'success';
        case 'DEFEITO': return 'danger';
        case 'MANUTENCAO': return 'warning';
        default: return 'secondary';
    }
}

// Helper function to format date safely
function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Não especificada';
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return 'Data inválida';
    }
}

export default function AccessControlDetalhesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const deviceName = searchParams?.get("name") || null;
    const deviceStatus = searchParams?.get("status") || null;

    // Fetch all related devices with the same name and status
    const { devices: relatedDevices, loading: relatedLoading, error: relatedError } = useFetchRelatedDevices(
        deviceName,
        deviceStatus
    );

    // Use the first device as the main device for displaying details
    const device = relatedDevices.length > 0 ? relatedDevices[0] : null;

    const { history: defectHistory } = useFetchDefectHistory(device?.id || null);

    // If no name or status is provided, redirect to the defective devices page
    useEffect(() => {
        if (!deviceName || !deviceStatus) {
            router.push("/pages/access-control/defeito");
        }
    }, [deviceName, deviceStatus, router]);

    // Loading state
    if (relatedLoading) {
        return <CmsTableSkeleton />;
    }

    // Error state
    if (relatedError) {
        return (
            <ComponentErrorBoundary componentName="AccessControlDetalhes">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Erro ao carregar detalhes do dispositivo</h4>
                        <p>{relatedError}</p>
                        <hr />
                        <button
                            onClick={() => router.back()}
                            className="btn btn-primary"
                        >
                            Voltar para Controle de Acesso
                        </button>
                    </div>
                </div>
            </ComponentErrorBoundary>
        );
    }

    // Device not found
    if (!device) {
        return (
            <div className="container">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Dispositivo não encontrado</h4>
                    <p>Não foi possível encontrar dispositivos com o nome &quot;{deviceName}&quot; e status &quot;{deviceStatus}&quot;.</p>
                    <hr />
                    <button
                        onClick={() => router.back()}
                        className="btn btn-primary"
                    >
                        Voltar para Controle de Acesso
                    </button>
                </div>
            </div>
        );
    }

    // Parse image paths from all devices
    const allImagePaths: { deviceId: string; deviceName: string; imagePath: string }[] = [];
    relatedDevices.forEach((relatedDevice) => {
        if ('imagePaths' in relatedDevice && relatedDevice.imagePaths) {
            try {
                const parsed = JSON.parse(relatedDevice.imagePaths as string);
                if (Array.isArray(parsed)) {
                    parsed.forEach(imagePath => {
                        // Normalize path separators to forward slashes for URL compatibility
                        const normalizedPath = imagePath.replace(/\\/g, '/');
                        allImagePaths.push({
                            deviceId: relatedDevice.id,
                            deviceName: relatedDevice.name,
                            imagePath: normalizedPath
                        });
                    });
                }
            } catch (e) {
                console.error("Error parsing image paths for device:", relatedDevice.id, e);
            }
        }
    });

    return (
        <ComponentErrorBoundary componentName="AccessControlDetalhes">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h3 mb-0">
                            <i className="bi bi-shield-lock me-2"></i>
                            Dispositivos Relacionados: {device.name}
                        </h1>
                        <p className="text-muted mb-0">
                            Status: <span className={`badge bg-${getStatusVariant(deviceStatus || '')}`}>{getStatusLabel(deviceStatus || '')}</span> |
                            Total Encontrados: {relatedDevices.length}
                        </p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="btn btn-secondary"
                    >
                        <i className="bi bi-arrow-left me-1"></i>
                        Voltar
                    </button>
                </div>

                <ToastContainer position="top-right" autoClose={2000} />

                {/* Related Devices Table */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="bi bi-list me-2"></i>
                            Lista de Dispositivos Relacionados
                        </h5>
                    </div>
                    <div className="card-body">
                        {relatedDevices.length === 0 ? (
                            <p className="text-center text-muted">Nenhum dispositivo relacionado encontrado.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Tipo</th>
                                            <th>Status</th>
                                            <th>Localização</th>
                                            <th>Descrição</th>
                                            <th>Última Atualização</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relatedDevices.map((relatedDevice, index) => {
                                            // Determine device type based on the device properties
                                            let deviceType = '';
                                            if ('ipAddress' in relatedDevice) {
                                                deviceType = 'controller';
                                            } else if ('buttonType' in relatedDevice) {
                                                deviceType = 'button';
                                            } else if ('isLocked' in relatedDevice) {
                                                deviceType = 'electromagnet';
                                            } else if ('sensorType' in relatedDevice) {
                                                deviceType = 'sensor';
                                            }

                                            return (
                                                <tr key={index}>
                                                    <td>{relatedDevice.name}</td>
                                                    <td>{getDeviceTypeLabel(deviceType)}</td>
                                                    <td>
                                                        <span className={`badge bg-${getStatusVariant(relatedDevice.status)}`}>
                                                            {getStatusLabel(relatedDevice.status)}
                                                        </span>
                                                    </td>
                                                    <td>{relatedDevice.location || 'Não especificada'}</td>
                                                    <td>{relatedDevice.description || 'Não especificada'}</td>
                                                    <td>{formatDate(relatedDevice.lastUpdated)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Device Images for Defective Devices */}
                {deviceStatus === 'DEFEITO' && allImagePaths.length > 0 && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-images me-2"></i>
                                Imagens do Defeito (Todos os Dispositivos)
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {allImagePaths.map((image, index) => (
                                    <div key={index} className="col-md-4 mb-3">
                                        <div className="mb-2">
                                            <small className="text-muted">Dispositivo: {image.deviceName} (ID: {image.deviceId})</small>
                                        </div>
                                        <Image
                                            src={`/api/serve-image?imagePath=${encodeURIComponent(image.imagePath)}&module=access-control`}
                                            alt={`Defeito ${index + 1}`}
                                            className="img-fluid"
                                            width={200}
                                            height={200}
                                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                                            unoptimized={true}
                                            onError={() => {
                                                console.error(`Failed to load image: ${image.imagePath}`);
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

                {/* Defect History */}
                {defectHistory && defectHistory.length > 0 && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-clock-history me-2"></i>
                                Histórico de Defeitos
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Data/Hora</th>
                                            <th>Status Anterior</th>
                                            <th>Status Novo</th>
                                            <th>Mensagem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {defectHistory.map((entry, index) => (
                                            <tr key={index}>
                                                <td>{formatDate(entry.timestamp)}</td>
                                                <td>
                                                    <span className={`badge bg-${getStatusVariant(entry.oldStatus)}`}>
                                                        {getStatusLabel(entry.oldStatus)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getStatusVariant(entry.newStatus)}`}>
                                                        {getStatusLabel(entry.newStatus)}
                                                    </span>
                                                </td>
                                                <td>{entry.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Device Specific Details (from the first device) */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="bi bi-gear me-2"></i>
                            Detalhes Específicos
                        </h5>
                    </div>
                    <div className="card-body">
                        {/* General device information */}
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <p><strong>Descrição:</strong> {device.description || 'Não especificada'}</p>
                            </div>
                        </div>

                        {/* Determine device type based on the device properties */}
                        {'ipAddress' in device && (
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Endereço IP:</strong> {(device as AccessController).ipAddress || 'Não especificado'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Dispositivos Conectados:</strong> {(device as AccessController).connectedDevices?.join(', ') || 'Nenhum'}</p>
                                </div>
                            </div>
                        )}

                        {'buttonType' in device && (
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Tipo de Botão:</strong> {(device as RequestButton).buttonType || 'ENTRY'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Está Pressionado:</strong> {(device as RequestButton).isPressed ? 'Sim' : 'Não'}</p>
                                    {(device as RequestButton).lastPressed && (
                                        <p><strong>Última Pressionada:</strong> {formatDate((device as RequestButton).lastPressed)}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {'isLocked' in device && (
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Está Bloqueado:</strong> {(device as Electromagnet).isLocked ? 'Sim' : 'Não'}</p>
                                    <p><strong>Status do Bloqueio:</strong> {(device as Electromagnet).lockStatus || 'Não especificado'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Consumo de Energia:</strong> {(device as Electromagnet).powerConsumption || 0} W</p>
                                </div>
                            </div>
                        )}

                        {'sensorType' in device && (
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Tipo de Sensor:</strong> {(device as MagneticSensor).sensorType || 'DOOR'}</p>
                                    <p><strong>Está Fechado:</strong> {(device as MagneticSensor).isClosed ? 'Sim' : 'Não'}</p>
                                </div>
                                <div className="col-md-6">
                                    {(device as MagneticSensor).lastTriggered && (
                                        <p><strong>Último Acionamento:</strong> {formatDate((device as MagneticSensor).lastTriggered)}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ComponentErrorBoundary>
    );
}