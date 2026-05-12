import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import {
  models,
  curatedModels,
  getLatestModels,
  COMPARE_PRESETS,
  type ModelCategory,
} from "@/data/models";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
  return { title: meta.title, description: meta.description };
}

const CATEGORY_DEFS: { id: ModelCategory; icon: string }[] = [
  { id: "chat",      icon: "💬" },
  { id: "coding",    icon: "💻" },
  { id: "reasoning", icon: "🧠" },
  { id: "image",     icon: "🖼️" },
  { id: "video",     icon: "🎬" },
];

const PROVIDER_BADGE: Record<string, string> = {
  OpenAI:             "bg-emerald-500/15 text-emerald-400",
  Anthropic:          "bg-orange-500/15 text-orange-400",
  Google:             "bg-blue-500/15 text-blue-400",
  DeepSeek:           "bg-sky-500/15 text-sky-400",
  Alibaba:            "bg-violet-500/15 text-violet-400",
  Moonshot:           "bg-indigo-500/15 text-indigo-400",
  "Black Forest Labs":"bg-rose-500/15 text-rose-400",
  Midjourney:         "bg-teal-500/15 text-teal-400",
  "Stability AI":     "bg-amber-500/15 text-amber-400",
  Runway:             "bg-pink-500/15 text-pink-400",
  "Kling AI":         "bg-cyan-500/15 text-cyan-400",
};

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t    = await getTranslations({ locale, namespace: "home" });
  const tCat = await getTranslations({ locale, namespace: "category" });

  const latest = getLatestModels();

  // 主流大模型比价（只显示精选的 20 个，按输入价格排序，零价格排末尾）
  const featuredModels = curatedModels
    .filter((m) => m.category !== "video" && m.contextWindow > 0)
    .sort((a, b) => {
      if (a.pricing.input === 0 && b.pricing.input > 0) return 1;
      if (b.pricing.input === 0 && a.pricing.input > 0) return -1;
      return a.pricing.input - b.pricing.input;
    });

  // Build per-category model lists (trending first, then by input price)
  const HOME_LIMIT = 12;
  const CATEGORIES = CATEGORY_DEFS.map((c) => {
    const allCatModels = models
      .filter((m) => m.category === c.id)
      .sort((a, b) => {
        if (a.isTrending && !b.isTrending) return -1;
        if (!a.isTrending && b.isTrending) return 1;
        if (a.pricing.input === 0 && b.pricing.input > 0) return 1;
        if (b.pricing.input === 0 && a.pricing.input > 0) return -1;
        return a.pricing.input - b.pricing.input;
      });
    return {
      ...c,
      name: tCat(`${c.id}Name` as Parameters<typeof tCat>[0]),
      desc: tCat(`${c.id}Desc` as Parameters<typeof tCat>[0]),
      catModels: allCatModels.slice(0, HOME_LIMIT),
      totalCount: allCatModels.length,
    };
  });

  // Schema.org JSON-LD
  const apiModels = models.filter((m) => m.pricing.input > 0);
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
        offers: { "@type": "Offer", price: m.pricing.input, priceCurrency: "USD" },
      },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What is the cheapest AI model?",       acceptedAnswer: { "@type": "Answer", text: "Gemini 2.0 Flash at $0.10/1M input tokens is one of the cheapest capable AI models available via API." } },
      { "@type": "Question", name: "Which AI model is best for coding?",   acceptedAnswer: { "@type": "Answer", text: "Claude Opus 4.7 and DeepSeek V3 are consistently rated highest for coding tasks in 2026." } },
      { "@type": "Question", name: "What is the largest context window?",  acceptedAnswer: { "@type": "Answer", text: "Gemini 2.5 Pro and GPT-4.1 both support up to 1 million tokens of context window." } },
    ],
  };

  const trendingLabel  = locale === "zh" ? "热门" : "Hot";
  const latestLabel    = locale === "zh" ? "最新" : "New";

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16 pb-20">

      {/* ── Hero ── */}
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
          <Link href="/compare"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600">
            {t("hero.compareBtn")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#chat"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
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

      {/* ── 主流大模型比价表（精选）── */}
      <section id="pricing" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t("pricingTable.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("pricingTable.subtitle")}</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("pricingTable.colModel")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("pricingTable.colProvider")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("pricingTable.colCategory")}</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("pricingTable.colInput")}</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("pricingTable.colOutput")}</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("pricingTable.colContext")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("pricingTable.colApi")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("pricingTable.colDetails")}</th>
              </tr>
            </thead>
            <tbody>
              {featuredModels.map((model, i) => (
                <tr key={model.id}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-accent ${i % 2 === 0 ? "" : "bg-card/30"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/models/${model.id}`} className="font-medium text-foreground hover:text-blue-400 transition-colors">
                        {model.name}
                      </Link>
                      {model.isTrending && (
                        <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-xs text-orange-400">🔥</span>
                      )}
                      {model.isLatest && (
                        <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-xs text-green-400">NEW</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROVIDER_BADGE[model.provider] ?? "bg-muted text-muted-foreground"}`}>
                      {model.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {tCat(`${model.category}Name` as Parameters<typeof tCat>[0])}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {model.pricing.input > 0 ? formatPrice(model.pricing.input) : <span className="text-xs text-muted-foreground">{tCat("freePrice")}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {model.pricing.output > 0 ? formatPrice(model.pricing.output) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatContext(model.contextWindow)}</td>
                  <td className="px-4 py-3 text-center">
                    {model.supportsApi
                      ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" />
                      : <span className="text-muted-foreground opacity-30">—</span>
                    }
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

      {/* ── Category Sections (one full table per category) ── */}
      <div className="space-y-12">
        {CATEGORIES.map((cat) => (
          <section key={cat.id} id={cat.id} className="space-y-0">

            {/* Category header */}
            <div className="flex items-start gap-3 mb-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                {cat.icon}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{cat.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{cat.desc}</p>
              </div>
            </div>

            {/* Full model table */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tCat("colModel")}</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tCat("colProvider")}</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">{tCat("colInput")}</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">{tCat("colOutput")}</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">{tCat("colContext")}</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">{tCat("colApi")}</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tCat("colDetails")}</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.catModels.map((m, i) => (
                    <tr key={m.id}
                      className={`border-b border-border last:border-0 hover:bg-accent transition-colors ${i % 2 === 0 ? "" : "bg-card/30"}`}>

                      {/* Model name + desc + badges */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/models/${m.id}`}
                            className="font-medium text-foreground hover:text-blue-400 transition-colors">
                            {m.name}
                          </Link>
                          {m.isTrending && (
                            <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-xs text-orange-400">{trendingLabel}</span>
                          )}
                          {m.isLatest && (
                            <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-xs text-green-400">{latestLabel}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                          {(locale === "zh" && m.description.zh) ? m.description.zh : m.description.en}
                        </p>
                      </td>

                      {/* Provider */}
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROVIDER_BADGE[m.provider] ?? "bg-muted text-muted-foreground"}`}>
                          {m.provider}
                        </span>
                      </td>

                      {/* Input price */}
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {m.pricing.input > 0
                          ? formatPrice(m.pricing.input)
                          : <span className="text-xs text-muted-foreground not-mono">{tCat("freePrice")}</span>
                        }
                      </td>

                      {/* Output price */}
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {m.pricing.output > 0 ? formatPrice(m.pricing.output) : "—"}
                      </td>

                      {/* Context window */}
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatContext(m.contextWindow)}
                      </td>

                      {/* API support */}
                      <td className="px-4 py-3 text-center">
                        {m.supportsApi
                          ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" />
                          : <span className="text-muted-foreground opacity-30">—</span>
                        }
                      </td>

                      {/* Details link */}
                      <td className="px-4 py-3">
                        <Link href={`/models/${m.id}`}
                          className="text-blue-400 hover:underline text-xs whitespace-nowrap">
                          {tCat("viewDetail")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {cat.totalCount > HOME_LIMIT && (
              <div className="text-center">
                <Link href={`/category/${cat.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 px-4 py-1.5 text-sm text-blue-400 hover:border-blue-400 hover:text-blue-300 transition-colors">
                  {tCat("viewAll", { count: cat.totalCount })} →
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* ── Popular Comparisons ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{t("popular.title")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {COMPARE_PRESETS.map((preset) => {
            const left  = models.find((m) => m.id === preset.left);
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

      {/* ── Latest Models ── */}
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
