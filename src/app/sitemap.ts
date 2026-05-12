import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { models, COMPARE_PRESETS, PROVIDER_SLUGS } from "@/data/models";

const BASE_URL = "https://www.tokencenter.cc";

const CATEGORIES = ["chat", "coding", "reasoning", "image", "video"];

// Build hreflang alternates for a given path
function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = locale === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
  }
  languages["x-default"] = `${BASE_URL}${path}`;
  return { languages };
}

// Generate a URL entry for every locale version of a path
function allLocaleEntries(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"],
  priority: number,
  lastModified: Date,
): MetadataRoute.Sitemap {
  const alternates = buildAlternates(path);
  return locales.map((locale) => ({
    url: locale === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticEntries = [
    ...allLocaleEntries("/", "daily", 1.0, now),
    ...allLocaleEntries("/calculator", "weekly", 0.8, now),
    ...allLocaleEntries("/compare", "weekly", 0.8, now),
  ];

  // Model detail pages
  const modelEntries = models.flatMap((model) =>
    allLocaleEntries(`/models/${model.id}`, "weekly", 0.8, now)
  );

  // Compare preset pages
  const compareEntries = COMPARE_PRESETS.flatMap((preset) =>
    allLocaleEntries(`/compare/${preset.slug}`, "weekly", 0.75, now)
  );

  // Provider pages
  const providerEntries = Object.keys(PROVIDER_SLUGS).flatMap((slug) =>
    allLocaleEntries(`/providers/${slug}`, "weekly", 0.7, now)
  );

  // Category pages
  const categoryEntries = CATEGORIES.flatMap((cat) =>
    allLocaleEntries(`/category/${cat}`, "weekly", 0.75, now)
  );

  return [
    ...staticEntries,
    ...modelEntries,
    ...compareEntries,
    ...providerEntries,
    ...categoryEntries,
  ];
}
