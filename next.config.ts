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
    return [...toRedirects("models"), ...toRedirects("compare")];
  },
};

export default withNextIntl(nextConfig);
