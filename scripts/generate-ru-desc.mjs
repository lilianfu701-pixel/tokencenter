#!/usr/bin/env node
/**
 * Генерирует русские описания для generated-models.json
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_RU = {
  chat:      "универсального чата",
  coding:    "генерации кода",
  reasoning: "продвинутых рассуждений",
  image:     "генерации изображений",
  video:     "генерации видео",
};

const SPEED_RU = {
  fast:   "быстрый отклик",
  medium: "средняя скорость",
  slow:   "медленная, но мощная обработка",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}М токенов`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}К токенов`;
  return `${n} токенов`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "бесплатно через OpenRouter";
  return `вход $${input}/млн токенов, выход $${output}/млн токенов`;
}

function genRu(m) {
  const cat   = CATEGORY_RU[m.category] ?? "языковая модель";
  const speed = SPEED_RU[m.speed] ?? "средняя скорость";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("анализ изображений");
  if (m.supportsTools)  caps.push("использование инструментов");
  if (m.supportsLocal)  caps.push("локальное развёртывание");
  if (m.supportsApi)    caps.push("доступ к API");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} — ИИ-модель для ${cat} от ${m.provider}, с ${speed}.`;
  if (ctx) desc += ` Контекстное окно до ${ctx}.`;
  if (caps.length > 0) desc += ` Возможности: ${caps.join(", ")}.`;
  desc += ` Цена: ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (Официальное описание: ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.ru) {
    m.description.ru = genRu(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ Сгенерировано ${count} русских описаний`);
