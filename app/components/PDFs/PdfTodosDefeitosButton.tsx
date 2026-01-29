"use client";

import React from "react";
import PDFGeradorTodosDefeitos from "./PDFGeradorTodosDefeitos";

const PdfTodosDefeitosButton: React.FC = () => {
    return (
        <div className="d-flex align-items-center">
            <PDFGeradorTodosDefeitos />
        </div>
    );
};

export default PdfTodosDefeitosButton;