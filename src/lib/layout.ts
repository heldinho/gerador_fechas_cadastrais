/**
 * Layout compartilhado da ficha A4.
 *
 * O PDF (`pdf.ts`) e o preview (`FichaPreview.tsx`) leem as MESMAS
 * coordenadas daqui, garantindo que a tela e o arquivo final fiquem iguais.
 *
 * Coordenadas em pontos tipográficos (1 pt = 1/72"), origem no canto
 * inferior esquerdo da página para o PDF; convertemos para "topo" (topY)
 * para facilitar o uso no HTML.
 */
import { cleanText } from './ficha';

export const A4_WIDTH = 595.28; // 210 mm
export const A4_HEIGHT = 841.89; // 297 mm

export const BORDER_INSET = 26;
export const PAGE_LEFT = 52;

export interface FieldLayout {
  key: string;
  label: string;
  /** Distância do topo da página até a linha de base do rótulo */
  topY: number;
  /** Coluna inicial (padrão: PAGE_LEFT) */
  x?: number;
  /** Largura da linha; 'full' estende até a margem direita */
  lineW: number | 'full';
  valueSize?: number;
  labelSize?: number;
}

export const HEADER = {
  igreja: { topY: 62, size: 17, underline: true },
  ministerio: { topY: 92, size: 14, underline: false },
  endereco: { topY: 116, size: 10 },
  instrucao: { topY: 138, size: 8.5 },
  titulo: { topY: 172, size: 13.5 },
} as const;

export const FOOTER = {
  pastorTopY: 792,
  pastorSize: 11,
} as const;

export const INSTRUCAO = 'Por favor, preencher os dados de forma legível e correta usando letras de forma.';

export const TITULO = 'CADASTRO DE MEMBRO:';

export const FIELDS: FieldLayout[] = [
  {
    key: 'nomeCompleto',
    label: 'Nome Completo:',
    topY: 212,
    lineW: 330,
    valueSize: 12,
  },
  {
    key: 'dataNascimento',
    label: 'Data de Nascimento:',
    topY: 244,
    lineW: 210,
  },
  { key: 'rg', label: 'RG:', topY: 276, lineW: 210 },
  { key: 'cpf', label: 'CPF:', topY: 276, x: 318, lineW: 200 },
  { key: 'mae', label: 'Filiação: Mãe:', topY: 308, lineW: 300 },
  { key: 'pai', label: 'Pai:', topY: 340, lineW: 300 },
  { key: 'celular', label: 'Telefone: Celular:', topY: 372, lineW: 200 },
  { key: 'residencial', label: 'Residencial:', topY: 372, x: 380, lineW: 140 },
  { key: 'estadoCivil', label: 'Estado Civil:', topY: 404, lineW: 260 },
  { key: 'conjuge', label: 'Nome do Cônjuge:', topY: 436, lineW: 300 },
  { key: 'endereco', label: 'Endereço:', topY: 468, lineW: 330 },
  { key: 'bairro', label: 'Bairro:', topY: 500, lineW: 300 },
  { key: 'dataBatismo', label: 'Data do Batismo:', topY: 532, lineW: 230 },
  { key: 'posicaoIgreja', label: 'Posição na Igreja:', topY: 564, lineW: 280 },
  { key: 'assinatura', label: 'Assinatura:', topY: 608, lineW: 'full' },
];

export const LINE_GAP = 5; // espaço entre o rótulo e o início da linha
export const LINE_DROP = 2.5; // quanto a linha "desce" abaixo da baseline
export const VALUE_OFFSET = 3; // recuo do valor em relação à linha

/** Margem direita útil (fim das linhas 'full'). */
export const RIGHT_EDGE = A4_WIDTH - BORDER_INSET - 10;

let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }
  return measureCtx;
}

/** Mede texto usando a mesma família do preview (Helvetica/Arial). */
export function measureText(text: string, size: number, weight = 'normal'): number {
  const ctx = getMeasureCtx();
  if (!ctx) return text.length * size * 0.55;
  ctx.font = `${weight} ${size}px Helvetica, Arial, sans-serif`;
  return ctx.measureText(text).width;
}

/** Ponto inicial da linha (após o rótulo) para um campo. */
export function lineStart(field: FieldLayout): number {
  const x = field.x ?? PAGE_LEFT;
  const labelSize = field.labelSize ?? 11;
  return x + measureText(field.label, labelSize) + LINE_GAP;
}

/** Largura efetiva da linha do campo (sempre respeitando a margem direita). */
export function lineWidth(field: FieldLayout): number {
  if (field.lineW === 'full') {
    return Math.max(RIGHT_EDGE - lineStart(field), 80);
  }
  return Math.min(field.lineW, Math.max(RIGHT_EDGE - lineStart(field), 60));
}

/** Trunca texto para caber na largura máxima (usa "..." no fim). */
export function clipText(text: string, size: number, maxWidth: number, weight = 'bold'): string {
  const value = cleanText(text);
  if (!value) return '';
  if (measureText(value, size, weight) <= maxWidth) return value;
  let out = value;
  while (out.length > 0 && measureText(`${out}...`, size, weight) > maxWidth) {
    out = out.slice(0, -1);
  }
  return out.length > 0 ? `${out}...` : '';
}
