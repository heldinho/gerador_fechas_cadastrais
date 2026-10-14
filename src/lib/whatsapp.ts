/**
 * Envio da ficha para o secretário via WhatsApp.
 *
 * 1) Preferência: Web Share API com o PDF anexado (celular/tablet e desktops
 *    com app de WhatsApp — o arquivo vai junto na conversa).
 * 2) Fallback: abre o wa.me com a mensagem resumida pronta para enviar.
 */
import type { ChurchConfig, FichaData } from './ficha';
import { formatBrDate, onlyDigits } from './ficha';
import { buildFichaPdf, pdfFileName } from './pdf';

export type WhatsAppResult = 'shared' | 'fallback' | 'cancelled';

/** Garante o formato 55 + DDD + número usado pelo wa.me. */
export function normalizeWhatsAppNumber(raw: string): string {
  let digits = onlyDigits(raw);
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return digits;
}

export function buildWhatsAppMessage(data: FichaData): string {
  const lines = [`Olá! Segue a ficha cadastral em PDF de *${data.nomeCompleto || '(nome não informado)'}*.`, ''];
  if (data.posicaoIgreja) lines.push(`• Posição: ${data.posicaoIgreja}`);
  if (data.dataNascimento) lines.push(`• Nascimento: ${formatBrDate(data.dataNascimento)}`);
  if (data.dataBatismo) lines.push(`• Batismo: ${formatBrDate(data.dataBatismo)}`);
  if (data.celular) lines.push(`• Celular: ${data.celular}`);
  lines.push('');
  lines.push('Qualquer dúvida, estou à disposição. 🙏');
  return lines.join('\n');
}

export async function sendFichaViaWhatsApp(
  data: FichaData,
  secretaryPhone: string,
  config: ChurchConfig,
): Promise<WhatsAppResult> {
  const bytes = await buildFichaPdf(data, config);
  const file = new File([new Uint8Array(bytes)], pdfFileName(data), {
    type: 'application/pdf',
  });
  const text = buildWhatsAppMessage(data);

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };

  if (typeof navigator.share === 'function' && typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
      // qualquer outro erro cai no fallback do wa.me
    }
  }

  const number = normalizeWhatsAppNumber(secretaryPhone);
  const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return 'fallback';
}
