/**
 * Smoke test de renderização (SSR) via vite-node.
 * Usa o mesmo pipeline de transformação do Vite (automatic JSX runtime),
 * diferente do tsx, que compila em modo clássico e falha com "React is not defined".
 *
 * Uso: npx vite-node scripts/smoke-render.ts
 */
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import App from "../src/App";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) {
    failures++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const html = renderToStaticMarkup(createElement(App));
check("App renderiza sem crash", html.length > 1000, `${html.length} bytes`);
check("preview contém cabeçalho", html.includes("CADASTRO DE MEMBRO"));
check(
  "formulário contém campos",
  html.includes("Nome completo") && html.includes("Data do batismo"),
);
check(
  "botões de ação presentes",
  html.includes("Baixar PDF A4") && html.includes("Enviar por WhatsApp"),
);
check("configurações presentes", html.includes("WhatsApp do secretário"));

if (failures > 0) {
  console.error(`\n${failures} verificação(ões) falharam.`);
  process.exit(1);
}
console.log("\nSmoke test de renderização OK.");
