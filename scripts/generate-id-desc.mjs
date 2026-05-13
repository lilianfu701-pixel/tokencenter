#!/usr/bin/env node
/**
 * Menghasilkan deskripsi bahasa Indonesia untuk generated-models.json
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_ID = {
  chat:      "obrolan umum",
  coding:    "pembuatan kode",
  reasoning: "penalaran tingkat lanjut",
  image:     "pembuatan gambar",
  video:     "pembuatan video",
};

const SPEED_ID = {
  fast:   "respons cepat",
  medium: "kecepatan sedang",
  slow:   "pemrosesan lambat namun lebih powerful",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M token`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K token`;
  return `${n} token`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "gratis melalui OpenRouter";
  return `input $${input}/juta token, output $${output}/juta token`;
}

function genId(m) {
  const cat   = CATEGORY_ID[m.category] ?? "model bahasa";
  const speed = SPEED_ID[m.speed] ?? "kecepatan sedang";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("analisis gambar");
  if (m.supportsTools)  caps.push("penggunaan alat");
  if (m.supportsLocal)  caps.push("penerapan lokal");
  if (m.supportsApi)    caps.push("akses API");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} adalah model AI untuk ${cat} dari ${m.provider}, dengan ${speed}.`;
  if (ctx) desc += ` Jendela konteks hingga ${ctx}.`;
  if (caps.length > 0) desc += ` Kemampuan: ${caps.join(", ")}.`;
  desc += ` Harga: ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (Deskripsi resmi: ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.id) {
    m.description.id = genId(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ ${count} deskripsi bahasa Indonesia berhasil dibuat`);
