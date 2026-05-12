import { setRequestLocale } from "next-intl/server";
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

const PROVIDER_INFO: Record<string, { description: string; website: string; apiUrl?: string }> = {
  openai: {
    description: "OpenAI is the creator of GPT series models. Known for ChatGPT, DALL-E, Sora, and the GPT API powering millions of applications worldwide.",
    website: "https://openai.com",
    apiUrl: "https://platform.openai.com",
  },
  anthropic: {
    description: "Anthropic builds AI systems that are safe, beneficial, and understandable. Their Claude models are known for helpfulness, harmlessness, and honesty.",
    website: "https://anthropic.com",
    apiUrl: "https://docs.anthropic.com",
  },
  google: {
    description: "Google DeepMind develops the Gemini series — powerful multimodal models with some of the largest context windows available.",
    website: "https://deepmind.google",
    apiUrl: "https://ai.google.dev",
  },
  deepseek: {
    description: "DeepSeek is a Chinese AI company building highly capable open-source models for coding and reasoning at remarkably low cost.",
    website: "https://www.deepseek.com",
    apiUrl: "https://api-docs.deepseek.com",
  },
  alibaba: {
    description: "Alibaba's Qwen series are powerful open-source models with strong multilingual and coding capabilities, freely available for research and commercial use.",
    website: "https://qwenlm.github.io",
    apiUrl: "https://qwen.readthedocs.io",
  },
  moonshot: {
    description: "Moonshot AI (月之暗面) develops Kimi — a leading Chinese AI assistant with strong reasoning and long-context capabilities.",
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Models
      </Link>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${PROVIDER_BADGE[provider] ?? "bg-muted text-muted-foreground"}`}>
            {provider}
          </span>
          <span className="text-sm text-muted-foreground">{providerModels.length} models</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{provider} AI Models</h1>
        {info && <p className="text-muted-foreground max-w-2xl">{info.description}</p>}
        {info && (
          <div className="flex gap-3">
            <a href={info.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:underline">
              Official Website <ExternalLink className="h-3 w-3" />
            </a>
            {info.apiUrl && (
              <a href={info.apiUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                API Docs <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              {["Model","Category","Input /1M","Output /1M","Context","API","Details"].map((h, i) => (
                <th key={h} className={`px-4 py-3 font-medium text-muted-foreground ${i >= 2 && i <= 4 ? "text-right" : i === 5 ? "text-center" : "text-left"}`}>{h}</th>
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
                <td className="px-4 py-3 capitalize text-muted-foreground">{model.category}</td>
                <td className="px-4 py-3 text-right font-mono text-foreground">{formatPrice(model.pricing.input)}</td>
                <td className="px-4 py-3 text-right font-mono text-foreground">{formatPrice(model.pricing.output)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatContext(model.contextWindow)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block h-2 w-2 rounded-full ${model.supportsApi ? "bg-green-400" : "bg-muted"}`} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/models/${model.id}`} className="text-blue-400 hover:underline text-xs">View →</Link>
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
