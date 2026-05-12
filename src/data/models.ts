export type DataSource = "official" | "estimated" | "experimental";

export type ModelCategory = "chat" | "coding" | "reasoning" | "image" | "video";

export type ModelProvider = string;

export interface ModelPricing {
  input: number;   // USD per 1M tokens (0 for image/video)
  output: number;  // USD per 1M tokens (0 for image/video)
  cacheWrite?: number;
  cacheRead?: number;
  note?: string;   // e.g. "$0.04/image" for image models
}

export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
  category: ModelCategory;
  contextWindow: number;   // tokens (0 for image/video)
  maxOutput: number;       // tokens (0 for image/video)
  pricing: ModelPricing;
  speed: "fast" | "medium" | "slow";
  releaseDate: string;     // YYYY-MM
  dataSource: DataSource;
  tags: string[];
  description: {
    en: string;
    zh: string;
  };
  supportsVision: boolean;
  supportsTools: boolean;
  supportsApi: boolean;
  supportsLocal: boolean;
  officialUrl: string;
  docsUrl?: string;
  ratingCoding: number;    // 0-5
  ratingWriting: number;   // 0-5
  ratingReasoning: number; // 0-5
  useCases: string[];
  bestFor: string[];
  isLatest?: boolean;
  isTrending?: boolean;
}

import generatedModelsRaw from "./generated-models.json";

const generatedModels = generatedModelsRaw as unknown as Model[];

export const curatedModels: Model[] = [
  // ── OpenAI Chat ────────────────────────────────────────────────────────────
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    category: "chat",
    contextWindow: 128_000,
    maxOutput: 16_384,
    pricing: { input: 2.5, output: 10, cacheRead: 1.25 },
    speed: "fast",
    releaseDate: "2024-05",
    dataSource: "official",
    tags: ["vision", "tools", "multimodal"],
    description: {
      en: "GPT-4o is a fast multimodal model optimized for chat, coding, and vision tasks.",
      zh: "GPT-4o 是快速的多模态模型，适用于对话、编程和视觉任务。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://openai.com/gpt-4o",
    docsUrl: "https://platform.openai.com/docs/models/gpt-4o",
    ratingCoding: 4,
    ratingWriting: 4,
    ratingReasoning: 3,
    useCases: ["Coding assistant", "Content writing", "Customer support", "Vision analysis"],
    bestFor: ["Chat", "Coding", "Writing"],
    isTrending: true,
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    category: "chat",
    contextWindow: 1_047_576,
    maxOutput: 32_768,
    pricing: { input: 2, output: 8, cacheRead: 0.5 },
    speed: "medium",
    releaseDate: "2025-04",
    dataSource: "official",
    tags: ["vision", "tools", "long-context"],
    description: {
      en: "GPT-4.1 is OpenAI's latest iteration with 1M token context and improved instruction following.",
      zh: "GPT-4.1 是 OpenAI 最新版本，支持 100 万 Token 上下文，指令遵循更精准。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://openai.com",
    docsUrl: "https://platform.openai.com/docs",
    ratingCoding: 4,
    ratingWriting: 4,
    ratingReasoning: 4,
    useCases: ["Long document analysis", "Complex coding", "Research", "Instruction following"],
    bestFor: ["Coding", "Long context"],
    isLatest: true,
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    category: "reasoning",
    contextWindow: 1_000_000,
    maxOutput: 32_768,
    pricing: { input: 15, output: 60 },
    speed: "slow",
    releaseDate: "2025-05",
    dataSource: "experimental",
    tags: ["reasoning", "vision", "tools"],
    description: {
      en: "GPT-5 is OpenAI's most capable model, integrating advanced reasoning and multimodal understanding.",
      zh: "GPT-5 是 OpenAI 最强模型，融合高级推理与多模态理解能力。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://openai.com",
    docsUrl: "https://platform.openai.com/docs",
    ratingCoding: 5,
    ratingWriting: 5,
    ratingReasoning: 5,
    useCases: ["Complex reasoning", "Research", "Advanced coding", "Scientific analysis"],
    bestFor: ["Reasoning", "Complex tasks"],
    isLatest: true,
    isTrending: true,
  },

  // ── Anthropic ─────────────────────────────────────────────────────────────
  {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    category: "reasoning",
    contextWindow: 200_000,
    maxOutput: 32_000,
    pricing: { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
    speed: "slow",
    releaseDate: "2025-07",
    dataSource: "estimated",
    tags: ["reasoning", "vision", "tools", "coding"],
    description: {
      en: "Claude Opus is Anthropic's most intelligent model for complex reasoning and agentic tasks.",
      zh: "Claude Opus 是 Anthropic 最智能的模型，擅长复杂推理与智能体任务。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://anthropic.com/claude",
    docsUrl: "https://docs.anthropic.com",
    ratingCoding: 5,
    ratingWriting: 5,
    ratingReasoning: 5,
    useCases: ["Complex reasoning", "Agentic workflows", "Advanced coding", "Research"],
    bestFor: ["Coding", "Reasoning", "Writing"],
    isTrending: true,
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    category: "chat",
    contextWindow: 200_000,
    maxOutput: 64_000,
    pricing: { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
    speed: "fast",
    releaseDate: "2025-05",
    dataSource: "official",
    tags: ["vision", "tools", "coding", "balanced"],
    description: {
      en: "Claude Sonnet offers the best balance of intelligence and speed for high-throughput tasks.",
      zh: "Claude Sonnet 提供最佳的智能与速度平衡，适合高吞吐量任务。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://anthropic.com/claude",
    docsUrl: "https://docs.anthropic.com",
    ratingCoding: 4,
    ratingWriting: 5,
    ratingReasoning: 4,
    useCases: ["Production coding", "Content writing", "Data analysis", "Customer support"],
    bestFor: ["Writing", "Coding", "Chat"],
    isLatest: true,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    category: "chat",
    contextWindow: 200_000,
    maxOutput: 16_000,
    pricing: { input: 0.8, output: 4, cacheWrite: 1, cacheRead: 0.08 },
    speed: "fast",
    releaseDate: "2025-05",
    dataSource: "official",
    tags: ["fast", "tools", "cost-effective"],
    description: {
      en: "Claude Haiku is Anthropic's fastest and most compact model for near-instant responsiveness.",
      zh: "Claude Haiku 是 Anthropic 最快速、最紧凑的模型，接近即时响应。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://anthropic.com/claude",
    docsUrl: "https://docs.anthropic.com",
    ratingCoding: 3,
    ratingWriting: 3,
    ratingReasoning: 2,
    useCases: ["Real-time chat", "Simple tasks", "High-volume automation", "Quick summarization"],
    bestFor: ["Fast response", "Cost saving"],
  },

  // ── Google ─────────────────────────────────────────────────────────────────
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "reasoning",
    contextWindow: 1_048_576,
    maxOutput: 65_536,
    pricing: { input: 1.25, output: 10 },
    speed: "medium",
    releaseDate: "2025-03",
    dataSource: "official",
    tags: ["reasoning", "vision", "long-context", "tools"],
    description: {
      en: "Gemini 2.5 Pro is Google's most capable model with native 1M token context and state-of-the-art reasoning.",
      zh: "Gemini 2.5 Pro 是 Google 最强模型，原生 100 万 Token 上下文，最先进的推理能力。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://deepmind.google/technologies/gemini/pro/",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    ratingCoding: 4,
    ratingWriting: 4,
    ratingReasoning: 5,
    useCases: ["Long document processing", "Complex reasoning", "Multimodal analysis", "Research"],
    bestFor: ["Reasoning", "Long context"],
    isTrending: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    category: "chat",
    contextWindow: 1_048_576,
    maxOutput: 8_192,
    pricing: { input: 0.1, output: 0.4 },
    speed: "fast",
    releaseDate: "2025-02",
    dataSource: "official",
    tags: ["fast", "vision", "long-context", "cost-effective"],
    description: {
      en: "Gemini 2.0 Flash is Google's workhorse model — fast, efficient, and multimodal.",
      zh: "Gemini 2.0 Flash 是 Google 主力模型，快速高效，支持多模态输入。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://deepmind.google/technologies/gemini/flash/",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    ratingCoding: 3,
    ratingWriting: 3,
    ratingReasoning: 3,
    useCases: ["High-volume tasks", "Quick summarization", "Real-time apps", "Cost-sensitive pipelines"],
    bestFor: ["Cheap models", "Fast response"],
  },

  // ── DeepSeek ───────────────────────────────────────────────────────────────
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    category: "coding",
    contextWindow: 128_000,
    maxOutput: 8_192,
    pricing: { input: 0.27, output: 1.1 },
    speed: "medium",
    releaseDate: "2024-12",
    dataSource: "official",
    tags: ["coding", "cost-effective", "open-source"],
    description: {
      en: "DeepSeek V3 is a highly competitive MoE model for coding and general reasoning at low cost.",
      zh: "DeepSeek V3 是极具竞争力的 MoE 模型，代码能力强，成本低廉。",
    },
    supportsVision: false,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: true,
    officialUrl: "https://www.deepseek.com",
    docsUrl: "https://api-docs.deepseek.com",
    ratingCoding: 5,
    ratingWriting: 3,
    ratingReasoning: 4,
    useCases: ["Code generation", "Code review", "General Q&A", "Self-hosting"],
    bestFor: ["Coding", "Cheap models"],
    isTrending: true,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "reasoning",
    contextWindow: 128_000,
    maxOutput: 8_192,
    pricing: { input: 0.55, output: 2.19 },
    speed: "slow",
    releaseDate: "2025-01",
    dataSource: "official",
    tags: ["reasoning", "coding", "cost-effective", "open-source"],
    description: {
      en: "DeepSeek R1 is a chain-of-thought reasoning model rivaling o1 at a fraction of the cost.",
      zh: "DeepSeek R1 是链式思维推理模型，以极低成本媲美 o1。",
    },
    supportsVision: false,
    supportsTools: false,
    supportsApi: true,
    supportsLocal: true,
    officialUrl: "https://www.deepseek.com",
    docsUrl: "https://api-docs.deepseek.com",
    ratingCoding: 5,
    ratingWriting: 3,
    ratingReasoning: 5,
    useCases: ["Math problems", "Complex reasoning", "Research analysis", "Self-hosting"],
    bestFor: ["Reasoning", "Coding", "Cheap models"],
    isTrending: true,
  },

  // ── Alibaba ────────────────────────────────────────────────────────────────
  {
    id: "qwen-2.5-72b",
    name: "Qwen 2.5 72B",
    provider: "Alibaba",
    category: "coding",
    contextWindow: 128_000,
    maxOutput: 8_192,
    pricing: { input: 0.4, output: 1.2 },
    speed: "medium",
    releaseDate: "2024-09",
    dataSource: "official",
    tags: ["multilingual", "coding", "open-source"],
    description: {
      en: "Qwen 2.5 72B is Alibaba's open-source flagship with strong multilingual and coding capabilities.",
      zh: "Qwen 2.5 72B 是阿里巴巴开源旗舰模型，多语言与代码能力突出。",
    },
    supportsVision: false,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: true,
    officialUrl: "https://qwenlm.github.io",
    docsUrl: "https://qwen.readthedocs.io",
    ratingCoding: 4,
    ratingWriting: 3,
    ratingReasoning: 3,
    useCases: ["Code generation", "Multilingual tasks", "Self-hosting", "Research"],
    bestFor: ["Coding", "Cheap models"],
  },

  // ── Moonshot ───────────────────────────────────────────────────────────────
  {
    id: "moonshot-kimi-k1.5",
    name: "Moonshot Kimi K1.5",
    provider: "Moonshot",
    category: "reasoning",
    contextWindow: 128_000,
    maxOutput: 8_192,
    pricing: { input: 0.5, output: 2 },
    speed: "medium",
    releaseDate: "2025-01",
    dataSource: "estimated",
    tags: ["reasoning", "multilingual", "long-context"],
    description: {
      en: "Moonshot Kimi K1.5 is a multimodal reasoning model with strong Chinese language support.",
      zh: "月之暗面 Kimi K1.5 是多模态推理模型，中文能力强劲。",
    },
    supportsVision: true,
    supportsTools: true,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://kimi.moonshot.cn",
    docsUrl: "https://platform.moonshot.cn/docs",
    ratingCoding: 3,
    ratingWriting: 4,
    ratingReasoning: 4,
    useCases: ["Chinese content", "Reasoning tasks", "Multilingual apps", "Research"],
    bestFor: ["Reasoning", "Writing"],
  },

  // ── Image Generation ───────────────────────────────────────────────────────
  {
    id: "flux-1",
    name: "FLUX.1",
    provider: "Black Forest Labs",
    category: "image",
    contextWindow: 0,
    maxOutput: 0,
    pricing: { input: 0, output: 0, note: "from $0.003/image" },
    speed: "fast",
    releaseDate: "2024-08",
    dataSource: "official",
    tags: ["image", "open-source", "api"],
    description: {
      en: "FLUX.1 is a state-of-the-art image generation model known for photorealism and prompt accuracy.",
      zh: "FLUX.1 是最先进的图像生成模型，以照片级真实感和提示词准确性著称。",
    },
    supportsVision: false,
    supportsTools: false,
    supportsApi: true,
    supportsLocal: true,
    officialUrl: "https://blackforestlabs.ai",
    docsUrl: "https://docs.bfl.ml",
    ratingCoding: 0,
    ratingWriting: 0,
    ratingReasoning: 0,
    useCases: ["Product photography", "Art generation", "Marketing visuals", "Self-hosting"],
    bestFor: ["Image generation"],
    isTrending: true,
  },
  {
    id: "midjourney-v6",
    name: "Midjourney v6",
    provider: "Midjourney",
    category: "image",
    contextWindow: 0,
    maxOutput: 0,
    pricing: { input: 0, output: 0, note: "from $10/month" },
    speed: "medium",
    releaseDate: "2023-12",
    dataSource: "official",
    tags: ["image", "artistic", "subscription"],
    description: {
      en: "Midjourney v6 produces stunning artistic images with exceptional aesthetic quality.",
      zh: "Midjourney v6 生成令人惊叹的艺术图像，美学质量卓越。",
    },
    supportsVision: false,
    supportsTools: false,
    supportsApi: false,
    supportsLocal: false,
    officialUrl: "https://midjourney.com",
    ratingCoding: 0,
    ratingWriting: 0,
    ratingReasoning: 0,
    useCases: ["Concept art", "Illustration", "Creative projects", "Marketing"],
    bestFor: ["Image generation"],
  },
  {
    id: "sdxl",
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    category: "image",
    contextWindow: 0,
    maxOutput: 0,
    pricing: { input: 0, output: 0, note: "open source / self-host" },
    speed: "fast",
    releaseDate: "2023-07",
    dataSource: "official",
    tags: ["image", "open-source", "local"],
    description: {
      en: "Stable Diffusion XL is the leading open-source image generation model for local deployment.",
      zh: "Stable Diffusion XL 是领先的开源图像生成模型，支持本地部署。",
    },
    supportsVision: false,
    supportsTools: false,
    supportsApi: true,
    supportsLocal: true,
    officialUrl: "https://stability.ai",
    docsUrl: "https://platform.stability.ai/docs",
    ratingCoding: 0,
    ratingWriting: 0,
    ratingReasoning: 0,
    useCases: ["Local image generation", "Fine-tuning", "Research", "Cost-free generation"],
    bestFor: ["Image generation"],
  },

  // ── Video Generation ───────────────────────────────────────────────────────
  {
    id: "sora",
    name: "Sora",
    provider: "OpenAI",
    category: "video",
    contextWindow: 0,
    maxOutput: 0,
    pricing: { input: 0, output: 0, note: "included in ChatGPT Plus" },
    speed: "slow",
    releaseDate: "2024-12",
    dataSource: "official",
    tags: ["video", "text-to-video"],
    description: {
      en: "Sora generates realistic and imaginative videos from text prompts up to 60 seconds.",
      zh: "Sora 根据文本提示生成逼真且富有想象力的视频，时长最长 60 秒。",
    },
    supportsVision: false,
    supportsTools: false,
    supportsApi: false,
    supportsLocal: false,
    officialUrl: "https://openai.com/sora",
    ratingCoding: 0,
    ratingWriting: 0,
    ratingReasoning: 0,
    useCases: ["Video ads", "Creative storytelling", "Concept visualization", "Entertainment"],
    bestFor: ["Video generation"],
    isTrending: true,
  },
  {
    id: "kling",
    name: "Kling AI",
    provider: "Kling AI",
    category: "video",
    contextWindow: 0,
    maxOutput: 0,
    pricing: { input: 0, output: 0, note: "from $9.99/month" },
    speed: "medium",
    releaseDate: "2024-06",
    dataSource: "official",
    tags: ["video", "text-to-video", "image-to-video"],
    description: {
      en: "Kling AI generates high-quality videos with realistic motion and fluid transitions.",
      zh: "Kling AI 生成高质量视频，具有真实的运动效果和流畅的转场。",
    },
    supportsVision: false,
    supportsTools: false,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://klingai.com",
    ratingCoding: 0,
    ratingWriting: 0,
    ratingReasoning: 0,
    useCases: ["Short films", "Marketing videos", "Social media content", "Prototyping"],
    bestFor: ["Video generation"],
    isTrending: true,
  },
  {
    id: "veo-2",
    name: "Veo 2",
    provider: "Google",
    category: "video",
    contextWindow: 0,
    maxOutput: 0,
    pricing: { input: 0, output: 0, note: "via Google Labs" },
    speed: "slow",
    releaseDate: "2024-12",
    dataSource: "official",
    tags: ["video", "text-to-video", "cinematic"],
    description: {
      en: "Veo 2 is Google's advanced video generation model with cinematic quality and physics understanding.",
      zh: "Veo 2 是 Google 的高级视频生成模型，具有电影级质量和物理理解能力。",
    },
    supportsVision: false,
    supportsTools: false,
    supportsApi: false,
    supportsLocal: false,
    officialUrl: "https://deepmind.google/technologies/veo/",
    ratingCoding: 0,
    ratingWriting: 0,
    ratingReasoning: 0,
    useCases: ["Cinematic videos", "Brand content", "Creative projects"],
    bestFor: ["Video generation"],
  },
  {
    id: "runway-gen3",
    name: "Runway Gen-3",
    provider: "Runway",
    category: "video",
    contextWindow: 0,
    maxOutput: 0,
    pricing: { input: 0, output: 0, note: "from $12/month" },
    speed: "medium",
    releaseDate: "2024-06",
    dataSource: "official",
    tags: ["video", "text-to-video", "image-to-video", "api"],
    description: {
      en: "Runway Gen-3 Alpha is a powerful video generation model with API access for developers.",
      zh: "Runway Gen-3 Alpha 是功能强大的视频生成模型，为开发者提供 API 访问。",
    },
    supportsVision: false,
    supportsTools: false,
    supportsApi: true,
    supportsLocal: false,
    officialUrl: "https://runwayml.com",
    docsUrl: "https://docs.runwayml.com",
    ratingCoding: 0,
    ratingWriting: 0,
    ratingReasoning: 0,
    useCases: ["Film production", "Marketing", "Creative tools", "API integration"],
    bestFor: ["Video generation"],
  },
];

// ── Merge curated + generated (curated takes precedence) ──────────────────
const curatedIds = new Set(curatedModels.map((m) => m.id));
export const models: Model[] = [
  ...curatedModels,
  ...generatedModels.filter((m) => !curatedIds.has(m.id)),
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getModelById(id: string): Model | undefined {
  return models.find((m) => m.id === id);
}

export function getModelsByProvider(provider: ModelProvider): Model[] {
  return models.filter((m) => m.provider === provider);
}

export function getModelsByCategory(category: ModelCategory): Model[] {
  return models.filter((m) => m.category === category);
}

export function getModelsSortedByInputPrice(): Model[] {
  return [...models].filter((m) => m.pricing.input > 0).sort((a, b) => a.pricing.input - b.pricing.input);
}

export function getModelsSortedByContextWindow(): Model[] {
  return [...models].filter((m) => m.contextWindow > 0).sort((a, b) => b.contextWindow - a.contextWindow);
}

export function getTrendingModels(): Model[] {
  return models.filter((m) => m.isTrending);
}

export function getLatestModels(): Model[] {
  return models.filter((m) => m.isLatest);
}

export const providers: ModelProvider[] = Array.from(
  new Set(models.map((m) => m.provider))
).sort();

export const PROVIDER_SLUGS: Record<string, ModelProvider> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  deepseek: "DeepSeek",
  alibaba: "Alibaba",
  moonshot: "Moonshot",
};

export const COMPARE_PRESETS = [
  { slug: "gpt-4o-vs-claude-sonnet", left: "gpt-4o", right: "claude-sonnet-4-6", label: "GPT-4o vs Claude Sonnet" },
  { slug: "claude-vs-gemini", left: "claude-opus-4-7", right: "gemini-2.5-pro", label: "Claude Opus vs Gemini" },
  { slug: "deepseek-vs-gpt", left: "deepseek-r1", right: "gpt-4o", label: "DeepSeek R1 vs GPT-4o" },
];
