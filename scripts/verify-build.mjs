// 빌드 결과 검사.
// 1. 언어마다 문서 본문이 HTML 응답에 있고, 같은 원본에서 Markdown 판이 파생됐다. 영어는 llms.txt·llms-full.txt에도 있다.
// 2. 번역이 영어 원본과 동기화돼 있다(translatedFrom 해시).
// 3. 페이지마다 canonical과 네 언어 hreflang이 있고, robots.txt·sitemap.xml이 있다.
// 4. 사이트 안 링크와 앵커가 모두 실제로 있다.
// 5. 사이트 CSS는 디자인 시스템 토큰만 쓴다(hex 색, 다크 분기 금지).
import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const SRC = "src/content/docs";
const DIST = "dist";
const LOCALES = ["en", "ko", "ja", "zh"];
const prefix = (l) => (l === "en" ? "" : `/${l}`);
const failures = [];

async function* walk(dir, test) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path, test);
    else if (test(entry.name)) yield path;
  }
}
const read = (path) => readFile(join(DIST, path), "utf8");
const exists = (path) => stat(path).then(() => true, () => false);
const unquote = (v) => (v?.startsWith('"') ? JSON.parse(v) : v);

// 1. 원본 → 파생물
const llms = await read("llms.txt");
const llmsFull = await read("llms-full.txt");
let docCount = 0;
for (const locale of LOCALES) {
  for await (const file of walk(join(SRC, locale), (n) => n.endsWith(".md"))) {
    const key = relative(join(SRC, locale), file).replace(/\.md$/, "");
    const route = `${prefix(locale)}/${key === "index" ? "docs" : `docs/${key}`}`.slice(1);
    const source = await readFile(file, "utf8");
    const title = unquote(source.match(/^title:\s*(.+)$/m)?.[1]?.trim());
    const body = source.split(/^---$/m).slice(2).join("---");
    // 본문 첫 일반 문단을 HTML에 그대로 있어야 하는 표본으로 쓴다.
    const sample = body
      .split("\n")
      .find((l) => /^[^\s#>|`\-\d!]/.test(l))
      ?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[`*]/g, "")
      .slice(0, 16);
    const html = await read(`${route}/index.html`).catch(() => "");
    const md = await read(`${route}.md`).catch(() => "");
    docCount++;
    const escaped = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    if (!html.includes(`<h1 class="aip-doc-title">${escaped}</h1>`)) failures.push(`${route}: HTML에 h1 제목 없음`);
    if (sample && !html.replace(/<[^>]+>/g, "").includes(sample)) failures.push(`${route}: HTML에 본문 없음 (${sample})`);
    if (!html.includes(`href="/${route}.md"`)) failures.push(`${route}: View as Markdown 링크 없음`);
    if (!md.startsWith(`# ${title}`)) failures.push(`${route}: Markdown 판 없음`);
    if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) failures.push(`${route}: h1이 하나가 아님`);
    if (locale === "en") {
      if (!llms.includes(`(/${route}.md)`)) failures.push(`${route}: llms.txt 누락`);
      if (!llmsFull.includes(`# ${title}\n`)) failures.push(`${route}: llms-full.txt 누락`);
    }
  }
}

// 2. 번역 동기화
try {
  execFileSync("node", ["scripts/i18n-status.mjs"], { stdio: "pipe" });
} catch (error) {
  failures.push(`번역이 영어 원본보다 뒤처짐:\n${error.stdout}`);
}

// 3. SEO·크롤링
const robots = await read("robots.txt").catch(() => "");
if (!/Sitemap: https?:\/\/.+\/sitemap\.xml/.test(robots)) failures.push("robots.txt에 Sitemap 없음");
const sitemap = await read("sitemap.xml").catch(() => "");
const sitemapUrls = (sitemap.match(/<loc>/g) ?? []).length;
if (!sitemapUrls) failures.push("sitemap.xml 없음");

// 4. 내부 링크·앵커, 페이지별 canonical·hreflang
let linkCount = 0;
let pageCount = 0;
for await (const file of walk(DIST, (n) => n.endsWith(".html"))) {
  const page = relative(DIST, file);
  const html = await readFile(file, "utf8");
  pageCount++;
  if (page !== "404.html") {
    if (!/<link rel="canonical" href="https?:\/\//.test(html)) failures.push(`${page}: canonical 없음`);
    const hreflangs = [...html.matchAll(/hreflang="([^"]+)" href="https?:/g)].map((m) => m[1]);
    for (const h of ["en", "ko", "ja", "zh-Hans", "x-default"]) {
      if (!hreflangs.includes(h)) failures.push(`${page}: hreflang ${h} 없음`);
    }
  }
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, href] of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(href)) continue;
    linkCount++;
    const [path, hash] = href.split("#");
    if (!path) {
      if (hash && !ids.has(hash)) failures.push(`${page}: 없는 앵커 #${hash}`);
      continue;
    }
    const target = join(DIST, path.endsWith("/") ? `${path}index.html` : path);
    if (!(await exists(target))) failures.push(`${page}: 깨진 링크 ${href}`);
    else if (hash && target.endsWith(".html")) {
      const targetHtml = await readFile(target, "utf8");
      if (!targetHtml.includes(`id="${hash}"`)) failures.push(`${page}: 없는 앵커 ${href}`);
    }
  }
}

// 5. 사이트 CSS는 토큰만
for await (const file of walk("src", (n) => n.endsWith(".css"))) {
  const css = await readFile(file, "utf8");
  if (/#[0-9a-fA-F]{3,8}\b/.test(css)) failures.push(`${file}: hex 색 사용`);
  if (/prefers-color-scheme/.test(css)) failures.push(`${file}: 다크 분기 사용`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `verified ${docCount} docs in ${LOCALES.length} languages, ${pageCount} pages (canonical + hreflang), ${linkCount} internal links, translations in sync, robots.txt + sitemap (${sitemapUrls} urls), token-only css`,
);
