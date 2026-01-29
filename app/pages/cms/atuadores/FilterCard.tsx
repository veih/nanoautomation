"use client";
import { Card, Form } from "react-bootstrap";

interface FilterCardProps {
    filtroBusca: string;
    setFiltroBusca: (value: string) => void;
}

export default function FilterCard({ filtroBusca, setFiltroBusca }: FilterCardProps) {
    return (
        <Card className="mb-4 shadow">
            <Card.Body>
                <Form.Group controlId="filtroBusca">
                    <Form.Control
                        type="text"
                        placeholder="Digite para buscar por máquina, casa de máquinas ou localização..."
                        value={filtroBusca}
                        onChange={(e) => setFiltroBusca(e.target.value)}
                    />
                </Form.Group>
            </Card.Body>
        </Card>
    );
}
