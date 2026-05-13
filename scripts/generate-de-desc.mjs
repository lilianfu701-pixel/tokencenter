#!/usr/bin/env node
/**
 * Generiert deutsche Beschreibungen für generated-models.json
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_DE = {
  chat:      "allgemeinem Dialog",
  coding:    "Code-Generierung",
  reasoning: "fortgeschrittenem Reasoning",
  image:     "Bildgenerierung",
  video:     "Videogenerierung",
};

const SPEED_DE = {
  fast:   "schneller Antwortzeit",
  medium: "mittlerer Geschwindigkeit",
  slow:   "langsamer, aber leistungsstarker Verarbeitung",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} Mio. Token`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K Token`;
  return `${n} Token`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "kostenlos über OpenRouter";
  return `Eingabe $${input}/Mio. Token, Ausgabe $${output}/Mio. Token`;
}

function genDe(m) {
  const cat   = CATEGORY_DE[m.category] ?? "Sprachmodell";
  const speed = SPEED_DE[m.speed] ?? "mittlerer Geschwindigkeit";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("Bildanalyse");
  if (m.supportsTools)  caps.push("Werkzeugnutzung");
  if (m.supportsLocal)  caps.push("lokale Bereitstellung");
  if (m.supportsApi)    caps.push("API-Zugang");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} ist ein KI-Modell für ${cat} von ${m.provider}, mit ${speed}.`;
  if (ctx) desc += ` Kontextfenster bis zu ${ctx}.`;
  if (caps.length > 0) desc += ` Fähigkeiten: ${caps.join(", ")}.`;
  desc += ` Preis: ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (Offizielle Beschreibung: ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.de) {
    m.description.de = genDe(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ ${count} deutsche Beschreibungen generiert`);
