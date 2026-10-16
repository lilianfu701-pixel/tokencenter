import { sitemapIndexXml, xmlResponse } from "@/lib/sitemap";

// Built once per deploy; see src/lib/sitemap.ts.
export const dynamic = "force-static";

export function GET(): Response {
  return xmlResponse(sitemapIndexXml());
}
