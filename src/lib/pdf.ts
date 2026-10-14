/**
 * Geração do PDF A4 da ficha cadastral com pdf-lib.
 *
 * Texto 100% vetorial (fontes Helvetica embutidas) — nada de captura de tela,
 * o PDF sai nítido em qualquer zoom e com caminho de texto selecionável.
 */
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import {
  A4_HEIGHT,
  A4_WIDTH,
  BORDER_INSET,
  FIELDS,
  FOOTER,
  HEADER,
  INSTRUCAO,
  LINE_DROP,
  LINE_GAP,
  PAGE_LEFT,
  RIGHT_EDGE,
  TITULO,
  VALUE_OFFSET,
  type FieldLayout,
} from './layout';
import { cleanText, formatBrDate, slugify, type ChurchConfig, type FichaData } from './ficha';

const BLACK = rgb(0, 0, 0);
const DATE_FIELDS = new Set(['dataNascimento', 'dataBatismo']);

function fieldValue(data: FichaData, key: string): string {
  const raw = (data as unknown as Record<string, string>)[key] ?? '';
  return DATE_FIELDS.has(key) ? formatBrDate(raw) : cleanText(raw);
}

function clipToWidth(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (!text) return '';
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 0 && font.widthOfTextAtSize(`${out}...`, size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return out.length > 0 ? `${out}...` : '';
}

export async function buildFichaPdf(data: FichaData, config: ChurchConfig): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setCreator('Gerador de Fichas Cadastrais');
  doc.setProducer('pdf-lib');
  doc.setTitle(`Ficha cadastral - ${cleanText(data.nomeCompleto) || 'sem nome'}`);
  doc.setSubject('Cadastro de membro');

  const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const { width, height } = page.getSize();

  // Fundo branco (alguns renderizadores tratam página sem fundo como transparente)
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });

  const drawCentered = (text: string, topY: number, size: number, font: PDFFont, underline = false) => {
    const value = cleanText(text);
    if (!value) return;
    const w = font.widthOfTextAtSize(value, size);
    const x = (width - w) / 2;
    const y = height - topY;
    page.drawText(value, { x, y, size, font, color: BLACK });
    if (underline) {
      const uy = y - size * 0.24;
      page.drawLine({
        start: { x, y: uy },
        end: { x: x + w, y: uy },
        thickness: 0.8,
        color: BLACK,
      });
    }
  };

  const drawField = (field: FieldLayout) => {
    const x = field.x ?? PAGE_LEFT;
    const labelSize = field.labelSize ?? 11;
    const valueSize = field.valueSize ?? 11.5;
    const y = height - field.topY;

    page.drawText(field.label, {
      x,
      y,
      size: labelSize,
      font: regular,
      color: BLACK,
    });

    const labelWidth = regular.widthOfTextAtSize(field.label, labelSize);
    const lineX = x + labelWidth + LINE_GAP;
    const lineY = y - LINE_DROP;
    const maxW = Math.max(RIGHT_EDGE - lineX, 60);
    const lineW = Math.min(field.lineW === 'full' ? maxW : field.lineW, maxW);

    page.drawLine({
      start: { x: lineX, y: lineY },
      end: { x: lineX + lineW, y: lineY },
      thickness: 0.9,
      color: BLACK,
    });

    const value = fieldValue(data, field.key);
    if (value) {
      const clipped = clipToWidth(value, bold, valueSize, lineW - VALUE_OFFSET - 2);
      page.drawText(clipped, {
        x: lineX + VALUE_OFFSET,
        y,
        size: valueSize,
        font: bold,
        color: BLACK,
      });
    }
  };

  // Borda da página
  page.drawRectangle({
    x: BORDER_INSET,
    y: BORDER_INSET,
    width: width - BORDER_INSET * 2,
    height: height - BORDER_INSET * 2,
    borderColor: BLACK,
    borderWidth: 1.2,
  });

  // Cabeçalho
  drawCentered(config.igreja, HEADER.igreja.topY, HEADER.igreja.size, bold, true);
  drawCentered(config.ministerio, HEADER.ministerio.topY, HEADER.ministerio.size, bold);
  drawCentered(`End: ${config.endereco}`, HEADER.endereco.topY, HEADER.endereco.size, italic);
  drawCentered(INSTRUCAO, HEADER.instrucao.topY, HEADER.instrucao.size, italic);
  drawCentered(TITULO, HEADER.titulo.topY, HEADER.titulo.size, bold, true);

  // Campos
  for (const field of FIELDS) {
    drawField(field);
  }

  // Rodapé
  drawCentered(`Pastor Presidente: ${config.pastor}`, FOOTER.pastorTopY, FOOTER.pastorSize, regular);

  return doc.save();
}

export function pdfFileName(data: FichaData): string {
  const slug = slugify(data.nomeCompleto);
  return slug ? `ficha-cadastral-${slug}.pdf` : 'ficha-cadastral.pdf';
}

/** Baixa os bytes como arquivo .pdf no navegador. */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
