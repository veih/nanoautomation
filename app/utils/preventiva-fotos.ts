// app/utils/preventiva-fotos.ts
// Utility functions for handling preventive maintenance photos in C:\preventivas

import fs from 'fs';
import path from 'path';

export interface FotoInfo {
    nomeArquivo: string;
    caminhoCompleto: string;
    tamanho: number;
    dataModificacao: Date;
    tipoEquipamento: string;
    lojaLUC: string;
}

/**
 * Lists all LUC folders in C:\preventivas
 */
export function listarLUCs(): string[] {
    const basePath = 'C:\\preventivas';

    try {
        if (!fs.existsSync(basePath)) {
            return [];
        }

        const items = fs.readdirSync(basePath);
        return items.filter(item => {
            const itemPath = path.join(basePath, item);
            return fs.statSync(itemPath).isDirectory() && item.startsWith('LUC');
        }).sort();
    } catch (error) {
        console.error('Error listing LUCs:', error);
        return [];
    }
}

/**
 * Lists all equipment types for a specific LUC
 */
export function listarTiposEquipamento(lojaLUC: string): string[] {
    const lucPath = `C:\\preventivas\\${lojaLUC}`;

    try {
        if (!fs.existsSync(lucPath)) {
            return [];
        }

        const items = fs.readdirSync(lucPath);
        return items.filter(item => {
            const itemPath = path.join(lucPath, item);
            return fs.statSync(itemPath).isDirectory();
        });
    } catch (error) {
        console.error(`Error listing equipment types for ${lojaLUC}:`, error);
        return [];
    }
}

/**
 * Gets all photos for a specific LUC and equipment type
 */
export function getFotosPorLUCeTipo(
    lojaLUC: string,
    tipoEquipamento: string
): FotoInfo[] {
    const tipoPath = `C:\\preventivas\\${lojaLUC}\\${tipoEquipamento}`;

    try {
        if (!fs.existsSync(tipoPath)) {
            return [];
        }

        const files = fs.readdirSync(tipoPath);
        return files
            .filter(file => {
                const filePath = path.join(tipoPath, file);
                const stat = fs.statSync(filePath);
                return stat.isFile() &&
                    (file.toLowerCase().endsWith('.jpg') ||
                        file.toLowerCase().endsWith('.jpeg') ||
                        file.toLowerCase().endsWith('.png'));
            })
            .map(file => {
                const filePath = path.join(tipoPath, file);
                const stat = fs.statSync(filePath);

                return {
                    nomeArquivo: file,
                    caminhoCompleto: filePath,
                    tamanho: stat.size,
                    dataModificacao: stat.mtime,
                    tipoEquipamento: tipoEquipamento,
                    lojaLUC: lojaLUC
                };
            })
            .sort((a, b) => b.dataModificacao.getTime() - a.dataModificacao.getTime());
    } catch (error) {
        console.error(`Error getting photos for ${lojaLUC}/${tipoEquipamento}:`, error);
        return [];
    }
}

/**
 * Gets all photos for a specific LUC (all equipment types)
 */
export function getTodasFotosPorLUC(lojaLUC: string): FotoInfo[] {
    const tipos = listarTiposEquipamento(lojaLUC);
    const todasFotos: FotoInfo[] = [];

    tipos.forEach(tipo => {
        const fotos = getFotosPorLUCeTipo(lojaLUC, tipo);
        todasFotos.push(...fotos);
    });

    return todasFotos.sort((a, b) => b.dataModificacao.getTime() - a.dataModificacao.getTime());
}

/**
 * Creates the folder structure for a new LUC
 */
export function criarEstruturaLUC(lojaLUC: string): boolean {
    const tiposEquipamento = [
        'SENSOR_TEMPERATURA',
        'SENSOR_MOVIMENTO',
        'BOTAO_PANICO',
        'QUADRO_AUTOMACAO'
    ];

    try {
        tiposEquipamento.forEach(tipo => {
            const dirPath = `C:\\preventivas\\${lojaLUC}\\${tipo}`;
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`Created directory: ${dirPath}`);
            }
        });
        return true;
    } catch (error) {
        console.error(`Error creating structure for ${lojaLUC}:`, error);
        return false;
    }
}

/**
 * Gets total statistics for all LUCs
 */
export function getEstatisticasFotos(): {
    totalLUCs: number;
    totalFotos: number;
    fotosPorTipo: Record<string, number>;
    ultimaFoto: Date | null;
} {
    const lucs = listarLUCs();
    let totalFotos = 0;
    const fotosPorTipo: Record<string, number> = {};
    let ultimaFoto: Date | null = null;

    lucs.forEach(luc => {
        const tipos = listarTiposEquipamento(luc);
        tipos.forEach(tipo => {
            const fotos = getFotosPorLUCeTipo(luc, tipo);
            totalFotos += fotos.length;
            fotosPorTipo[tipo] = (fotosPorTipo[tipo] || 0) + fotos.length;

            fotos.forEach(foto => {
                if (!ultimaFoto || foto.dataModificacao > ultimaFoto) {
                    ultimaFoto = foto.dataModificacao;
                }
            });
        });
    });

    return {
        totalLUCs: lucs.length,
        totalFotos,
        fotosPorTipo,
        ultimaFoto
    };
}

/**
 * Checks if a photo file exists
 */
export function fotoExiste(caminhoCompleto: string): boolean {
    return fs.existsSync(caminhoCompleto);
}

/**
 * Gets file information for a specific photo
 */
export function getInfoFoto(caminhoCompleto: string): FotoInfo | null {
    try {
        if (!fs.existsSync(caminhoCompleto)) {
            return null;
        }

        const stat = fs.statSync(caminhoCompleto);
        const pathParts = caminhoCompleto.split(path.sep);

        return {
            nomeArquivo: path.basename(caminhoCompleto),
            caminhoCompleto: caminhoCompleto,
            tamanho: stat.size,
            dataModificacao: stat.mtime,
            tipoEquipamento: pathParts[pathParts.length - 2] || '',
            lojaLUC: pathParts[pathParts.length - 3] || ''
        };
    } catch (error) {
        console.error(`Error getting info for photo ${caminhoCompleto}:`, error);
        return null;
    }
}