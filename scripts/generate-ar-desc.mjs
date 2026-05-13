#!/usr/bin/env node
/**
 * يولِّد أوصافًا عربية لـ generated-models.json
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_AR = {
  chat:      "الدردشة العامة",
  coding:    "توليد الكود",
  reasoning: "الاستدلال المتقدم",
  image:     "توليد الصور",
  video:     "توليد الفيديو",
};

const SPEED_AR = {
  fast:   "استجابة سريعة",
  medium: "سرعة متوسطة",
  slow:   "معالجة بطيئة لكنها أكثر قوة",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} مليون رمز`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K رمز`;
  return `${n} رمز`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "مجاني عبر OpenRouter";
  return `إدخال $${input}/مليون رمز، إخراج $${output}/مليون رمز`;
}

function genAr(m) {
  const cat   = CATEGORY_AR[m.category] ?? "نموذج لغوي";
  const speed = SPEED_AR[m.speed] ?? "سرعة متوسطة";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("تحليل الصور");
  if (m.supportsTools)  caps.push("استخدام الأدوات");
  if (m.supportsLocal)  caps.push("النشر المحلي");
  if (m.supportsApi)    caps.push("الوصول عبر API");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} نموذج ذكاء اصطناعي لـ${cat} من ${m.provider}، يتميز بـ${speed}.`;
  if (ctx) desc += ` نافذة السياق تصل إلى ${ctx}.`;
  if (caps.length > 0) desc += ` الإمكانيات: ${caps.join("، ")}.`;
  desc += ` السعر: ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (الوصف الرسمي: ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.ar) {
    m.description.ar = genAr(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ تم توليد ${count} وصفًا عربيًا`);
