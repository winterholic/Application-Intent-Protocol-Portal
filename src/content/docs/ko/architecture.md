---
translatedFrom: 080fd4a7117b
title: 아키텍처
description: AIP는 표준 기능을 내장하고 자체 포트에서 동작하는 서버 프레임워크, 공식 TypeScript·Python SDK, 둘 사이의 프로토콜, 계약과 정책이 통제하는 공통 Rust 엔진으로 이뤄진다.
---

## 네 가지 구성 요소 {#parts}

| 구성 요소 | 역할 | 상태 |
|---|---|---|
| AIP 서버 프레임워크 | 설치하고 설정하면 표준 기능을 내장한 채 자체 포트에서 동작 | `Decided` |
| AIP TypeScript·Python SDK | 프론트엔드가 데이터와 동작을 표현하는 공식 방법 | `Decided` |
| Application Intent Protocol | 둘 사이의 통신 모델 | 1.0의 통신 프로토콜은 `aip-protocol/1.0`이다. |
| 공통 실행 엔진 | 요청을 실행하는 Rust 엔진과 계약·정책 체계 | `Decided` |

서버와 TypeScript·Python SDK는 서로를 대체하지 않는다. AIP는 둘 다 제공한다. Node나 Python 패키지에서 서버를 자동으로 띄우는 방식은 개발 편의 기능으로 검토 중이다. `Open`

## Spring Boot처럼 시작하되, 처음부터 기능이 있다 {#spring-boot}

Spring Boot 프로젝트를 설치하고 설정하면 애플리케이션 서버가 포트에서 시작한다. 기능을 구현하기 전까지는 거의 아무것도 하지 않는다.

AIP도 같은 시작을 지향한다. 설치하고 설정하면 서버가 자체 포트에서 동작한다. 차이는 AIP 서버가 이미 풍부한 표준 기능을 갖추고 있다는 점이다. 데이터베이스 연결, 데이터 모델, 권한 정책은 여전히 설정한다. 화면마다 controller와 service와 API를 구현하지는 않는다. `Decided`

## 요청이 지나는 길 {#request-path}

1. TypeScript·Python SDK가 화면이 표현한 것을 보낸다.
2. 런타임이 호출자를 인증하고 요청을 계약과 정책에 비춰 확인한다.
3. 엔진이 허용된 요청을 계획하고 실행하며, 비용과 자원 제한을 지킨다.
4. 표준 기능 밖의 로직은 같은 계약 아래에서 확장으로 실행된다.
5. 결과가 TypeScript·Python SDK로 돌아간다.

계약과 SDK는 [호환성](/ko/docs/compatibility/)에 설명한다.

## 지금 존재하는 것 {#implementation-today}

1.0의 정식 경로는 PostgreSQL 17과 `aip service`다. 서버는 외부 IdP의 JWT를 검증하고 마이그레이션, TypeScript·Python SDK, Node.js·Python 워커를 지원한다. 범위와 조건은 [알려진 한계](/ko/docs/known-limitations/)를 참고한다.
