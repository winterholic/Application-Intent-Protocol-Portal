---
translatedFrom: e1f8d726bc55
title: 소개
description: AIP는 AI가 코드의 많은 부분을 작성하고 유지보수하는 시대를 전제로 설계 중인 오픈소스 웹 프레임워크다. 프론트엔드가 필요한 데이터와 동작을 표현하면 AIP 서버가 정책에 따라 판단하고 실행한다.
---

AIP(Application Intent Protocol)는 하나의 관찰에서 출발한다. 화면에 새 데이터나 동작이 필요해지면 팀은 여전히 그것을 새 endpoint, controller, service, DTO, 검증, 권한 검사, API 문서로 옮기고, 그 모두를 프론트엔드와 백엔드 양쪽에서 유지보수한다.

AI는 그 코드를 더 빨리 쓸 수 있다. 그렇다고 중복이 사라지지는 않는다.

AIP는 다른 길을 택한다. 프론트엔드는 필요한 데이터와 동작을 정형화된 형태로 표현한다. 풍부한 표준 기능을 내장하도록 설계 중인 AIP 서버는 그 요청을 개발자가 정의한 계약과 정책에 비춰 확인하고 실행한다. 애플리케이션별 백엔드 코드는 그 애플리케이션에만 있는 것으로 줄어든다.

> [!IMPORTANT]
> AIP는 설계와 검증이 진행 중이다. 아직 공개 릴리스가 없고 정의 문법도 확정되지 않았다. 이 문서는 AIP Core 프로젝트가 결정한 내용만 적고, 나머지는 direction이나 open으로 표시한다. [현재 상태](/ko/docs/status/)를 참고한다.

## AIP는 무엇인가 {#what-aip-is}

- 설치하고 설정하면 자체 포트에서 동작하고, 표준 기능이 이미 들어 있는 **백엔드 서버 프레임워크**
- 애플리케이션이 필요한 데이터와 동작을 표현하는 **프론트엔드 라이브러리**
- 둘 사이의 **Application Intent Protocol**
- Rust로 작성한 **공통 실행 엔진**과 서버의 통제를 유지하는 계약·정책 체계

AIP가 겨냥하는 문제는 [Why AIP](/ko/docs/why-aip/)에, 모든 설계 결정이 지켜야 하는 규칙은 [원칙](/ko/docs/concepts/)에 있다.

## AIP가 아닌 것 {#what-aip-is-not}

- 백엔드를 없애지 않는다. 인증, 인가, 데이터 접근 통제, 업무 불변조건, 데이터 무결성, 트랜잭션, 자원 제한은 서버에 남는다.
- REST endpoint 생성기가 아니다. GraphQL과 CQRS에서 아이디어를 얻었지만 그 복제도 아니다.
- 기존 프레임워크에 AI 기능을 더한 것이 아니고, 자연어 프롬프트를 애플리케이션 로직으로 실행하지도 않는다.
- 새로운 범용 프로그래밍 언어가 아니다. 개발자는 JavaScript/TypeScript와 Python 생태계를 계속 쓴다.

## 이 문서를 읽는 법 {#how-these-docs-work}

모든 페이지는 머리와 Markdown 판에 상태를 표시한다.

| 상태 | 뜻 |
|---|---|
| `sourced` | AIP Core 프로젝트가 결정한 내용만 출처 링크와 함께 적었다 |
| `stub` | 자리만 있다. 내용은 AIP Core의 결정을 기다린다 |

페이지 안의 항목은 AIP Core 프로젝트와 같은 어휘로 표시한다. 이 어휘는 번역하지 않는다.

| 표시 | 뜻 |
|---|---|
| `Decided` | 창시자가 직접 밝혔거나 명시적으로 결정했다 |
| `Direction` | 창시자의 의도에 맞는 방향이며 세부 사항은 검증이 필요하다 |
| `Open` | 아직 정하지 않았다 |

## AI 코딩 에이전트를 위해 {#for-ai-agents}

HTML 페이지와 아래 텍스트 판은 같은 원본 파일에서 만들어지므로 서로 어긋나지 않는다.

| 경로 | 내용 |
|---|---|
| `/llms.txt` | 모든 페이지의 목록과 Markdown 경로 |
| `/llms-full.txt` | 모든 페이지의 전체 본문 |
| `/docs/<page>.md` | 페이지의 Markdown 판. 페이지 URL 끝의 `/`를 `.md`로 바꾼다 |

```sh
curl https://aip-portal.vercel.app/llms.txt
curl https://aip-portal.vercel.app/docs/concepts.md
```

`#what-aip-is` 같은 절 id는 문구나 언어가 바뀌어도 유지한다. `Open`으로 표시된 것은 정해지지 않은 것이다. AIP를 설명하거나 AIP 코드를 만들 때 추측으로 채우지 않는다.
