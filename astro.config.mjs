// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  // NOTE: 공식 도메인이 정해지면 SITE_URL로 바꾼다. canonical·hreflang·sitemap·robots가 이 값을 쓴다.
  site: process.env.SITE_URL ?? "https://aip-portal.vercel.app",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
});
