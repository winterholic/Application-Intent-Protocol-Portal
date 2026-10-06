---
title: Why AIP
description: 기능마다 반복되는 백엔드 구현을 표준화된 컴파일러와 런타임으로 옮겨, 애플리케이션별 백엔드 구현 코드를 줄이려는 것이 AIP의 목적이다.
status: sourced
source:
  - README.md
  - docs/PRINCIPLES.md
checked: 2026-10-06
---

## 반복되는 백엔드 구현 {#repeated-backend-work}

화면 하나에 필요한 데이터나 동작이 생길 때마다 백엔드에는 비슷한 코드가 쌓인다.
Controller, DTO, Validation, Service, Repository, 권한, 트랜잭션, 오류 처리, API 문서가 기능마다 다시 작성된다.
프론트엔드와 백엔드가 같은 계약을 각자 유지해야 하는 이중 관리도 따라온다.

## AIP가 하려는 일 {#what-aip-does}

AIP는 이 반복을 표준화된 컴파일러와 런타임으로 옮긴다.

> 서버는 안전한 실행 환경을 제공하고, 프론트엔드에서 필요한 데이터와 동작을 표현하면 백엔드에 매번 API를 추가하지 않고도 처리할 수 있어야 한다.

## AIP가 하지 않는 일 {#non-goals}

- 백엔드 서버를 없애지 않는다.
- 인증·인가·비즈니스 규칙·데이터 무결성의 책임을 프론트엔드로 넘기지 않는다.
- 비즈니스 규칙을 정하고 바꾸는 책임은 여전히 개발자에게 있다.

GraphQL과 CQRS에서 영감을 받았지만 그것을 복제하려는 것은 아니다.

## 다음 문서 {#next}

- [목적과 원칙](/docs/concepts/)
- [현재 상태](/docs/status/)
