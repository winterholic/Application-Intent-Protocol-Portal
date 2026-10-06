# AIP

AIP(Application Intent Protocol)의 공식 웹사이트. AIP 소개, Documentation, Specification, 생태계 탐색을 한곳에서 제공한다.

> 저장소 이름은 `Application-Intent-Protocol-Portal`이지만 사용자에게 노출되는 이름은 **AIP**이다. "AIP Portal"이라는 별도 브랜드는 없다.

## 구조

```
src/content/docs/          문서 원본(canonical source). Markdown + frontmatter
src/lib/site.ts            문서 사이드바·pager·검색 순서(DOC_NAV), 저장소 URL
src/lib/docs.ts            원본 → 문서 목록·URL·Markdown 판 파생
src/lib/markdown.ts        Markdown → AIP Design System 문서 마크업
src/layouts/               Base(공통 head·셸), Docs(사이드바·TOC·pager·검색)
src/pages/                 /, /docs/…, /ecosystem/, /llms.txt, /llms-full.txt, /docs/….md
public/vendor/aip/         AIP Design System 배포 산출물 복사본(SOURCE.json에 출처 commit)
scripts/verify-build.mjs   빌드 결과 검사
```

Astro로 전부 build 시점에 정적 HTML을 만든다. UI는 [AIP Design System](https://github.com/winterholic/winterholic-design-system/tree/main/aip)을 쓴다. 이유와 규칙은 [docs/architecture.md](docs/architecture.md).

## 개발

Node 22 이상과 pnpm이 필요하다.

```sh
pnpm install
pnpm dev       # http://localhost:4321
pnpm verify    # build + 본문 HTML·Markdown 판·llms.txt 파생, 내부 링크·앵커, 토큰 전용 CSS 검사
pnpm check     # 타입·frontmatter 검사
pnpm sync:ds   # ../winterholic-design-system 의 aip/ 산출물을 public/ 으로 다시 복사
```

공식 도메인이 정해지면 `SITE_URL=https://... pnpm build`로 canonical URL을 만든다.

## License

MIT
