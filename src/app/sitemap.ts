import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { models, COMPARE_PRESETS, PROVIDER_SLUGS } from "@/data/models";

const CATEGORIES = ["chat", "coding", "reasoning", "image", "video"];

const BASE_URL = "https://tokencenter.cc";

function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = locale === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
  }
  languages["x-default"] = `${BASE_URL}${path}`;
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["/", "/calculator", "/compare"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.8,
    alternates: buildAlternates(route),
  }));

  const modelEntries: MetadataRoute.Sitemap = models.map((model) => ({
    url: `${BASE_URL}/models/${model.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: buildAlternates(`/models/${model.id}`),
  }));

  const compareEntries: MetadataRoute.Sitemap = COMPARE_PRESETS.map((preset) => ({
    url: `${BASE_URL}/compare/${preset.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
    alternates: buildAlternates(`/compare/${preset.slug}`),
  }));

  const providerEntries: MetadataRoute.Sitemap = Object.keys(PROVIDER_SLUGS).map((slug) => ({
    url: `${BASE_URL}/providers/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: buildAlternates(`/providers/${slug}`),
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
    alternates: buildAlternates(`/category/${cat}`),
  }));

  return [...staticRoutes, ...modelEntries, ...compareEntries, ...providerEntries, ...categoryEntries];
}
