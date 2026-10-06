import { getCollection, type CollectionEntry } from "astro:content";
import { renderMarkdown, type RenderedDoc } from "./markdown";
import { DOC_NAV } from "./site";

/**
 * 하나의 canonical source(src/content/docs)에서 HTML·raw Markdown·llms.txt·검색 목록을 모두 파생한다.
 * URL 규칙: HTML은 `/<route>/`, raw Markdown은 `/<route>.md`. route는 `docs` 또는 `docs/<id>`.
 */
export type DocEntry = CollectionEntry<"docs">;

export interface Doc {
  entry: DocEntry;
  group: string;
  route: string;
  rendered: RenderedDoc;
}

let cache: Promise<Doc[]> | undefined;

/** DOC_NAV 순서의 전체 문서. nav에 없는 문서나 없는 nav 항목은 빌드 오류다. */
export function getDocs(): Promise<Doc[]> {
  cache ??= (async () => {
    const entries = new Map((await getCollection("docs")).map((e) => [e.id, e]));
    const docs: Doc[] = [];
    for (const { group, items } of DOC_NAV) {
      for (const id of items) {
        const entry = entries.get(id);
        if (!entry) throw new Error(`DOC_NAV의 "${id}"에 해당하는 문서가 없다`);
        entries.delete(id);
        const route = id === "index" ? "docs" : `docs/${id}`;
        docs.push({ entry, group, route, rendered: await renderMarkdown(entry.body ?? "", entry.filePath ?? id) });
      }
    }
    if (entries.size) throw new Error(`DOC_NAV에 없는 문서: ${[...entries.keys()].join(", ")}`);
    return docs;
  })();
  return cache;
}

export const htmlPath = (doc: Doc) => `/${doc.route}/`;
export const markdownPath = (doc: Doc) => `/${doc.route}.md`;

export function toMarkdown(doc: Doc): string {
  const { title, description, status, source } = doc.entry.data;
  const meta = [`> ${description}`, `> status: ${status}`, `> url: ${htmlPath(doc)}`];
  if (source.length) meta.push(`> source: ${source.map((s) => `AIP Core ${s}`).join(", ")}`);
  return `# ${title}\n\n${meta.join("\n")}\n\n${(doc.entry.body ?? "").trim()}\n`;
}
