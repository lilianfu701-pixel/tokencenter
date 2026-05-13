#!/usr/bin/env node
/**
 * Genera descripciones en español para generated-models.json
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_ES = {
  chat:      "diálogo generalista",
  coding:    "generación de código",
  reasoning: "razonamiento avanzado",
  image:     "generación de imágenes",
  video:     "generación de vídeo",
};

const SPEED_ES = {
  fast:   "respuesta rápida",
  medium: "velocidad intermedia",
  slow:   "más lento pero más potente",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M tokens`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K tokens`;
  return `${n} tokens`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "gratuito vía OpenRouter";
  return `entrada $${input}/millón de tokens, salida $${output}/millón de tokens`;
}

function genEs(m) {
  const cat   = CATEGORY_ES[m.category] ?? "modelo de lenguaje";
  const speed = SPEED_ES[m.speed] ?? "velocidad intermedia";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("análisis de imágenes");
  if (m.supportsTools)  caps.push("uso de herramientas");
  if (m.supportsLocal)  caps.push("despliegue local");
  if (m.supportsApi)    caps.push("acceso API");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} es un modelo de IA de ${cat} desarrollado por ${m.provider}, con ${speed}.`;
  if (ctx) desc += ` Ventana de contexto de hasta ${ctx}.`;
  if (caps.length > 0) desc += ` Capacidades: ${caps.join(", ")}.`;
  desc += ` Precio: ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (Descripción oficial: ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.es) {
    m.description.es = genEs(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ ${count} descripciones en español generadas`);
