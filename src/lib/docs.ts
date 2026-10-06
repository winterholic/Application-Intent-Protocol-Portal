import { getCollection, type CollectionEntry } from "astro:content";

/**
 * 하나의 canonical source(src/content/docs)에서 HTML·raw Markdown·llms.txt를 모두 파생한다.
 * URL 규칙: HTML은 `/<id>/`, raw Markdown은 `/<id>.md`.
 */
export type DocEntry = CollectionEntry<"docs">;

export async function getDocs(): Promise<DocEntry[]> {
  const entries = await getCollection("docs", (entry) => entry.id === "docs" || entry.id.startsWith("docs/"));
  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

export const htmlPath = (entry: DocEntry) => `/${entry.id}/`;
export const markdownPath = (entry: DocEntry) => `/${entry.id}.md`;

export function toMarkdown(entry: DocEntry): string {
  const { title, description, status } = entry.data;
  const meta = [`> status: ${status}`, `> url: ${htmlPath(entry)}`];
  if (description) meta.unshift(`> ${description}`);
  return `# ${title}\n\n${meta.join("\n")}\n\n${(entry.body ?? "").trim()}\n`;
}
