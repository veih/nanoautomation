// app/layout.tsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css"; // se usar CSS global
import { AppErrorBoundary } from "./components/ErrorBoundary";
import { AccessibilityProvider, AccessibilityPanel, SkipToContent, LiveRegion } from "./components/Accessibility";

export const metadata = {
  title: "Dashboard de Centrais de Monitoramento", // Título mais descritivo
  description:
    "Dashboard para gerenciamento e visualização de Centrais de Monitoramento, Equipamentos, Atuadores e Sensores.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content={metadata.description} />
        <meta name="theme-color" content="#3b82f6" />
        {/* Scripts CDN para jsPDF e html2canvas
            Estes scripts são carregados no <head> para estarem disponíveis globalmente
            antes que seus componentes interativos tentem usá-los.
            O atributo 'defer' garante que eles não bloqueiem a renderização inicial do HTML.
        */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          defer
        ></script>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          defer
        ></script>
      </head>
      <body className="d-flex flex-column bg-light min-vh-100">
        <AccessibilityProvider>
          <SkipToContent />
          <AppErrorBoundary>
            <main id="main-content" className="flex-grow-1 p-0 p-md-3" role="main">
              {children}
            </main>
          </AppErrorBoundary>
          <AccessibilityPanel />
          <LiveRegion />
        </AccessibilityProvider>
      </body>
    </html>
  );
}