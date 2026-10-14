import { useEffect, useRef, useState } from 'react';
import {
  A4_HEIGHT,
  A4_WIDTH,
  BORDER_INSET,
  FIELDS,
  FOOTER,
  HEADER,
  INSTRUCAO,
  LINE_DROP,
  TITULO,
  VALUE_OFFSET,
  clipText,
  lineStart,
  lineWidth,
} from '@/lib/layout';
import { cleanText, formatBrDate, type ChurchConfig, type FichaData } from '@/lib/ficha';

const FONT_STACK = 'Helvetica, Arial, sans-serif';
const DATE_FIELDS = new Set(['dataNascimento', 'dataBatismo']);

interface Props {
  data: FichaData;
  config: ChurchConfig;
}

/**
 * Réplica em HTML do PDF A4, na mesma escala (595,28 x 841,89 pt).
 * Usa as mesmas coordenadas de `lib/layout.ts` do gerador de PDF.
 */
export function FichaPreview({ data, config }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) setScale(width / A4_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full">
      <div
        className="relative overflow-hidden bg-white shadow-lg ring-1 ring-black/10 print:shadow-none"
        style={{ aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}` }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left text-black"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            transform: `scale(${scale})`,
            fontFamily: FONT_STACK,
          }}
        >
          {/* Borda da página */}
          <div
            className="absolute border border-black"
            style={{
              left: BORDER_INSET,
              top: BORDER_INSET,
              width: A4_WIDTH - BORDER_INSET * 2,
              height: A4_HEIGHT - BORDER_INSET * 2,
            }}
          />

          {/* Cabeçalho */}
          <CenteredText
            text={cleanText(config.igreja)}
            topY={HEADER.igreja.topY}
            size={HEADER.igreja.size}
            weight={700}
            underline
          />
          <CenteredText
            text={cleanText(config.ministerio)}
            topY={HEADER.ministerio.topY}
            size={HEADER.ministerio.size}
            weight={700}
          />
          <CenteredText
            text={`End: ${config.endereco}`}
            topY={HEADER.endereco.topY}
            size={HEADER.endereco.size}
            italic
          />
          <CenteredText text={INSTRUCAO} topY={HEADER.instrucao.topY} size={HEADER.instrucao.size} italic />
          <CenteredText text={TITULO} topY={HEADER.titulo.topY} size={HEADER.titulo.size} weight={700} underline />

          {/* Campos */}
          {FIELDS.map(field => {
            const raw = (data as unknown as Record<string, string>)[field.key] ?? '';
            const value = DATE_FIELDS.has(field.key) ? formatBrDate(raw) : cleanText(raw);
            const labelSize = field.labelSize ?? 11;
            const valueSize = field.valueSize ?? 11.5;
            const x = field.x ?? 52;
            const start = lineStart(field);
            const w = lineWidth(field);

            return (
              <div key={field.key}>
                <span
                  className="absolute whitespace-nowrap leading-none"
                  style={{
                    left: x,
                    top: field.topY - labelSize * 0.82,
                    fontSize: labelSize,
                  }}
                >
                  {field.label}
                </span>
                <div
                  className="absolute border-b border-black"
                  style={{ left: start, top: field.topY + LINE_DROP, width: w }}
                />
                {value ? (
                  <span
                    className="absolute block overflow-hidden whitespace-nowrap font-bold leading-none"
                    style={{
                      left: start + VALUE_OFFSET,
                      top: field.topY - valueSize * 0.82,
                      width: w - VALUE_OFFSET - 2,
                      fontSize: valueSize,
                    }}
                  >
                    {clipText(value, valueSize, w - VALUE_OFFSET - 2)}
                  </span>
                ) : null}
              </div>
            );
          })}

          {/* Rodapé */}
          <CenteredText
            text={`Pastor Presidente: ${config.pastor}`}
            topY={FOOTER.pastorTopY}
            size={FOOTER.pastorSize}
          />
        </div>
      </div>
    </div>
  );
}

interface CenteredTextProps {
  text: string;
  topY: number;
  size: number;
  weight?: number;
  italic?: boolean;
  underline?: boolean;
}

function CenteredText({ text, topY, size, weight, italic, underline }: CenteredTextProps) {
  return (
    <div
      className="absolute w-full whitespace-nowrap text-center leading-none"
      style={{
        top: topY - size * 0.82,
        fontSize: size,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : undefined,
        textDecoration: underline ? 'underline' : undefined,
        textUnderlineOffset: size * 0.24,
        textDecorationThickness: Math.max(size * 0.05, 0.6),
      }}
    >
      {text}
    </div>
  );
}
