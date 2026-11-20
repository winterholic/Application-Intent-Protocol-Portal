---
translatedFrom: 8d7f7236a363
title: "クイックスタート"
description: "PostgreSQL 17 に AIP の定義を配置し、認証済みの読み書きと SDK 呼び出しを試します。"
---

専用の PostgreSQL 17 データベースと Node.js 26 を使います。AIP 1.0.0 は公開準備中です。[インストール](/ja/docs/installation/#from-source)で作成した `artifact` ディレクトリから始めます。

## 作業ディレクトリを作る {#prerequisites}

接続文字列を自分のローカルテスト用データベースに置き換えます。

```sh
export AIP_HOME="$PWD"
export PATH="$AIP_HOME/bin:$PATH"
aip --version
export AIP_DATABASE_URL='postgres://user:password@127.0.0.1:5432/aip_demo'
mkdir demo && cd demo
```

## 定義を書く {#definition}

次の定義を `app.aip` に保存します。`aip service check` の出力に `"ok":true` が含まれることを確認します。

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

## 開発用トークンを作る {#token}

このトークンはローカル開発専用です。本番では外部の ID プロバイダーが発行したトークンを使います。

```sh
TOKEN=$(node "$AIP_HOME/tools/dev-jwt.mjs" --dir ./dev-idp --subject user-42)
export TOKEN
```

## 設定と初期化 {#init}

設定を作成し、新しいスキーマを初期化します。

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

## データと利用者を紐付ける {#principal}

行を作り、トークンの subject をその actor に紐付けます。

```sh
psql "$AIP_DATABASE_URL" <<'EOF'
INSERT INTO aip_demo.member(id) VALUES (42);
INSERT INTO aip_demo.event(id, member_id, checked, title) VALUES (11, 42, false, 'First event');
EOF
aip service principal --config service.json bind --subject user-42 --actor 42
```

## サーバーを起動 {#serve}

バインディングを生成し、サービスをループバックで起動します。

```sh
aip service gen app.aip --wire decimal --out binding.ts --sdk-import @aip/sdk
FP=$(sed -n 's/^export const contractFingerprint = "\(.*\)";/\1/p' binding.ts)
export FP
aip service serve app.aip --config service.json &
AIP_PID=$!
```

## HTTP で読み書き {#http}

認証済みの読み取りと更新を行います。同じキーを再送すると一度目の結果が返ります。

```sh
curl -s localhost:8080/ready
curl -s localhost:8080/read -H "authorization: Bearer $TOKEN" -H "x-aip-contract: $FP" \
  -H 'content-type: application/json' -d '{"query":{"read":"Event","select":["id","title","checked"]}}'
curl -s localhost:8080/apply -H "authorization: Bearer $TOKEN" -H "x-aip-contract: $FP" \
  -H 'content-type: application/json' -d '{"key":"first-mark","request":{"apply":"Event.mark","target":{"ids":["11"]}}}'
```

## SDK で呼び出す {#sdk}

TypeScript のコードは `app.ts` に保存します。公開アーカイブを使う場合は、下のローカル tarball の代わりに同じリリースの tarball または `npm install @aip/sdk` を使います。Python のコードは `app.py` に保存し、[Python SDK](/ja/docs/installation/#python-sdk)を入れて `python app.py` で実行します。

```sh
mkdir app && cd app && npm init -y >/dev/null && npm pkg set type=module >/dev/null
npm install --offline --ignore-scripts "$AIP_HOME/sdk/aip-sdk-1.0.0.tgz"
cp ../binding.ts .
```

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

```python
import os
from aip_sdk import connect

client = connect("http://127.0.0.1:8080", os.environ["TOKEN"], os.environ["FP"])
print(client.session())
print(client.read({"read": "Event", "select": ["id", "title", "checked"]}))
```

## 終了 {#next}

サーバーを停止します。例のデータが不要になったら、専用データベースを片付けてください。

```sh
kill "$AIP_PID"
```
