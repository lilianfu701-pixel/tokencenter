#!/usr/bin/env node
/**
 * Tạo mô tả tiếng Việt cho generated-models.json
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_VI = {
  chat:      "trò chuyện đa năng",
  coding:    "tạo code",
  reasoning: "suy luận nâng cao",
  image:     "tạo ảnh",
  video:     "tạo video",
};

const SPEED_VI = {
  fast:   "phản hồi nhanh",
  medium: "tốc độ trung bình",
  slow:   "xử lý chậm nhưng mạnh mẽ hơn",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M token`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K token`;
  return `${n} token`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "miễn phí qua OpenRouter";
  return `đầu vào $${input}/triệu token, đầu ra $${output}/triệu token`;
}

function genVi(m) {
  const cat   = CATEGORY_VI[m.category] ?? "mô hình ngôn ngữ";
  const speed = SPEED_VI[m.speed] ?? "tốc độ trung bình";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("phân tích ảnh");
  if (m.supportsTools)  caps.push("sử dụng công cụ");
  if (m.supportsLocal)  caps.push("triển khai cục bộ");
  if (m.supportsApi)    caps.push("truy cập API");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} là mô hình AI ${cat} của ${m.provider}, với ${speed}.`;
  if (ctx) desc += ` Cửa sổ ngữ cảnh lên đến ${ctx}.`;
  if (caps.length > 0) desc += ` Khả năng: ${caps.join(", ")}.`;
  desc += ` Giá: ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (Mô tả chính thức: ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.vi) {
    m.description.vi = genVi(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ Đã tạo ${count} mô tả tiếng Việt`);
