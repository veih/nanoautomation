// app/pages/layout.tsx
import { Container, Row, Col } from "react-bootstrap";
import React from "react";
import SideMenu from "../components/SideMenu";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container fluid className="vh-100 p-0">
      <Row className="flex-grow-1 h-100 g-0">
        {/* Coluna para o menu lateral */}
        <Col
          xs={2}
          sm={1}
          md={3}
          lg={2}
          className="bg-dark text-white p-0 d-flex flex-column"
        >
          <SideMenu />
        </Col>
        {/* Coluna para o conteúdo principal - aqui será renderizado o 'children' (page.tsx) */}
        <Col xs={10} sm={11} md={9} lg={10} className="p-3 p-md-4 overflow-auto">
          {children}
        </Col>
      </Row>
    </Container>
  );
}