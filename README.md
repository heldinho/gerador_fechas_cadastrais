# 📋 Gerador de Fichas Cadastrais — PDF A4

**O que é?** É uma página de internet que você abre no computador, preenche os dados de um
membro da igreja numa tela, e ela cria automaticamente aquela **ficha cadastral bonitinha em
PDF**, igualzinha ao modelo impresso — pronta para **baixar** ou **mandar pro secretário pelo
WhatsApp**. 🎉

---

## 🤔 De onde veio essa ideia?

Imagina o cenário: o secretário precisa cadastrar novos membros da igreja. Ele poderia ficar
imprimindo ficha em branco e pedindo pra pessoa escrever de mão (aí fica tudo torto e ilegível
e ele precisa decifrar letra ruim 😅).

Com esse programa, a pessoa digita os dados **no computador ou no celular**, a ficha aparece
pronta na tela, e em 2 cliques vira um **arquivo PDF** — que é tipo uma "foto digital
perfeita" do documento, que não apaga, não torta e qualquer um consegue abrir.

---

## 🚀 Como ligar isso (passo a passo)

Você precisa ter o **Node.js** instalado (é tipo o "motor" que faz rodar programas de
internet no seu computador). Se não tem, baixe em [nodejs.org](https://nodejs.org).

Abra a pasta do projeto no terminal ( aquela tela preta de programador ) e digite:

```bash
npm install   # 1ª vez só: baixa as "peças de LEGO" que o projeto usa (peça paciência, demora um pouquinho)

npm run dev   # liga o programa! 🎈
```

Depois disso, abra o navegador e acesse: **http://localhost:5173**

Pronto! A página vai abrir com o formulário esperando pra ser preenchido. 🎉

> **Dica:** enquanto o programa estiver ligado, o terminal não pode ser fechado. Pra desligar,
> aperte `Ctrl + C` no terminal.

---

## 👀 Como usar (o passeio completo)

1. **Preencha os dados** — nome, data de nascimento, RG, CPF, nome da mãe e do pai, telefones,
   estado civil, endereço, data do batismo e posição na igreja.
   - O **CPF** e os **telefenez** se formatam sozinhos: você digita `11987654321` e vira
     `(11) 98765-4321` na hora. Mágica? Quase — é o programa inserindo os pontinhos e
     parênteses automaticamente. ✨
   - Se a pessoa for **casada**, aparece o campo "Nome do cônjuge" (namorado(a) não conta,
     precisa ser casado de verdade 😄).
2. **Veja a mágica acontecendo** — do lado direito (ou embaixo, se for celular) tem uma
   **pré-visualização da ficha**, que vai sendo preenchida em tempo real enquanto você digita.
   É como um "espelho" do PDF que vai sair.
3. **Clique em "Baixar PDF A4"** 💾 — o arquivo PDF baixa no seu computador, com o nome da
   pessoa (ex: `ficha-cadastral-maria-silva.pdf`).
4. **Ou clique em "Enviar por WhatsApp"** 📱 — no celular, o PDF vai **anexado automaticamente**
   na conversa do secretário, direitinho. Em alguns navegadores antigos ele não consegue anexar
   sozinho; nesse caso ele abre a conversa com a mensagem pronta e avisa pra você anexar o
   arquivo que baixou.

### ⚙️ As configurações (pra mudar os dados da igreja)

Derruba a setinha lá embaixo no card **"Configurações"** e você pode mudar:

- Nome da igreja e do ministério (vem pronto: _Assembleia de Deus · Ministério Doulos_)
- Endereço e nome do pastor presidente (_Valmor Pereira_)
- **O número do WhatsApp do secretário** — coloque aí pra o botão de enviar funcionar direto!

Tudo que você digita ali fica **salvo no seu navegador** (igual quando o jogo guarda seu
recorde). Na próxima vez que abrir, já está tudo lá. 🎮

E o **rascunho da ficha também salva sozinho** a cada letra digitada — se o navegador fechar
sem querer, é só abrir de novo que os dados continuam lá.

---

## 🧠 Como isso funciona lá por dentro? (a parte da pizza 🍕)

Pensa assim:

| Parte do programa         | O que ela faz (em linguagem de gente)                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **`src/components/`**     | As "telas" que você vê: o formulário, o espelho da ficha e o card de configurações.                                                     |
| **`src/lib/layout.ts`**   | O **cão-chave** do projeto 🔑: é onde ficam todas as medidas da ficha (onde começa cada linha, onde termina, tamanho das letras).       |
| **`src/lib/pdf.ts`**      | O "impressor digital": recebe os dados + as medidas e desenha o PDF com letras de verdade (não é foto — dá pra selecionar o texto!).    |
| **`src/lib/whatsapp.ts`** | O "carteiro": prepara a mensagem e manda o PDF pro secretário.                                                                          |
| **`src/lib/ficha.ts`**    | Os dicionários e utilidades: máscara de CPF, formatação de data (de `1990-05-14` vira `14/05/1990`), e salvar/carregar os dados salvos. |

**O segredo mais legal:** o espelho na tela e o PDF são "desenhados" usando as **mesmas
medidas**, do mesmo arquivo (`layout.ts`). Por isso o que você vê é exatamente o que sai no
PDF. Não tem surpresa. 🎯

---

## 🛠️ Outros comandos úteis

| Comando          | O que faz                                                                       |
| ---------------- | ------------------------------------------------------------------------------- |
| `npm run dev`    | Liga o programa pra você usar (modo desenvolvimento)                            |
| `npm run build`  | Gera a versão "de verdade" na pasta `dist/`, pronta pra hospedar na internet    |
| `npm run verify` | Roda os "testes de precisão" (confere se nenhuma linha da ficha vaza da margem) |
| `npm run sample` | Gera um PDF de exemplo (`scripts/sample-output.pdf`) pra conferir como fica     |
| `npm run test`   | Roda a verificação + o build (tudo de uma vez)                                  |
| `npm run lint`   | Procura "erros de português" no código                                          |

> **Quer conferir se o PDF ficou certo sem preencher nada?** Rode `npm run sample` e abra o
> arquivo `scripts/sample-output.pdf` — ele gera uma ficha de exemplo com dados fictícios.

---

## ❓ Perguntas que devem aparecer na sua cabeça

**"Por que o PDF não sai todo borrado quando eu aumento o zoom?"**
Porque as letras são desenhadas com **vetores** (linhas matemáticas), não como uma foto.
Fotos ficam pixeladas ao aproximar; vetores ficam afiados pra sempre. 📐

**"Meus dados vão pra internet?"**
Não! Tudo acontece no **seu computador**. Os dados ficam salvos no seu navegador
(`localStorage`), que é tipo uma caderneta que o navegador guarda só pra você. Nenhum
servidor recebe nada. 🔒

**"Consigo usar pra outra igreja?"**
Com certeza! Mude nome, endereço e pastor no card de Configurações — já era. Se quiser mudar
o modelo da ficha em si (posição das linhas etc.), mexa no arquivo `src/lib/layout.ts`.

**"O que é esse PDF/A4 que tanto falam?"**
A4 é o tamanho do papel comum (210 × 297 mm — o papel A4 de sempre). O programa desenha
exatamente nesse tamanho, então na hora de imprimir não corta nada. 🖨️

---

## 📁 De que cada pasta é feita

```
gerador_fechas_cadastrais/
├── index.html              # A "porta de entrada" da página
├── src/
│   ├── App.tsx             # O "diretor de orquestra": junta tudo e cuida dos botões
│   ├── components/         # As telas que você vê (formulário, espelho, configurações)
│   └── lib/                # O "cérebro": medidas, PDF, WhatsApp, máscaras
├── scripts/                # Ferramentas de teste do programador (você não precisa mexer)
├── package.json            # A "lista de compras" das peças usadas
└── README.md               # Este arquivo que você está lendo agora 😄
```

---

Feito com ❤️ para facilitar o trabalho do secretário — e para ninguém mais precisar decifrar
letra ruim. 🙌
