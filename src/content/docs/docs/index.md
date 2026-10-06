---
title: AIP Documentation
description: AIP 공식 문서의 구성과 현재 상태
status: sourced
source:
  - README.md
  - plan-docs/STATUS.md
---

AIP(Application Intent Protocol)는 프론트엔드가 필요한 데이터와 동작을 정형화해 표현하면
서버가 정책과 계약에 따라 실행하는 프레임워크다.

## 현재 상태

AIP는 설계와 검증이 진행 중이다. 이 문서는 AIP Core에서 확정된 내용만 옮기며,
아직 정해지지 않은 영역은 비워 둔다. 각 문서의 상태는 아래 두 가지 중 하나다.

| status | 의미 |
|---|---|
| `sourced` | AIP Core에서 확정된 내용을 출처와 함께 옮겼다 |
| `stub` | 자리만 있다. 내용은 AIP Core 확정 대기 |

## 구성

- [Quick Start](/docs/getting-started/)
- [Concepts](/docs/concepts/)
- [Guides](/docs/guides/)
- [Specification](/docs/specification/)
- [Security Model](/docs/security/)
- [Examples](/docs/examples/)

## AI Coding Agent를 위한 접근

모든 문서는 같은 원본에서 만들어진다.

- 문서 목록: [`/llms.txt`](/llms.txt)
- 전체 본문: [`/llms-full.txt`](/llms-full.txt)
- 페이지별 Markdown: 페이지 URL 끝의 `/`를 `.md`로 바꾼다. 예: [`/docs/concepts.md`](/docs/concepts.md)
