/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Spinner, Alert, Table, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import CmsNavigationSubmenu from "../../../components/navigation/CmsNavigationSubmenu";
import { Cvf, SensorTemperaturaStatus, SensorUmidadeStatus } from "../../../../types";
import PdfDefectiveCvfButton from "../../../components/PDFs/PdfDefectiveCvfButton";
import styles from "./page.module.css";

export default function CvfDefeitosPage() {
    const router = useRouter();
    const [cvfsData, setCvfsData] = useState<Cvf[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Função para buscar os dados dos CVFs
    const fetchCvfs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/cvf");
            if (!res.ok) {
                const errorData = await res
                    .json()
                    .catch(() => ({ message: "Erro desconhecido ao buscar CVFs." }));
                throw new Error(errorData.message || `Erro HTTP: ${res.status}`);
            }
            const result = await res.json();

            // Verifica se a resposta tem o formato esperado
            if (!result || !Array.isArray(result.cvfs)) {
                console.error("Formato de resposta inesperado:", result);
                throw new Error("Formato de dados inválido recebido da API");
            }

            setCvfsData(result.cvfs);
        } catch (err: any) {
            console.error("Erro ao buscar CVFs para relatório de defeito:", err);
            setError(
                `Falha ao carregar dados para o relatório: ${err.message || "Erro de rede."}`
            );
            setCvfsData([]);
        } finally {
            setLoading(false);
        }
    };

    // Efeito para carregar os dados na montagem do componente
    useEffect(() => {
        fetchCvfs();
    }, []);

    // Filter to show only CVFs with DEFEITO status
    const defectiveCvfs = useMemo(() => {
        if (!Array.isArray(cvfsData)) return [];
        return cvfsData.filter(
            (cvf: Cvf) =>
                cvf.sensorTemperatura === SensorTemperaturaStatus.DEFEITO ||
                cvf.sensorUmidade === SensorUmidadeStatus.DEFEITO ||
                cvf.atuador === "DEFEITO"
        );
    }, [cvfsData]);

    // Calcula estatísticas for defective CVFs only
    const stats = useMemo(() => {
        const totalCvfs = defectiveCvfs.length;
        const defectiveTemperatureSensors = defectiveCvfs.filter(
            (cvf: Cvf) => cvf.sensorTemperatura === SensorTemperaturaStatus.DEFEITO
        ).length;
        const defectiveHumiditySensors = defectiveCvfs.filter(
            (cvf: Cvf) => cvf.sensorUmidade === SensorUmidadeStatus.DEFEITO
        ).length;
        const defectiveActuators = defectiveCvfs.filter(
            (cvf: Cvf) => cvf.atuador === "DEFEITO"
        ).length;

        return {
            totalCvfs,
            defectiveTemperatureSensors,
            defectiveHumiditySensors,
            defectiveActuators,
        };
    }, [defectiveCvfs]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando dados...</span>
                </Spinner>
                <p className="mt-2">
                    Carregando relatório de CVFs com defeito, por favor aguarde...
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
                    <div className="d-flex justify-content-end">
                        <button className="btn btn-primary" onClick={fetchCvfs}>
                            Tentar Novamente
                        </button>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <CmsNavigationSubmenu isCollapsed={false} />
            <h1 className="mb-4 text-center text-primary fw-bold">Relatório de CVFs com Defeito</h1>
            <hr className="mb-4" />

            <div className="d-flex justify-content-center mt-2 mb-4">
                <PdfDefectiveCvfButton cvfsData={defectiveCvfs} />
            </div>

            {/* Resumo do Relatório */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="text-danger">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                            </Card.Title>
                            <div className="text-center">
                                <div className="fw-bold fs-3">{stats.totalCvfs}</div>
                                <div className="text-muted">Total de CVFs com Defeito</div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3 mb-3">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="text-warning">
                                <i className="bi bi-thermometer-half"></i>
                            </Card.Title>
                            <div className="text-center">
                                <div className="fw-bold fs-3">{stats.defectiveTemperatureSensors}</div>
                                <div className="text-muted">Sensores de Temperatura com Defeito</div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3 mb-3">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="text-info">
                                <i className="bi bi-moisture"></i>
                            </Card.Title>
                            <div className="text-center">
                                <div className="fw-bold fs-3">{stats.defectiveHumiditySensors}</div>
                                <div className="text-muted">Sensores de Umidade com Defeito</div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3 mb-3">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="text-success">
                                <i className="bi bi-speedometer2"></i>
                            </Card.Title>
                            <div className="text-center">
                                <div className="fw-bold fs-3">{stats.defectiveActuators}</div>
                                <div className="text-muted">Atuadores com Defeito</div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {defectiveCvfs.length === 0 ? (
                <Alert variant="info" className="text-center">
                    <i className="bi bi-info-circle me-2"></i>
                    Nenhum CVF com status de defeito foi encontrado no sistema.
                </Alert>
            ) : (
                <Table striped bordered hover responsive className="shadow-sm">
                    <thead>
                        <tr className="bg-primary text-white">
                            <th>Viga Fria</th>
                            <th>Piso</th>
                            <th>Sensor Temperatura</th>
                            <th>Sensor Umidade</th>
                            <th>Atuador</th>
                            <th>Localização Quadro</th>
                            <th>Localização Válvula</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {defectiveCvfs.map((cvf: Cvf) => (
                            <tr key={cvf.id}>
                                <td>{cvf.vigaFria || "N/A"}</td>
                                <td>{cvf.piso || "N/A"}</td>
                                <td>
                                    {cvf.sensorTemperatura === SensorTemperaturaStatus.DEFEITO ? (
                                        <span className={`badge ${styles.badgeDanger}`}>Defeito</span>
                                    ) : cvf.sensorTemperatura === SensorTemperaturaStatus.OPERACIONAL ? (
                                        <span className={`badge ${styles.badgeSecondary}`}>Operacional</span>
                                    ) : (
                                        <span className={`badge ${styles.badgeLight}`}>{cvf.sensorTemperatura || "N/A"}</span>
                                    )}
                                </td>
                                <td>
                                    {cvf.sensorUmidade === SensorUmidadeStatus.DEFEITO ? (
                                        <span className={`badge ${styles.badgeDanger}`}>Defeito</span>
                                    ) : cvf.sensorUmidade === SensorUmidadeStatus.OPERACIONAL ? (
                                        <span className={`badge ${styles.badgeSecondary}`}>Operacional</span>
                                    ) : (
                                        <span className={`badge ${styles.badgeLight}`}>{cvf.sensorUmidade || "N/A"}</span>
                                    )}
                                </td>
                                <td>
                                    {cvf.atuador === "DEFEITO" ? (
                                        <span className={`badge ${styles.badgeDanger}`}>Defeito</span>
                                    ) : cvf.atuador === "OPERACIONAL" ? (
                                        <span className={`badge ${styles.badgeSecondary}`}>Operacional</span>
                                    ) : (
                                        <span className={`badge ${styles.badgeLight}`}>{cvf.atuador || "N/A"}</span>
                                    )}
                                </td>
                                <td>{cvf.localizacaoQuadro || "N/A"}</td>
                                <td>{cvf.localizacaoValvula || "N/A"}</td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => router.push(`/pages/cvf/${cvf.id}`)}
                                    >
                                        <i className="bi bi-eye"></i> Detalhes
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <div className="mt-3">
                <p className="text-muted text-end">
                    Total de registros com defeito: {defectiveCvfs.length}
                </p>
            </div>
        </div>
    );
}