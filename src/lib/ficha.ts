/**
 * Tipos, constantes, máscaras e persistência da ficha cadastral.
 */

export interface FichaData {
  nomeCompleto: string;
  dataNascimento: string; // yyyy-mm-dd
  rg: string;
  cpf: string;
  mae: string;
  pai: string;
  celular: string;
  residencial: string;
  estadoCivil: string;
  conjuge: string;
  endereco: string;
  bairro: string;
  dataBatismo: string; // yyyy-mm-dd
  posicaoIgreja: string;
}

export interface ChurchConfig {
  igreja: string;
  ministerio: string;
  endereco: string;
  pastor: string;
}

export const ESTADOS_CIVIS = ['Solteiro(a)', 'Casado(a)', 'União estável', 'Divorciado(a)', 'Viúvo(a)'] as const;

export const POSICOES_IGREJA = [
  'Membro',
  'Doulos(a)',
  'Líder',
  'Diacono(a)',
  'Presbítero(a)',
  'Pastor(a)',
  'Evangelista',
  'Missionário(a)',
  'Catequista',
  'Cônjuge',
  'Outro',
] as const;

export const POSICAO_OUTRO = 'Outro';

export const DEFAULT_CHURCH: ChurchConfig = {
  igreja: 'Nome da igreja',
  ministerio: 'Nome do ministério',
  endereco: 'Endereço da igreja',
  pastor: 'Nome do pastor',
};

export const EMPTY_FICHA: FichaData = {
  nomeCompleto: '',
  dataNascimento: '',
  rg: '',
  cpf: '',
  mae: '',
  pai: '',
  celular: '',
  residencial: '',
  estadoCivil: '',
  conjuge: '',
  endereco: '',
  bairro: '',
  dataBatismo: '',
  posicaoIgreja: '',
};

/* ------------------------------------------------------------------ */
/* Máscaras e formatação                                               */
/* ------------------------------------------------------------------ */

export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export function maskCpf(raw: string): string {
  const d = onlyDigits(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Máscara brasileira: (00) 0000-0000 ou (00) 00000-0000 */
export function maskPhone(raw: string): string {
  const d = onlyDigits(raw).slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** yyyy-mm-dd -> dd/mm/yyyy */
export function formatBrDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Normaliza texto para exibição/PDF: remove quebras e espaços duplos. */
export function cleanText(value: string): string {
  return (value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ------------------------------------------------------------------ */
/* Persistência (localStorage)                                         */
/* ------------------------------------------------------------------ */

const DRAFT_KEY = 'ficha.rascunho.v1';
const CHURCH_KEY = 'ficha.igreja.v1';
const SECRETARY_KEY = 'ficha.secretario.whatsapp.v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadDraft(): Partial<FichaData> | null {
  if (typeof localStorage === 'undefined') return null;
  return safeParse<Partial<FichaData>>(localStorage.getItem(DRAFT_KEY));
}

export function saveDraft(data: Partial<FichaData>): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    /* modo privado / cota excedida — ignora */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignora */
  }
}

export function loadChurchConfig(): ChurchConfig {
  const stored = safeParse<Partial<ChurchConfig>>(
    typeof localStorage !== 'undefined' ? localStorage.getItem(CHURCH_KEY) : null,
  );
  return { ...DEFAULT_CHURCH, ...(stored ?? {}) };
}

export function saveChurchConfig(config: ChurchConfig): void {
  try {
    localStorage.setItem(CHURCH_KEY, JSON.stringify(config));
  } catch {
    /* ignora */
  }
}

export function loadSecretaryPhone(): string {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem(SECRETARY_KEY) ?? '';
}

export function saveSecretaryPhone(phone: string): void {
  try {
    localStorage.setItem(SECRETARY_KEY, phone);
  } catch {
    /* ignora */
  }
}
