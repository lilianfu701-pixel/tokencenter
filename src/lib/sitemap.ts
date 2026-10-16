import { locales, type Locale } from "@/i18n/routing";
import { models, COMPARE_PRESETS, PROVIDER_SLUGS } from "@/data/models";

/**
 * Sitemaps, split by language.
 *
 * One file listing every page in every language (5,800+ URLs, each carrying 13
 * hreflang links) grew to ~9 MB and Search Console never managed to fetch it.
 * /sitemap.xml is now an index; each language has its own file at
 * /sitemaps/{locale}.xml, every entry still listing all its alternates.
 */
export const BASE_URL = "https://www.tokencenter.cc";

type ChangeFrequency = "daily" | "weekly" | "monthly";

interface SitemapPage {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

const CATEGORIES = ["chat", "coding", "reasoning", "image", "video"];

/** Set once per build, so lastmod does not change on every request. */
const BUILT_AT = new Date().toISOString();

export function sitemapPages(): SitemapPage[] {
  return [
    { path: "/", changeFrequency: "daily", priority: 1.0 },
    { path: "/calculator", changeFrequency: "weekly", priority: 0.8 },
    { path: "/compare", changeFrequency: "weekly", priority: 0.8 },
    ...models.map((m) => ({ path: `/models/${m.id}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...COMPARE_PRESETS.map((p) => ({ path: `/compare/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.75 })),
    ...Object.keys(PROVIDER_SLUGS).map((s) => ({ path: `/providers/${s}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...CATEGORIES.map((c) => ({ path: `/category/${c}`, changeFrequency: "weekly" as const, priority: 0.75 })),
  ];
}

export function localeUrl(locale: Locale, path: string): string {
  return locale === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
}

export function sitemapFileName(locale: Locale): string {
  return `${locale}.xml`;
}

export function localeFromFileName(file: string): Locale | null {
  const match = /^([a-z]{2})\.xml$/.exec(file);
  const locale = match?.[1];
  return locale && (locales as readonly string[]).includes(locale) ? (locale as Locale) : null;
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function alternateLinks(path: string): string {
  const links = locales.map(
    (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(localeUrl(l, path))}" />`,
  );
  links.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(localeUrl("en", path))}" />`);
  return links.join("\n");
}

export function localeSitemapXml(locale: Locale, pages = sitemapPages()): string {
  const urls = pages.map(
    (p) =>
      `<url>\n<loc>${escapeXml(localeUrl(locale, p.path))}</loc>\n${alternateLinks(p.path)}\n<lastmod>${BUILT_AT}</lastmod>\n<changefreq>${p.changeFrequency}</changefreq>\n<priority>${p.priority}</priority>\n</url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const items = locales.map(
    (l) => `<sitemap>\n<loc>${BASE_URL}/sitemaps/${sitemapFileName(l)}</loc>\n<lastmod>${BUILT_AT}</lastmod>\n</sitemap>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</sitemapindex>\n`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
