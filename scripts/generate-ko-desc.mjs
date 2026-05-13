#!/usr/bin/env node
/**
 * generated-models.json에 한국어 설명을 생성합니다
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_KO = {
  chat:      "범용 채팅",
  coding:    "코드 생성",
  reasoning: "고급 추론",
  image:     "이미지 생성",
  video:     "영상 생성",
};

const SPEED_KO = {
  fast:   "빠른 응답",
  medium: "표준 속도",
  slow:   "느리지만 강력한 처리",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M 토큰`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K 토큰`;
  return `${n} 토큰`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "OpenRouter를 통해 무료 제공";
  return `입력 $${input}/100만 토큰, 출력 $${output}/100만 토큰`;
}

function genKo(m) {
  const cat   = CATEGORY_KO[m.category] ?? "언어 모델";
  const speed = SPEED_KO[m.speed] ?? "표준 속도";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("이미지 인식");
  if (m.supportsTools)  caps.push("도구 사용");
  if (m.supportsLocal)  caps.push("로컬 실행");
  if (m.supportsApi)    caps.push("API 접근");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name}은(는) ${m.provider}가 제공하는 ${cat} AI 모델로, ${speed}이 특징입니다.`;
  if (ctx) desc += ` 컨텍스트 창은 최대 ${ctx}.`;
  if (caps.length > 0) desc += ` 지원 기능: ${caps.join(", ")}.`;
  desc += ` 가격: ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (공식 설명: ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.ko) {
    m.description.ko = genKo(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ ${count}개의 한국어 설명을 생성했습니다`);
