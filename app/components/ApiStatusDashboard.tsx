"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Alert,
  Spinner,
  Table,
  Accordion,
} from "react-bootstrap";
import {
  testAllApiEndpoints,
  API_ENDPOINTS,
  type ApiTestResult,
} from "../../lib/api-test-utils";

interface ApiStatusDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Group endpoints by category for better organization
const groupEndpointsByCategory = () => {
  const categories: Record<string, typeof API_ENDPOINTS> = {
    "Access Control": [],
    "Stores (Lojas)": [],
    "Monitoring Centers (CMS)": [],
    "Theater Monitoring (CMS Teatro)": [],
    "Corrective Actions (Corretivas)": [],
    "Collaborators (Colaboradores)": [],
    "CVF": [],
    "General Services": [],
  };

  API_ENDPOINTS.forEach(endpoint => {
    if (endpoint.url.includes("access-control")) {
      categories["Access Control"].push(endpoint);
    } else if (endpoint.url.includes("lojas")) {
      categories["Stores (Lojas)"].push(endpoint);
    } else if (endpoint.url.includes("cmsTeatro")) {
      categories["Theater Monitoring (CMS Teatro)"].push(endpoint);
    } else if (endpoint.url.includes("cms") && !endpoint.url.includes("cmsTeatro")) {
      categories["Monitoring Centers (CMS)"].push(endpoint);
    } else if (endpoint.url.includes("corretivas")) {
      categories["Corrective Actions (Corretivas)"].push(endpoint);
    } else if (endpoint.url.includes("colaboradores")) {
      categories["Collaborators (Colaboradores)"].push(endpoint);
    } else if (endpoint.url.includes("cvf")) {
      categories["CVF"].push(endpoint);
    } else {
      categories["General Services"].push(endpoint);
    }
  });

  return categories;
};

export default function ApiStatusDashboard({
  autoRefresh = false,
  refreshInterval = 2400000,
}: ApiStatusDashboardProps) {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runTests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const testResults = await testAllApiEndpoints();
      setResults(testResults);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test APIs");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up new interval
      intervalRef.current = setInterval(runTests, refreshInterval);

      // Clean up interval on unmount or when dependencies change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    // Clean up interval if autoRefresh is disabled
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, runTests]);

  // Initial load
  useEffect(() => {
    runTests();
  }, [runTests]);

  // Filter out parameterized endpoints for success calculation
  const nonParamEndpoints = results.filter((_, index) => {
    const endpoint = API_ENDPOINTS[index];
    return !endpoint?.requiresParam;
  });

  const successCount = nonParamEndpoints.filter((r) => r.success).length;
  const totalCount = nonParamEndpoints.length;

  const averageResponseTime =
    nonParamEndpoints.length > 0
      ? nonParamEndpoints
        .filter(r => r.responseTime && r.responseTime > 0) // Exclude parameterized endpoints
        .reduce((sum, r) => sum + (r.responseTime || 0), 0) /
      nonParamEndpoints.filter(r => r.responseTime && r.responseTime > 0).length
      : 0;

  const getStatusBadge = (success: boolean, requiresParam?: boolean) => {
    if (requiresParam) {
      return <Badge bg="info">iParam Needed</Badge>;
    }
    return success ? (
      <Badge bg="success">✅ Online</Badge>
    ) : (
      <Badge bg="danger">❌ Offline</Badge>
    );
  };

  const getResponseTimeColor = (time?: number) => {
    if (!time) return "text-muted";
    if (time < 500) return "text-success";
    if (time < 1000) return "text-warning";
    return "text-danger";
  };

  // Group results by category
  const groupedResults: Record<string, ApiTestResult[]> = {};
  const categories = groupEndpointsByCategory();

  Object.keys(categories).forEach(category => {
    groupedResults[category] = [];
  });

  results.forEach((result, index) => {
    const endpoint = API_ENDPOINTS[index];
    if (!endpoint) return;

    let category = "General Services";
    if (endpoint.url.includes("access-control")) {
      category = "Access Control";
    } else if (endpoint.url.includes("lojas")) {
      category = "Stores (Lojas)";
    } else if (endpoint.url.includes("cmsTeatro")) {
      category = "Theater Monitoring (CMS Teatro)";
    } else if (endpoint.url.includes("cms") && !endpoint.url.includes("cmsTeatro")) {
      category = "Monitoring Centers (CMS)";
    } else if (endpoint.url.includes("corretivas")) {
      category = "Corrective Actions (Corretivas)";
    } else if (endpoint.url.includes("colaboradores")) {
      category = "Collaborators (Colaboradores)";
    } else if (endpoint.url.includes("cvf")) {
      category = "CVF";
    }

    if (!groupedResults[category]) {
      groupedResults[category] = [];
    }
    groupedResults[category].push(result);
  });

  return (
    <div className="api-status-dashboard">
      <Card className="mb-4 shadow">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-router me-2"></i>
              API Connection Status
            </h5>
            <div className="d-flex gap-2">
              <Button
                variant="light"
                size="sm"
                onClick={runTests}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <i className="bi bi-arrow-clockwise me-2"></i>
                )}
                Refresh
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Summary Stats */}
          <Row className="mb-4">
            <Col md={3}>
              <Card
                className={`text-center ${successCount === totalCount
                  ? "bg-success"
                  : successCount > 0
                    ? "bg-warning"
                    : "bg-danger"
                  } text-white`}
              >
                <Card.Body>
                  <h3 className="mb-1">
                    {successCount}/{totalCount}
                  </h3>
                  <small>Endpoints Online</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-info text-white">
                <Card.Body>
                  <h3 className="mb-1">{averageResponseTime.toFixed(0)}ms</h3>
                  <small>Avg Response Time</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-secondary text-white">
                <Card.Body>
                  <h3 className="mb-1">{API_ENDPOINTS.length}</h3>
                  <small>Total Endpoints</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-dark text-white">
                <Card.Body>
                  <h3 className="mb-1">
                    {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--"}
                  </h3>
                  <small>Last Updated</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Categorized Results */}
          {results.length > 0 && (
            <Accordion defaultActiveKey="0">
              {Object.entries(groupedResults).map(([category, categoryResults], idx) => (
                categoryResults.length > 0 && (
                  <Accordion.Item eventKey={idx.toString()} key={category}>
                    <Accordion.Header>
                      <strong>{category}</strong> ({categoryResults.filter(r => r.success).length}/{categoryResults.length} online)
                    </Accordion.Header>
                    <Accordion.Body>
                      <Table striped bordered hover responsive size="sm">
                        <thead className="table-dark">
                          <tr>
                            <th>Endpoint</th>
                            <th>Status</th>
                            <th>Response Time</th>
                            <th>HTTP Status</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryResults.map((result, index) => {
                            // Find the corresponding endpoint in API_ENDPOINTS
                            const endpointIndex = API_ENDPOINTS.findIndex(ep => ep.name === result.endpoint);
                            const endpoint = endpointIndex >= 0 ? API_ENDPOINTS[endpointIndex] : null;

                            return (
                              <tr key={index}>
                                <td>
                                  <strong>{result.endpoint}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {endpoint?.url || 'Unknown URL'}
                                    {endpoint?.requiresParam && (
                                      <span className="badge bg-warning ms-2">Requires Parameters</span>
                                    )}
                                  </small>
                                </td>
                                <td>
                                  {getStatusBadge(result.success, endpoint?.requiresParam)}
                                </td>
                                <td>
                                  <span
                                    className={getResponseTimeColor(result.responseTime)}
                                  >
                                    {result.responseTime
                                      ? `${result.responseTime}ms`
                                      : endpoint?.requiresParam
                                        ? "N/A (Param Required)"
                                        : "N/A"}
                                  </span>
                                </td>
                                <td>
                                  {result.status && (
                                    <Badge
                                      bg={
                                        result.status < 300
                                          ? "success"
                                          : result.status < 500
                                            ? "warning"
                                            : "danger"
                                      }
                                    >
                                      {result.status}
                                    </Badge>
                                  )}
                                </td>
                                <td>
                                  {endpoint?.requiresParam ? (
                                    <small className="text-info">
                                      <i className="bi bi-info-circle me-1"></i>
                                      Requires parameters to test
                                    </small>
                                  ) : result.error ? (
                                    <small className="text-danger">
                                      <i className="bi bi-exclamation-circle me-1"></i>
                                      {result.error}
                                    </small>
                                  ) : result.response &&
                                    typeof result.response === "object" &&
                                    "success" in result.response ? (
                                    <small className="text-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Standardized Response
                                    </small>
                                  ) : (
                                    <small className="text-warning">
                                      <i className="bi bi-info-circle me-1"></i>
                                      Legacy Response
                                    </small>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                )
              ))}
            </Accordion>
          )}

          {autoRefresh && (
            <Alert variant="info" className="mt-3 mb-0">
              <i className="bi bi-clock me-2"></i>
              Auto-refreshing every {Math.floor(refreshInterval / 60000)} minutes
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}