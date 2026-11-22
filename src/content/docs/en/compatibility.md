---
title: Compatibility
description: Which versions of the engine, SDKs, wire protocol and file formats belong together in AIP 1.0, what the 1.0 compatibility boundary is, and what is not promised.
status: sourced
source:
  - COMPATIBILITY.md
  - product/INSTALL.md
  - product/OPERATIONS.md
  - CHANGELOG.md
  - product/RELEASE-NOTES-1.0.0.md
  - product/SUPPORT.md
checked: 2026-11-22
---

## Versions that belong together {#versions}

The engine (`aip`), the TypeScript SDK and the Python SDK share one version number. The Cargo workspace version in AIP Core is the single source, and a script fails the build if any marker drifts from it. Only Python's pre-release spelling differs (`1.0.0rc1`, PEP 440).

| Engine and SDKs | Protocol | Core IR | App manifest | Package format | Note |
|---|---|---|---|---|---|
| 1.0.0 | `aip-protocol/1.0` | `aip-core/0.11` | `app-manifest-v1.json` | 1 | Release candidate. Not released; a draft until the owner approves it |
| 0.1.0 | `aip-protocol/0.1` | `aip-core/0.11` | `app-manifest-v1.json` | 1 | Pre-release, never published |

## The compatibility boundary {#boundary}

- **Protocol major version.** The `protocol` field of the contract document (`GET /aip/describe`) and the header comment of a generated binding carry `aip-protocol/1.0`. Inside one major version the contract document may only gain optional fields. Removing a field, changing a meaning or deleting an error code needs a new major. The error code registry grows by minor versions and shrinks only by a major.
- **Contract fingerprint.** `x-aip-contract` and the `contractFingerprint` in `/capabilities` identify one application's deployed contract. It is independent of SemVer. When a deployment changes, regenerate the binding.
- **Core IR tag.** `aip-core/0.11` stays in 1.0. It is stored in each deployment's journal, and changing the string would make every existing deployment read as changed. It moves only when the meaning of the IR changes.
- **Manifest and package format.** Neither changed in 1.0.

The protocol string is not an input to the contract fingerprint, so a deployment made before 1.0 keeps its fingerprint.

## Contract header errors {#header-errors}

What a caller gets when the `x-aip-contract` header is missing or wrong depends on the route. Code that calls HTTP directly can handle `WIRE.CONTRACT_REQUIRED` and `WIRE.CONTRACT_MISMATCH` the same way: read the server's fingerprint and send it, or regenerate the binding. The generated bindings and the SDKs send the header themselves.

| Request | Code |
|---|---|
| `/read`, `/apply` (transitions, bundles, compose) or `/status`, no header | `WIRE.CONTRACT_REQUIRED` |
| The same routes, a value that is not 64 lowercase hexadecimal digits (uppercase is refused) | `WIRE.BAD_REQUEST` |
| The same routes, a well-formed fingerprint that differs from the server's | `WIRE.CONTRACT_MISMATCH` |
| Object API, RAG API, managed `/jobs/*`, `/files/*`, `/events/*` and `/messages/*`, no header | `WIRE.CONTRACT_MISMATCH`, not `CONTRACT_REQUIRED` |
| `/apply` of a write extension, no header | `WIRE.CONTRACT_MISMATCH` (not `CONTRACT_REQUIRED`; a wrong supplied fingerprint uses the same "contract fingerprint required" message) |

## What 1.0 does not promise {#not-promised}

- **Old clients next to new ones.** After a definition change, a client holding the old fingerprint gets `WIRE.CONTRACT_MISMATCH`, and a server still running the old definition refuses work with `WIRE.DEPLOYMENT_CHANGED`. There is no protocol for serving both.
- **Definition-syntax stability.** AIP Core found no grammar version field or compatibility guard beyond its generated golden file. Treat added syntax in a later release as possibly affecting how existing definitions are read until the project says otherwise.
- **A blocking protocol check in the SDK.** The SDKs only warn. The server reports its protocol in `/capabilities`, and the Python SDK raises `AipProtocolWarning` when the major version differs or the value is malformed. The TypeScript client has no automatic warning; it exposes `protocolWarning(serverProtocol)`. Neither blocks a call, and compatibility is still decided by the contract fingerprint.
- **Extension interface stability.** The extension ABI is `Open`.

## Newer syntax and older servers {#expressiveness}

The expressiveness additions are new optional request keys, so they stay inside the 1.0 rule that only optional fields are added.

- An older server rejects the keys `refs`, `target.created`, `input` and a `compose` inside a bundle with `WIRE.UNKNOWN_KEY`. A new SDK that uses them needs a server from the same release.
- The fingerprint changes only for a new definition that declares a transition `input` or uses Decimal `sum`. A definition that uses neither keeps its fingerprint, generated binding and execution digest.
- A bundle response gains an `ops` list only when the bundle holds a `compose`. Other responses, and replayed stored results, are unchanged.
- On MySQL, which is outside 1.0, writes refuse `input` and arithmetic with `WIRE.UNSUPPORTED`, and reads refuse Decimal `sum`.
- `aip service check` rejects more than one `actor` (`DEF.MULTIPLE_ACTORS`) and some hidden-field routes, and reports new advisories. Check existing definitions with the new binary first. See [Known limitations](/docs/known-limitations/#policy-checks).
- The definition-check JSON diagnostics add location and explanation fields while keeping the existing fields. The JSON code registry exposes `severity` and `status`; match on diagnostic `code`, not message text. For write extensions and jobs, an unexposed transition now reports `DEF.ACCESS_TARGET_NOT_EXPOSED` where earlier builds reported `DEF.UNKNOWN_SYMBOL`.
- `access read.<Resource>` is an optional read-extension allowlist. When declared, undeclared `ctx.data.read` calls fail with `WIRE.ACCESS_NOT_DECLARED`; extensions without the declaration keep the earlier behavior. The extension ABI remains open.
- A bundle pre-locks multiple named `target.ids` and compose rows in `(resource, id)` order. This changes lock acquisition timing, not operation order or response shape. Dynamic `target.where` targets, earlier creates and effect locks are not covered; see [Known limitations](/docs/known-limitations/#expressiveness).
- After a lost write response, SDK retries that receive selected pre-idempotency rejections (`WIRE.RATE_LIMITED`, `WIRE.SERVER_BUSY`, `WIRE.CIRCUIT_OPEN`, `WIRE.DEPLOYMENT_CHANGED`, `WIRE.SCHEMA_MISMATCH`) remain unsettled. Python also reuses the pending idempotency key when the caller retries without supplying one. TypeScript rejects duplicate or missing `refs` fields, duplicate `select` fields and non-reference `refs` keys at compile time; a compose result for a Uuid resource is no longer treated as malformed.

## SDK and engine versions together {#sdk-versions}

Both SDKs report their version and send it in `x-aip-sdk`, and the server logs it. A caller from before this header existed (development builds, all numbered `0.1.0`) sends nothing; the log has no `sdk` field. Mixing a new binding with such an SDK fails with a `TypeError` as soon as it uses a function the old SDK lacks, for example `client.session is not a function`. The fix is to move the SDK to the same release as the binding. A browser using SDK 1.0.0 needs engine 1.0.0 or newer because of the CORS preflight.

## Platforms and databases {#platforms}

Supported CLI targets, glibc and macOS minimums are on [Installation](/docs/installation/#platforms). PostgreSQL 17 is the only verified database. See [Known limitations](/docs/known-limitations/#database).
