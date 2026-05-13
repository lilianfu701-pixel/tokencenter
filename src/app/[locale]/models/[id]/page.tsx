import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { models, getModelById, COMPARE_PRESETS } from "@/data/models";
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

type Params = Promise<{ locale: string; id: string }>;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    models.map((model) => ({ locale, id: model.id }))
  );
}

const BASE_URL = "https://tokencenter.cc";

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, id } = await params;
  const model = getModelById(id);
  if (!model) return {};

  const description = (locale === "zh" && model.description.zh) ? model.description.zh : model.description.en;
  const priceNote = model.pricing.input > 0
    ? ` Input: $${model.pricing.input}/1M tokens.`
    : model.pricing.note ? ` ${model.pricing.note}.` : "";

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = l === "en" ? `${BASE_URL}/models/${id}` : `${BASE_URL}/${l}/models/${id}`;
  }
  languages["x-default"] = `${BASE_URL}/models/${id}`;

  return {
    title: `${model.name} — Pricing, Features & Comparison`,
    description: `${description}${priceNote} Compare ${model.name} with other AI models on TokenCenter.`,
    keywords: `${model.name}, ${model.provider} AI model, ${model.name} pricing, ${model.name} API, ${model.name} vs, LLM comparison`,
    alternates: {
      canonical: locale === "en" ? `${BASE_URL}/models/${id}` : `${BASE_URL}/${locale}/models/${id}`,
      languages,
    },
    openGraph: {
      title: `${model.name} — Pricing & Details`,
      description: `${description}${priceNote}`,
      type: "article",
    },
  };
}

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

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-muted-foreground opacity-30"}>★</span>
      ))}
    </div>
  );
}

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

const SOURCE_BADGE: Record<string, string> = {
  official: "bg-green-500/15 text-green-400",
  estimated: "bg-yellow-500/15 text-yellow-400",
  experimental: "bg-purple-500/15 text-purple-400",
};

export default async function ModelDetailPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const model = getModelById(id);
  if (!model) notFound();

  const t = await getTranslations({ locale, namespace: "model" });
  const tSpeed = await getTranslations({ locale, namespace: "speedLabel" });
  const tDs = await getTranslations({ locale, namespace: "dataSource" });

  const description = (locale === "zh" && model.description.zh) ? model.description.zh : model.description.en;
  const relatedCompare = COMPARE_PRESETS.filter((p) => p.left === id || p.right === id);

  const modelSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: model.name,
    description: model.description.en,
    applicationCategory: "Artificial Intelligence",
    operatingSystem: "Cloud",
    url: `${BASE_URL}/models/${id}`,
    provider: { "@type": "Organization", name: model.provider },
    datePublished: model.releaseDate,
    ...(model.pricing.input > 0 && {
      offers: {
        "@type": "Offer",
        price: model.pricing.input,
        priceCurrency: "USD",
        description: "Per 1M input tokens",
      },
    }),
    ...(model.ratingCoding > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ((model.ratingCoding + model.ratingWriting + model.ratingReasoning) / 3).toFixed(1),
        bestRating: "5",
        worstRating: "1",
        ratingCount: "1",
      },
    }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TokenCenter", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Models", item: `${BASE_URL}/models` },
      { "@type": "ListItem", position: 3, name: model.name, item: `${BASE_URL}/models/${id}` },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(modelSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("backToModels")}
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PROVIDER_BADGE[model.provider] ?? "bg-muted text-muted-foreground"}`}>
            {model.provider}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_BADGE[model.dataSource]}`}>
            {tDs(model.dataSource)}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{model.name}</h1>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-1.5">
          {model.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">{tag}</span>
          ))}
        </div>
      </div>

      {/* Pricing & Capabilities Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pricing */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">{t("pricing")}</h2>
          {model.pricing.input > 0 ? (
            <>
              <PricingRow label={t("input")} value={formatPrice(model.pricing.input)} unit={t("perMillionTokens")} />
              <PricingRow label={t("output")} value={formatPrice(model.pricing.output)} unit={t("perMillionTokens")} />
              {model.pricing.cacheWrite !== undefined && (
                <PricingRow label={t("cacheWrite")} value={formatPrice(model.pricing.cacheWrite)} unit={t("perMillionTokens")} />
              )}
              {model.pricing.cacheRead !== undefined && (
                <PricingRow label={t("cacheRead")} value={formatPrice(model.pricing.cacheRead)} unit={t("perMillionTokens")} />
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{model.pricing.note ?? t("notTokenBased")}</p>
          )}
        </div>

        {/* Capabilities */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">{t("capabilities")}</h2>
          {model.contextWindow > 0 && <SpecRow label={t("contextWindow")} value={`${formatContext(model.contextWindow)} ${t("tokens")}`} />}
          {model.maxOutput > 0 && <SpecRow label={t("maxOutput")} value={`${formatContext(model.maxOutput)} ${t("tokens")}`} />}
          <SpecRow label={t("speed")} value={<span>{tSpeed(model.speed)}</span>} />
          <SpecRow label={t("release")} value={model.releaseDate} />
          <div className="pt-1 border-t border-border space-y-2">
            <CapRow label={t("vision")} value={model.supportsVision} />
            <CapRow label={t("toolUse")} value={model.supportsTools} />
            <CapRow label={t("apiAccess")} value={model.supportsApi} />
            <CapRow label={t("localOpen")} value={model.supportsLocal} />
          </div>
        </div>
      </div>

      {/* Best For Ratings */}
      {(model.ratingCoding > 0 || model.ratingWriting > 0 || model.ratingReasoning > 0) && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-foreground">{t("bestFor")}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("ratingCoding")}</span>
              <RatingStars rating={model.ratingCoding} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("ratingWriting")}</span>
              <RatingStars rating={model.ratingWriting} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("ratingReasoning")}</span>
              <RatingStars rating={model.ratingReasoning} />
            </div>
          </div>
        </div>
      )}

      {/* Use Cases */}
      {model.useCases.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">{t("useCases")}</h2>
          <ul className="grid grid-cols-2 gap-2">
            {model.useCases.map((u) => (
              <li key={u} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />{u}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* API Access & Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">{t("apiAccess")}</h2>
          <div className="space-y-2">
            {model.supportsApi ? (
              <>
                <a href={model.officialUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> {t("officialApi")}
                </a>
                {model.docsUrl && (
                  <a href={model.docsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-3.5 w-3.5" /> {t("apiDocumentation")}
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noPublicApi")}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">{t("officialLinks")}</h2>
          <div className="space-y-2">
            <a href={model.officialUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
              <ExternalLink className="h-3.5 w-3.5" /> {t("officialWebsite")}
            </a>
            {model.docsUrl && (
              <a href={model.docsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" /> {t("documentation")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Compare CTA */}
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">{t("compareCta", { name: model.name })}</p>
          <p className="text-sm text-muted-foreground">{t("compareSubtitle")}</p>
          {relatedCompare.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {relatedCompare.map((p) => (
                <Link key={p.slug} href={`/compare/${p.slug}`}
                  className="text-xs text-blue-400 hover:underline">{p.label} →</Link>
              ))}
            </div>
          )}
        </div>
        <Link href="/compare"
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors whitespace-nowrap">
          {t("compareBtn")}
        </Link>
      </div>
    </div>
    </>
  );
}

function PricingRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="font-mono text-sm font-medium text-foreground">{value}</span>
        <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function CapRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {value
        ? <CheckCircle2 className="h-4 w-4 text-green-400" />
        : <XCircle className="h-4 w-4 text-muted-foreground opacity-40" />
      }
    </div>
  );
}
