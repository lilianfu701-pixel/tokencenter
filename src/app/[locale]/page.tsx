import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import {
  models,
  getModelsSortedByInputPrice,
  getModelsSortedByContextWindow,
} from "@/data/models";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Trophy } from "lucide-react";

type Params = Promise<{ locale: string }>;

function formatPrice(price: number) {
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function formatContext(tokens: number) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

const sourceColors: Record<string, string> = {
  official: "bg-green-50 text-green-700 border-green-200",
  estimated: "bg-yellow-50 text-yellow-700 border-yellow-200",
  experimental: "bg-purple-50 text-purple-700 border-purple-200",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.hero" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("home");
  const tSource = await getTranslations("dataSource");

  const sortedByInput = getModelsSortedByInputPrice();
  const sortedByContext = getModelsSortedByContextWindow();
  const cheapestOutput = [...models].sort(
    (a, b) => a.pricing.output - b.pricing.output
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-12">
      {/* Hero */}
      <section className="space-y-4 text-center py-6">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-neutral-500">
          {t("hero.subtitle")}
        </p>
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
        >
          {t("hero.cta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Leaderboard */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          {t("leaderboard.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-neutral-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <Trophy className="h-4 w-4 text-amber-400" />
                {t("leaderboard.cheapestInput")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sortedByInput.slice(0, 3).map((m, i) => (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className="flex items-center justify-between text-sm hover:text-blue-600"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 text-neutral-400">#{i + 1}</span>
                    <span className="font-medium text-neutral-800">{m.name}</span>
                  </span>
                  <span className="text-neutral-600">{formatPrice(m.pricing.input)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-neutral-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <Trophy className="h-4 w-4 text-amber-400" />
                {t("leaderboard.cheapestOutput")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cheapestOutput.slice(0, 3).map((m, i) => (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className="flex items-center justify-between text-sm hover:text-blue-600"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 text-neutral-400">#{i + 1}</span>
                    <span className="font-medium text-neutral-800">{m.name}</span>
                  </span>
                  <span className="text-neutral-600">{formatPrice(m.pricing.output)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-neutral-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <Trophy className="h-4 w-4 text-amber-400" />
                {t("leaderboard.longestContext")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sortedByContext.slice(0, 3).map((m, i) => (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className="flex items-center justify-between text-sm hover:text-blue-600"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 text-neutral-400">#{i + 1}</span>
                    <span className="font-medium text-neutral-800">{m.name}</span>
                  </span>
                  <span className="text-neutral-600">{formatContext(m.contextWindow)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Price table */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            {t("priceTable.title")}
          </h2>
          <p className="text-sm text-neutral-500">{t("priceTable.subtitle")}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                <TableHead className="font-medium text-neutral-600">{t("priceTable.columns.model")}</TableHead>
                <TableHead className="font-medium text-neutral-600">{t("priceTable.columns.provider")}</TableHead>
                <TableHead className="text-right font-medium text-neutral-600">{t("priceTable.columns.inputPrice")}</TableHead>
                <TableHead className="text-right font-medium text-neutral-600">{t("priceTable.columns.outputPrice")}</TableHead>
                <TableHead className="text-right font-medium text-neutral-600">{t("priceTable.columns.contextWindow")}</TableHead>
                <TableHead className="font-medium text-neutral-600">{t("priceTable.columns.dataSource")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id} className="hover:bg-neutral-50">
                  <TableCell>
                    <Link
                      href={`/models/${model.id}`}
                      className="font-medium text-neutral-900 hover:text-blue-600"
                    >
                      {model.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-neutral-600">{model.provider}</TableCell>
                  <TableCell className="text-right font-mono text-neutral-800">
                    {formatPrice(model.pricing.input)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-neutral-800">
                    {formatPrice(model.pricing.output)}
                  </TableCell>
                  <TableCell className="text-right text-neutral-600">
                    {formatContext(model.contextWindow)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${sourceColors[model.dataSource]}`}
                    >
                      {tSource(model.dataSource)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
