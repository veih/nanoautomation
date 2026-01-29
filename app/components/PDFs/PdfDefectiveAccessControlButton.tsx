"use client";

import React, { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PDFGeradorAccessControlDefeito from "./PDFGeradorAccessControlDefeito";
import { AccessController, RequestButton, Electromagnet, MagneticSensor } from "../../../types/accessControl";

interface PdfDefectiveAccessControlButtonProps {
    devices: {
        controllers: AccessController[];
        buttons: RequestButton[];
        electromagnets: Electromagnet[];
        sensors: MagneticSensor[];
    } | null;
}

const PdfDefectiveAccessControlButton: React.FC<PdfDefectiveAccessControlButtonProps> = ({ devices }) => {
    const [showPdfGenerator, setShowPdfGenerator] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        if (devices) {
            setIsDataLoaded(true);
        }
    }, [devices]);

    const handleGeneratePdf = () => {
        if (!isDataLoaded || !devices) {
            toast.error("Dados ainda estão sendo carregados. Por favor, aguarde.");
            return;
        }
        setShowPdfGenerator(true);
    };

    // Close the PDF generator
    const handleClosePdfGenerator = () => {
        setShowPdfGenerator(false);
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />
            <Button
                variant="danger"
                disabled={!isDataLoaded}
                onClick={handleGeneratePdf}
                className="d-flex align-items-center"
            >
                {!isDataLoaded ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                        />
                        <span>Carregando Dados...</span>
                    </>
                ) : (
                    <>
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        <span>PDF dos Dispositivos com Defeito</span>
                    </>
                )}
            </Button>

            {showPdfGenerator && devices && (
                <div className="modal-backdrop show" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1050,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '5px',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        overflow: 'auto'
                    }}>
                        <div className="modal-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                        }}>
                            <h5>Gerar PDF dos Dispositivos com Defeito</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleClosePdfGenerator}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <PDFGeradorAccessControlDefeito devices={devices} onClose={handleClosePdfGenerator} />
                    </div>
                </div>
            )}
        </>
    );
};

export default PdfDefectiveAccessControlButton;