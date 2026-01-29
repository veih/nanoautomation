/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOGO_BASE64 } from "@/app/img/logoBase64";

// Helper function to display status in a readable format
export const formatStatus = (status: string) => {
    switch (status) {
        case "OPERACIONAL":
            return "Operacional";
        case "DEFEITO":
            return "Defeito";
        case "MANUTENCAO":
            return "Manutenção";
        case "N_A":
            return "N/A";
        default:
            return status;
    }
};

// Function to add page header to PDF
export const addPageHeader = (doc: any, pageNum: number, title: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8;
    const logoHeaderWidth = 60;
    const logoHeaderHeight = 20;
    const logoHeaderX = margin;
    const logoHeaderY = margin;
    const watermarkWidth = 200;
    const watermarkHeight = 100;
    const watermarkX = (pageWidth - watermarkWidth) / 2;
    const watermarkY = (pageHeight - watermarkHeight) / 2;
    const watermarkOpacity = 0.1;

    if (
        LOGO_BASE64 &&
        LOGO_BASE64.length > 50 &&
        LOGO_BASE64.startsWith("data:image")
    ) {
        doc.addImage(
            LOGO_BASE64,
            "PNG",
            logoHeaderX,
            logoHeaderY,
            logoHeaderWidth,
            logoHeaderHeight
        );
        const GState = (doc as any).GState || doc.GState;
        doc.saveGraphicsState();
        doc.setGState(new GState({ opacity: watermarkOpacity }));
        doc.addImage(
            LOGO_BASE64,
            "PNG",
            watermarkX,
            watermarkY,
            watermarkWidth,
            watermarkHeight
        );
        doc.restoreGraphicsState();
    } else {
        console.warn(
            "Logo Base64 não encontrado ou é inválido. O logo e a marca d'água não serão adicionados."
        );
    }

    // Position the title below the logo
    const titleY = logoHeaderY + logoHeaderHeight + 10; // 10px spacing below logo

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text(title, pageWidth / 2, titleY, {
        align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const fortzLocaleString = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Fortaleza",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    // Position the date and page number below the title
    const infoY = titleY + 15; // 15px spacing below title
    doc.text(`Gerado em: ${fortzLocaleString}`, margin, infoY);
    doc.text(`Página ${pageNum}`, pageWidth - margin, infoY, {
        align: "right",
    });

    doc.setTextColor(0, 0, 0);
    // Return the Y position for the next content
    return infoY + 10; // 10px spacing below the info text
};

// Function to add footer to PDF
export const addFooter = (doc: any) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8;
    const footerY = pageHeight - 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    doc.text("NANOAUTOMATION - Your Road to the Future", margin, footerY);
    doc.text(
        `Fone: +55 (11) 3647-6266 | E-mail: contato@nanoautomation.com.br`,
        margin,
        footerY + 4
    );
    doc.text(
        `CNPJ: 08.316.992-0001-72 | Site: www.nanoautomation.com.br`,
        margin,
        footerY + 8
    );
    doc.text(
        `Av Queiroz Filho, 1700-Torre E-303/304 | CEP: 05319-000 Vila Leopoldina São Paulo/SP`,
        margin,
        footerY + 12
    );
    doc.setTextColor(0, 0, 0);
};

// Function to convert image URL to base64 with better error handling
export const imageUrlToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        // For same-origin requests, we can use fetch
        if (url.startsWith('/') || url.includes(window.location.origin)) {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (typeof reader.result === 'string') {
                            resolve(reader.result);
                        } else {
                            reject(new Error('Failed to convert blob to base64'));
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                })
                .catch(reject);
        } else {
            // For cross-origin requests, use the image approach
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Maintain aspect ratio while setting dimensions
                const maxWidth = 300;
                const maxHeight = 60;
                let width = img.width;
                let height = img.height;

                // Calculate scaling
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                try {
                    const dataURL = canvas.toDataURL("image/jpeg", 0.85); // Increased quality from 0.8 to 0.85
                    resolve(dataURL);
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = reject;
            img.src = url;
        }
    });
};
