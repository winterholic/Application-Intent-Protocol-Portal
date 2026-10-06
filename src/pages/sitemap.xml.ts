import type { APIRoute } from "astro";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES, localizePath } from "../i18n/locales";
import { getDocs } from "../lib/docs";

// 언어마다 같은 페이지를 hreflang 대체 링크로 묶는다.
export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).href;
  const paths = ["/", "/ecosystem/", ...(await getDocs(DEFAULT_LOCALE)).map((d) => `/${d.route}/`)];
  const urls = paths.flatMap((path) =>
    LOCALES.map((locale) => {
      const alternates = LOCALES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${LOCALE_META[l].hreflang}" href="${abs(localizePath(l, path))}"/>`,
      );
      alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(path)}"/>`);
      return `  <url>\n    <loc>${abs(localizePath(locale, path))}</loc>\n${alternates.join("\n")}\n  </url>`;
    }),
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
