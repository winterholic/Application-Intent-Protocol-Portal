---
translatedFrom: "bab1f359c236"
title: "프로젝트 상태"
description: "AIP 1.0.0의 출시 상태와 지원 범위, 남은 결정이다."
---

AIP 1.0.0은 출시 후보로 준비 중이며 안정 릴리스가 아니다. CLI와 SDK가 공개되기 전에는 [소스에서 빌드](/ko/docs/installation/#from-source)할 수 있다.

## 출시 상태 {#release}

`v1.0.0` 태그와 GitHub Release는 아직 없고 npm과 PyPI에도 게시하지 않았다. 통신 프로토콜은 `aip-protocol/1.0`, 라이선스는 MIT, 지원 데이터베이스는 PostgreSQL 17이다. 레지스트리 패키지 이름은 소유자 승인 전까지 잠정이다. 이 페이지는 AIP Core 커밋 `c781dbf7`(2026-11-22)과 대조했다.

## 1.0 범위 {#scope}

PostgreSQL 17을 쓰는 `aip service`와 TypeScript·Python SDK가 정식 경로다. Core는 후보 기능 19개를 지원 11, 조건부 7, 제외 1(자동 테넌트 격리)로 판정했다. 기능별 조건은 [알려진 한계](/ko/docs/known-limitations/)와 영어 원문의 [판정표](/docs/known-limitations/#scope)에 있다.

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
