export type DataSource = "official" | "estimated" | "experimental";

export type ModelProvider =
  | "OpenAI"
  | "Anthropic"
  | "Google"
  | "DeepSeek"
  | "Alibaba"
  | "Moonshot";

export interface ModelPricing {
  input: number;   // USD per 1M tokens
  output: number;  // USD per 1M tokens
  cacheWrite?: number;
  cacheRead?: number;
}

export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number;   // tokens
  maxOutput: number;       // tokens
  pricing: ModelPricing;
  releaseDate: string;     // YYYY-MM
  dataSource: DataSource;
  tags: string[];
  description: {
    en: string;
    zh: string;
  };
  supportsVision: boolean;
  supportsTools: boolean;
}

export const models: Model[] = [
  // ── OpenAI ────────────────────────────────────────────────────────────────
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    contextWindow: 128_000,
    maxOutput: 16_384,
    pricing: { input: 2.5, output: 10, cacheRead: 1.25 },
    releaseDate: "2024-05",
    dataSource: "official",
    tags: ["vision", "tools", "multimodal"],
    description: {
      en: "OpenAI's flagship multimodal model balancing speed and intelligence.",
      zh: "OpenAI 旗舰多模态模型，兼顾速度与智能。",
    },
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    contextWindow: 1_047_576,
    maxOutput: 32_768,
    pricing: { input: 2, output: 8, cacheRead: 0.5 },
    releaseDate: "2025-04",
    dataSource: "official",
    tags: ["vision", "tools", "long-context"],
    description: {
      en: "OpenAI's latest GPT-4 iteration with 1M token context and improved instruction following.",
      zh: "OpenAI 最新 GPT-4 版本，支持 100 万 Token 上下文，指令遵循更精准。",
    },
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    contextWindow: 1_000_000,
    maxOutput: 32_768,
    pricing: { input: 15, output: 60 },
    releaseDate: "2025-05",
    dataSource: "experimental",
    tags: ["reasoning", "vision", "tools"],
    description: {
      en: "OpenAI's most capable model, integrating reasoning and multimodal understanding.",
      zh: "OpenAI 最强模型，融合推理与多模态理解能力。",
    },
    supportsVision: true,
    supportsTools: true,
  },

  // ── Anthropic ─────────────────────────────────────────────────────────────
  {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    contextWindow: 200_000,
    maxOutput: 32_000,
    pricing: { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
    releaseDate: "2025-07",
    dataSource: "estimated",
    tags: ["reasoning", "vision", "tools", "coding"],
    description: {
      en: "Anthropic's most intelligent model for complex reasoning and agentic tasks.",
      zh: "Anthropic 最智能的模型，擅长复杂推理与智能体任务。",
    },
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    contextWindow: 200_000,
    maxOutput: 64_000,
    pricing: { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
    releaseDate: "2025-05",
    dataSource: "official",
    tags: ["vision", "tools", "coding", "balanced"],
    description: {
      en: "Best balance of intelligence and speed for high-throughput tasks.",
      zh: "智能与速度最佳平衡，适合高吞吐量任务。",
    },
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    contextWindow: 200_000,
    maxOutput: 16_000,
    pricing: { input: 0.8, output: 4, cacheWrite: 1, cacheRead: 0.08 },
    releaseDate: "2025-05",
    dataSource: "official",
    tags: ["fast", "tools", "cost-effective"],
    description: {
      en: "Anthropic's fastest and most compact model for near-instant responsiveness.",
      zh: "Anthropic 最快速、最紧凑的模型，接近即时响应。",
    },
    supportsVision: true,
    supportsTools: true,
  },

  // ── Google ─────────────────────────────────────────────────────────────────
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    contextWindow: 1_048_576,
    maxOutput: 65_536,
    pricing: { input: 1.25, output: 10 },
    releaseDate: "2025-03",
    dataSource: "official",
    tags: ["reasoning", "vision", "long-context", "tools"],
    description: {
      en: "Google's most capable model with native 1M token context and state-of-the-art reasoning.",
      zh: "Google 最强模型，原生 100 万 Token 上下文，最先进的推理能力。",
    },
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    contextWindow: 1_048_576,
    maxOutput: 8_192,
    pricing: { input: 0.1, output: 0.4 },
    releaseDate: "2025-02",
    dataSource: "official",
    tags: ["fast", "vision", "long-context", "cost-effective"],
    description: {
      en: "Google's workhorse model — fast, efficient, and supports multimodal input.",
      zh: "Google 主力模型，快速高效，支持多模态输入。",
    },
    supportsVision: true,
    supportsTools: true,
  },

  // ── DeepSeek ───────────────────────────────────────────────────────────────
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    contextWindow: 128_000,
    maxOutput: 8_192,
    pricing: { input: 0.27, output: 1.1 },
    releaseDate: "2024-12",
    dataSource: "official",
    tags: ["coding", "cost-effective"],
    description: {
      en: "DeepSeek's flagship MoE model, highly competitive on coding and reasoning benchmarks.",
      zh: "DeepSeek 旗舰 MoE 模型，在代码和推理基准上极具竞争力。",
    },
    supportsVision: false,
    supportsTools: true,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    contextWindow: 128_000,
    maxOutput: 8_192,
    pricing: { input: 0.55, output: 2.19 },
    releaseDate: "2025-01",
    dataSource: "official",
    tags: ["reasoning", "coding", "cost-effective"],
    description: {
      en: "DeepSeek's chain-of-thought reasoning model, rivaling o1 at a fraction of the cost.",
      zh: "DeepSeek 链式思维推理模型，以极低成本媲美 o1。",
    },
    supportsVision: false,
    supportsTools: false,
  },

  // ── Alibaba ────────────────────────────────────────────────────────────────
  {
    id: "qwen-2.5-72b",
    name: "Qwen 2.5 72B",
    provider: "Alibaba",
    contextWindow: 128_000,
    maxOutput: 8_192,
    pricing: { input: 0.4, output: 1.2 },
    releaseDate: "2024-09",
    dataSource: "official",
    tags: ["multilingual", "coding", "open-source"],
    description: {
      en: "Alibaba's open-source flagship with strong multilingual and coding capabilities.",
      zh: "阿里巴巴开源旗舰模型，多语言与代码能力突出。",
    },
    supportsVision: false,
    supportsTools: true,
  },

  // ── Moonshot ───────────────────────────────────────────────────────────────
  {
    id: "moonshot-kimi-k1.5",
    name: "Moonshot Kimi K1.5",
    provider: "Moonshot",
    contextWindow: 128_000,
    maxOutput: 8_192,
    pricing: { input: 0.5, output: 2 },
    releaseDate: "2025-01",
    dataSource: "estimated",
    tags: ["reasoning", "multilingual", "long-context"],
    description: {
      en: "Moonshot's multimodal reasoning model with strong Chinese language support.",
      zh: "月之暗面多模态推理模型，中文能力强劲。",
    },
    supportsVision: true,
    supportsTools: true,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getModelById(id: string): Model | undefined {
  return models.find((m) => m.id === id);
}

export function getModelsByProvider(provider: ModelProvider): Model[] {
  return models.filter((m) => m.provider === provider);
}

export function getModelsSortedByInputPrice(): Model[] {
  return [...models].sort((a, b) => a.pricing.input - b.pricing.input);
}

export function getModelsSortedByContextWindow(): Model[] {
  return [...models].sort((a, b) => b.contextWindow - a.contextWindow);
}

export const providers: ModelProvider[] = [
  "OpenAI",
  "Anthropic",
  "Google",
  "DeepSeek",
  "Alibaba",
  "Moonshot",
];
