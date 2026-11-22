---
title: Extensions and workers
description: How to run your own Node.js or Python logic under an AIP 1.0 server. Declaring an extension, the worker configuration, isolation, durable jobs, and what is still conditional.
status: sourced
source:
  - spec/definition-syntax.md
  - product/OPERATIONS.md
  - product/MANAGED-EXECUTION.md
  - product/EXECUTION.md
  - product/LIMITS.md
  - product/SDK.md
  - CHANGELOG.md
  - product/tests/fixtures/expr-apps/orders/extensions/shopb.mjs
checked: 2026-11-22
---

Logic that the standard capabilities cannot express is written as an extension in JavaScript or Python and runs in a worker process that the server controls. The concept is on [Extensions](/docs/concepts/extensions/). This page is how it works in 1.0.

> [!WARNING]
> Extension code is trusted code. The server checks its input, permissions, time and output, and keeps transactions intact, but it does not read your code. The extension interface (ABI) is not final (`Open`), and worker isolation on Linux and macOS is only partly covered by automated checks. See [Known limitations](/docs/known-limitations/#extensions).

## Declare it in the definition {#declare}

There are four kinds. Each declares its input, output, deadline and implementation, and says what it may touch.

| Kind | Use |
|---|---|
| `operation read` | A call with no resource, such as a computation |
| `operation job` | A durable job with no resource |
| `extension read`, `extension write`, `extension job` | Inside a resource. A write extension lists the transitions it may call in `access` and declares `effect db` |

The release archive's `example.aip` declares them all. This trimmed version keeps a read operation and a write extension; `implementation "module.function"` names the code:

```aip
resource Member { fields { id: Id } }
actor Member

operation read textLength {
  input { text: Text(1..1000) }
  output { length: Int(1..1000) }
  allow actor != null
  effect none
  deadline 2s
  implementation "event.textLength"
}

resource Event {
  fields { id: Id; member: Member; checked: Bool; title: Text }
  rows read when member = actor
  transition mark { allow member = actor; from checked = false; to checked = true; repeat unchanged }
  expose apply mark { target id; bulk maxRows 20 }
  extension write confirm {
    input { id: Event.Id }
    output { id: Event.Id; count: Int }
    access Event.mark
    effect db
    deadline 2s
    implementation "event.confirm"
  }
}
```

`aip service check` lists the extensions the definition needs under `workers.extensions` and sets `workers.required` to `true`.

## Write the code {#code}

`implementation "event.textLength"` means the function `textLength` in `event.mjs` (Node.js) or `event.py` (Python) inside the workers directory. The archive's `extensions/` holds both.

```js
export function textLength(input) {
  return { length: [...input.text].length };
}

export async function confirm(input, ctx) {
  const result = await ctx.data.apply("Event", "mark", [input.id]);
  return { id: result.changed[0] ?? result.unchanged[0], count: result.changed.length };
}
```

The server derives the actor from the verified token. `ctx.data.apply` can only call the transitions the extension's `access` lists (each must also be exposed with `expose apply`), each under its own policy, and every write, audit row and idempotency result commits in one transaction with the validated output. A rejection, a bad output or a missed deadline rolls all of it back. A write extension marked `internal` is hidden from generated clients and refused at the public HTTP entry points.

## Create rows from a write extension {#create}

A write extension can create rows when its `access` lists `create.<Resource>` and that resource has `expose create`. Inside the extension, `ctx.data.create(resource, values)` runs the caller's public create path, with the same field allowlist, `allow` rule and reference visibility. The new ID can feed later reads, transitions and creates in the same call, and all of it commits in one transaction.

```js
export async function placeAtomic(input, ctx) {
  const page = await ctx.data.read({ read: "Product", select: ["id", "price", "stock"], filter: [{ field: "id", op: "eq", value: input.product }] });
  if (page.rows.length === 0) throw ctx.reject("NO_SUCH_PRODUCT", "no such product");
  const { price, stock } = page.rows[0];
  if (stock < input.qty) throw ctx.reject("INSUFFICIENT_STOCK", "not enough stock");
  const total = input.qty * price;
  await ctx.data.apply("Product", "take", [input.product], undefined, undefined, undefined, { qty: input.qty });
  const order = await ctx.data.create("Order", { owner: input.owner, total: 0, placed: false });
  await ctx.data.create("OrderLine", { order, product: input.product, qty: input.qty, unitPrice: price });
  await ctx.data.apply("Order", "settle", [order], undefined, { total });
  return { id: order, total };
}
```

- `ctx.data.apply(resource, transition, ids, key, values, expect, input)` takes the transition's `input` as its last optional argument. Leave `key` as `undefined`; the outer request's idempotency key already covers the whole call.
- `ctx.reject(code, message)` refuses the call for a business reason. The caller receives `WIRE.EXTENSION_REJECTED` with your code and message. A plain exception is `WIRE.EXTENSION_ERROR`.
- An extension that passes `WIRE.CONFLICT` or `WIRE.ALREADY_EXISTS` through gives the caller that code. The server does not rerun an extension, so the caller resends with the same key.
- Create on a resource with encrypted fields is `WIRE.UNSUPPORTED`. After a database error inside the call, such as a unique violation, the transaction is aborted and later `ctx` calls cannot continue.
- The type files for `ctx` (`ctx.d.ts` and `aip_ctx.py`) are in the AIP Core source, not in the SDK packages.

The full definition for this example, with its checked declarations, is on [Examples](/docs/examples/#extension-create).

## Turn workers on {#configure}

Workers are off unless the configuration enables them. One service uses one worker language.

```json
{
  "workers": {
    "directory": "../extensions",
    "language": "node",
    "enable_writes": true
  }
}
```

Set `language` to `"python"` for Python. `enable_writes` is needed for write extensions and not for pure operations. The directory is relative to the configuration file. Calling an operation from an SDK is then `client.operation("textLength", { text: "AIP 1.0" })`, which returns `{ length: 7 }`.

Outbound HTTP is only by registered name. Put endpoints in `workers.integrations` with a URL, method, timeout and size limits. A secret header takes its value from a named environment variable of the service process, never from a file. Endpoints are resolved and pinned at startup, use HTTPS, and refuse private addresses, redirects and proxies by default.

## Isolation {#isolation}

The default `auto` picks the operating system's mechanism: on macOS a Seatbelt sandbox that denies network, file writes, reads of user directories and process creation, and on Linux Bubblewrap with optional cgroup v2 limits. The macOS profile is a deny list, so reads of system paths stay open. The `isolation` setting can select the older network-only macOS profile, `mac_net_deny`.

The server fingerprints top-level `.mjs` and `.py` files in the directory, but not nested imports or installed packages. Pin the modules and their dependencies and keep them immutable.

## Durable jobs {#jobs}

An `operation job` is accepted into PostgreSQL and runs apart from the request. It survives restarts, can be retried, cancelled and looked up, and keeps results for 24 hours.

| Limit | Value |
|---|---|
| Active jobs per owner | 100 |
| Retained job records per owner | 10,000 |
| Input and output | 1 MiB each |
| Declared deadline | at most 1 hour |
| Attempts | 3 by default, 1 to 10 by configuration |

Operators list and requeue failed jobs with `aip service jobs --config service.json list --state FAILED` and `retry --id <id>`. A retry keeps the same run, key and effect journal, so files, events and HTTP effects already recorded are replayed, not repeated.

A request to an outside provider and the database commit are not one transaction. When the outcome after a lost response is unknown, the job stops with `WIRE.EFFECT_UNKNOWN` instead of repeating a mutation. AIP does not claim end-to-end exactly-once delivery with outside providers; plan a recovery step using the provider's own idempotency and lookup features.

Schedules, signature-verified webhooks, event streams, managed files and a message-queue consumer exist and are configured in the service configuration. AIP Core's `product/MANAGED-EXECUTION.md` and `product/INFRASTRUCTURE.md` describe them. External brokers (Kafka, RabbitMQ), S3 and GCS object storage and MySQL job stores sit outside the 1.0 support scope.
