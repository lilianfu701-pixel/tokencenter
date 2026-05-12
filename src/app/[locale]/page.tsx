import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import {
  models,
  getTrendingModels,
  getLatestModels,
  COMPARE_PRESETS,
  type ModelCategory,
} from "@/data/models";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Star,
} from "lucide-react";

type Params = Promise<{ locale: string }>;

function formatPrice(price: number) {
  if (price === 0) return "—";
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function formatContext(tokens: number) {
  if (tokens === 0) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: { title: "Compare AI Models, Pricing & Performance", description: "Explore the best AI models for coding, writing, image generation, video, reasoning, and APIs. Compare ChatGPT vs Gemini vs Claude and more." },
  zh: { title: "比较 AI 大模型：价格、性能与分类", description: "探索最佳 AI 大模型：ChatGPT、Gemini、Claude、DeepSeek 等，涵盖编程、写作、图像生成、视频、推理与 API 定价。" },
  ja: { title: "AIモデル比較：価格・性能・分類", description: "ChatGPT、Gemini、Claude、DeepSeekなど、コーディング・ライティング・画像生成・動画・推論・APIに最適なAIモデルを比較。" },
  ko: { title: "AI 모델 비교: 가격, 성능 및 분류", description: "코딩, 글쓰기, 이미지 생성, 동영상, 추론, API에 최적인 AI 모델을 비교하세요. ChatGPT vs Gemini vs Claude." },
  ru: { title: "Сравнение ИИ-моделей: цены, производительность и классификация", description: "Изучите лучшие ИИ-модели для программирования, написания текстов, генерации изображений и видео. ChatGPT vs Gemini vs Claude." },
  fr: { title: "Comparer les modèles IA : Prix, Performance et Classement", description: "Découvrez les meilleurs modèles d'IA pour le codage, la rédaction, la génération d'images et de vidéos. ChatGPT vs Gemini vs Claude." },
  de: { title: "KI-Modelle vergleichen: Preise, Leistung und Klassifikation", description: "Entdecken Sie die besten KI-Modelle für Coding, Schreiben, Bildgenerierung und Video. ChatGPT vs Gemini vs Claude." },
  es: { title: "Comparar modelos IA: Precios, Rendimiento y Clasificación", description: "Explora los mejores modelos de IA para programación, escritura, generación de imágenes y vídeos. ChatGPT vs Gemini vs Claude." },
  pt: { title: "Comparar modelos IA: Preços, Desempenho e Classificação", description: "Explore os melhores modelos de IA para programação, escrita, geração de imagens e vídeos. ChatGPT vs Gemini vs Claude." },
  ar: { title: "مقارنة نماذج الذكاء الاصطناعي: الأسعار والأداء والتصنيف", description: "استكشف أفضل نماذج الذكاء الاصطناعي للبرمجة والكتابة وتوليد الصور والفيديو. ChatGPT مقابل Gemini مقابل Claude." },
  id: { title: "Bandingkan Model AI: Harga, Kinerja, dan Klasifikasi", description: "Jelajahi model AI terbaik untuk coding, penulisan, pembuatan gambar dan video. ChatGPT vs Gemini vs Claude." },
  vi: { title: "So sánh mô hình AI: Giá, Hiệu suất và Phân loại", description: "Khám phá các mô hình AI tốt nhất cho lập trình, viết lách, tạo ảnh và video. ChatGPT vs Gemini vs Claude." },
};

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const meta = PAGE_META[locale] ?? PAGE_META.en;
  return {
    title: meta.title,
    description: meta.description,
  };
}

const CATEGORY_DEFS: { id: ModelCategory; icon: string; examples: string }[] = [
  { id: "chat", icon: "💬", examples: "GPT / Claude / Gemini" },
  { id: "coding", icon: "💻", examples: "Claude / DeepSeek / Qwen" },
  { id: "reasoning", icon: "🧠", examples: "DeepSeek R1 / o-series" },
  { id: "image", icon: "🖼️", examples: "FLUX / Midjourney / SDXL" },
  { id: "video", icon: "🎬", examples: "Sora / Kling / Veo / Runway" },
];

const PROVIDER_BADGE: Record<string, string> = {
  OpenAI: "bg-emerald-500/15 text-emerald-400",
  Anthropic: "bg-orange-500/15 text-orange-400",
  Google: "bg-blue-500/15 text-blue-400",
  DeepSeek: "bg-sky-500/15 text-sky-400",
  Alibaba: "bg-violet-500/15 text-violet-400",
  Moonshot: "bg-indigo-500/15 text-indigo-400",
  "Black Forest Labs": "bg-rose-500/15 text-rose-400",
  Midjourney: "bg-teal-500/15 text-teal-400",
  "Stability AI": "bg-amber-500/15 text-amber-400",
  Runway: "bg-pink-500/15 text-pink-400",
  "Kling AI": "bg-cyan-500/15 text-cyan-400",
};

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const tCat = await getTranslations({ locale, namespace: "category" });
  const tSpeed = await getTranslations({ locale, namespace: "speedLabel" });

  const trending = getTrendingModels();
  const latest = getLatestModels();
  const apiModels = models.filter((m) => m.pricing.input > 0);

  const CATEGORIES = CATEGORY_DEFS.map((c) => ({
    ...c,
    label: t(`categories.${c.id}`),
  }));

  const BEST_FOR = [
    { labelKey: "bestFor.coding", models: ["Claude Opus 4.7", "DeepSeek V3", "GPT-4.1"], icon: "💻", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { labelKey: "bestFor.writing", models: ["Claude Sonnet 4.6", "Gemini 2.5 Pro", "GPT-4o"], icon: "✍️", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { labelKey: "bestFor.cheap", models: ["Gemini 2.0 Flash", "DeepSeek V3", "Claude Haiku 4.5"], icon: "💰", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { labelKey: "bestFor.video", models: ["Sora", "Kling AI", "Veo 2"], icon: "🎬", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  ];

  const tableHeaders = [
    t("pricingTable.colModel"),
    t("pricingTable.colProvider"),
    t("pricingTable.colCategory"),
    t("pricingTable.colInput"),
    t("pricingTable.colOutput"),
    t("pricingTable.colContext"),
    t("pricingTable.colApi"),
    t("pricingTable.colDetails"),
  ];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI Language Models Comparison",
    description: "Comprehensive list of AI models with pricing and capabilities",
    numberOfItems: apiModels.length,
    itemListElement: apiModels.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.name,
      url: `https://tokencenter.cc/models/${m.id}`,
      item: {
        "@type": "SoftwareApplication",
        name: m.name,
        applicationCategory: "Artificial Intelligence",
        operatingSystem: "Cloud",
        offers: m.pricing.input > 0 ? {
          "@type": "Offer",
          price: m.pricing.input,
          priceCurrency: "USD",
          description: "Per 1M input tokens",
        } : undefined,
      },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What is the cheapest AI model?", acceptedAnswer: { "@type": "Answer", text: "Gemini 2.0 Flash at $0.10/1M input tokens is one of the cheapest capable AI models available via API." } },
      { "@type": "Question", name: "Which AI model is best for coding?", acceptedAnswer: { "@type": "Answer", text: "Claude Opus 4.7 and DeepSeek V3 are consistently rated highest for coding tasks in 2026." } },
      { "@type": "Question", name: "What is the largest context window?", acceptedAnswer: { "@type": "Answer", text: "Gemini 2.5 Pro and GPT-4.1 both support up to 1 million tokens of context window." } },
    ],
  };

  const modelDesc = (m: typeof trending[0]) =>
    locale === "zh" ? m.description.zh : m.description.en;

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-20 pb-20">

      {/* Hero */}
      <section className="pt-16 pb-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 inline-block" />
          {t("badge")}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {t("hero.title1")}<br />
          <span className="text-blue-400">{t("hero.title2")}</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/compare" className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600">
            {t("hero.compareBtn")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#pricing" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
            {t("hero.pricingBtn")}
          </Link>
        </div>
        <div className="mx-auto max-w-lg">
          <div className="relative">
            <input type="text" placeholder={t("hero.searchPlaceholder")} readOnly
              className="w-full rounded-xl border border-border bg-card px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 transition-all cursor-text" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{t("categories.title")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`#${cat.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-blue-500/50 hover:bg-accent">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-xl group-hover:bg-blue-500/20">
                {cat.icon}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.examples}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Models */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" /> {t("trending.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((m) => (
            <Link key={m.id} href={`/models/${m.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-blue-500/50 hover:bg-accent">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROVIDER_BADGE[m.provider] ?? "bg-muted text-muted-foreground"}`}>
                  {m.provider}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{tCat(m.category)}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{modelDesc(m)}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                {m.pricing.input > 0
                  ? <span className="text-xs text-muted-foreground">{t("trending.from")} <span className="font-mono text-foreground">${m.pricing.input}</span>/1M</span>
                  : <span className="text-xs text-muted-foreground">{m.pricing.note ?? "—"}</span>
                }
                <span className="text-xs text-blue-400 group-hover:underline">{t("trending.viewDetails")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best For */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{t("bestFor.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BEST_FOR.map((section) => (
            <div key={section.labelKey} className={`rounded-xl border p-5 ${section.bg}`}>
              <div className={`flex items-center gap-2 font-semibold text-sm mb-3 ${section.color}`}>
                <span>{section.icon}</span> {t(section.labelKey as Parameters<typeof t>[0])}
              </div>
              <ul className="space-y-1.5">
                {section.models.map((name) => (
                  <li key={name} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 shrink-0 text-yellow-500" /> {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Compare Presets */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{t("popular.title")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {COMPARE_PRESETS.map((preset) => {
            const left = models.find((m) => m.id === preset.left);
            const right = models.find((m) => m.id === preset.right);
            if (!left || !right) return null;
            return (
              <Link key={preset.slug} href={`/compare/${preset.slug}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-blue-500/50 hover:bg-accent">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-foreground">{left.name}</span>
                  <span className="text-muted-foreground text-xs">vs</span>
                  <span className="font-medium text-foreground">{right.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
              </Link>
            );
          })}
        </div>
        <div className="text-center">
          <Link href="/compare" className="text-sm text-blue-400 hover:underline">
            {t("popular.custom")}
          </Link>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t("pricingTable.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("pricingTable.subtitle")}</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                {tableHeaders.map((h, i) => (
                  <th key={h} className={`px-4 py-3 font-medium text-muted-foreground ${i >= 3 && i <= 5 ? "text-right" : i === 6 ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiModels.map((model, i) => (
                <tr key={model.id} className={`border-b border-border last:border-0 transition-colors hover:bg-accent ${i % 2 === 0 ? "" : "bg-card/30"}`}>
                  <td className="px-4 py-3">
                    <Link href={`/models/${model.id}`} className="font-medium text-foreground hover:text-blue-400 transition-colors">
                      {model.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROVIDER_BADGE[model.provider] ?? "bg-muted text-muted-foreground"}`}>
                      {model.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tCat(model.category)}</td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{formatPrice(model.pricing.input)}</td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{formatPrice(model.pricing.output)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatContext(model.contextWindow)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block h-2 w-2 rounded-full ${model.supportsApi ? "bg-green-400" : "bg-muted"}`} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/models/${model.id}`} className="text-blue-400 hover:underline text-xs">{t("pricingTable.view")}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Latest Models */}
      {latest.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{t("latest.title")}</h2>
          <div className="flex flex-wrap gap-3">
            {latest.map((m) => (
              <Link key={m.id} href={`/models/${m.id}`}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-all hover:border-blue-500/50 hover:bg-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="font-medium text-foreground">{m.name}</span>
                <span className="text-muted-foreground text-xs">{m.releaseDate}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
