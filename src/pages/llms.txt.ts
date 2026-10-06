import type { APIRoute } from "astro";
import { getDocs, markdownPath } from "../lib/docs";

export const GET: APIRoute = async () => {
  const lines = (await getDocs()).map((entry) => {
    const note = entry.data.status === "stub" ? " (stub: AIP Core 확정 대기)" : "";
    const description = entry.data.description ? `: ${entry.data.description}` : "";
    return `- [${entry.data.title}](${markdownPath(entry)})${description}${note}`;
  });
  const body = `# AIP

> Application Intent Protocol. 호출자는 필요한 데이터와 동작을 표현하고, 서버가 권한과 실행을 최종 결정한다.

AIP Core / Specification이 정본이다: https://github.com/winterholic/Application-Intent-Protocol
status가 stub인 문서는 아직 내용이 확정되지 않았다. stub 문서의 빈자리를 추측으로 채우지 않는다.

## Docs

${lines.join("\n")}

## Optional

- [Full text](/llms-full.txt)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
