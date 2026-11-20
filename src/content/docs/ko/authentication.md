---
translatedFrom: 9e126c4340ae
title: "인증과 인가"
description: "서비스에 토큰과 앱의 actor를 연결한다."
---

외부 IdP의 RS256 access token을 사용한다. 서버가 서명과 issuer·audience·만료를 확인한 뒤, 토큰의 subject를 `aip service principal`로 연결한 actor로 해석한다. 행·필드·전이 권한은 앱 정의에서 정한다.

## 인증 구조 {#model}

[영어 원문의 절 보기](/docs/authentication/#model)

## 토큰 프로필 {#token-profile}

[영어 원문의 절 보기](/docs/authentication/#token-profile)

## 서비스 설정 {#configure}

[영어 원문의 절 보기](/docs/authentication/#configure)

## 사용자와 actor 연결 {#principals}

[영어 원문의 절 보기](/docs/authentication/#principals)

## 정의의 인가 정책 {#authorization}

[영어 원문의 절 보기](/docs/authentication/#authorization)

## 검증 범위 {#verified}

[영어 원문의 절 보기](/docs/authentication/#verified)
