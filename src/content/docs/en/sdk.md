---
title: SDK
description: Calling an AIP service from TypeScript and Python in 1.0. Generating a typed binding, reads and writes, idempotency keys, unsettled writes, error handling, and the version header.
status: sourced
source:
  - product/SDK.md
  - product/INSTALL.md
  - COMPATIBILITY.md
  - product/MANAGED-EXECUTION.md
checked: 2026-11-21
---

AIP ships two SDKs for callers: `@aip/sdk` for TypeScript and `application-intent-protocol-sdk` (import name `aip_sdk`) for Python. They use the same version as the engine, 1.0.0. The SDKs call a service from a frontend, a Node.js or Python backend, a batch job or an AI agent. They are separate from the Node.js and Python code that runs inside the server as [extensions](/docs/workers/). Installation is on [Installation](/docs/installation/).

## Generate a binding {#binding}

The server's contract is machine-readable. `aip service gen` turns a definition into a binding file that types every read, write and operation, and carries the contract fingerprint.

```sh
aip service gen app.aip --wire decimal --out binding.ts --sdk-import @aip/sdk
aip service gen app.aip --wire decimal --lang python --out binding.py
```

Keep `--wire` equal to the `wire` value in the service configuration. A deployment's wire is fixed on first connection. Always use an SDK and a binding from the same release and the same deployment: after a definition changes, generate the binding again.

## Read and write from TypeScript {#typescript}

`connect(baseUrl, accessToken, binding)` returns a client. Reads are cached and a successful write invalidates the cache. Writes take an idempotency `key`.

```ts
import { connect } from "@aip/sdk";
import { contract } from "./binding.ts";

const client = connect("http://127.0.0.1:8080", process.env.TOKEN!, contract);
const identity = await client.session();   // { actorId: string | null }
const events = await client.read({ read: "Event", select: ["id", "title", "checked"] as const } as const);
const done = await client.apply({ apply: "Event.mark", target: { ids: ["11"] } } as const, { key: "mark-11" });
```

Fields or values that the contract does not contain are type errors, and the server rejects them as well. `session()` asks the server which actor the token is linked to; it never creates or links an actor.

## Read and write from Python {#python}

The Python SDK uses only the standard library and does not cache reads. It sends the pinned fingerprint as the contract header, so a changed deployment is detected.

```python
from aip_sdk import AipError, WriteUnsettled, connect

client = connect("https://api.example.com", access_token, contract_fingerprint)
identity = client.session()   # {"actorId": "..."}, verified by the server, not read from token claims
rows = client.read({"read": "Event", "select": ["id", "checked"]})
try:
    result = client.apply({"apply": "Event.mark", "target": {"ids": ["11"]}}, key="mark-11")
except WriteUnsettled:
    client.retry_pending()   # same key and body, to settle the outcome
```

## Idempotency and unsettled writes {#unsettled}

The same `key` sent twice runs once; the second call reports `"replayed":true`. If the network fails or the server answers `WIRE.COMMIT_UNKNOWN` or `WIRE.INTERNAL`, the SDK resends the same key and body to settle the result. If the answer after a resend is a refusal that happens before execution, the SDK does not treat the write as settled and raises `WriteUnsettled`. Never invent a new key for an unsettled write. The same key with a different body is `WIRE.IDEMPOTENCY_MISMATCH`.

## Bundles and compose {#bundle}

A caller may group operations the server exposes into one atomic request: everything succeeds or nothing changes. A bundle holds up to 20 operations, and a bundle or compose request may touch up to 1000 rows (`WIRE.BULK_LIMIT` beyond that).

```ts
const done = await client.bundle({ atomic: [
  { create: "Task", values: { project: "10", author: "1", title: "write", points: 3 } },
  { apply: "Project.archive", target: { ids: ["10"] } },
] }, { key: "close-10" });
```

This needs a definition that exposes `create` and the transition. Values cannot be passed between operations except inside `compose`, and `create` does not accept `Url` or `Time` fields.

## Errors and retry guidance {#errors}

Failure bodies carry `requestId` (equal to the `x-request-id` response header) and `retry`. A refused read raises an exception that includes the code. A refused write is returned as `{ ok: false, code: "WIRE...", ... }`. An outcome you cannot know is `WriteUnsettled`.

| `retry` | What the caller does |
|---|---|
| `never` | Fix the input, setup or contract, then call again |
| `later` | Wait, then send the same request. Keep the same key for writes |
| `check-first` | Check the real effect or the stored result first. Do not issue a new key |
| `reauthenticate` | Get a valid token and call again |

Look up any `WIRE.*` code with `aip explain-code`. Codes the SDKs raise themselves are `CLIENT.*`.

## Operations, jobs, files and events {#managed}

When the definition declares `operation` entries, the same client offers `client.operation(name, input)`. Durable jobs add `jobs` (`enqueue`, `status`, `cancel`, `result`), `files` (`put`, `get`, `delete`) and `events` (`read`, `watch`). `watch` polls; there is no SSE or WebSocket helper in the SDK. See [Extensions and workers](/docs/workers/).

```ts
const out = await client.operation("textLength", { text: "AIP 1.0" });   // { length: 7 }
```

## Version header and CORS {#version}

Both SDKs expose their own version (`SDK_VERSION` in TypeScript, `aip_sdk.__version__` in Python) and send `x-aip-sdk: <identity>` on every request. The server records it in logs and traces only; it never rejects on it. Compatibility is decided by the contract fingerprint. In a browser, the engine must be 1.0.0 or newer to accept this header in its CORS preflight; server-to-server calls are not affected. See [Compatibility](/docs/compatibility/).
