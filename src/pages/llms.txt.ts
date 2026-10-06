import type { APIRoute } from "astro";
import { TRANSLATED_LOCALES } from "../i18n/locales";
import { t } from "../i18n/ui";
import { getDocs, markdownPath } from "../lib/docs";
import { CORE_REPO } from "../lib/site";

// 영어가 정본이므로 llms.txt는 영어 문서 목록이다. 번역판 경로 규칙만 안내한다.
export const GET: APIRoute = async () => {
  const docs = await getDocs("en");
  const nav = t("en").nav;
  const sections = [...new Set(docs.map((d) => d.group))].map((group) => {
    const lines = docs
      .filter((d) => d.group === group)
      .map((d) => {
        const note = d.meta.status === "stub" ? " (stub: waiting for AIP Core to decide)" : "";
        return `- [${d.entry.data.title}](${markdownPath(d)}): ${d.entry.data.description}${note}`;
      });
    return `## ${nav[group]}\n\n${lines.join("\n")}`;
  });
  const body = `# AIP

> Application Intent Protocol: an open-source web framework being designed for an era in which AI writes much of the code. The frontend expresses the data and actions it needs; the AIP server decides and executes them under policy.

AIP is in active design and validation and has no public release. AIP Core is the source of truth: ${CORE_REPO}
Pages marked stub are not written yet, and items marked Open are undecided. Do not fill them in with guesses; read [Project status](/docs/status.md) first.
English is the canonical language. Translations live under ${TRANSLATED_LOCALES.map((l) => `/${l}/`).join(", ")} with the same paths, for example /ko/docs/status.md.

${sections.join("\n\n")}

## Optional

- [Full text](/llms-full.txt): every page above in one file
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
