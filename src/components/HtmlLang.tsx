"use client";
import { useEffect } from "react";

const LOCALE_LANG: Record<string, string> = {
  en: "en", zh: "zh-Hans", fr: "fr", es: "es",
  pt: "pt-BR", de: "de", ja: "ja", ar: "ar",
  ko: "ko", id: "id", ru: "ru", vi: "vi",
};

export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = LOCALE_LANG[locale] ?? locale;
  }, [locale]);
  return null;
}
