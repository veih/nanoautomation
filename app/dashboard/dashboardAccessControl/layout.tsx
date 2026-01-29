// app/dashboard/dashboardAccessControl/layout.tsx
import React from "react";
import { Container } from "react-bootstrap";

export default function AccessControlDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Container fluid className="px-0">
            {children}
        </Container>
    );
}