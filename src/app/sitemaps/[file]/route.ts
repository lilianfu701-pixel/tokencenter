import { locales } from "@/i18n/routing";
import { localeFromFileName, localeSitemapXml, sitemapFileName, xmlResponse } from "@/lib/sitemap";

// One prebuilt file per language: /sitemaps/en.xml, /sitemaps/zh.xml, ...
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((l) => ({ file: sitemapFileName(l) }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const locale = localeFromFileName((await params).file);
  if (!locale) return new Response("Not found", { status: 404 });
  return xmlResponse(localeSitemapXml(locale));
}
