"use client";

import React from "react";
import Ocorrencia from "@/app/components/Ocorrencia";
import { Card, Button } from "react-bootstrap";
import Link from "next/link";

const OcorrenciasPage = () => {
    return (
        <div className="container-fluid">
            <Card className="shadow mb-4">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        <i className="bi bi-mic me-2"></i>
                        Registro de Ocorrências
                    </h4>
                    <Link href="/pages/ocorrencias/list" passHref>
                        <Button variant="light">
                            <i className="bi bi-list-check me-1"></i>
                            Ver Lista
                        </Button>
                    </Link>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">
                        Registre ocorrências e soluções para melhorar a manutenção preventiva.
                    </p>
                    <p className="text-muted">
                        Os colaboradores são gerenciados na página de <a href="/pages/colaboradores">Colaboradores</a>.
                    </p>
                </Card.Body>
            </Card>

            <Ocorrencia />
        </div>
    );
};

export default OcorrenciasPage;