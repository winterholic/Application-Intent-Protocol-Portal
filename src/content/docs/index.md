---
title: AIP Documentation
description: AIP는 프론트엔드가 필요한 데이터와 동작을 표현하면 서버가 정책과 계약에 따라 실행하는 프레임워크다. 이 문서는 AIP Core에서 확정된 내용만 다룬다.
status: sourced
source:
  - README.md
checked: 2026-10-06
---

AIP(Application Intent Protocol)는 애플리케이션별 백엔드 반복 구현과 프론트엔드·백엔드 계약의 이중 유지보수를 줄이려는 프레임워크다.
프론트엔드가 필요한 데이터와 동작을 정형화해 표현하면, 서버가 정책과 계약에 따라 실행한다.

> [!NOTE]
> AIP는 설계와 검증이 진행 중이다. 이 문서는 AIP Core에서 확정된 내용만 옮기고, 정해지지 않은 영역은 비워 둔다.

## 문서 상태 {#doc-status}

모든 문서는 둘 중 하나의 상태를 가진다. 상태는 각 페이지 머리와 Markdown 판에 표시된다.

| 상태 | 뜻 |
|---|---|
| `sourced` | AIP Core에서 확정된 내용을 출처와 함께 옮겼다 |
| `stub` | 자리만 있다. 내용은 AIP Core 확정 대기 |

## 어디서 시작할까 {#where-to-start}

- [Why AIP](/docs/why-aip/): AIP가 줄이려는 문제
- [목적과 원칙](/docs/concepts/): AIP가 지키는 원칙
- [현재 상태](/docs/status/): 확정된 것과 아직 정해지지 않은 것

## AI Coding Agent를 위한 접근 {#for-ai-agents}

사람이 읽는 HTML과 같은 원본에서 만든 텍스트 판을 제공한다.

| 경로 | 내용 |
|---|---|
| `/llms.txt` | 문서 목록과 각 문서의 Markdown 경로 |
| `/llms-full.txt` | 전체 문서 본문 |
| `/docs/<page>.md` | 페이지별 Markdown. 페이지 URL 끝의 `/`를 `.md`로 바꾼다 |

```sh
curl https://<site>/llms.txt
curl https://<site>/docs/concepts.md
```

절 제목의 id(`#principles` 등)는 문구가 바뀌어도 유지한다.
