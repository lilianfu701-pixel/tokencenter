import { defineRouting } from "next-intl/routing";

export const locales = [
  "en", "zh", "fr", "es", "pt", "de", "ja", "ar", "ko", "id", "ru", "vi",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  // Locale comes from the URL only. No Accept-Language redirect, no NEXT_LOCALE
  // cookie, and no per-response Link header — those ran in the Node proxy on
  // every HTML request and kept localized pages from being cached.
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});
