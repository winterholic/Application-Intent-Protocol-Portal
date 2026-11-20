---
translatedFrom: 8d7f7236a363
title: "快速入门"
description: "将 AIP 定义部署到 PostgreSQL 17，试用有身份验证的读写和 SDK 调用。"
---

请使用专用的 PostgreSQL 17 数据库和 Node.js 26。AIP 1.0.0 正在准备发布。请从[安装](/zh/docs/installation/#from-source)生成的 `artifact` 目录开始。

## 准备工作目录 {#prerequisites}

将连接字符串换成自己专用的本地测试数据库。

```sh
export AIP_HOME="$PWD"
export PATH="$AIP_HOME/bin:$PATH"
aip --version
export AIP_DATABASE_URL='postgres://user:password@127.0.0.1:5432/aip_demo'
mkdir demo && cd demo
```

## 编写定义 {#definition}

将以下定义保存为 `app.aip`。确认 `aip service check` 的输出包含 `"ok":true`。

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

## 生成开发令牌 {#token}

此令牌仅供本地开发。生产环境使用外部身份提供方签发的访问令牌。

```sh
TOKEN=$(node "$AIP_HOME/tools/dev-jwt.mjs" --dir ./dev-idp --subject user-42)
export TOKEN
```

## 配置并初始化 {#init}

创建配置并初始化新的数据库模式。

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

## 添加数据并绑定用户 {#principal}

先创建数据行，再将令牌的 subject 绑定到对应 actor。

```sh
psql "$AIP_DATABASE_URL" <<'EOF'
INSERT INTO aip_demo.member(id) VALUES (42);
INSERT INTO aip_demo.event(id, member_id, checked, title) VALUES (11, 42, false, 'First event');
EOF
aip service principal --config service.json bind --subject user-42 --actor 42
```

## 启动服务 {#serve}

生成绑定代码并在环回地址启动服务。

```sh
aip service gen app.aip --wire decimal --out binding.ts --sdk-import @aip/sdk
FP=$(sed -n 's/^export const contractFingerprint = "\(.*\)";/\1/p' binding.ts)
export FP
aip service serve app.aip --config service.json &
AIP_PID=$!
```

## 通过 HTTP 读写 {#http}

执行有身份验证的读取和更新。用相同的键再次发送会返回第一次的结果。

```sh
curl -s localhost:8080/ready
curl -s localhost:8080/read -H "authorization: Bearer $TOKEN" -H "x-aip-contract: $FP" \
  -H 'content-type: application/json' -d '{"query":{"read":"Event","select":["id","title","checked"]}}'
curl -s localhost:8080/apply -H "authorization: Bearer $TOKEN" -H "x-aip-contract: $FP" \
  -H 'content-type: application/json' -d '{"key":"first-mark","request":{"apply":"Event.mark","target":{"ids":["11"]}}}'
```

## 通过 SDK 调用 {#sdk}

将 TypeScript 代码保存为 `app.ts`。如果使用正式归档，下方本地 tarball 可以换成同版发布的 tarball 或 `npm install @aip/sdk`。将 Python 代码保存为 `app.py`，安装 [Python SDK](/zh/docs/installation/#python-sdk) 后用 `python app.py` 运行。

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

## 结束 {#next}

停止服务。示例数据不再需要时，可清理这个专用数据库。

```sh
kill "$AIP_PID"
```
