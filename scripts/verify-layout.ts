/**
 * Verificações do layout e smoke test de renderização.
 * Uso: npx tsx scripts/verify-layout.ts
 */
import {
  A4_HEIGHT,
  FIELDS,
  RIGHT_EDGE,
  lineStart,
  lineWidth,
} from "../src/lib/layout";
import {
  normalizeWhatsAppNumber,
  buildWhatsAppMessage,
} from "../src/lib/whatsapp";
import { maskCpf, maskPhone, formatBrDate } from "../src/lib/ficha";

let failures = 0;

function check(name: string, ok: boolean, detail = "") {
  if (!ok) {
    failures++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/* 1. Nenhuma linha ultrapassa a margem direita */
for (const field of FIELDS) {
  const end = lineStart(field) + lineWidth(field);
  check(
    `linha de "${field.label}" dentro da margem`,
    end <= RIGHT_EDGE + 0.5,
    `fim=${end.toFixed(1)} limite=${RIGHT_EDGE}`,
  );
}

/* 2. Campos na mesma linha não se sobrepõem */
const rows = new Map<number, typeof FIELDS>();
for (const field of FIELDS) {
  rows.set(field.topY, [...(rows.get(field.topY) ?? []), field]);
}
for (const [, row] of rows) {
  const sorted = [...row].sort((a, b) => lineStart(a) - lineStart(b));
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = lineStart(sorted[i - 1]) + lineWidth(sorted[i - 1]);
    check(
      `sem sobreposição em topY=${sorted[0].topY}`,
      lineStart(sorted[i]) > prevEnd,
      `"${sorted[i - 1].label}" termina em ${prevEnd.toFixed(1)}, "${sorted[i].label}" começa em ${lineStart(sorted[i]).toFixed(1)}`,
    );
  }
}

/* 3. Espaçamento vertical mínimo entre linhas de campos */
const topYs = [...new Set(FIELDS.map((f) => f.topY))].sort((a, b) => a - b);
for (let i = 1; i < topYs.length; i++) {
  check(
    `espaço vertical entre topY=${topYs[i - 1]} e ${topYs[i]}`,
    topYs[i] - topYs[i - 1] >= 24,
    `${topYs[i] - topYs[i - 1]}pt`,
  );
}

/* 4. Campos dentro da altura da página */
const lastTopY = topYs[topYs.length - 1]!;
check(
  "último campo dentro da página",
  lastTopY < A4_HEIGHT,
  `topY=${lastTopY}`,
);

/* 5. Máscaras */
check(
  "maskCpf parcial",
  maskCpf("12345678901") === "123.456.789-01",
  maskCpf("12345678901"),
);
check("maskCpf curto", maskCpf("1234") === "123.4", maskCpf("1234"));
check(
  "maskPhone celular",
  maskPhone("11987654321") === "(11) 98765-4321",
  maskPhone("11987654321"),
);
check(
  "maskPhone fixo",
  maskPhone("1133334444") === "(11) 3333-4444",
  maskPhone("1133334444"),
);
check(
  "formatBrDate",
  formatBrDate("1990-05-14") === "14/05/1990",
  formatBrDate("1990-05-14"),
);

/* 6. WhatsApp */
check(
  "número nacional vira 55DDD",
  normalizeWhatsAppNumber("(11) 98765-4321") === "5511987654321",
);
check(
  "número com 55 não duplica",
  normalizeWhatsAppNumber("5511987654321") === "5511987654321",
);
const msg = buildWhatsAppMessage({
  nomeCompleto: "Maria Teste",
  posicaoIgreja: "Membro",
  dataNascimento: "1990-01-01",
  dataBatismo: "2010-02-02",
  celular: "(11) 99999-0000",
} as never);
check("mensagem contém o nome", msg.includes("*Maria Teste*"));
check(
  "mensagem formata datas",
  msg.includes("01/01/1990") && msg.includes("02/02/2010"),
);

if (failures > 0) {
  console.error(`\n${failures} verificação(ões) falharam.`);
  process.exit(1);
}
console.log("\nTodas as verificações passaram.");
