import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/i18n/routing";
import { models, getModelById } from "@/data/models";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Params = Promise<{ locale: string; id: string }>;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    models.map((model) => ({ locale, id: model.id }))
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, id } = await params;
  const model = getModelById(id);
  if (!model) return {};
  const t = await getTranslations({ locale, namespace: "model" });
  return {
    title: model.name,
    description: `${model.name} ${t("pricing")} — ${model.provider}`,
  };
}

function formatPrice(price: number) {
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

const sourceColors: Record<string, string> = {
  official: "bg-green-50 text-green-700 border-green-200",
  estimated: "bg-yellow-50 text-yellow-700 border-yellow-200",
  experimental: "bg-purple-50 text-purple-700 border-purple-200",
};

export default async function ModelDetailPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const model = getModelById(id);
  if (!model) notFound();

  const t = await getTranslations("model");
  const tSource = await getTranslations("dataSource");

  const description =
    locale === "zh" ? model.description.zh : model.description.en;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToModels")}
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            {model.name}
          </h1>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sourceColors[model.dataSource]}`}
          >
            {tSource(model.dataSource)}
          </span>
        </div>
        <p className="text-neutral-500">{model.provider}</p>
        <p className="text-neutral-600">{description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="border-neutral-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{t("pricing")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PricingRow label={t("inputPrice")} value={formatPrice(model.pricing.input)} unit={t("perMillionTokens")} />
            <PricingRow label={t("outputPrice")} value={formatPrice(model.pricing.output)} unit={t("perMillionTokens")} />
            {model.pricing.cacheWrite !== undefined && (
              <PricingRow label={t("cacheWrite")} value={formatPrice(model.pricing.cacheWrite)} unit={t("perMillionTokens")} />
            )}
            {model.pricing.cacheRead !== undefined && (
              <PricingRow label={t("cacheRead")} value={formatPrice(model.pricing.cacheRead)} unit={t("perMillionTokens")} />
            )}
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{t("capabilities")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SpecRow
              label={t("contextWindow")}
              value={`${formatTokens(model.contextWindow)} ${t("tokens")}`}
            />
            <SpecRow
              label={t("maxOutput")}
              value={`${formatTokens(model.maxOutput)} ${t("tokens")}`}
            />
            <Separator />
            <CapRow label={t("vision")} value={model.supportsVision} />
            <CapRow label={t("tools")} value={model.supportsTools} />
            <Separator />
            <SpecRow label={t("releaseDate")} value={model.releaseDate} />
          </CardContent>
        </Card>
      </div>

      {model.tags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">{t("tags")}</p>
          <div className="flex flex-wrap gap-2">
            {model.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 flex items-center justify-between">
        <div>
          <p className="font-medium text-neutral-900">Compare {model.name}</p>
          <p className="text-sm text-neutral-500">
            See how it stacks up against other models side by side.
          </p>
        </div>
        <Link
          href="/compare"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
        >
          Compare →
        </Link>
      </div>
    </div>
  );
}

function PricingRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-600">{label}</span>
      <div className="text-right">
        <span className="font-mono text-sm font-medium text-neutral-900">{value}</span>
        <span className="ml-1 text-xs text-neutral-400">{unit}</span>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}

function CapRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-600">{label}</span>
      {value ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-neutral-300" />
      )}
    </div>
  );
}
