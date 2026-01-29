// app/components/JsonViewer.tsx
"use client";

import React, { useState } from "react";
import { Card, Button, Tabs, Tab, Badge } from "react-bootstrap";

interface JsonViewerProps {
    data: unknown;
    title?: string;
}

interface JsonObject {
    [key: string]: unknown;
}

// Define a type for the render function parameter
type RenderableValue = string | number | boolean | null | undefined | unknown[] | JsonObject;

export default function JsonViewer({ data, title = "Dados JSON" }: JsonViewerProps) {
    const [expanded, setExpanded] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>("formatted");

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    // Function to render formatted JSON with syntax highlighting
    const renderFormattedJson = (obj: RenderableValue, indent = 0) => {
        if (obj === null) return <span className="text-muted">null</span>;
        if (obj === undefined) return <span className="text-muted">undefined</span>;
        if (typeof obj === "boolean") return <span className="text-primary">{obj.toString()}</span>;
        if (typeof obj === "number") return <span className="text-info">{obj}</span>;
        if (typeof obj === "string") return <span className="text-success">{`"${obj}"`}</span>;

        const indentStyle = { paddingLeft: `${indent * 20}px` };

        if (Array.isArray(obj)) {
            if (obj.length === 0) return <span>[]</span>;
            return (
                <div>
                    <div style={indentStyle}>[</div>
                    {obj.map((item, index) => (
                        <div key={index} style={indentStyle}>
                            {renderFormattedJson(item as RenderableValue, indent + 1)}
                            {index < obj.length - 1 && ","}
                        </div>
                    ))}
                    <div style={indentStyle}>]</div>
                </div>
            );
        }

        if (typeof obj === "object") {
            const keys = Object.keys(obj as JsonObject);
            if (keys.length === 0) return <span>{"{}"}</span>;
            return (
                <div>
                    <div style={indentStyle}>{"{"}</div>
                    {keys.map((key, index) => (
                        <div key={key} style={indentStyle}>
                            <span className="text-warning">{`"${key}"`}</span>: {renderFormattedJson((obj as JsonObject)[key] as RenderableValue, indent + 1)}
                            {index < keys.length - 1 && ","}
                        </div>
                    ))}
                    <div style={indentStyle}>{"}"}</div>
                </div>
            );
        }

        return <span>{String(obj)}</span>;
    };

    return (
        <Card className="mb-4">
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                    <i className="bi bi-filetype-json me-2"></i>
                    {title}
                </h6>
                <div>
                    <Badge bg="info" className="me-2">
                        DEV
                    </Badge>
                    <Button
                        variant="outline-light"
                        size="sm"
                        onClick={toggleExpand}
                    >
                        {expanded ? "Recolher" : "Expandir"}
                    </Button>
                </div>
            </Card.Header>
            {expanded && (
                <>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k || "formatted")}
                        className="mb-3"
                    >
                        <Tab eventKey="formatted" title="Formatado">
                            <Card.Body>
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '15px',
                                    borderRadius: '5px',
                                    maxHeight: '500px',
                                    overflow: 'auto',
                                    fontSize: '14px',
                                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                                }}>
                                    {renderFormattedJson(data as RenderableValue)}
                                </div>
                            </Card.Body>
                        </Tab>
                        <Tab eventKey="raw" title="JSON Bruto">
                            <Card.Body>
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '15px',
                                    borderRadius: '5px',
                                    maxHeight: '500px',
                                    overflow: 'auto',
                                    fontSize: '14px',
                                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                                }}>
                                    <pre>{JSON.stringify(data, null, 2)}</pre>
                                </div>
                            </Card.Body>
                        </Tab>
                        <Tab eventKey="summary" title="Resumo">
                            <Card.Body>
                                <div>
                                    <h6>Resumo dos Dados:</h6>
                                    <p>Visualize os dados em formato JSON bruto ou formatado nas outras abas.</p>
                                </div>
                            </Card.Body>
                        </Tab>
                    </Tabs>
                </>
            )}
        </Card>
    );
}