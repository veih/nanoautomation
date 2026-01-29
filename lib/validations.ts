/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/validations.ts
import { z } from 'zod';
import { AtuadorStatus, SensorStatus, CorretivasStatus } from '../types';

// ==================== CMS VALIDATIONS ====================
export const cmSchema = z.object({
    nome: z.string()
        .min(1, 'Nome da CM é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Nome contém caracteres inválidos'),
    localizacao: z.string()
        .min(1, 'Localização é obrigatória')
        .max(100, 'Localização deve ter no máximo 100 caracteres'),
});

export const equipamentoSchema = z.object({
    nome: z.string()
        .min(1, 'Nome do equipamento é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    descricao: z.string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .optional(),
    cmId: z.string().uuid('ID da CM deve ser um UUID válido'),
});

export const atuadorSchema = z.object({
    nome: z.string()
        .min(1, 'Nome do atuador é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    tipo: z.string()
        .min(1, 'Tipo do atuador é obrigatório')
        .max(50, 'Tipo deve ter no máximo 50 caracteres'),
    equipamentoId: z.string().uuid('ID do equipamento deve ser um UUID válido'),
    valorAtual: z.number()
        .min(0, 'Valor atual deve ser positivo')
        .optional(),
    descricaoDefeito: z.string()
        .max(500, 'Descrição do defeito deve ter no máximo 500 caracteres')
        .optional(),
    estado: z.nativeEnum(AtuadorStatus).default(AtuadorStatus.OPERACIONAL),
});

export const sensorSchema = z.object({
    nome: z.string()
        .min(1, 'Nome do sensor é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    tipo: z.string()
        .min(1, 'Tipo do sensor é obrigatório')
        .max(50, 'Tipo deve ter no máximo 50 caracteres'),
    equipamentoId: z.string().uuid('ID do equipamento deve ser um UUID válido'),
    valorAtual: z.number()
        .min(0, 'Valor atual deve ser positivo')
        .optional(),
    descricaoDefeito: z.string()
        .max(500, 'Descrição do defeito deve ter no máximo 500 caracteres')
        .optional(),
    estado: z.nativeEnum(SensorStatus).default(SensorStatus.OPERACIONAL),
});

// ==================== LOJAS VALIDATIONS ====================
export const lojaSchema = z.object({
    nome: z.string()
        .min(1, 'Nome da loja é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    LUC: z.string()
        .min(1, 'LUC é obrigatório')
        .max(20, 'LUC deve ter no máximo 20 caracteres')
        .regex(/^[A-Z0-9]+$/, 'LUC deve conter apenas letras maiúsculas e números'),
    localizacao: z.string()
        .max(200, 'Localização deve ter no máximo 200 caracteres')
        .optional(),
    smart: z.string()
        .max(50, 'Smart deve ter no máximo 50 caracteres')
        .optional(),
    idKron: z.string()
        .max(50, 'ID Kron deve ter no máximo 50 caracteres')
        .optional(),
});

export const equipamentoLojaSchema = z.object({
    nome: z.string()
        .min(1, 'Nome do equipamento é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    descricao: z.string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .optional(),
    lojaId: z.string().uuid('ID da loja deve ser um UUID válido'),
    smart: z.string()
        .max(50, 'Smart deve ter no máximo 50 caracteres')
        .optional(),
    status: z.enum(['OPERACIONAL', 'MANUTENCAO', 'DESATIVADO', 'DESCONHECIDO']).default('OPERACIONAL'),
});

export const atuadorLojaSchema = z.object({
    nome: z.string()
        .min(1, 'Nome do atuador é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    tipo: z.string()
        .min(1, 'Tipo do atuador é obrigatório')
        .max(50, 'Tipo deve ter no máximo 50 caracteres'),
    lojaId: z.string().uuid('ID da loja deve ser um UUID válido').optional(),
    equipamentoLojaId: z.string().uuid('ID do equipamento deve ser um UUID válido').optional(),
    valorAtual: z.number()
        .min(0, 'Valor atual deve ser positivo')
        .optional(),
    estado: z.nativeEnum(AtuadorStatus).default(AtuadorStatus.OPERACIONAL),
});

export const sensorLojaSchema = z.object({
    nome: z.string()
        .min(1, 'Nome do sensor é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    tipo: z.string()
        .min(1, 'Tipo do sensor é obrigatório')
        .max(50, 'Tipo deve ter no máximo 50 caracteres'),
    lojaId: z.string().uuid('ID da loja deve ser um UUID válido').optional(),
    equipamentoLojaId: z.string().uuid('ID do equipamento deve ser um UUID válido').optional(),
    estado: z.nativeEnum(SensorStatus).default(SensorStatus.OPERACIONAL),
});

// ==================== CORRETIVAS VALIDATIONS ====================
export const corretivaSchema = z.object({
    descricao: z.string()
        .min(10, 'Descrição deve ter pelo menos 10 caracteres')
        .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
    local: z.string()
        .min(1, 'Local é obrigatório')
        .max(200, 'Local deve ter no máximo 200 caracteres'),
    colaborador: z.string()
        .max(100, 'Nome do colaborador deve ter no máximo 100 caracteres')
        .optional(),
    solicitacao: z.string()
        .min(5, 'Solicitação deve ter pelo menos 5 caracteres')
        .max(500, 'Solicitação deve ter no máximo 500 caracteres'),
    solicitante: z.string()
        .min(1, 'Solicitante é obrigatório')
        .max(100, 'Nome do solicitante deve ter no máximo 100 caracteres'),
    status: z.nativeEnum(CorretivasStatus).default(CorretivasStatus.ESPERA),
    data: z.string().datetime('Data deve estar em formato ISO válido'),
    dataConclusao: z.string().datetime('Data de conclusão deve estar em formato ISO válido').optional(),
    sistema: z.string()
        .max(50, 'Sistema deve ter no máximo 50 caracteres')
        .optional(),
    categoria: z.string()
        .max(100, 'Categoria deve ter no máximo 100 caracteres')
        .optional(),
    formaCorrecao: z.string()
        .max(2000, 'Forma de correção deve ter no máximo 2000 caracteres')
        .optional(),
});

export const colaboradorSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    funcao: z.string()
        .min(1, 'Função é obrigatória')
        .max(100, 'Função deve ter no máximo 100 caracteres'),
});

// ==================== UPDATE SCHEMAS ====================
export const cmUpdateSchema = cmSchema.partial();
export const equipamentoUpdateSchema = equipamentoSchema.partial();
export const atuadorUpdateSchema = atuadorSchema.partial();
export const sensorUpdateSchema = sensorSchema.partial();
export const lojaUpdateSchema = lojaSchema.partial();
export const equipamentoLojaUpdateSchema = equipamentoLojaSchema.partial();
export const atuadorLojaUpdateSchema = atuadorLojaSchema.partial();
export const sensorLojaUpdateSchema = sensorLojaSchema.partial();
export const corretivaUpdateSchema = corretivaSchema.partial();
export const colaboradorUpdateSchema = colaboradorSchema.partial();

// ==================== FILTER SCHEMAS ====================
export const filterSchema = z.object({
    search: z.string().max(100).optional(),
    status: z.string().optional(),
    location: z.string().max(100).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});

// ==================== HELPER FUNCTIONS ====================
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
    try {
        const validData = schema.parse(data);
        return { success: true, data: validData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
            return { success: false, errors };
        }
        return { success: false, errors: ['Erro de validação desconhecido'] };
    }
};

export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
    const errors: Record<string, string> = {};
    error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
    });
    return errors;
};