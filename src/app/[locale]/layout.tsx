import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HtmlLang } from "@/components/HtmlLang";

const BASE_URL = "https://tokencenter.cc";

type Params = Promise<{ locale: string }>;

// Locale-specific base metadata (page-level overrides these via generateMetadata)
const LOCALE_META: Record<string, { title: string; description: string; keywords: string }> = {
  en: {
    title: "TokenCenter — AI Model Comparison, Pricing & Directory",
    description: "Compare ChatGPT, Gemini, Claude, DeepSeek and 20+ AI models by pricing, context window, and capabilities. The most complete LLM pricing guide — updated May 2026.",
    keywords: "AI model comparison, LLM directory, ChatGPT vs Gemini vs Claude, LLM pricing, best AI models 2026, AI model guide",
  },
  zh: {
    title: "TokenCenter — 全球大模型(LLM)百科、比较与定价指南",
    description: "专业的 AI 大模型导航中心。涵盖 ChatGPT, Gemini, Claude, DeepSeek 等主流模型的详细介绍、Token 价格比较、多语言分类及使用指南。支持12种语言。",
    keywords: "大模型比较, LLM简介, AI模型分类, Token价格, 大模型入门指南, 最佳AI工具, 免费LLM列表",
  },
  ja: {
    title: "TokenCenter — AIモデル比較・価格・ディレクトリ",
    description: "ChatGPT、Gemini、Claude、DeepSeekなど20以上のAIモデルを価格・コンテキスト・能力で比較。最新LLM価格ガイド — 2026年更新。",
    keywords: "AIモデル比較, 大規模言語モデル, チャットGPT 比較, LLM 分類, おすすめAIツール, 最新AIニュース",
  },
  ko: {
    title: "TokenCenter — AI 모델 비교, 가격 및 디렉토리",
    description: "ChatGPT, Gemini, Claude, DeepSeek 등 20개 이상의 AI 모델을 가격, 컨텍스트, 기능별로 비교하세요. 최신 LLM 가격 가이드 — 2026년 업데이트.",
    keywords: "AI 모델 비교, 거대언어모델, 챗GPT vs 제미나이, 인공지능 모델 분류, 무료 AI 추천",
  },
  ru: {
    title: "TokenCenter — Сравнение нейросетей, цены и каталог ИИ",
    description: "Сравните ChatGPT, Gemini, Claude, DeepSeek и более 20 ИИ-моделей по цене, контексту и возможностям. Полный справочник LLM — обновлено 2026.",
    keywords: "Сравнение нейросетей, Модели ИИ, ChatGPT против Gemini, Список LLM, Обзор нейросетей 2026",
  },
  fr: {
    title: "TokenCenter — Comparaison de modèles IA, prix et répertoire",
    description: "Comparez ChatGPT, Gemini, Claude, DeepSeek et plus de 20 modèles d'IA par prix, contexte et capacités. Le guide LLM le plus complet — mis à jour mai 2026.",
    keywords: "Comparaison modèles IA, Guide LLM, ChatGPT vs Claude, Meilleurs outils IA, Classement LLM",
  },
  de: {
    title: "TokenCenter — KI-Modellvergleich, Preise und Verzeichnis",
    description: "Vergleichen Sie ChatGPT, Gemini, Claude, DeepSeek und mehr als 20 KI-Modelle nach Preis, Kontext und Fähigkeiten. Der umfassendste LLM-Preisguide — aktualisiert 2026.",
    keywords: "KI Modell Vergleich, LLM Verzeichnis, ChatGPT vs Gemini, Beste KI-Modelle 2026",
  },
  es: {
    title: "TokenCenter — Comparación de modelos IA, precios y directorio",
    description: "Compara ChatGPT, Gemini, Claude, DeepSeek y más de 20 modelos de IA por precio, contexto y capacidades. La guía LLM más completa — actualizada mayo 2026.",
    keywords: "Comparación modelos IA, directorio LLM, ChatGPT vs Claude, Mejores herramientas IA",
  },
  pt: {
    title: "TokenCenter — Comparação de modelos IA, preços e diretório",
    description: "Compare ChatGPT, Gemini, Claude, DeepSeek e mais de 20 modelos de IA por preço, contexto e capacidades. O guia LLM mais completo — atualizado maio 2026.",
    keywords: "Comparação modelos IA, diretório LLM, ChatGPT vs Claude, Melhores ferramentas IA",
  },
  ar: {
    title: "TokenCenter — مقارنة نماذج الذكاء الاصطناعي والأسعار والدليل",
    description: "قارن ChatGPT وGemini وClaude وDeepSeek وأكثر من 20 نموذج ذكاء اصطناعي حسب السعر والسياق والقدرات. دليل LLM الأكثر شمولاً.",
    keywords: "مقارنة نماذج الذكاء الاصطناعي, دليل LLM, ChatGPT مقابل Gemini, أفضل أدوات الذكاء الاصطناعي",
  },
  id: {
    title: "TokenCenter — Perbandingan Model AI, Harga dan Direktori",
    description: "Bandingkan ChatGPT, Gemini, Claude, DeepSeek dan lebih dari 20 model AI berdasarkan harga, konteks, dan kemampuan. Panduan LLM terlengkap — diperbarui Mei 2026.",
    keywords: "perbandingan model AI, direktori LLM, ChatGPT vs Claude, model AI terbaik 2026",
  },
  vi: {
    title: "TokenCenter — So sánh mô hình AI, giá cả và thư mục",
    description: "So sánh ChatGPT, Gemini, Claude, DeepSeek và hơn 20 mô hình AI theo giá, ngữ cảnh và khả năng. Hướng dẫn LLM toàn diện nhất — cập nhật tháng 5/2026.",
    keywords: "so sánh mô hình AI, thư mục LLM, ChatGPT vs Claude, công cụ AI tốt nhất",
  },
};

const OG_LOCALE: Record<string, string> = {
  en: "en_US", zh: "zh_CN", fr: "fr_FR", es: "es_ES",
  pt: "pt_BR", de: "de_DE", ja: "ja_JP", ar: "ar_SA",
  ko: "ko_KR", id: "id_ID", ru: "ru_RU", vi: "vi_VN",
};

function buildHreflang(path: string = "") {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = l === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/${l}${path}`;
  }
  languages["x-default"] = `${BASE_URL}${path}`;
  return languages;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const meta = LOCALE_META[locale] ?? LOCALE_META.en;
  const canonical = locale === "en" ? BASE_URL : `${BASE_URL}/${locale}`;

  return {
    title: {
      template: `%s | TokenCenter`,
      default: meta.title,
    },
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical,
      languages: buildHreflang(),
    },
    openGraph: {
      siteName: "TokenCenter",
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_US",
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l] ?? l),
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      site: "@tokencenter",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

// Schema.org WebSite JSON-LD (injected once in every page)
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TokenCenter",
  url: BASE_URL,
  description: "Compare AI models by pricing, context window, and capabilities.",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "TokenCenter",
    url: BASE_URL,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <>
      <HtmlLang locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
      />
      <NextIntlClientProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </NextIntlClientProvider>
    </>
  );
}
