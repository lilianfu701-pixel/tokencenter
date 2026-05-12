import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/i18n/routing";
import { models, COMPARE_PRESETS } from "@/data/models";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

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

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    COMPARE_PRESETS.map((p) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const preset = COMPARE_PRESETS.find((p) => p.slug === slug);
  if (!preset) return {};
  return {
    title: `${preset.label} — Compare | TokenCenter`,
    description: `Side-by-side comparison of ${preset.label}. Pricing, context, capabilities and more.`,
  };
}

export default async function CompareSlugPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const preset = COMPARE_PRESETS.find((p) => p.slug === slug);
  if (!preset) notFound();

  const left = models.find((m) => m.id === preset.left);
  const right = models.find((m) => m.id === preset.right);
  if (!left || !right) notFound();

  const rows: { label: string; leftVal: React.ReactNode; rightVal: React.ReactNode; winner?: "left" | "right" | "tie" }[] = [
    {
      label: "Input Price /1M",
      leftVal: <span className="font-mono">{formatPrice(left.pricing.input)}</span>,
      rightVal: <span className="font-mono">{formatPrice(right.pricing.input)}</span>,
      winner: left.pricing.input < right.pricing.input ? "left" : right.pricing.input < left.pricing.input ? "right" : "tie",
    },
    {
      label: "Output Price /1M",
      leftVal: <span className="font-mono">{formatPrice(left.pricing.output)}</span>,
      rightVal: <span className="font-mono">{formatPrice(right.pricing.output)}</span>,
      winner: left.pricing.output < right.pricing.output ? "left" : right.pricing.output < left.pricing.output ? "right" : "tie",
    },
    {
      label: "Context Window",
      leftVal: <span className="font-mono">{formatContext(left.contextWindow)}</span>,
      rightVal: <span className="font-mono">{formatContext(right.contextWindow)}</span>,
      winner: left.contextWindow > right.contextWindow ? "left" : right.contextWindow > left.contextWindow ? "right" : "tie",
    },
    {
      label: "Max Output",
      leftVal: <span className="font-mono">{formatContext(left.maxOutput)}</span>,
      rightVal: <span className="font-mono">{formatContext(right.maxOutput)}</span>,
      winner: left.maxOutput > right.maxOutput ? "left" : right.maxOutput > left.maxOutput ? "right" : "tie",
    },
    {
      label: "Speed",
      leftVal: <span className="capitalize">{left.speed}</span>,
      rightVal: <span className="capitalize">{right.speed}</span>,
    },
    {
      label: "Coding Rating",
      leftVal: "★".repeat(left.ratingCoding) + "☆".repeat(5 - left.ratingCoding),
      rightVal: "★".repeat(right.ratingCoding) + "☆".repeat(5 - right.ratingCoding),
      winner: left.ratingCoding > right.ratingCoding ? "left" : right.ratingCoding > left.ratingCoding ? "right" : "tie",
    },
    {
      label: "Writing Rating",
      leftVal: "★".repeat(left.ratingWriting) + "☆".repeat(5 - left.ratingWriting),
      rightVal: "★".repeat(right.ratingWriting) + "☆".repeat(5 - right.ratingWriting),
      winner: left.ratingWriting > right.ratingWriting ? "left" : right.ratingWriting > left.ratingWriting ? "right" : "tie",
    },
    {
      label: "Reasoning Rating",
      leftVal: "★".repeat(left.ratingReasoning) + "☆".repeat(5 - left.ratingReasoning),
      rightVal: "★".repeat(right.ratingReasoning) + "☆".repeat(5 - right.ratingReasoning),
      winner: left.ratingReasoning > right.ratingReasoning ? "left" : right.ratingReasoning > left.ratingReasoning ? "right" : "tie",
    },
    {
      label: "Vision",
      leftVal: left.supportsVision ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" /> : <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />,
      rightVal: right.supportsVision ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" /> : <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Tool Use",
      leftVal: left.supportsTools ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" /> : <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />,
      rightVal: right.supportsTools ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" /> : <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "API",
      leftVal: left.supportsApi ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" /> : <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />,
      rightVal: right.supportsApi ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" /> : <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Local / Open-source",
      leftVal: left.supportsLocal ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" /> : <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />,
      rightVal: right.supportsLocal ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" /> : <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Release Date",
      leftVal: left.releaseDate,
      rightVal: right.releaseDate,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <Link href="/compare" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Compare
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground">{preset.label}</h1>
        <p className="text-muted-foreground mt-1">Side-by-side comparison</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-4 text-left font-medium text-muted-foreground w-40">Feature</th>
              <th className="px-4 py-4 text-center">
                <div>
                  <p className="font-semibold text-foreground">{left.name}</p>
                  <p className="text-xs text-muted-foreground">{left.provider}</p>
                </div>
              </th>
              <th className="px-4 py-4 text-center">
                <div>
                  <p className="font-semibold text-foreground">{right.name}</p>
                  <p className="text-xs text-muted-foreground">{right.provider}</p>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-card/30"}`}>
                <td className="px-4 py-3 text-sm text-muted-foreground">{row.label}</td>
                <td className={`px-4 py-3 text-center relative ${row.winner === "left" ? "text-blue-400 font-semibold" : "text-foreground"}`}>
                  {row.winner === "left" && <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-400" />}
                  {row.leftVal}
                </td>
                <td className={`px-4 py-3 text-center relative ${row.winner === "right" ? "text-blue-400 font-semibold" : "text-foreground"}`}>
                  {row.winner === "right" && <span className="absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-400" />}
                  {row.rightVal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[left, right].map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div>
              <p className="font-semibold text-foreground">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.provider}</p>
            </div>
            <p className="text-sm text-muted-foreground">{m.description.en}</p>
            <div className="flex gap-2 flex-wrap">
              {m.useCases.slice(0, 3).map((u) => (
                <span key={u} className="rounded-full bg-accent border border-border px-2 py-0.5 text-xs text-muted-foreground">{u}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <Link href={`/models/${m.id}`} className="text-xs text-blue-400 hover:underline">Full Details →</Link>
              <a href={m.officialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">Official Site ↗</a>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground mb-3">Other Comparisons</p>
        <div className="flex flex-wrap gap-2">
          {COMPARE_PRESETS.filter((p) => p.slug !== slug).map((p) => (
            <Link key={p.slug} href={`/compare/${p.slug}`}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-blue-500/50 transition-colors">
              {p.label}
            </Link>
          ))}
          <Link href="/compare" className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors">
            Custom Compare →
          </Link>
        </div>
      </div>
    </div>
  );
}
