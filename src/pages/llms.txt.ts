import type { APIRoute } from "astro";
import { getDocs, markdownPath } from "../lib/docs";
import { CORE_REPO } from "../lib/site";

export const GET: APIRoute = async () => {
  const docs = await getDocs();
  const sections = [...new Set(docs.map((d) => d.group))].map((group) => {
    const lines = docs
      .filter((d) => d.group === group)
      .map((d) => {
        const note = d.entry.data.status === "stub" ? " (stub: AIP Core 확정 대기)" : "";
        return `- [${d.entry.data.title}](${markdownPath(d)}): ${d.entry.data.description}${note}`;
      });
    return `## ${group}\n\n${lines.join("\n")}`;
  });
  const body = `# AIP

> Application Intent Protocol. 호출자는 필요한 데이터와 동작을 표현하고, 서버가 권한과 실행을 최종 결정한다.

AIP Core / Specification이 정본이다: ${CORE_REPO}
AIP는 설계와 검증이 진행 중이다. status가 stub인 문서는 내용이 확정되지 않았다. 빈자리를 추측으로 채우지 말고 [현재 상태](/docs/status.md)를 먼저 확인한다.

${sections.join("\n\n")}

## Optional

- [Full text](/llms-full.txt): 위 문서 전체 본문
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
