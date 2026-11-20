---
translatedFrom: 8d7f7236a363
title: Quick Start
description: 빈 디렉터리에서 시작해 정의 하나를 PostgreSQL에 배포하고, 인증된 읽기와 쓰기를 실행하기까지. AIP 1.0.0 명령줄 도구와 SDK를 쓴다.
---

이 페이지는 빈 디렉터리에서 AIP 서버를 띄우는 순서다. 정의 파일 하나를 PostgreSQL에 배포하고, 인증된 호출자가 데이터를 읽고 바꾼다. 애플리케이션에는 서버 코드가 없다. 호출자가 무엇을 읽고 바꿀 수 있는지는 정의가 정하고, 서버가 매 요청마다 다시 검사한다.

> [!IMPORTANT]
> AIP 1.0.0은 출시를 준비 중이다. 공개 다운로드가 열리기 전에는 [소스에서 설치 묶음을 만들어](/ko/docs/installation/#from-source) 이 가이드를 따라간다.

## 시작 전에 {#prerequisites}

| 필요한 것 | 비고 |
|---|---|
| `aip` 1.0.0 | [설치](/ko/docs/installation/). 아카이브를 풀고 그 디렉터리에서 작업한다 |
| PostgreSQL 17 | 전용 데이터베이스를 쓴다. 다른 버전은 확인하지 않았다 |
| Node.js 26 | 개발용 토큰 도구와 TypeScript SDK에 쓴다 |
| Python 3.9+ | Python SDK를 쓸 때만 필요하다 |

CLI 아카이브를 푼 디렉터리나 로컬에서 만든 `artifact` 디렉터리에서 셸을 연다.

```sh
export AIP_HOME="$PWD"
export PATH="$AIP_HOME/bin:$PATH"
aip --version
export AIP_DATABASE_URL='postgres://user:password@127.0.0.1:5432/aip_demo'
mkdir demo && cd demo
```

`aip --version`은 `aip 1.0.0`을 출력한다. 실제 비밀번호는 셸에만 둔다. 서비스는 `.env`를 읽지 않는다. 연결 문자열은 설정에 적은 환경 변수 이름으로만 받는다.

## 1. 정의 쓰기 {#definition}

`app.aip`로 저장한다. 호출자 종류 하나, resource 하나, 호출자가 읽을 수 있는 행, 상태 전이 하나, 호출자에게 열어 주는 읽기와 쓰기를 선언한다. 선언하지 않은 것은 열리지 않는다. [정의 문법](/ko/docs/definition-syntax/)을 본다.

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

```sh
aip service check app.aip
```

정의가 올바르면 `"ok":true`가 들어 있는 JSON 한 줄이 나온다.

## 2. 개발용 토큰 만들기 {#token}

운영에서는 외부 인증 제공자가 RS256 access token을 발급한다. `aip service`는 토큰을 발급하지 않고 개발용 우회도 없다. 로컬에서는 스크립트가 제공자 역할을 한다. 키 쌍을 만들고 토큰을 찍으며, 서비스는 이 토큰을 다른 토큰과 똑같이 검증한다(서명, issuer, audience, 최대 900초 수명). 운영에는 쓰지 않는다.

```sh
TOKEN=$(node "$AIP_HOME/tools/dev-jwt.mjs" --dir ./dev-idp --subject user-42)
export TOKEN
```

`./dev-idp/jwks.json`(공개 키)과 모드 0600의 개인 키가 생긴다. 토큰은 15분 뒤 만료되므로 만료되면 같은 명령을 다시 실행한다.

## 3. 설정과 초기화 {#init}

```sh
cat > service.json <<'EOF'
{
  "schema": "aip_demo",
  "database_url_env": "AIP_DATABASE_URL",
  "listen": "127.0.0.1:8080",
  "wire": "decimal",
  "auth": {
    "issuer": "https://issuer.example",
    "audience": "aip-api",
    "jwks": {"kind": "file", "path": "./dev-idp/jwks.json"}
  }
}
EOF
aip service init app.aip --config service.json
```

`schema`는 `aip_`로 시작하는 소문자 ASCII 식별자여야 한다. `init`은 새 schema에 테이블과 배포 저널을 만든다. 이미 있는 schema에는 쓰지 않는다. 배포한 정의를 바꿀 때는 `service migrate`를 쓴다([배포와 마이그레이션](/ko/docs/deployment/)).

## 4. 데이터와 사용자 연결 {#principal}

토큰의 사용자(`sub`)를 actor 행에 연결해야 요청이 그 사용자로 실행된다. actor 행은 앱의 데이터이므로 먼저 있어야 한다.

```sh
psql "$AIP_DATABASE_URL" <<'EOF'
INSERT INTO aip_demo.member(id) VALUES (42);
INSERT INTO aip_demo.event(id, member_id, checked, title) VALUES (11, 42, false, 'First event');
EOF
aip service principal --config service.json bind --subject user-42 --actor 42
```

토큰의 role이나 actor id claim은 권한으로 쓰이지 않는다. 연결은 서버 DB에 `bind`가 저장한 값이 정한다. [인증과 인가](/ko/docs/authentication/)를 본다.

## 5. 서버 시작 {#serve}

```sh
aip service gen app.aip --wire decimal --out binding.ts --sdk-import @aip/sdk
FP=$(sed -n 's/^export const contractFingerprint = "\(.*\)";/\1/p' binding.ts)
export FP
aip service serve app.aip --config service.json &
AIP_PID=$!
```

서버는 `"event":"listening"`이 들어 있는 JSON 한 줄을 출력한다. loopback HTTP만 열므로 외부에는 TLS reverse proxy를 앞에 둔다. `FP`는 이 정의의 계약 지문이다. 호출자는 자기가 아는 계약을 헤더로 보내고, 서버가 다르면 DB에 닿기 전에 거부한다.

## 6. HTTP로 읽고 쓰기 {#http}

```sh
curl -s localhost:8080/ready
curl -s localhost:8080/read -H "authorization: Bearer $TOKEN" -H "x-aip-contract: $FP" \
  -H 'content-type: application/json' -d '{"query":{"read":"Event","select":["id","title","checked"]}}'
curl -s localhost:8080/apply -H "authorization: Bearer $TOKEN" -H "x-aip-contract: $FP" \
  -H 'content-type: application/json' -d '{"key":"first-mark","request":{"apply":"Event.mark","target":{"ids":["11"]}}}'
```

`/ready`는 정의와 DB 구조 검사를 통과하면 `{"ok":true,"status":"ready"}`를 돌려준다. 읽기는 행(`"title":"First event"`)을 돌려준다. 쓰기는 `"changed":["11"]`을 돌려준다. 같은 `key`로 다시 보내면 `"replayed":true`를 받고 두 번 실행되지 않는다.

전이 `mark`는 `member = actor`인 행의 `checked`를 `false`에서 `true`로 바꾸는 것만 허용한다. 토큰이 없는 요청은 익명이며 이 정의는 익명에게 행을 주지 않으므로 `"rows":[]`를 받는다. 지문 형식이 올바른데 서버와 다르면 `WIRE.CONTRACT_MISMATCH`다. 형식이 잘못되면 `WIRE.BAD_REQUEST`, 정의가 열지 않은 필드를 고르면 `WIRE.FIELD_NOT_EXPOSED`다. 코드는 `aip explain-code <코드>`로 찾아본다.

## 7. SDK로 호출하기 {#sdk}

TypeScript는 별도 디렉터리에서 생성한 `binding.ts`를 `app.ts` 옆에 복사해 쓴다.

```sh
mkdir app && cd app && npm init -y >/dev/null && npm pkg set type=module >/dev/null
npm install --offline --ignore-scripts "$AIP_HOME/sdk/aip-sdk-1.0.0.tgz"
cp ../binding.ts .
```

로컬 묶음에는 TypeScript SDK tarball이 들어 있다. 공개 CLI 아카이브를 사용했다면 `npm install @aip/sdk`를 실행하거나 같은 릴리스에서 받은 tarball을 설치한다.

```ts
import { connect } from "@aip/sdk";
import { contract } from "./binding.ts";

const client = connect("http://127.0.0.1:8080", process.env.TOKEN!, contract);
const events = await client.read({ read: "Event", select: ["id", "title", "checked"] as const } as const);
const done = await client.apply({ apply: "Event.mark", target: { ids: ["11"] } } as const, { key: "mark-11" });
console.log(events.rows, done);
```

```sh
node app.ts
```

Node.js 26은 `.ts` 파일을 그대로 실행한다. Python은 같은 계약 지문을 쓴다. 공개 뒤에는 `pip install application-intent-protocol-sdk`로 설치한다. 공개 전에는 Core 체크아웃에서 `pip install ./product/python`을 실행한다. 아래 내용을 `app.py`로 저장해 `python app.py`로 실행한다.

```python
import os
from aip_sdk import connect

client = connect("http://127.0.0.1:8080", os.environ["TOKEN"], os.environ["FP"])
print(client.session())
print(client.read({"read": "Event", "select": ["id", "title", "checked"]}))
```

두 SDK는 같은 멱등 key 공간을 쓴다. [SDK](/ko/docs/sdk/)를 본다.

## 정리하고 다음으로 {#next}

```sh
kill "$AIP_PID"
```

예제 데이터가 더 이상 필요 없으면 이 가이드 전용 데이터베이스를 정리한다.

- 배포한 정의 변경, 릴리스 업그레이드, 롤백: [배포와 마이그레이션](/ko/docs/deployment/).
- 서버의 통제 아래에서 Node.js나 Python 로직 실행: [확장과 worker](/ko/docs/workers/).
- 1.0이 다루지 않는 범위: [알려진 한계](/ko/docs/known-limitations/).
