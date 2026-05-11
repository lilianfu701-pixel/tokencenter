import { setRequestLocale, getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import CompareClient from "./CompareClient";

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ComparePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <CompareClient />;
}
