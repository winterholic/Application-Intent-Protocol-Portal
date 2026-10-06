# AIP

AIP(Application Intent Protocol)의 공식 웹사이트. AIP 소개, Documentation, Specification, 생태계 탐색을 한곳에서 제공한다.

> 저장소 이름은 `Application-Intent-Protocol-Portal`이지만 사용자에게 노출되는 이름은 **AIP**이다. "AIP Portal"이라는 별도 브랜드는 없다.

## 구조

```
src/content/docs/docs/   문서 원본(canonical source). Markdown/MDX
src/pages/index.astro    / 소개
src/pages/ecosystem.astro /ecosystem/
src/pages/llms*.txt.ts   원본에서 파생한 llms.txt, llms-full.txt
src/pages/[...slug].md.ts 원본에서 파생한 페이지별 raw Markdown
scripts/verify-build.mjs 빌드 결과 검사
```

[Astro](https://astro.build) + [Starlight](https://starlight.astro.build)로 전부 build 시점에 정적 HTML을 만든다. 이유와 규칙은 [docs/architecture.md](docs/architecture.md).

## 개발

Node 22 이상과 pnpm이 필요하다.

```sh
pnpm install
pnpm dev       # http://localhost:4321
pnpm verify    # build + 본문 HTML·raw Markdown·llms.txt 파생 검사
pnpm check     # 타입·frontmatter 검사
```

공식 도메인이 정해지면 `SITE_URL=https://... pnpm build`로 sitemap과 절대 URL을 만든다.

## License

MIT
