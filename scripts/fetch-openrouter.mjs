#!/usr/bin/env node
/**
 * 从 OpenRouter 公开 API 拉取所有大模型数据，转换格式后写入
 * src/data/generated-models.json
 *
 * 运行方式: node scripts/fetch-openrouter.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../src/data/generated-models.json");

// ── Provider slug → 显示名称 ────────────────────────────────────────────────
const PROVIDER_NAMES = {
  "openai":             "OpenAI",
  "anthropic":          "Anthropic",
  "google":             "Google",
  "meta-llama":         "Meta",
  "mistralai":          "Mistral AI",
  "deepseek":           "DeepSeek",
  "qwen":               "Alibaba",
  "cohere":             "Cohere",
  "xai":                "xAI",
  "perplexity":         "Perplexity",
  "microsoft":          "Microsoft",
  "amazon":             "Amazon",
  "moonshot":           "Moonshot",
  "01-ai":              "01.AI",
  "nousresearch":       "Nous Research",
  "nvidia":             "NVIDIA",
  "databricks":         "Databricks",
  "ai21":               "AI21 Labs",
  "writer":             "Writer",
  "minimax":            "MiniMax",
  "zhipuai":            "Zhipu AI",
  "baidu":              "Baidu",
  "bytedance":          "ByteDance",
  "inflection":         "Inflection",
  "allenai":            "Allen AI",
  "sophosympatheia":    "Sophosympatheia",
  "liquid":             "Liquid AI",
  "x-ai":               "xAI",
  "sao10k":             "Sao10K",
  "cognitivecomputations": "Cognitive Computations",
  "thedrummer":         "TheDrummer",
  "nothingiisreal":     "Nothingiisreal",
  "austism":            "Austism",
  "gryphe":             "Gryphe",
  "undi95":             "Undi95",
  "jondurbin":          "JonDurbin",
  "teknium":            "Teknium",
  "recursal":           "Recursal",
  "huggingfaceh4":      "HuggingFace H4",
};

// ── 已手工维护的模型 ID（跳过，避免重复）──────────────────────────────────────
const CURATED_IDS = new Set([
  "gpt-4o", "gpt-4.1", "gpt-5",
  "claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5",
  "gemini-2.5-pro", "gemini-2.0-flash",
  "deepseek-v3", "deepseek-r1",
  "qwen-2.5-72b",
  "moonshot-kimi-k1.5",
  "flux-1", "midjourney-v6", "sdxl",
  "sora", "kling", "veo-2", "runway-gen3",
]);

// ── 工具函数 ────────────────────────────────────────────────────────────────

function toSlug(openrouterId) {
  // "google/gemini-2.5-pro-preview-05-06" → "gemini-2-5-pro-preview-05-06"
  // "openai/gpt-4o:extended"              → "gpt-4o-extended"
  const modelPart = openrouterId.includes("/")
    ? openrouterId.split("/")[1]
    : openrouterId;
  return modelPart
    .replace(/[:.]/g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getProvider(openrouterId) {
  const slug = openrouterId.split("/")[0];
  if (PROVIDER_NAMES[slug]) return PROVIDER_NAMES[slug];
  // Capitalize first letter as fallback
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function inferCategory(m) {
  const out = m.architecture?.output_modalities || [];
  const name = (m.name || "").toLowerCase();
  const id   = (m.id   || "").toLowerCase();
  const combined = name + " " + id;

  if (out.includes("image")) return "image";
  if (out.includes("video")) return "video";

  if (/\bcode\b|coder|codestral|starcoder|wizard-code|codegen|deepcoder/.test(combined))
    return "coding";

  if (/\br1\b|\bo1\b|\bo3\b|\bo4\b|thinking|reasoner|qwq|deepthink|reflect/.test(combined))
    return "reasoning";

  return "chat";
}

function inferSpeed(m) {
  const name = (m.name || "").toLowerCase();
  if (/flash|haiku|mini|instant|turbo|lite|small|nano|fast/.test(name)) return "fast";
  if (/opus|large|ultra|heavy|plus/.test(name)) return "slow";
  return "medium";
}

/** OpenRouter 定价单位是 USD/token，乘以 100万换算成 USD/1M tokens */
function perMillion(priceStr) {
  if (!priceStr || priceStr === "0") return 0;
  const n = parseFloat(priceStr);
  if (!isFinite(n) || n === 0) return 0;
  return Math.round(n * 1_000_000 * 10000) / 10000;
}

function formatDate(unix) {
  if (!unix) return "2024-01";
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function cleanDesc(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim().slice(0, 600);
}

// ── 主逻辑 ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("📡 正在请求 OpenRouter API...");
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const { data } = await res.json();
  console.log(`✓ 获取到 ${data.length} 个模型`);

  const generated = [];
  const seen = new Set(CURATED_IDS);
  let skipped = 0;

  for (const m of data) {
    // 基本验证
    if (!m.id || !m.name) { skipped++; continue; }

    const slug = toSlug(m.id);

    // 跳过已有精选模型（含 slug 碰撞）
    if (seen.has(slug)) { skipped++; continue; }
    seen.add(slug);

    const inputPrice  = perMillion(m.pricing?.prompt);
    const outputPrice = perMillion(m.pricing?.completion);
    const cacheRead   = m.pricing?.input_cache_read  ? perMillion(m.pricing.input_cache_read)  : undefined;
    const cacheWrite  = m.pricing?.input_cache_write ? perMillion(m.pricing.input_cache_write) : undefined;

    const isImage = (m.architecture?.output_modalities || []).includes("image");
    const isVideo = (m.architecture?.output_modalities || []).includes("video");

    const pricing = {
      input:  inputPrice,
      output: outputPrice,
      ...(cacheRead  !== undefined && { cacheRead }),
      ...(cacheWrite !== undefined && { cacheWrite }),
      ...(inputPrice === 0 && !isImage && !isVideo && { note: "Free via OpenRouter" }),
    };

    generated.push({
      id:           slug,
      openrouterId: m.id,
      name:         m.name,
      provider:     getProvider(m.id),
      category:     inferCategory(m),
      contextWindow: m.context_length || 0,
      maxOutput:    m.top_provider?.max_completion_tokens || 0,
      pricing,
      speed:        inferSpeed(m),
      releaseDate:  formatDate(m.created),
      dataSource:   "official",
      tags:         [],
      description: {
        en: cleanDesc(m.description),
        zh: "",            // 后续可批量生成中文描述
      },
      supportsVision: (m.architecture?.input_modalities  || []).includes("image"),
      supportsTools:  (m.supported_parameters || []).includes("tools"),
      supportsApi:    true,
      supportsLocal:  false,
      officialUrl:    `https://openrouter.ai/models/${m.id}`,
      ratingCoding:    0,
      ratingWriting:   0,
      ratingReasoning: 0,
      useCases: [],
      bestFor:  [],
      isTrending: false,
      isLatest:   false,
    });
  }

  // 按厂商 + 模型名排序
  generated.sort((a, b) => {
    if (a.provider < b.provider) return -1;
    if (a.provider > b.provider) return 1;
    return a.name.localeCompare(b.name);
  });

  console.log(`✓ 生成 ${generated.length} 个新模型（跳过 ${skipped} 个）`);
  writeFileSync(OUT_PATH, JSON.stringify(generated, null, 2), "utf8");
  console.log(`✓ 已写入 ${OUT_PATH}`);

  // 统计分类
  const cats = {};
  for (const m of generated) cats[m.category] = (cats[m.category] || 0) + 1;
  console.log("分类统计:", cats);
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
