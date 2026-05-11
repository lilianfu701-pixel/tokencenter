import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { models } from "@/data/models";

const BASE_URL = "https://tokencenter.cc";

const staticRoutes = ["/", "/calculator", "/compare"];

function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    if (locale === "en") {
      languages["x-default"] = `${BASE_URL}${path}`;
      languages[locale] = `${BASE_URL}${path}`;
    } else {
      languages[locale] = `${BASE_URL}/${locale}${path}`;
    }
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
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
    priority: 0.7,
    alternates: buildAlternates(`/models/${model.id}`),
  }));

  return [...staticEntries, ...modelEntries];
}
