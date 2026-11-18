import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import redirectTable from "./src/data/redirects.json";
import { locales, defaultLocale } from "./src/i18n/routing";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Old model/compare URLs (delisted or renamed models) → 301 to their replacement.
// The default locale is unprefixed, the others live under /<locale>.
const prefixedLocales = locales.filter((l) => l !== defaultLocale).join("|");

function toRedirects(section: "models" | "compare") {
  return Object.entries(redirectTable[section] as Record<string, string>).flatMap(
    ([slug, destination]) => [
      { source: `/${section}/${slug}`, destination, statusCode: 301 as const },
      {
        source: `/:locale(${prefixedLocales})/${section}/${slug}`,
        destination: `/:locale${destination}`,
        statusCode: 301 as const,
      },
    ],
  );
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // English pages are served at unprefixed URLs. /en is only the internal
      // rewrite target below, so a direct visit bounces back to the canonical URL.
      { source: "/en", destination: "/", statusCode: 301 as const },
      { source: "/en/:path*", destination: "/:path*", statusCode: 301 as const },
      ...toRedirects("models"),
      ...toRedirects("compare"),
    ];
  },
  async rewrites() {
    // Platform rewrite (no Node proxy): unprefixed URLs are the English pages,
    // which live under the [locale] segment. Checked after public files and
    // static routes, before the [locale] dynamic segment.
    return {
      afterFiles: [
        { source: "/", destination: "/en" },
        { source: "/calculator", destination: "/en/calculator" },
        { source: "/compare", destination: "/en/compare" },
        { source: "/compare/:slug", destination: "/en/compare/:slug" },
        { source: "/models/:id", destination: "/en/models/:id" },
        { source: "/category/:id", destination: "/en/category/:id" },
        { source: "/providers/:slug", destination: "/en/providers/:slug" },
        { source: "/gt", destination: "/en/gt" },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
