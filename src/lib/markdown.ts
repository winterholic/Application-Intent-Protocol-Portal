import type { Element, ElementContent, Root as HastRoot } from "hast";
import { toString } from "hast-util-to-string";
import type { Heading, Root as MdastRoot, Text } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createCssVariablesTheme, createHighlighter, type Highlighter } from "shiki";
import { unified } from "unified";
import { visit } from "unist-util-visit";

/**
 * 문서 원본(Markdown)을 AIP Design System의 문서 마크업 계약(docs/07)에 맞는 HTML로 바꾼다.
 * - h2·h3은 `## 제목 {#stable-id}`로 id를 명시한다. 문구를 바꿔도 링크가 깨지지 않게 하려는 것이다.
 * - GFM alert(> [!NOTE] 등)는 `.markdown-alert`로, 코드 블록은 `figure.aip-code`로 바꾼다.
 */
export interface DocHeading {
  depth: 2 | 3;
  id: string;
  text: string;
}

export interface RenderedDoc {
  html: string;
  headings: DocHeading[];
}

export class MarkdownContractError extends Error {
  override name = "MarkdownContractError";
}

const HEADING_ID = /\s*\{#([a-z0-9]+(?:-[a-z0-9]+)*)\}\s*$/;
const ALERTS = ["note", "tip", "important", "warning", "caution"] as const;
type AlertKind = (typeof ALERTS)[number];
const ALERT_TITLE: Record<string, Record<AlertKind, string>> = {
  en: { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" },
  ko: { note: "참고", tip: "팁", important: "중요", warning: "주의", caution: "경고" },
  ja: { note: "注記", tip: "ヒント", important: "重要", warning: "注意", caution: "警告" },
  zh: { note: "说明", tip: "提示", important: "重要", warning: "注意", caution: "警告" },
};
const LANG_LABEL: Record<string, string> = { sh: "shell", shell: "shell", ts: "TypeScript", py: "Python", json: "JSON" };


let highlighter: Promise<Highlighter> | undefined;
function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: [createCssVariablesTheme({ name: "css-variables", variablePrefix: "--shiki-" })],
    langs: ["typescript", "javascript", "python", "shellscript", "json"],
  });
  return highlighter;
}

function remarkHeadingIds(file: string) {
  return (tree: MdastRoot) => {
    const seen = new Set<string>();
    visit(tree, "heading", (node: Heading) => {
      if (node.depth === 1) throw new MarkdownContractError(`${file}: 본문에 h1을 쓰지 않는다. 제목은 frontmatter title`);
      if (node.depth > 4) throw new MarkdownContractError(`${file}: h5 이상은 쓰지 않는다`);
      const last = node.children.at(-1);
      const match = last?.type === "text" ? (last as Text).value.match(HEADING_ID) : null;
      if (!match) {
        if (node.depth <= 3) throw new MarkdownContractError(`${file}: h${node.depth}에 {#id}가 없다`);
        return;
      }
      const id = match[1]!;
      if (seen.has(id)) throw new MarkdownContractError(`${file}: 중복 id #${id}`);
      seen.add(id);
      (last as Text).value = (last as Text).value.replace(HEADING_ID, "");
      node.data = { ...node.data, hProperties: { id } };
    });
  };
}

const el = (tagName: string, properties: Element["properties"], children: ElementContent[] = []): Element => ({
  type: "element",
  tagName,
  properties,
  children,
});
const text = (value: string): ElementContent => ({ type: "text", value });
const icon = (id: string, className = "aip-icon"): Element =>
  el("svg", { className: [className], ariaHidden: "true" }, [el("use", { href: `#${id}` })]);

function rehypeHeadings(headings: DocHeading[]) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (!/^h[234]$/.test(node.tagName) || typeof node.properties.id !== "string") return;
      const id = node.properties.id;
      const label = toString(node);
      if (node.tagName !== "h4") headings.push({ depth: node.tagName === "h2" ? 2 : 3, id, text: label });
      node.children.push(
        text(" "),
        el("a", { className: ["aip-anchor"], href: `#${id}` }, [
          el("span", { className: ["aip-sr-only"] }, [text(`Section link: ${label}`)]),
          text("#"),
        ]),
      );
    });
  };
}

function rehypeAlerts(locale: string) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "blockquote") return;
      const first = node.children.find((c): c is Element => c.type === "element");
      const lead = first?.children[0];
      const match = lead?.type === "text" ? lead.value.match(/^\[!(\w+)\]\s*/) : null;
      const kind = match?.[1]?.toLowerCase() as AlertKind | undefined;
      if (!first || !match || !kind || !ALERTS.includes(kind)) return;
      (lead as { value: string }).value = (lead as { value: string }).value.slice(match[0].length);
      // NOTE: prose.css 는 제목 svg 를 fill 로 칠한다. 선 아이콘(Lucide)은 면으로 뭉개지므로 제목에 아이콘을 넣지 않는다.
      const title = el("p", { className: ["markdown-alert-title"] }, [text((ALERT_TITLE[locale] ?? ALERT_TITLE.en!)[kind])]);
      node.tagName = "div";
      node.properties = { className: ["markdown-alert", `markdown-alert-${kind}`], role: "note" };
      node.children.unshift(title);
    });
  };
}

function rehypeCodeBlocks(hl: Highlighter) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      const code = node.children[0];
      if (code?.type !== "element" || code.tagName !== "code") return;
      const classes = (code.properties.className as string[] | undefined) ?? [];
      const lang = classes.find((c) => c.startsWith("language-"))?.slice("language-".length) ?? "text";
      const source = toString(code).replace(/\n$/, "");
      const highlighted = hl.codeToHast(source, {
        lang: hl.getLoadedLanguages().includes(lang) ? lang : "text",
        theme: "css-variables",
      });
      const shikiPre = highlighted.children[0] as Element;
      const shikiCode = shikiPre.children[0] as Element;
      const copy = el("button", { className: ["aip-copy"], type: "button", dataAipCopy: "", ariaLabel: "Copy code" }, [
        el("span", { className: ["aip-copy__idle"] }, [icon("i-copy")]),
        el("span", { className: ["aip-copy__done"] }, [icon("i-check")]),
        el("span", { className: ["aip-copy__idle"] }, [text("Copy")]),
        el("span", { className: ["aip-copy__done"] }, [text("Copied")]),
      ]);
      parent.children[index] = el("figure", { className: ["aip-code"] }, [
        el("div", { className: ["aip-code__header"] }, [
          el("span", { className: ["aip-code__lang"] }, [text(LANG_LABEL[lang] ?? lang)]),
          copy,
        ]),
        el("pre", { className: ["aip-code__pre"], tabIndex: 0, dataLang: lang }, [
          el("code", {}, shikiCode.children),
        ]),
      ]);
    });
  };
}

function rehypeTables() {
  // 넓은 표가 본문 열을 밀어내지 않도록 가로 스크롤 상자로 감싼다.
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table" || !parent || index === undefined) return;
      parent.children[index] = el("div", { className: ["aip-table-wrap"], tabIndex: 0 }, [node]);
      return "skip";
    });
  };
}

export async function renderMarkdown(source: string, file: string, locale = "en"): Promise<RenderedDoc> {
  const headings: DocHeading[] = [];
  const hl = await getHighlighter();
  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHeadingIds, file)
    .use(remarkRehype)
    .use(rehypeAlerts, locale)
    .use(rehypeCodeBlocks, hl)
    .use(rehypeTables)
    .use(rehypeHeadings, headings)
    .use(rehypeStringify)
    .process(source);
  return { html: String(html), headings };
}
