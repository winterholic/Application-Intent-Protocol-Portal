# Architecture

## 하나의 원본, 여러 표현

```
src/content/docs/**/*.md  (canonical source, frontmatter: title · description · status · source · checked)
        │  astro build  (src/lib/docs.ts · src/lib/markdown.ts)
        ├─▶ /docs/<path>/          사람용 HTML. 본문이 HTML 응답에 있다
        ├─▶ /docs/<path>.md        AI용 Markdown 판
        ├─▶ /llms.txt              문서 목록(DOC_NAV 그룹 순)
        ├─▶ /llms-full.txt         전체 본문
        └─▶ 검색 목록              문서 제목과 h2·h3을 빌드 시점에 search dialog에 굽는다
```

- 사람용 문서와 AI용 문서를 따로 쓰지 않는다. 파생은 `src/lib/docs.ts` 한 곳에서 한다.
- 모든 페이지는 SSG다. 클라이언트 JavaScript(`aip.js`)는 테마·검색·복사·TOC 같은 부가 동작에만 쓴다. 꺼져도 본문은 그대로다.
- Markdown 렌더는 Astro 내장 파이프라인 대신 `unified` + Shiki(css-variables 테마)를 직접 쓴다. 디자인 시스템의 문서 마크업 계약(`figure.aip-code`, `.markdown-alert`, `.aip-anchor`)을 정확히 내야 해서다.

## 문서 작성 규칙

- 본문에 h1을 쓰지 않는다. 제목은 frontmatter `title`, 요지는 `description`(페이지 lead와 llms.txt 설명).
- h2·h3에는 `## 제목 {#stable-id}`로 영문 kebab id를 붙인다. 없으면 빌드가 실패한다. 문구를 바꿔도 id는 유지한다.
- 콜아웃은 GFM alert 다섯 가지(`NOTE` `TIP` `IMPORTANT` `WARNING` `CAUTION`)만 쓴다.
- 새 문서는 `src/lib/site.ts`의 `DOC_NAV`에 넣는다. nav에 없는 문서나 없는 nav 항목은 빌드 오류다.

## 문서 상태

frontmatter `status`는 필수다.

| status | 의미 | 규칙 |
|---|---|---|
| `stub` | 자리만 있음 | 본문에 추측을 쓰지 않는다. `> [!IMPORTANT]`로 미작성 상태를 알린다 |
| `sourced` | AIP Core에서 확정된 내용 | `source`에 AIP Core 경로, `checked`에 대조한 날짜를 적는다 |

디자인 시스템의 성숙도 배지(stable·beta·experimental·deprecated)는 Specification·API 버전이 생긴 뒤에 쓴다. 문서 확인 상태와 섞지 않는다.

## URL 규칙

- HTML은 `/docs/<id>/`, Markdown 판은 `/docs/<id>.md`. 문서 루트는 `/docs/`와 `/docs.md`.
- 공개된 URL과 heading id는 바꾸지 않는다. 바꿔야 하면 redirect를 함께 추가한다.

## 디자인 시스템

- UI는 AIP Design System(`winterholic-design-system/aip`)의 토큰·컴포넌트 클래스만 쓴다. 셸은 디자인 시스템 `examples/home.html`·`examples/docs.html` 템플릿을 따른다.
- 배포 산출물은 `pnpm sync:ds`로 `public/vendor/aip/`에 복사해 커밋한다. 출처 commit은 `SOURCE.json`에 남는다. 디자인 시스템에 커밋되지 않은 변경이 있으면 복사하지 않는다.
- 사이트 전용 CSS(`src/styles/site.css`)도 토큰만 쓴다. hex 색과 다크 분기는 `pnpm verify`가 막는다.

## 아직 정하지 않은 것

- 공식 도메인과 호스팅
- 문서 언어 정책(현재 한국어 본문, UI 크롬은 디자인 시스템 템플릿의 영어)
- Specification을 AIP Core 저장소에서 가져와 동기화하는 방식. Core에 machine-readable Specification이 생기면 build 단계에서 가져오는 것을 우선 검토한다
- 문서 버전 관리
- 검색 규모가 커질 때의 검색 엔진(현재는 빌드 시점 목록 + 텍스트 포함 필터)
