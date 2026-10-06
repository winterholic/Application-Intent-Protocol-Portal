import type { APIRoute } from "astro";

// 문서는 사람과 AI 에이전트 모두가 읽도록 공개한다. 크롤러를 막지 않는다.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site).href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
