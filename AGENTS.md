# AGENTS.md

이 저장소에서 작업하는 사람과 AI Coding Agent가 따르는 기준.

## 이 저장소는 무엇인가

- GitHub 저장소: `Application-Intent-Protocol-Portal`
- 사용자에게 보이는 이름: **AIP**. "Portal"은 저장소 구분용 이름이다. "AIP Portal"이라는 이름을 UI·문서에 쓰지 않는다.
- 역할: AIP 생태계의 공식 진입점이자 정보 허브. 소개·철학·Getting Started·Documentation·Concepts·Specification·Security·Examples·생태계 탐색을 제공하고, MakeAIP·Playground 같은 공식 도구로 연결한다.

## 책임의 경계

- 이 저장소는 AIP Runtime을 구현하지 않는다.
- AIP Core/Specification이 source of truth다: https://github.com/winterholic/Application-Intent-Protocol
- 사이트 구현 편의를 위해 Specification을 바꾸거나 재정의하지 않는다.
- AIP Core에서 확인할 수 없는 Specification·기능을 공식 문서처럼 쓰지 않는다. 확인된 내용은 `status: sourced`와 `source`, 미정 영역은 `status: stub`.

## Documentation 원칙

- Documentation은 AIP의 핵심 제품이다. 독자는 사람과 AI Coding Agent 둘 다다.
- 하나의 canonical source(`src/content/docs`)에서 HTML·raw Markdown·llms.txt를 파생한다. 별도 AI용 문서를 손으로 쓰지 않는다.
- SSG가 기본이다. 본문이 브라우저 JavaScript 실행 이후에만 나타나는 구조를 만들지 않는다.
- URL과 anchor는 안정적으로 유지한다. heading 위계를 건너뛰지 않는다.
- 정확성, 구조 일관성, 검색 가능성, 링크 안정성, 코드 예제 품질, Specification 동기화를 우선한다.

자세한 구조와 규칙: [docs/architecture.md](docs/architecture.md)

## 작업 방법

```sh
pnpm install
pnpm verify
pnpm check
```

문서를 추가하거나 옮기면 `pnpm verify`가 통과해야 한다.
