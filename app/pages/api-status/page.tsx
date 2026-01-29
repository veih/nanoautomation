"use client";

import React from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import ApiStatusDashboard from "../../components/ApiStatusDashboard";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";

export default function ApiStatusPage() {
  return (
    <ComponentErrorBoundary componentName="API Status Page">
      <Container className="py-4">
        <div className="mb-4">
          <h1 className="text-primary">
            <i className="bi bi-diagram-3 me-2"></i>
            API Connection Monitor
          </h1>
          <p className="text-muted">
            Real-time monitoring of all API endpoints in the nanofront
            application. This page helps ensure all backend services are
            properly connected and responding.
          </p>
        </div>

        <Tabs defaultActiveKey="dashboard" id="api-status-tabs" className="mb-3">
          <Tab eventKey="dashboard" title="Status Dashboard">
            <ApiStatusDashboard autoRefresh={true} refreshInterval={2400000} />
          </Tab>
          <Tab eventKey="documentation" title="API Documentation">
            <div className="card p-4">
              <h4 className="mb-4">API Endpoint Categories</h4>

              <h5 className="text-primary mt-4">Access Control</h5>
              <ul>
                <li><strong>/api/access-control</strong> - Fetch all access control items</li>
                <li><strong>/api/access-control/defect-history</strong> - Fetch defect history</li>
                <li><strong>/api/access-control/serve-image</strong> - Serve access control images</li>
                <li><strong>/api/access-control/upload-image</strong> - Upload access control images</li>
              </ul>

              <h5 className="text-primary mt-4">Stores (Lojas)</h5>
              <ul>
                <li><strong>/api/lojasApi/lojas</strong> - Fetch all stores</li>
                <li><strong>/api/lojasApi/atuadores-loja</strong> - Fetch store actuators</li>
                <li><strong>/api/lojasApi/sensores-loja</strong> - Fetch store sensors</li>
                <li><strong>/api/lojasApi/equipamentos-loja</strong> - Fetch store equipment</li>
                <li><strong>/api/lojasApi/fire-detection-equipment</strong> - Fetch fire detection equipment</li>
                <li><strong>/api/lojas/serve-image</strong> - Serve store images</li>
              </ul>

              <h5 className="text-primary mt-4">Monitoring Centers (CMS)</h5>
              <ul>
                <li><strong>/api/cmsApi/cms</strong> - Fetch monitoring centers</li>
                <li><strong>/api/cmsApi/maquinas</strong> - Fetch machines/equipment</li>
                <li><strong>/api/cmsApi/atuador</strong> - Fetch actuators</li>
                <li><strong>/api/cmsApi/sensores</strong> - Fetch sensors</li>
                <li><strong>/api/cms/serve-image</strong> - Serve CMS images</li>
              </ul>

              <h5 className="text-primary mt-4">Corrective Actions (Corretivas)</h5>
              <ul>
                <li><strong>/api/corretivas</strong> - Fetch corrective actions</li>
                <li><strong>/api/corretivas/[id]</strong> - Fetch specific corrective action</li>
                <li><strong>/api/corretivas/serve-image</strong> - Serve corrective action images</li>
              </ul>

              <h5 className="text-primary mt-4">Collaborators (Colaboradores)</h5>
              <ul>
                <li><strong>/api/colaboradores</strong> - Fetch collaborators</li>
                <li><strong>/api/colaboradores/[id]</strong> - Fetch specific collaborator</li>
              </ul>

              <h5 className="text-primary mt-4">CVF</h5>
              <ul>
                <li><strong>/api/cvf</strong> - Fetch CVF items</li>
                <li><strong>/api/cvf/[id]</strong> - Fetch specific CVF item</li>
                <li><strong>/api/cvf/serve-image</strong> - Serve CVF images</li>
              </ul>

              <h5 className="text-primary mt-4">General Services</h5>
              <ul>
                <li><strong>/api/export-data</strong> - Export application data</li>
                <li><strong>/api/import-data</strong> - Import application data</li>
                <li><strong>/api/sync-cloudinary</strong> - Sync with Cloudinary</li>
                <li><strong>/api/upload</strong> - General upload endpoint</li>
              </ul>
            </div>
          </Tab>
        </Tabs>

        <div className="mt-4">
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              How to Use This Dashboard
            </h6>
            <ul className="mb-0">
              <li>
                <strong>Manual refresh:</strong> Click the refresh button to
                test all APIs manually
              </li>
              <li>
                <strong>Auto refresh:</strong> This page automatically refreshes every 40 minutes
              </li>
              <li>
                <strong>Response times:</strong> Green (&lt;500ms), Yellow
                (500-1000ms), Red (&gt;1000ms)
              </li>
              <li>
                <strong>Response format:</strong> Shows whether APIs use
                standardized or legacy response formats
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </ComponentErrorBoundary>
  );
}