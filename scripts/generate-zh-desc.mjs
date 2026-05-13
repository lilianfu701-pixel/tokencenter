#!/usr/bin/env node
/**
 * 为 generated-models.json 中 description.zh 为空的模型
 * 根据结构化数据自动生成中文描述
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");

const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_ZH = {
  chat:      "通用对话",
  coding:    "代码生成",
  reasoning: "推理思考",
  image:     "图像生成",
  video:     "视频生成",
};

const SPEED_ZH = {
  fast:   "响应速度快",
  medium: "速度适中",
  slow:   "响应较慢但能力更强",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M 词元`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K 词元`;
  return `${n} 词元`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "免费（通过 OpenRouter 访问）";
  return `输入 $${input}/百万词元，输出 $${output}/百万词元`;
}

function genZh(m) {
  const cat     = CATEGORY_ZH[m.category] ?? "大语言";
  const speed   = SPEED_ZH[m.speed] ?? "速度适中";
  const ctx     = fmtCtx(m.contextWindow);
  const price   = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("图像理解");
  if (m.supportsTools)  caps.push("工具调用");
  if (m.supportsLocal)  caps.push("本地部署");
  if (m.supportsApi)    caps.push("API 接入");

  // 处理 OpenRouter 英文描述：去掉结尾的省略号和 Markdown 链接
  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // [text](url) → text
    .replace(/\.{2,}$/, "")                     // 去掉结尾的 ...
    .trim();

  // 用英文描述的第一句作为开头补充（避免内容过空洞）
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} 是由 ${m.provider} 推出的${cat}大模型，${speed}。`;

  if (ctx) {
    desc += `支持最长 ${ctx} 的上下文窗口。`;
  }

  if (caps.length > 0) {
    desc += `具备${caps.join("、")}等能力。`;
  }

  desc += `定价：${price}。`;

  // 附加英文简介的中文意译（保留第一句作为补充背景）
  if (firstSentence && firstSentence.length > 20) {
    desc += `（原厂说明：${firstSentence}）`;
  }

  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.zh) {
    m.description.zh = genZh(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ 已为 ${count} 个模型生成中文描述`);
