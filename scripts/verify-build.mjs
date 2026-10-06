// 빌드 결과 검사.
// 1. 문서 본문이 HTML 응답에 있고, 같은 원본에서 raw Markdown·llms.txt·llms-full.txt가 파생됐다.
// 2. 사이트 안 링크가 모두 실제 파일을 가리킨다.
// 3. 사이트 코드가 디자인 시스템 토큰만 쓴다(hex 색, dark: 분기 금지).
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const SRC = "src/content/docs";
const DIST = "dist";
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

// 1. 원본 → 파생물
const llms = await read("llms.txt");
const llmsFull = await read("llms-full.txt");
let docCount = 0;
for await (const file of walk(SRC, (n) => n.endsWith(".md"))) {
  const id = relative(SRC, file).replace(/\.md$/, "").replace(/\/index$/, "");
  const route = id === "index" ? "docs" : `docs/${id}`;
  const source = await readFile(file, "utf8");
  const title = source.match(/^title:\s*(.+)$/m)?.[1]?.trim();
  const body = source.split(/^---$/m).slice(2).join("---");
  // 본문 첫 일반 문단을 HTML에 그대로 있어야 하는 표본으로 쓴다.
  const sample = body
    .split("\n")
    .find((l) => /^[^\s#>|`\-\d!]/.test(l))
    ?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*]/g, "")
    .slice(0, 24);
  const html = await read(`${route}/index.html`).catch(() => "");
  const md = await read(`${route}.md`).catch(() => "");
  docCount++;
  if (!html.includes(`<h1 class="aip-doc-title">${title}</h1>`)) failures.push(`${route}: HTML에 h1 제목 없음`);
  if (sample && !html.includes(sample)) failures.push(`${route}: HTML에 본문 없음 (${sample})`);
  if (!html.includes(`href="/${route}.md"`)) failures.push(`${route}: View as Markdown 링크 없음`);
  if (!md.startsWith(`# ${title}`)) failures.push(`${route}: raw Markdown 없음`);
  if (!llms.includes(`(/${route}.md)`)) failures.push(`${route}: llms.txt 누락`);
  if (!llmsFull.includes(`# ${title}\n`)) failures.push(`${route}: llms-full.txt 누락`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) failures.push(`${route}: h1이 하나가 아님`);
}

// 2. 내부 링크
let linkCount = 0;
for await (const file of walk(DIST, (n) => n.endsWith(".html"))) {
  const html = await readFile(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(href)) continue;
    linkCount++;
    const [path, hash] = href.split("#");
    if (!path) {
      if (hash && !ids.has(hash)) failures.push(`${relative(DIST, file)}: 없는 앵커 #${hash}`);
      continue;
    }
    const target = join(DIST, path.endsWith("/") ? `${path}index.html` : path);
    if (!(await exists(target))) failures.push(`${relative(DIST, file)}: 깨진 링크 ${href}`);
    else if (hash && target.endsWith(".html")) {
      const targetHtml = await readFile(target, "utf8");
      if (!targetHtml.includes(`id="${hash}"`)) failures.push(`${relative(DIST, file)}: 없는 앵커 ${href}`);
    }
  }
}

// 3. 사이트 CSS는 토큰만 쓴다. 다크 모드도 토큰이 처리한다(design system CLAUDE.md).
for await (const file of walk("src", (n) => n.endsWith(".css"))) {
  const css = await readFile(file, "utf8");
  if (/#[0-9a-fA-F]{3,8}\b/.test(css)) failures.push(`${file}: hex 색 사용`);
  if (/prefers-color-scheme/.test(css)) failures.push(`${file}: 다크 분기 사용`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`verified ${docCount} docs (html · raw markdown · llms.txt · llms-full.txt), ${linkCount} internal links, token-only css`);
