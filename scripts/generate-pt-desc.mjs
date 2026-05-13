#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_PT = {
  chat:      "diálogo generalista",
  coding:    "geração de código",
  reasoning: "raciocínio avançado",
  image:     "geração de imagens",
  video:     "geração de vídeo",
};

const SPEED_PT = {
  fast:   "resposta rápida",
  medium: "velocidade intermédia",
  slow:   "mais lento mas mais potente",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M tokens`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K tokens`;
  return `${n} tokens`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "gratuito via OpenRouter";
  return `entrada $${input}/milhão de tokens, saída $${output}/milhão de tokens`;
}

function genPt(m) {
  const cat   = CATEGORY_PT[m.category] ?? "modelo de linguagem";
  const speed = SPEED_PT[m.speed] ?? "velocidade intermédia";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("análise de imagens");
  if (m.supportsTools)  caps.push("uso de ferramentas");
  if (m.supportsLocal)  caps.push("implementação local");
  if (m.supportsApi)    caps.push("acesso API");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} é um modelo de IA de ${cat} desenvolvido pela ${m.provider}, com ${speed}.`;
  if (ctx) desc += ` Janela de contexto até ${ctx}.`;
  if (caps.length > 0) desc += ` Capacidades: ${caps.join(", ")}.`;
  desc += ` Preço: ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (Descrição oficial: ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.pt) {
    m.description.pt = genPt(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ ${count} descrições em português geradas`);
