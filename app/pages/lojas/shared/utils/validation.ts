"use client";

// ==================== IMPORTS ====================
import { z } from "zod";
import {
  AtuadorStatus,
  SensorStatus,
} from "../../../../../types";

// ==================== VALIDATION SCHEMAS ====================
// Extended validation schemas for loja entities
export const lojaFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  LUC: z.string()
    .min(1, "LUC é obrigatório")
    .max(20, "LUC deve ter no máximo 20 caracteres")
    .regex(/^[A-Z0-9]+$/, "LUC deve conter apenas letras maiúsculas e números"),
  localizacao: z.string().optional(),
  smart: z.string().optional(),
  idKron: z.string().optional(),
});

export const atuadorLojaFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  estado: z.nativeEnum(AtuadorStatus).default(AtuadorStatus.OPERACIONAL),
  lojaId: z.string().min(1, "Loja é obrigatória"),
  valorAtual: z.number().optional(),
  descricaoDefeito: z.string().optional(), // Observation/notes field
});

// Sensor-specific status enums union type
const sensorStatusUnion = z.nativeEnum(SensorStatus);

export const sensorLojaFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  estado: sensorStatusUnion.default(SensorStatus.OPERACIONAL),
  lojaId: z.string().min(1, "Loja é obrigatória"),
  descricaoDefeito: z.string().optional(), // Observation/notes field
});

export const equipamentoLojaFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  descricaoDefeito: z.string().optional(), // Observation/notes field
  status: z.enum(["OPERACIONAL", "MANUTENCAO", "DESATIVADO", "DESCONHECIDO"]).default("OPERACIONAL"),
  lojaId: z.string().min(1, "Loja é obrigatória"),
});

// Fire Detection Equipment schema
export const fireDetectionEquipmentFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  modelo: z.string().optional(),
  existe: z.boolean().default(true),
  lojaId: z.string().min(1, "Loja é obrigatória"),
  comissionada: z.boolean().default(false),
  tipoLoja: z.string().optional(),
  lacoDetec: z.string().optional(),
  v24Dc2: z.boolean().default(false),
  stGas: z.boolean().default(false),
  cmdAlarme: z.boolean().default(false),
  stAlarme: z.boolean().default(false),
  stFalha: z.boolean().default(false),
});

// ==================== TYPE DEFINITIONS ====================
// Type definitions for forms
export type LojaFormData = z.infer<typeof lojaFormSchema>;
export type AtuadorLojaFormData = z.infer<typeof atuadorLojaFormSchema>;
export type SensorLojaFormData = z.infer<typeof sensorLojaFormSchema>;
export type EquipamentoLojaFormData = z.infer<typeof equipamentoLojaFormSchema>;
export type FireDetectionEquipmentFormData = z.infer<typeof fireDetectionEquipmentFormSchema>;