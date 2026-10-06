// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  // NOTE: 공식 도메인이 정해지면 SITE_URL로 넣는다. 값이 있어야 sitemap과 절대 URL이 생성된다.
  site: process.env.SITE_URL,
  output: "static",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "AIP",
      description: "Application Intent Protocol",
      defaultLocale: "root",
      locales: { root: { label: "한국어", lang: "ko" } },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/winterholic/Application-Intent-Protocol" },
      ],
      sidebar: [
        { label: "Overview", link: "/docs/" },
        { label: "Getting Started", items: [{ autogenerate: { directory: "docs/getting-started" } }] },
        { label: "Concepts", items: [{ autogenerate: { directory: "docs/concepts" } }] },
        { label: "Guides", items: [{ autogenerate: { directory: "docs/guides" } }] },
        { label: "Specification", items: [{ autogenerate: { directory: "docs/specification" } }] },
        { label: "Security", items: [{ autogenerate: { directory: "docs/security" } }] },
        { label: "Examples", items: [{ autogenerate: { directory: "docs/examples" } }] },
      ],
    }),
  ],
});
