# Architecture

## 하나의 원본, 여러 표현

```
src/content/docs/**/*.md  (canonical source, frontmatter: title · description · status · source)
        │  astro build
        ├─▶ /docs/<path>/          사람용 HTML (본문이 HTML 응답에 존재)
        ├─▶ /docs/<path>.md        AI용 raw Markdown
        ├─▶ /llms.txt              문서 목록
        └─▶ /llms-full.txt         전체 본문
```

- 사람용 문서와 AI용 문서를 따로 쓰지 않는다. 파생 경로는 `src/lib/docs.ts` 한 곳에 있다.
- 모든 페이지는 SSG로 만든다. 클라이언트 JavaScript는 검색 같은 부가 기능에만 쓴다.
- `pnpm verify`가 각 원본 문서에 대해 HTML 본문, raw Markdown, llms.txt·llms-full.txt 포함 여부를 검사한다.

## URL 규칙

- HTML은 `/<id>/`, raw Markdown은 `/<id>.md`. `<id>`는 `src/content/docs` 기준 경로에서 `/index`를 뺀 값이다.
- 공개된 URL과 heading anchor는 바꾸지 않는다. 바꿔야 하면 redirect를 함께 추가한다.

## 문서 상태

frontmatter `status`는 필수다.

| status | 의미 | 규칙 |
|---|---|---|
| `stub` | 자리만 있음 | 본문에 추측을 쓰지 않는다. banner로 미작성 상태를 표시한다 |
| `sourced` | AIP Core에서 확정된 내용 | `source`에 AIP Core 경로를 적는다 |

새 상태(예: 정식 Specification 버전)는 AIP Core가 Specification 버전 체계를 정한 뒤 추가한다.

## 아직 정하지 않은 것

- 공식 도메인과 호스팅
- 문서 언어 정책(현재 한국어 단일)
- Specification을 AIP Core 저장소에서 가져와 동기화하는 방식. Core에 machine-readable Specification이 생기면 build 단계에서 가져오는 것을 우선 검토한다
- 문서 버전 관리
