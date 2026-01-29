"use client";

import { Card, Button, ButtonGroup, Badge, Alert } from "react-bootstrap";
import { ComponentErrorBoundary } from "@/app/components/ErrorBoundary";
import { Cm } from "../../../../../types";
import Image from "next/image";
import Link from "next/link";

interface CmCardProps {
    cm: Cm;
    onEdit: (cm: Cm) => void;
    onDelete: (cm: Cm) => void;
}

function CmCard({ cm, onEdit, onDelete }: CmCardProps) {
    // Check if this is a machine room (casa de máquinas)
    // Looking for 'CM' which stands for 'Casa de Máquinas' in the data
    const isMachineRoom = cm.nome?.toUpperCase().includes('CM') ||
                         cm.nome?.toLowerCase().includes('casa') || 
                         cm.nome?.toLowerCase().includes('máquina') || 
                         cm.nome?.toLowerCase().includes('maquina') ||
                         cm.localizacao?.toLowerCase().includes('casa') ||
                         cm.localizacao?.toLowerCase().includes('máquina') ||
                         cm.localizacao?.toLowerCase().includes('maquina');
    


    return (
        <ComponentErrorBoundary componentName="CmCard">
            <Card className="shadow-sm h-100">
                <div className="position-relative" style={{ height: '200px' }}>
                    {/* Machine Room Image */}
                    {isMachineRoom && (
                        <div className="position-absolute top-0 start-0 w-100 h-100">
                            <Image
                                src="/img/casaDeMaquinas.jpg"
                                alt="Casa de Máquinas"
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                        </div>
                    )}
                    
                    {/* Background icon - shown when no image or as fallback */}
                    {/* <div className={`bg-light h-100 d-flex align-items-center justify-content-center ${isMachineRoom ? 'opacity-50' : ''}`}>
                        <i className="bi bi-building-gear text-muted" style={{ fontSize: '3rem' }}></i>
                    </div> */}
                    
                    {/* Location Badge */}
                    <div className="position-absolute top-0 end-0 m-2">
                        <Badge bg="primary">{cm.localizacao || 'Sem piso'}</Badge>
                    </div>
                </div>
                <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-1">{cm.nome}</Card.Title>
                    <Card.Text className="text-muted small mb-2">
                        {cm.localizacao ? `Piso: ${cm.localizacao}` : "Localização não informada"}
                    </Card.Text>
                    <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">
                                {cm.equipamentos?.length || 0} equipamentos
                            </small>
                            <small className="text-muted">
                                {cm.equipamentos?.reduce((total, eq) => total + (eq.atuadores?.length || 0), 0) || 0} atuadores
                            </small>
                            <small className="text-muted">
                                {cm.equipamentos?.reduce((total, eq) => total + (eq.sensores?.length || 0), 0) || 0} sensores
                            </small>
                        </div>
                        {/* View Details Button */}
                        <div className="mb-2">
                            <Link href={`/pages/cms/detalhes?id=${cm.id}`} className="btn btn-outline-info btn-sm w-100">
                                <i className="bi bi-eye me-1"></i>
                                Ver Detalhes
                            </Link>
                        </div>
                        <ButtonGroup className="w-100">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => onEdit(cm)}
                                title="Editar"
                            >
                                <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => onDelete(cm)}
                                title="Excluir"
                            >
                                <i className="bi bi-trash"></i>
                            </Button>
                        </ButtonGroup>
                    </div>
                </Card.Body>
            </Card>


        </ComponentErrorBoundary>
    );
}

interface CardViewProps {
    data: Cm[];
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    onEdit: (item: Cm) => void;
    onDelete: (item: Cm) => void;
    title?: string;
}

export function CardView({
    data,
    loading = false,
    error = null,
    emptyMessage = "Nenhuma item encontrado",
    onEdit,
    onDelete,
    title,
}: CardViewProps) {
    if (error) {
        return (
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-grid me-2"></i>
                        {title}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Alert variant="danger" className="mb-0">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    if (data.length === 0 && !loading) {
        return (
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-grid me-2"></i>
                        {title}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Alert variant="info" className="text-center mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        {emptyMessage}
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    return (
        <ComponentErrorBoundary componentName="CardView">
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="bi bi-grid me-2"></i>
                        {title}
                    </h5>
                    <span className="badge bg-light text-dark">
                        {data.length} {data.length === 1 ? 'item' : 'itens'}
                    </span>
                </Card.Header>
                <Card.Body>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {data.map((cm) => (
                            <div key={cm.id} className="col">
                                <CmCard
                                    cm={cm}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        </ComponentErrorBoundary>
    );
}