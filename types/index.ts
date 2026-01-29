// types.ts

// ==================== ENUMS ====================
export enum AtuadorStatus {
  OPERACIONAL = "OPERACIONAL",
  DEFEITO = "DEFEITO",
  MANUTENCAO = "MANUTENCAO",
  DESCONHECIDO = "DESCONHECIDO",
}

export enum SensorStatus {
  OPERACIONAL = "OPERACIONAL",
  DEFEITO = "DEFEITO",
  MANUTENCAO = "MANUTENCAO",
  DESCONHECIDO = "DESCONHECIDO",
}

export enum SensorTemperaturaStatus {
  OPERACIONAL = "OPERACIONAL",
  DEFEITO = "DEFEITO",
  N_A = "N_A",
}

export enum SensorUmidadeStatus {
  OPERACIONAL = "OPERACIONAL",
  DEFEITO = "DEFEITO",
  N_A = "N_A",
}

export enum CorretivasStatus {
  ANDAMENTO = "ANDAMENTO",
  ESPERA = "ESPERA",
  CONCLUIDO = "CONCLUIDO",
}

export enum EquipamentoStatus {
  OPERACIONAL = "OPERACIONAL",
  DEFEITO = "DEFEITO",
  MANUTENCAO = "MANUTENCAO",
  DESATIVADO = "DESATIVADO",
  DESCONHECIDO = "DESCONHECIDO",
}

// ==================== INTERFACES ====================
export interface Cm {
  id: string;
  nome: string;
  localizacao: string;
  equipamentos?: Equipamento[];
}

export interface Equipamento {
  id: string;
  nome: string;
  descricao?: string;
  cmId: string;
  status?: EquipamentoStatus;
  cm?: Cm;
  atuadores?: Atuador[];
  sensores?: Sensor[];
  imagePaths?: string; // JSON array of image paths
}

export interface Atuador {
  id: string;
  nome: string;
  tipo: string;
  equipamentoId: string;
  equipamento?: Equipamento;
  valorAtual?: number;
  descricaoDefeito?: string;
  estado: AtuadorStatus;
  imagePaths?: string; // JSON array of image paths
}

export interface Sensor {
  id: string;
  nome: string;
  tipo: string; // obrigatório agora
  valorAtual?: number;
  equipamentoId: string;
  equipamento?: Equipamento;
  estado?: SensorStatus;
  descricaoDefeito?: string;
  imagePaths?: string; // JSON array of image paths
}

// ==================== CORRETIVAS ====================
export interface Local {
  id: string;
  nome: string;
}

export interface Corretiva {
  id: string;
  data: string;
  descricao: string;
  local: string;
  colaborador?: string;
  solicitacao: string;
  solicitante: string;
  status: CorretivasStatus;
  dataConclusao?: string;
  sistema?: string;
  categoria?: string;
  formaCorrecao?: string;
  fotoUrls: string[];
}

export type FormDataCorretiva = Omit<Corretiva, "id"> & {
  file?: File | null;
};

export interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
}

// ==================== LOJAS ====================
export interface Loja {
  id: string;
  nome: string;
  LUC: string;
  localizacao?: string;
  smart?: string;
  idKron?: string;
  imagem?: string; // URL to the loja layout image
  equipamentosLoja?: EquipamentoLoja[];
  atuadores?: AtuadorLoja[];
  sensores?: SensorLoja[];
  fireDetectionEquipment?: FireDetectionEquipmentLoja[];
}

export interface FireDetectionEquipmentLoja {
  id: string;
  nome: string;
  tipo: string;
  modelo?: string;
  existe: boolean;
  lojaId: string;
  comissionada: boolean;
  tipoLoja: string;
  lacoDetec: string;
  v24Dc2: boolean;
  stGas: boolean;
  cmdAlarme: boolean;
  stAlarme: boolean;
  stFalha: boolean;
  loja?: Loja;
}

export interface EquipamentoLoja {
  id: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  lojaId: string;
  smart?: string;
  status?: "OPERACIONAL" | "MANUTENCAO" | "DESATIVADO" | "DESCONHECIDO" | "DEFEITO";
  descricaoDefeito?: string; // Observation/notes field
  atuadoresLoja?: AtuadorLoja[];
  sensoresLoja?: SensorLoja[];
  imagePaths?: string; // JSON array of image paths
}

export interface AtuadorLoja {
  id: string;
  nome: string;
  tipo: string;
  equipamentoLojaId?: string;
  lojaId?: string;
  valorAtual?: number;
  estado?: AtuadorStatus;
  descricaoDefeito?: string;
  existe?: boolean;
  motivoNaoExiste?: string;
  imagePaths?: string; // JSON array of image paths
}

export interface AtuadorDefeitoLojasCompleto {
  id: string;
  nome: string;
  tipo: string;
  descricaoDefeito?: string;
  existe?: boolean;
  motivoNaoExiste?: string;
  estado?: string;
  valorAtual?: number;
  equipamentoNome?: string;
  lojaNome: string;
  lojaLUC: string;
  lojaLocalizacao?: string;
}

export interface SensorLoja {
  id: string;
  nome: string;
  tipo: string;
  equipamentoLojaId?: string;
  lojaId?: string;
  valorAtual?: number;
  estado?: SensorStatus;
  ultimaAtivacao?: string;
  existe?: boolean;
  motivoNaoExiste?: string;
  descricaoDefeito?: string;
  imagePaths?: string; // JSON array of image paths
}

export interface SensorDefeitoCompleto {
  id: string;
  nome: string;
  tipo: string;
  descricaoDefeito?: string;
  existe?: boolean;
  motivoNaoExiste?: string;
  estado?: SensorStatus;
  valorAtual?: number;
  ultimaAtivacao?: string;
  equipamentoNome?: string;
  lojaNome: string;
  lojaLUC: string;
  lojaLocalizacao?: string;
}

export interface FotoCorretiva {
  id: string;
  url: string;
}

export interface CorretivaConcluida {
  id: string;
  data: string;
  descricao: string;
  local: string;
  colaborador: string;
  solicitacao: string;
  solicitante: string;
  status: "ANDAMENTO" | "ESPERA" | "CONCLUIDO";
  dataConclusao?: string | null;
  sistema?: string;
  categoria?: string;
  formaCorrecao?: string;
  fotos?: FotoCorretiva[];
}

// ==================== CVF ====================
export interface Cvf {
  id: string;
  vigaFria?: string;
  piso?: string;
  sensorTemperatura?: SensorTemperaturaStatus;
  sensorUmidade?: SensorUmidadeStatus;
  localizacaoQuadro?: string;
  localizacaoValvula?: string;
  atuador?: string;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
  imagePaths?: string; // JSON array of image paths
}