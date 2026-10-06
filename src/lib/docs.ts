import { getCollection, type CollectionEntry } from "astro:content";
import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from "../i18n/locales";
import { renderMarkdown, type RenderedDoc } from "./markdown";
import { DOC_NAV, type NavGroup } from "./site";
import { translationHash } from "./translation-hash.mjs";

/**
 * 하나의 canonical source(src/content/docs/en)와 그 번역에서 HTML·Markdown 판·llms.txt·검색 목록을 파생한다.
 * URL 규칙: HTML은 `<prefix>/<route>/`, Markdown 판은 `<prefix>/<route>.md`. route는 `docs` 또는 `docs/<key>`.
 */
export type DocEntry = CollectionEntry<"docs">;

export interface DocMeta {
  status: "stub" | "sourced";
  source: string[];
  checked?: Date;
}

export interface Doc {
  locale: Locale;
  /** 언어 중립 key. 예: "index", "concepts/intent" */
  key: string;
  group: NavGroup;
  route: string;
  entry: DocEntry;
  /** 상태·출처는 영어 원본이 정본이다. 번역도 이 값을 쓴다. */
  meta: DocMeta;
  rendered: RenderedDoc;
  /** 번역이면 영어 원본과의 동기화 상태. 영어 원본이면 null. */
  translation: { upToDate: boolean; expected: string; actual?: string } | null;
}

const cache = new Map<Locale, Promise<Doc[]>>();

export function getDocs(locale: Locale): Promise<Doc[]> {
  let docs = cache.get(locale);
  if (!docs) {
    docs = load(locale);
    cache.set(locale, docs);
  }
  return docs;
}

async function load(locale: Locale): Promise<Doc[]> {
  const all = await getCollection("docs");
  const byId = new Map(all.map((e) => [e.id, e]));
  const known = new Set(DOC_NAV.flatMap((g) => g.items));
  for (const e of all) {
    const [lang, ...rest] = e.id.split("/");
    if (!LOCALES.includes(lang as Locale) || !known.has(rest.join("/"))) {
      throw new Error(`DOC_NAV에 없거나 언어 폴더 밖의 문서: ${e.id}`);
    }
  }

  const docs: Doc[] = [];
  for (const { group, items } of DOC_NAV) {
    for (const key of items) {
      const canonical = byId.get(`${DEFAULT_LOCALE}/${key}`);
      const entry = byId.get(`${locale}/${key}`);
      if (!canonical) throw new Error(`영어 원본이 없다: ${key}`);
      if (!entry) throw new Error(`${locale} 번역이 없다: ${key}`);
      if (!canonical.data.status) throw new Error(`영어 원본에 status가 없다: ${key}`);

      const rendered = await renderMarkdown(entry.body ?? "", entry.filePath ?? entry.id);
      let translation: Doc["translation"] = null;
      if (locale !== DEFAULT_LOCALE) {
        const enRendered = await renderMarkdown(canonical.body ?? "", canonical.filePath ?? canonical.id);
        const ids = (r: RenderedDoc) => r.headings.map((h) => h.id).join(",");
        if (ids(rendered) !== ids(enRendered)) {
          throw new Error(`${entry.id}: 절 id가 영어 원본과 다르다. 번역은 같은 {#id}를 같은 순서로 쓴다`);
        }
        const expected = translationHash({
          title: canonical.data.title,
          description: canonical.data.description,
          body: canonical.body ?? "",
        });
        const actual = entry.data.translatedFrom;
        translation = { upToDate: actual === expected, expected, ...(actual ? { actual } : {}) };
      }

      const route = key === "index" ? "docs" : `docs/${key}`;
      docs.push({
        locale,
        key,
        group,
        route,
        entry,
        meta: {
          status: canonical.data.status,
          source: canonical.data.source ?? [],
          ...(canonical.data.checked ? { checked: canonical.data.checked } : {}),
        },
        rendered,
        translation,
      });
    }
  }
  return docs;
}

export const htmlPath = (doc: Doc) => localizePath(doc.locale, `/${doc.route}/`);
export const markdownPath = (doc: Doc) => localizePath(doc.locale, `/${doc.route}.md`);

export function toMarkdown(doc: Doc): string {
  const { title, description } = doc.entry.data;
  const meta = [`> ${description}`, `> status: ${doc.meta.status}`, `> url: ${htmlPath(doc)}`];
  if (doc.locale !== DEFAULT_LOCALE) {
    meta.push(`> language: ${doc.locale} (translation of /${doc.route}.md, English is canonical)`);
    if (!doc.translation?.upToDate) meta.push("> translation: behind the English version");
  }
  if (doc.meta.source.length) meta.push(`> source: ${doc.meta.source.map((s) => `AIP Core ${s}`).join(", ")}`);
  return `# ${title}\n\n${meta.join("\n")}\n\n${(doc.entry.body ?? "").trim()}\n`;
}
