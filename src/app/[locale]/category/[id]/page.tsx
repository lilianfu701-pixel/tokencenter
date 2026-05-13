import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { locales, type Locale } from "@/i18n/routing";
import { models, type ModelCategory } from "@/data/models";

type Params = Promise<{ locale: string; id: string }>;

const CATEGORY_META: Record<ModelCategory, { icon: string; nameKey: string; descKey: string }> = {
  chat:      { icon: "💬", nameKey: "chatName",      descKey: "chatDesc" },
  coding:    { icon: "💻", nameKey: "codingName",    descKey: "codingDesc" },
  reasoning: { icon: "🧠", nameKey: "reasoningName", descKey: "reasoningDesc" },
  image:     { icon: "🖼️", nameKey: "imageName",     descKey: "imageDesc" },
  video:     { icon: "🎬", nameKey: "videoName",     descKey: "videoDesc" },
};

const VALID_CATEGORIES = Object.keys(CATEGORY_META) as ModelCategory[];

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    VALID_CATEGORIES.map((id) => ({ locale, id }))
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, id } = await params;
  if (!VALID_CATEGORIES.includes(id as ModelCategory)) return {};
  const t = await getTranslations({ locale, namespace: "category" });
  const meta = CATEGORY_META[id as ModelCategory];
  const name = t(meta.nameKey as Parameters<typeof t>[0]);
  const desc = t(meta.descKey as Parameters<typeof t>[0]);
  return {
    title: `${name} — TokenCenter`,
    description: desc,
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

export default async function CategoryPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  if (!VALID_CATEGORIES.includes(id as ModelCategory)) notFound();

  const t = await getTranslations({ locale, namespace: "category" });
  const tDs = await getTranslations({ locale, namespace: "dataSource" });
  const tSpeed = await getTranslations({ locale, namespace: "speedLabel" });

  const meta = CATEGORY_META[id as ModelCategory];
  const name = t(meta.nameKey as Parameters<typeof t>[0]);
  const desc = t(meta.descKey as Parameters<typeof t>[0]);

  const catModels = models
    .filter((m) => m.category === id)
    .sort((a, b) => {
      if (a.isTrending && !b.isTrending) return -1;
      if (!a.isTrending && b.isTrending) return 1;
      return a.pricing.input - b.pricing.input;
    });

  const tableHeaders = [
    { label: t("colModel"), align: "left" },
    { label: t("colProvider"), align: "left" },
    { label: t("colInput"), align: "right" },
    { label: t("colOutput"), align: "right" },
    { label: t("colContext"), align: "right" },
    { label: t("colApi"), align: "center" },
    { label: t("colDetails"), align: "left" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("backToHome")}
      </Link>

      {/* Hero */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">{meta.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground">{t("pageSubtitle", { count: catModels.length })}</p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl">{desc}</p>
      </div>

      {/* Model Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              {tableHeaders.map((h) => (
                <th key={h.label}
                  className={`px-4 py-3 font-medium text-muted-foreground ${
                    h.align === "right" ? "text-right" : h.align === "center" ? "text-center" : "text-left"
                  }`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {catModels.map((model, i) => (
              <tr key={model.id}
                className={`border-b border-border last:border-0 hover:bg-accent transition-colors ${i % 2 === 0 ? "" : "bg-card/30"}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/models/${model.id}`} className="font-medium text-foreground hover:text-blue-400 transition-colors">
                      {model.name}
                    </Link>
                    {model.isTrending && (
                      <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-xs text-orange-400">热门</span>
                    )}
                    {model.isLatest && (
                      <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-xs text-green-400">最新</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {(locale === "zh" && model.description.zh) ? model.description.zh : model.description.en}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROVIDER_BADGE[model.provider] ?? "bg-muted text-muted-foreground"}`}>
                    {model.provider}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {model.pricing.input > 0 ? formatPrice(model.pricing.input) : <span className="text-xs text-muted-foreground">{t("freePrice")}</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {model.pricing.output > 0 ? formatPrice(model.pricing.output) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatContext(model.contextWindow)}</td>
                <td className="px-4 py-3 text-center">
                  {model.supportsApi
                    ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" />
                    : <span className="text-muted-foreground opacity-40">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <Link href={`/models/${model.id}`} className="text-blue-400 hover:underline text-xs">{t("viewDetail")}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Other categories */}
      <div className="flex flex-wrap gap-2">
        {VALID_CATEGORIES.filter((c) => c !== id).map((c) => {
          const m = CATEGORY_META[c];
          return (
            <Link key={c} href={`/category/${c}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-blue-500/50 transition-colors">
              <span>{m.icon}</span>
              {t(m.nameKey as Parameters<typeof t>[0])} →
            </Link>
          );
        })}
      </div>
    </div>
  );
}
