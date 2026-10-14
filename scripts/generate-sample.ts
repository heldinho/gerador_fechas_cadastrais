/**
 * Script de verificação: gera um PDF de exemplo fora do navegador
 * para conferir o layout. Uso: npx tsx scripts/generate-sample.ts
 */
import { writeFileSync } from "node:fs";
import { buildFichaPdf } from "../src/lib/pdf";
import type { ChurchConfig, FichaData } from "../src/lib/ficha";

const data: FichaData = {
  nomeCompleto: "João Pereira da Silva",
  dataNascimento: "1990-05-14",
  rg: "37.673.437-6",
  cpf: "123.456.789-00",
  mae: "Maria das Graças Pereira",
  pai: "Antônio Carlos Pereira",
  celular: "(11) 98765-4321",
  residencial: "(11) 3333-4444",
  estadoCivil: "Casado(a)",
  conjuge: "Ana Beatriz Pereira",
  endereco: "Estrada do Barro Vermelho, Lt 45, Quadra 7, Casa 12",
  bairro: "Jardim Santa Luzia",
  dataBatismo: "2005-09-18",
  posicaoIgreja: "Doula/Doulos - Secretário",
};

const config: ChurchConfig = {
  igreja: "ASSEMBLEIA DE DEUS",
  ministerio: "MINISTÉRIO DOULOS",
  endereco: "Estrada do Barro Vermelho Lt 45 quadra 7",
  pastor: "Valmor Pereira",
};

const bytes = await buildFichaPdf(data, config);
writeFileSync("scripts/sample-output.pdf", Buffer.from(bytes));
console.log("OK: scripts/sample-output.pdf gerado");
