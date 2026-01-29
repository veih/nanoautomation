"use client";

import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";

interface PageHeaderProps {
    title: string;
    icon: string;
    onAddNew?: () => void;
    addButtonLabel?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    children?: React.ReactNode;
    showSearch?: boolean;
    showAddButton?: boolean;
}

const PageHeader = ({
    title,
    icon,
    onAddNew,
    addButtonLabel,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    children,
    showSearch = true,
    showAddButton = true,
}: PageHeaderProps) => (
    <ComponentErrorBoundary componentName="PageHeader">
        <Card className="mb-4 shadow mx-3">
            <Card.Body>
                {children}

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 mt-4 gap-3">
                    <h1 className="text-primary mb-0">
                        <i className={`bi ${icon} me-2`}></i>
                        {title}
                    </h1>
                    {showAddButton && onAddNew && (
                        <div className="d-flex justify-content-end w-100 w-md-auto">
                            <Button
                                variant="success"
                                onClick={onAddNew}
                                className="btn-enhanced w-100 w-md-auto"
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                {addButtonLabel || "Adicionar"}
                            </Button>
                        </div>
                    )}
                </div>

                {showSearch && onSearchChange && (
                    <Row>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder={searchPlaceholder || "Digite para pesquisar..."}
                                    value={searchValue}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="search-input"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                )}
            </Card.Body>
        </Card>
    </ComponentErrorBoundary>
);

export default PageHeader;