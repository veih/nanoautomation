"use client";

import React from "react";
import { Badge } from "react-bootstrap";

export default function TestBadgePage() {
    return (
        <div className="container py-4">
            <h1>Teste de Badges Bootstrap</h1>

            <div className="mb-3">
                <h2>Badges com prop bg:</h2>
                <Badge bg="primary">Primary</Badge>{' '}
                <Badge bg="secondary">Secondary</Badge>{' '}
                <Badge bg="success">Success</Badge>{' '}
                <Badge bg="danger">Danger</Badge>{' '}
                <Badge bg="warning" text="dark">Warning</Badge>{' '}
                <Badge bg="info">Info</Badge>{' '}
                <Badge bg="light" text="dark">Light</Badge>{' '}
                <Badge bg="dark">Dark</Badge>
            </div>

            <div className="mb-3">
                <h2>Badges com classes CSS:</h2>
                <span className="badge bg-primary">Primary</span>{' '}
                <span className="badge bg-secondary">Secondary</span>{' '}
                <span className="badge bg-success">Success</span>{' '}
                <span className="badge bg-danger">Danger</span>{' '}
                <span className="badge bg-warning text-dark">Warning</span>{' '}
                <span className="badge bg-info">Info</span>{' '}
                <span className="badge bg-light text-dark">Light</span>{' '}
                <span className="badge bg-dark">Dark</span>
            </div>
        </div>
    );
}