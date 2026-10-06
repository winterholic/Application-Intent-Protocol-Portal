// 번역 동기화 상태를 보여준다. 번역을 영어 원본에 맞춘 뒤 표시된 translatedFrom 값을 frontmatter에 넣는다.
// 사용: node scripts/i18n-status.mjs [--write]   (--write: 내용은 그대로 두고 translatedFrom만 현재 값으로 갱신. 번역을 실제로 맞춘 뒤에만 쓴다)
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { translationHash } from "../src/lib/translation-hash.mjs";

const ROOT = "src/content/docs";
const LOCALES = ["ko", "ja", "zh"];
const write = process.argv.includes("--write");

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith(".md")) yield p;
  }
}
function parse(text) {
  const [, fm, body] = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const field = (name) => {
    const v = fm?.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
    return v.startsWith('"') ? JSON.parse(v) : v;
  };
  return { fm, body: body ?? "", title: field("title"), description: field("description"), translatedFrom: field("translatedFrom") };
}

let behind = 0;
for await (const file of walk(join(ROOT, "en"))) {
  const rel = relative(join(ROOT, "en"), file);
  const en = parse(await readFile(file, "utf8"));
  const hash = translationHash(en);
  for (const locale of LOCALES) {
    const target = join(ROOT, locale, rel);
    const text = await readFile(target, "utf8").catch(() => null);
    if (text === null) {
      console.log(`missing  ${locale}/${rel}`);
      behind++;
      continue;
    }
    const tr = parse(text);
    if (tr.translatedFrom === hash) continue;
    if (write) {
      const next = tr.translatedFrom
        ? text.replace(/^translatedFrom:.*$/m, `translatedFrom: ${hash}`)
        : text.replace(/^---\n/, `---\ntranslatedFrom: ${hash}\n`);
      await writeFile(target, next);
      console.log(`updated  ${locale}/${rel} -> ${hash}`);
    } else {
      console.log(`behind   ${locale}/${rel}  translatedFrom=${tr.translatedFrom || "-"} expected=${hash}`);
      behind++;
    }
  }
}
if (!write && behind) process.exit(1);
if (!write) console.log("all translations match the English source");
