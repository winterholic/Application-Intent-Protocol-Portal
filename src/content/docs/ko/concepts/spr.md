---
translatedFrom: 3611fd430ece
title: "SPR: Specification, Presentation, Runtime"
description: SPR은 AIP에서 누가 무엇을 책임지는지 이해하기 위한 기본 모델이다. 고정된 패키지 구성이 아니라 책임을 설명한다.
sidebarLabel: "SPR"
---

SPR은 책임을 이해하는 모델로 `Decided`다. SPR이라는 이름으로 구체적인 패키지 구성이나 내부 구현을 고정하지 않는다.

## Specification {#specification}

서버 쪽에서 데이터 모델, 허용 범위, 권한, 정책, 업무 규칙, 확장 계약을 정의한다. 애플리케이션 개발자가 무엇이 일어나도 되는지 밝히는 곳이다.

## Presentation {#presentation}

프론트엔드가 공식 프론트엔드 라이브러리로 필요한 데이터와 동작을 AIP의 정형화된 형태로 표현한다. 화면이 원하는 것을 밝히는 곳이다.

## Runtime {#runtime}

런타임은 각 요청을 검증하고 정책에 따라 안전하게 실행한다. 요청을 실행할지와 어떻게 실행할지를 서버가 결정하는 곳이다.

## 세 가지가 맞물리는 방식 {#flow}

| 단계 | 책임 | 주체 |
|---|---|---|
| 화면이 필요한 것을 표현한다 | Presentation | 프론트엔드 |
| 요청을 계약과 정책에 비춰 확인한다 | Specification을 쓰는 Runtime | 서버 |
| 허용된 요청을 실행한다 | Runtime | 서버 |
| 표준 기능 밖의 로직을 실행한다 | Specification의 계약 아래의 확장 | 서버 |

호출자가 볼 수 있는 계약과 서버 내부 정책은 다르다. 계약의 어느 부분을 공개할지는 `Open`이다.
