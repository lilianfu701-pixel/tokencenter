import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/i18n/routing";
import { models, PROVIDER_SLUGS } from "@/data/models";
import { ArrowLeft, ExternalLink } from "lucide-react";

type Params = Promise<{ locale: string; slug: string }>;

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

type ProviderInfo = {
  description: { en: string; zh: string };
  website: string;
  apiUrl?: string;
};

const PROVIDER_INFO: Record<string, ProviderInfo> = {
  openai: {
    description: {
      en: "OpenAI is the creator of GPT series models. Known for ChatGPT, DALL-E, Sora, and the GPT API powering millions of applications worldwide.",
      zh: "OpenAI 是 GPT 系列模型的创造者，以 ChatGPT、DALL-E、Sora 及 GPT API 闻名，为全球数百万应用提供支持。",
    },
    website: "https://openai.com",
    apiUrl: "https://platform.openai.com",
  },
  anthropic: {
    description: {
      en: "Anthropic builds AI systems that are safe, beneficial, and understandable. Their Claude models are known for helpfulness, harmlessness, and honesty.",
      zh: "Anthropic 专注于构建安全、有益且可理解的 AI 系统。其 Claude 系列模型以乐于助人、无害性和诚实性著称。",
    },
    website: "https://anthropic.com",
    apiUrl: "https://docs.anthropic.com",
  },
  google: {
    description: {
      en: "Google DeepMind develops the Gemini series — powerful multimodal models with some of the largest context windows available.",
      zh: "Google DeepMind 开发 Gemini 系列模型，功能强大、支持多模态，并拥有业界领先的超大上下文窗口。",
    },
    website: "https://deepmind.google",
    apiUrl: "https://ai.google.dev",
  },
  deepseek: {
    description: {
      en: "DeepSeek is a Chinese AI company building highly capable open-source models for coding and reasoning at remarkably low cost.",
      zh: "DeepSeek 是一家中国 AI 公司，以极低成本构建了在编程和推理方面表现卓越的开源模型。",
    },
    website: "https://www.deepseek.com",
    apiUrl: "https://api-docs.deepseek.com",
  },
  alibaba: {
    description: {
      en: "Alibaba's Qwen series are powerful open-source models with strong multilingual and coding capabilities, freely available for research and commercial use.",
      zh: "阿里巴巴的 Qwen（通义千问）系列是强大的开源模型，多语言与编程能力突出，可免费用于研究和商业用途。",
    },
    website: "https://qwenlm.github.io",
    apiUrl: "https://qwen.readthedocs.io",
  },
  moonshot: {
    description: {
      en: "Moonshot AI (月之暗面) develops Kimi — a leading Chinese AI assistant with strong reasoning and long-context capabilities.",
      zh: "月之暗面（Moonshot AI）开发了 Kimi——一款推理能力强、支持超长上下文的中国领先 AI 助手。",
    },
    website: "https://kimi.moonshot.cn",
    apiUrl: "https://platform.moonshot.cn/docs",
  },
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Object.keys(PROVIDER_SLUGS).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const provider = PROVIDER_SLUGS[slug];
  if (!provider) return {};
  return {
    title: `${provider} AI Models & Pricing | TokenCenter`,
    description: `All ${provider} models, pricing, and API access. Compare ${provider} models on TokenCenter.`,
  };
}

export default async function ProviderPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale, namespace: "provider" });
  const tCat = await getTranslations({ locale, namespace: "category" });

  const provider = PROVIDER_SLUGS[slug];
  if (!provider) notFound();

  const providerModels = models.filter((m) => m.provider === provider);
  const info = PROVIDER_INFO[slug];

  const PROVIDER_BADGE: Record<string, string> = {
    OpenAI: "bg-emerald-500/15 text-emerald-400",
    Anthropic: "bg-orange-500/15 text-orange-400",
    Google: "bg-blue-500/15 text-blue-400",
    DeepSeek: "bg-sky-500/15 text-sky-400",
    Alibaba: "bg-violet-500/15 text-violet-400",
    Moonshot: "bg-indigo-500/15 text-indigo-400",
  };

  const desc = info ? (locale === "zh" ? info.description.zh : info.description.en) : null;

  const tableHeaders = [
    { label: t("colModel"), align: "left" },
    { label: t("colCategory"), align: "left" },
    { label: t("colInput"), align: "right" },
    { label: t("colOutput"), align: "right" },
    { label: t("colContext"), align: "right" },
    { label: t("colApi"), align: "center" },
    { label: t("colDetails"), align: "left" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${PROVIDER_BADGE[provider] ?? "bg-muted text-muted-foreground"}`}>
            {provider}
          </span>
          <span className="text-sm text-muted-foreground">{providerModels.length} {t("models")}</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{provider} AI Models</h1>
        {desc && <p className="text-muted-foreground max-w-2xl">{desc}</p>}
        {info && (
          <div className="flex gap-3">
            <a href={info.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:underline">
              {t("officialWebsite")} <ExternalLink className="h-3 w-3" />
            </a>
            {info.apiUrl && (
              <a href={info.apiUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                {t("apiDocs")} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              {tableHeaders.map((h, i) => (
                <th key={h.label} className={`px-4 py-3 font-medium text-muted-foreground ${h.align === "right" ? "text-right" : h.align === "center" ? "text-center" : "text-left"}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {providerModels.map((model, i) => (
              <tr key={model.id} className={`border-b border-border last:border-0 hover:bg-accent transition-colors ${i % 2 === 0 ? "" : "bg-card/30"}`}>
                <td className="px-4 py-3">
                  <Link href={`/models/${model.id}`} className="font-medium text-foreground hover:text-blue-400 transition-colors">
                    {model.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{tCat(model.category)}</td>
                <td className="px-4 py-3 text-right font-mono text-foreground">{formatPrice(model.pricing.input)}</td>
                <td className="px-4 py-3 text-right font-mono text-foreground">{formatPrice(model.pricing.output)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatContext(model.contextWindow)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block h-2 w-2 rounded-full ${model.supportsApi ? "bg-green-400" : "bg-muted"}`} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/models/${model.id}`} className="text-blue-400 hover:underline text-xs">{t("view")}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(PROVIDER_SLUGS).filter(([s]) => s !== slug).map(([s, p]) => (
          <Link key={s} href={`/providers/${s}`}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-blue-500/50 transition-colors">
            {p} →
          </Link>
        ))}
      </div>
    </div>
  );
}
