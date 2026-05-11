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
});
