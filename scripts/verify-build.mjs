// 빌드 결과가 "본문이 HTML 응답에 존재한다"와 "같은 원본에서 파생된다"를 지키는지 검사한다.
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const SRC = "src/content/docs";
const DIST = "dist";

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.mdx?$/.test(entry.name)) yield path;
  }
}

const read = (path) => readFile(join(DIST, path), "utf8");
const llms = await read("llms.txt");
const llmsFull = await read("llms-full.txt");
const failures = [];
let count = 0;

for await (const file of walk(SRC)) {
  const id = relative(SRC, file).replace(/\.mdx?$/, "").replace(/\/index$/, "");
  const source = await readFile(file, "utf8");
  const title = source.match(/^title:\s*(.+)$/m)?.[1]?.trim();
  // 본문 첫 문단의 첫 줄을 HTML에 그대로 있어야 하는 표본으로 쓴다.
  const sample = source.split(/^---$/m)[2]?.trim().split("\n")[0]?.replace(/[`*\[\]]/g, "").slice(0, 20);
  const html = await read(`${id}/index.html`).catch(() => "");
  const md = await read(`${id}.md`).catch(() => "");
  count++;
  if (!html.includes(title)) failures.push(`${id}: HTML에 제목 없음`);
  if (sample && !html.includes(sample)) failures.push(`${id}: HTML에 본문 없음 (${sample})`);
  if (!md.startsWith(`# ${title}`)) failures.push(`${id}: raw Markdown 없음`);
  if (!llms.includes(`(/${id}.md)`)) failures.push(`${id}: llms.txt 누락`);
  if (!llmsFull.includes(`# ${title}`)) failures.push(`${id}: llms-full.txt 누락`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`verified ${count} docs: html, raw markdown, llms.txt, llms-full.txt`);
