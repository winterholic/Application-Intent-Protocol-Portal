// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  // NOTE: 공식 도메인이 정해지면 SITE_URL로 넣는다. 값이 있어야 canonical URL이 생성된다.
  site: process.env.SITE_URL,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
});
