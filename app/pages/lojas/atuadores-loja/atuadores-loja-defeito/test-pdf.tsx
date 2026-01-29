// Test file to debug PDF generation
"use client";

import React, { useEffect, useState } from "react";
import PdfDefectiveAtuadoresLojasButton from "../../../../components/PDFs/PdfDefectiveAtuadoresLojasButton";

export default function TestPdfPage() {
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        // Simple timeout to ensure components are mounted
        const timer = setTimeout(() => {
            setDataLoaded(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="container py-4">
            <h1>Teste de Geração de PDF</h1>
            <p>Esta página testa o componente de geração de PDF para atuadores com defeito.</p>

            {dataLoaded && (
                <div className="mt-4">
                    <PdfDefectiveAtuadoresLojasButton />
                </div>
            )}

            {!dataLoaded && (
                <p>Carregando componente...</p>
            )}
        </div>
    );
}