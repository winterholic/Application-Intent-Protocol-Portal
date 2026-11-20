---
translatedFrom: 90ce40d1fa51
title: 정의 문법
description: AIP 1.0에서 `aip service`가 읽는 정의 언어. 가정하지 않는 것, 블록과 키, 검사를 거친 예제 두 개, 처음 쓰는 사람이 자주 틀리는 규칙을 다룬다.
---

정의는 애플리케이션의 데이터가 어떻게 생겼는지, 누가 어떤 행을 읽을 수 있는지, 어떤 변경이 허용되는지, 읽기가 얼마나 커질 수 있는지를 적는다. 서버는 모든 요청을 이 정의로 검사한다. 이 페이지는 읽기 안내다. 컴파일러에서 생성하는 전체 참조는 AIP Core의 [`spec/definition-syntax.md`](https://github.com/winterholic/Application-Intent-Protocol/blob/main/spec/definition-syntax.md)이며, 둘이 다르면 그쪽이 맞다.

> [!NOTE]
> AIP Core에는 정의 언어가 둘 있다. 1.0 제품 경로인 `aip service`는 이 페이지의 언어를 읽는다. PoC 언어(`entity`, `command`, `query`, 확장자 `.aipoc`)는 `aip check` 등이 읽으며 1.0 제품이 아니다. 둘을 섞어 쓰지 않는다. [알려진 한계](/ko/docs/known-limitations/#poc-language)를 본다.

## 작성 형식 {#forms}

정의는 다섯 가지 형식 중 하나로 쓰고, 모두 같은 계약이 된다.

- `.aip` 텍스트 파일
- TypeScript·Python 소스 안의 `aip` 블록(`.e.ts`, `.e.py`)
- TypeScript·Python 데이터 리터럴(`.h.ts`, `.h.py`)

파일 형식으로는 모두 다섯 가지다. `aip service check`는 어느 형식이든 검사한다. Quick Start와 이 페이지는 `.aip`를 쓴다.

## 언어가 가정하지 않는 것 {#no-defaults}

무제한 기본값도 암묵적 허용도 없다. 빠뜨리면 열리지 않거나 오류가 된다.

- `rows read`가 없는 resource는 읽을 수 있는 행이 없고, `expose read`가 없는 resource는 읽을 수 없다.
- `budget`이 없는 `expose read`는 루트 읽기가 될 수 없다. budget은 rows, depth, deadline, cost 네 값이 모두 필요하다.
- `expose apply`에는 `bulk maxRows`가, `aggregate`에는 `sourceAccess`가 필요하다.
- 필드 읽기 정책(`field ... read when`)이 있는 필드는 filter, sort, 집계에 쓸 수 없다.
- 알 수 없는 키는 무시하지 않고 오류다.
- 문법 오류는 첫 번째에서 멈춘다. 의미 오류는 모아서 원인을 먼저 보고한다.

## 블록과 키 {#blocks}

| 선언 | 뜻 |
|---|---|
| `enum` | 닫힌 값 집합 |
| `actor` | 호출자를 가리키는 resource. 정확히 하나 |
| `predicate` | 이름 붙인 재사용 조건 |
| `access` | 집계나 확장 결과를 누구에게 줄지 정하는 guard |
| `limit` | 조건에 맞는 행 수의 상한. `invariant`로 필드마다 건다 |
| `resource` | 테이블 하나와 그것을 여는 방식 |
| `operation` | resource 없는 호출. 확장이 구현한다 |

`resource` 안에서는 다음 키를 쓴다.

| 키 | 뜻 |
|---|---|
| `fields` | 열. `?`는 null 허용, 다른 resource 이름은 외래 키 |
| `rows read when` | 호출자가 읽을 수 있는 행. 없으면 읽을 수 있는 행이 없다 |
| `field name read when` | 필드별 읽기 조건. 거짓이면 null이 나온다 |
| `expose read`, `apply`, `create`, `compose`, `aggregate` | 호출자에게 여는 것 |
| `transition` | `from`, `to`나 `patch`, `allow`를 가진 상태 변경 |
| `aggregate` | 행별 또는 단독 count, sum, min, max |
| `unique`, `check`, `invariant` | 제약 |
| `extension` | Node.js나 Python worker 호출 |
| `docs` | 사람이 읽는 설명. 실행과 권한에는 영향을 주지 않는다 |

모든 키의 형태와 뜻은 Core 참조에 표로 있다.

## 예제: 읽기, 정책, 쓰기 {#example}

[Quick Start](/ko/docs/getting-started/)의 정의다. 호출자는 자기 event만 읽고 하나를 checked로 바꿀 수 있다.

```aip
resource Member { fields { id: Id } }
actor Member

resource Event {
  fields { id: Id; member: Member; checked: Bool; title: Text }
  rows read when member = actor
  transition mark { allow member = actor; from checked = false; to checked = true; repeat unchanged }
  expose read {
    select id, checked, title
    filter id.eq, checked.eq
    sort id
    budget { rows 50; depth 1; deadline 1s; cost 100 }
  }
  expose apply mark { target id, where; bulk maxRows 20 }
}
```

## 예제: 집계 {#aggregate-example}

집계는 다른 resource의 행을 이 resource의 행별로 센다. 여기서는 각 글에 호출자가 만든 북마크가 몇 개인지 보여 준다.

```aip
resource Member { fields { id: Id } }
actor Member

resource Bookmark {
  fields { id: Id; post: Post; member: Member }
  rows read when member = actor
}

access visiblePosts = totalOfVisible(Post)

resource Post {
  fields { id: Id; title: Text(1..100); published: Bool }
  rows read when published = true
  aggregate bookmarkCount: Int {
    source Bookmark
    sourceAccess visiblePosts
    groupKey post
    where member = actor
    callerFilter none
    rowOutput none
    release count
  }
  expose read {
    select id, title, bookmarkCount
    filter id.eq
    sort id
    budget { rows 50; depth 1; deadline 1s; cost 100 }
  }
}
```

## 공개 count {#public-count}

`release count`는 `sourceAccess`와 `where`가 고른 모집단을 센다. 원본의 `rows read`는 적용하지 않는다. `sum`, `min`, `max`는 적용한다. 이 차이는 의도한 것이고 1.0에서 응답 값이 바뀌지 않지만, 설계할 때 두 가지를 고려해야 한다.

- `where`가 없는 `count`는 공개 count다. 호출자가 읽을 수 없는 행도 세므로 숨은 행이 늘면 값이 바뀐다. `aip service check`는 오류가 아니라 `DEF.ADVISORY_PUBLIC_COUNT` 경고를 낸다.
- 원본에 `rows read`가 있고 집계가 `callerFilter read`를 쓰면, 집계의 `where`가 그 정책을 함의해야 한다. 아니면 검사가 `DEF.CALLER_FILTER_POLICY_REQUIRED`로 실패한다. 이 규칙이 없으면 호출자가 필터 값을 하나씩 바꿔 가며 숨은 행을 셀 수 있다. 정책을 `where`의 AND 항으로 그대로 적으면 함의한 것으로 본다. 정책이 `A or B`이면 한 가지만 적어도 된다.

응답 값이 바뀌는 대안 두 가지, 명시적인 `release count public`과 모든 count에 `rows read`를 거는 방식은 프로젝트 소유자의 결정으로 남아 있고 1.0에는 없다.

## 자주 틀리는 것 {#separators}

- `transition`의 `to` 안에서 대입은 쉼표로 구분한다: `to done = true, views = views + 1`. 세미콜론은 `from`, `to`, `allow` 같은 항목 사이에 쓴다. `update Member where id = author { ... }` 같은 효과 블록 안의 구분자는 세미콜론이다.
- 숫자는 `f = f + 1`로만 바꾼다. 다른 필드 값을 더하거나 관련 행을 증감하는 것은 표현할 수 없으므로 [확장](/ko/docs/workers/)을 쓴다.
- `Decimal(p,s)` 리터럴은 따옴표 문자열이다: `to total = "0.00"`. 따옴표 없는 `0.00`은 `DEF.BAD_VALUE`다.
- `Int(lo..hi)`는 양 끝을 포함하며 음수 경계도 쓸 수 있다.
- 기본 키는 `id: Id`(숫자, 기본) 또는 `id: Uuid`다. 참조는 resource 이름으로 쓴다(`owner: Member`). `X.Id`는 입력과 operation 타입에서만 쓴다.

## 표현할 수 없는 것 {#not-expressible}

1.0에서 확인했고 `aip service check`가 거부하므로 숨은 함정이 아니다.

- `avg` 집계, `Decimal` 필드의 `sum`
- `sort author.name`처럼 관계 경로를 통한 정렬이나 필터
- 참조 둘 이상으로 집계를 묶는 것
- 관련 행의 필드 증감, 다른 필드 값으로 계산하는 증감

이런 요구는 확장으로 처리한다. [알려진 한계](/ko/docs/known-limitations/)를 본다.

## 진단 코드 {#diagnostics}

모든 오류는 `영역.이름` 형식이다. `DEF`는 정의, `WIRE`는 HTTP API, `CLIENT`는 SDK가 올리는 오류, `POC`는 PoC 언어다.

```sh
aip explain-code DEF.CALLER_FILTER_POLICY_REQUIRED
aip diagnostics --area def
```

첫 명령은 의미와 고치는 방법을 보여 주고, wire 코드에는 재시도 지침도 보여 준다. 둘째 명령은 정의 코드를 모두 나열한다.
