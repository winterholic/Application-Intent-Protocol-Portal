---
title: Quick Start
description: From an empty directory to one definition deployed on PostgreSQL, with an authenticated read and write, using the AIP 1.0.0 command-line tool and SDKs.
status: sourced
source:
  - product/GETTING-STARTED.md
  - product/INSTALL.md
  - product/OPERATIONS.md
  - spec/definition-syntax.md
checked: 2026-11-21
---

This page takes an empty directory to a running AIP server: one definition file is deployed to PostgreSQL, and an authenticated caller reads and changes data. The application has no server code. The definition decides what a caller may read and change, and the server checks every request again.

> [!IMPORTANT]
> AIP 1.0.0 is being prepared for release. [Build the local bundle](/docs/installation/#from-source) to follow this guide before the public downloads are available.

## Before you start {#prerequisites}

| Need | Notes |
|---|---|
| `aip` 1.0.0 | [Installation](/docs/installation/). Unpack the archive and work from that directory |
| PostgreSQL 17 | Use a dedicated database. Other versions were not verified |
| Node.js 26 | For the development token tool and the TypeScript SDK |
| Python 3.9+ | Only for the Python SDK |

Open a shell in the extracted CLI archive directory or in the local `artifact` directory.

```sh
export AIP_HOME="$PWD"
export PATH="$AIP_HOME/bin:$PATH"
aip --version
export AIP_DATABASE_URL='postgres://user:password@127.0.0.1:5432/aip_demo'
mkdir demo && cd demo
```

`aip --version` prints `aip 1.0.0`. Keep the real password in your shell only. The service never reads a `.env` file: the connection string comes from the environment variable named in the configuration.

## 1. Write a definition {#definition}

Save this as `app.aip`. It declares one actor kind, one resource, the rows a caller may read, one state transition, and the read and write the caller is allowed to ask for. Nothing is open unless it is declared. See [Definition syntax](/docs/definition-syntax/).

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

A valid definition prints a JSON line that contains `"ok":true`.

## 2. Make a development token {#token}

In production an external identity provider issues RS256 access tokens. `aip service` never issues tokens and has no development bypass. For local work, a script plays the provider: it creates a key pair and prints a token that the service validates like any other (signature, issuer, audience, lifetime up to 900 seconds). Never use it in production.

```sh
TOKEN=$(node "$AIP_HOME/tools/dev-jwt.mjs" --dir ./dev-idp --subject user-42)
export TOKEN
```

This writes `./dev-idp/jwks.json` (public key) and a private key with mode 0600. A token lives 15 minutes; run the command again when it expires.

## 3. Configure and initialize {#init}

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

`schema` must be a lowercase ASCII identifier that starts with `aip_`. `init` creates the tables and the deployment journal in a new schema. Never run it on an existing schema; change a deployed definition with `service migrate` ([Deploy and migrate](/docs/deployment/)).

## 4. Add data and link the user {#principal}

The token's subject (`sub`) must be linked to an actor row before requests run as that user. The actor row is application data, so it has to exist first.

```sh
psql "$AIP_DATABASE_URL" <<'EOF'
INSERT INTO aip_demo.member(id) VALUES (42);
INSERT INTO aip_demo.event(id, member_id, checked, title) VALUES (11, 42, false, 'First event');
EOF
aip service principal --config service.json bind --subject user-42 --actor 42
```

A token's role or actor id claims are never used as permission. The link is whatever `bind` stored in the server's database. See [Authentication](/docs/authentication/).

## 5. Start the server {#serve}

```sh
aip service gen app.aip --wire decimal --out binding.ts --sdk-import @aip/sdk
FP=$(sed -n 's/^export const contractFingerprint = "\(.*\)";/\1/p' binding.ts)
export FP
aip service serve app.aip --config service.json &
AIP_PID=$!
```

The server prints one JSON line with `"event":"listening"`. It opens loopback HTTP only; put a TLS reverse proxy in front for outside access. `FP` is the contract fingerprint of this definition. A caller sends the contract it knows in a header, and the server rejects a mismatch before touching the database.

## 6. Read and write over HTTP {#http}

```sh
curl -s localhost:8080/ready
curl -s localhost:8080/read -H "authorization: Bearer $TOKEN" -H "x-aip-contract: $FP" \
  -H 'content-type: application/json' -d '{"query":{"read":"Event","select":["id","title","checked"]}}'
curl -s localhost:8080/apply -H "authorization: Bearer $TOKEN" -H "x-aip-contract: $FP" \
  -H 'content-type: application/json' -d '{"key":"first-mark","request":{"apply":"Event.mark","target":{"ids":["11"]}}}'
```

`/ready` returns `{"ok":true,"status":"ready"}` once the definition and database structure check out. The read returns the row (`"title":"First event"`). The write returns `"changed":["11"]`; sending the same `key` again returns `"replayed":true` and does not run twice.

The transition `mark` only lets a caller change `checked` from `false` to `true` on rows where `member = actor`. A request without a token is anonymous, and this definition gives anonymous callers no rows: they receive `"rows":[]`. A valid fingerprint that differs from the server’s is `WIRE.CONTRACT_MISMATCH`. A malformed fingerprint is `WIRE.BAD_REQUEST`, and selecting a field the definition did not expose is `WIRE.FIELD_NOT_EXPOSED`. Look up any code with `aip explain-code <code>`.

## 7. Call it from an SDK {#sdk}

TypeScript, in a separate directory with the generated `binding.ts` copied next to `app.ts`:

```sh
mkdir app && cd app && npm init -y >/dev/null && npm pkg set type=module >/dev/null
npm install --offline --ignore-scripts "$AIP_HOME/sdk/aip-sdk-1.0.0.tgz"
cp ../binding.ts .
```

The local bundle includes the TypeScript SDK tarball. With a published CLI archive, use `npm install @aip/sdk` or install the tarball downloaded from the same release.

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

Node.js 26 runs `.ts` files directly. Python uses the same fingerprint. Install the Python SDK with `pip install application-intent-protocol-sdk` after publication, or run `pip install ./product/python` from the Core checkout before publication. Save the following as `app.py` and run `python app.py`.

```python
import os
from aip_sdk import connect

client = connect("http://127.0.0.1:8080", os.environ["TOKEN"], os.environ["FP"])
print(client.session())
print(client.read({"read": "Event", "select": ["id", "title", "checked"]}))
```

Both SDKs share one idempotency key space. See [SDK](/docs/sdk/).

## Clean up and continue {#next}

```sh
kill "$AIP_PID"
```

Remove the dedicated demo database when you are done with its data.

- Change a deployed definition, upgrade a release or roll back: [Deploy and migrate](/docs/deployment/).
- Run your own Node.js or Python logic under the server's controls: [Extensions and workers](/docs/workers/).
- Know what 1.0 does not cover: [Known limitations](/docs/known-limitations/).
