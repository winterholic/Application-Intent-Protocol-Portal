---
translatedFrom: e22145b82c9a
title: "프로젝트 상태"
description: "AIP 1.0.0의 출시 상태와 지원 범위, 남은 결정이다."
---

AIP 1.0.0은 출시를 준비 중이다. CLI와 SDK가 공개되기 전에는 [소스에서 빌드](/ko/docs/installation/#from-source)할 수 있다.

## 출시 상태 {#release}

예정 태그는 `v1.0.0`이고 통신 프로토콜은 `aip-protocol/1.0`이다. 레지스트리 패키지 이름은 잠정이다.

## 1.0 범위 {#scope}

PostgreSQL 17을 쓰는 `aip service`와 TypeScript·Python SDK가 정식 경로다. 지원 범위는 [알려진 한계](/ko/docs/known-limitations/)를 참고한다.

## Decided {#decided}

앱이 필요한 데이터와 동작을 표현하면 서버가 계약과 정책에 따라 실행한다.

## Direction {#direction}

표준 기능을 먼저 쓰고, 앱에만 필요한 로직은 Node.js나 Python 확장으로 작성한다.

## Open {#open}

공개 패키지 이름과 확장 ABI는 확정 전이다.

## 검증 {#verification}

통합 검사와 환경별 근거는 [영어 문서](/docs/status/#verification)에서 볼 수 있다.

## 이전 프로토타입 {#prototype}

`.aipoc`는 개념 검증용이다. 제품 정의에는 `.aip`를 쓴다.

## 이 페이지를 갱신하는 방법 {#updating}

구현과 출시 결정은 Core를 따른다. 세부 항목은 [영어 문서](/docs/status/)에 있다.
