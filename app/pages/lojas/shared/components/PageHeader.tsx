"use client";

import { Card, Row, Col, Form, Button, Badge } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../../components/ErrorBoundary";

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
  itemCount?: number; // New prop for item count
}

export function PageHeader({
  title,
  icon,
  onAddNew,
  addButtonLabel = "Adicionar",
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Digite para pesquisar...",
  children,
  showSearch = true,
  showAddButton = true,
  itemCount, // New prop
}: PageHeaderProps) {

  return (
    <ComponentErrorBoundary componentName="PageHeader">
      <Card className="mb-4 shadow border-0">
        <Card.Body className="p-4">
          {children}

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 mt-4 gap-3">
            <div className="d-flex align-items-center">
              <h1 className="text-primary mb-0 me-3">
                <i className={`bi ${icon} me-2`}></i>
                {title}
              </h1>
              {itemCount !== undefined && (
                <Badge bg="primary" className="fs-6">
                  {itemCount}
                </Badge>
              )}
            </div>
            {showAddButton && onAddNew && (
              <div className="d-flex justify-content-end w-100 w-md-auto">
                <Button
                  variant="success"
                  onClick={onAddNew}
                  className="btn-enhanced w-100 w-md-auto shadow-sm"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  {addButtonLabel}
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
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input shadow-sm"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </ComponentErrorBoundary>
  );
}