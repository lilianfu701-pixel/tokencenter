#!/usr/bin/env node
/**
 * generated-models.json に日本語説明を生成する
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_JA = {
  chat:      "汎用チャット",
  coding:    "コード生成",
  reasoning: "高度な推論",
  image:     "画像生成",
  video:     "動画生成",
};

const SPEED_JA = {
  fast:   "高速レスポンス",
  medium: "標準的な速度",
  slow:   "低速だが高性能",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}Mトークン`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}Kトークン`;
  return `${n}トークン`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "OpenRouter経由で無料";
  return `入力 $${input}/100万トークン、出力 $${output}/100万トークン`;
}

function genJa(m) {
  const cat   = CATEGORY_JA[m.category] ?? "言語モデル";
  const speed = SPEED_JA[m.speed] ?? "標準的な速度";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("画像認識");
  if (m.supportsTools)  caps.push("ツール使用");
  if (m.supportsLocal)  caps.push("ローカル実行");
  if (m.supportsApi)    caps.push("APIアクセス");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name}は${m.provider}が提供する${cat}向けAIモデルで、${speed}が特徴です。`;
  if (ctx) desc += `コンテキスト長は最大${ctx}。`;
  if (caps.length > 0) desc += `対応機能：${caps.join("、")}。`;
  desc += `料金：${price}。`;
  if (firstSentence && firstSentence.length > 20) {
    desc += `（公式説明：${firstSentence}）`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.ja) {
    m.description.ja = genJa(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ ${count}件の日本語説明を生成しました`);
