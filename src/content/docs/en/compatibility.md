---
title: Compatibility
description: Which versions of the engine, SDKs, wire protocol and file formats belong together in AIP 1.0, what the 1.0 compatibility boundary is, and what is not promised.
status: sourced
source:
  - COMPATIBILITY.md
  - product/INSTALL.md
  - product/OPERATIONS.md
checked: 2026-11-21
---

## Versions that belong together {#versions}

The engine (`aip`), the TypeScript SDK and the Python SDK share one version number. The Cargo workspace version in AIP Core is the single source, and a script fails the build if any marker drifts from it. Only Python's pre-release spelling differs (`1.0.0rc1`, PEP 440).

| Engine and SDKs | Protocol | Core IR | App manifest | Package format | Note |
|---|---|---|---|---|---|
| 1.0.0 | `aip-protocol/1.0` | `aip-core/0.11` | `app-manifest-v1.json` | 1 | First stable release. Draft until the owner approves it |
| 0.1.0 | `aip-protocol/0.1` | `aip-core/0.11` | `app-manifest-v1.json` | 1 | Pre-release, never published |

## The compatibility boundary {#boundary}

- **Protocol major version.** The `protocol` field of the contract document (`GET /aip/describe`) and the header comment of a generated binding carry `aip-protocol/1.0`. Inside one major version the contract document may only gain optional fields. Removing a field, changing a meaning or deleting an error code needs a new major. The error code registry grows by minor versions and shrinks only by a major.
- **Contract fingerprint.** `x-aip-contract` and the `contractFingerprint` in `/capabilities` identify one application's deployed contract. It is independent of SemVer. When a deployment changes, regenerate the binding.
- **Core IR tag.** `aip-core/0.11` stays in 1.0. It is stored in each deployment's journal, and changing the string would make every existing deployment read as changed. It moves only when the meaning of the IR changes.
- **Manifest and package format.** Neither changed in 1.0.

The protocol string is not an input to the contract fingerprint, so a deployment made before 1.0 keeps its fingerprint.

## What 1.0 does not promise {#not-promised}

- **Old clients next to new ones.** After a definition change, a client holding the old fingerprint gets `WIRE.CONTRACT_MISMATCH`, and a server still running the old definition refuses work with `WIRE.DEPLOYMENT_CHANGED`. There is no protocol for serving both.
- **Definition-syntax stability.** AIP Core found no grammar version field or compatibility guard beyond its generated golden file. Treat added syntax in a later release as possibly affecting how existing definitions are read until the project says otherwise.
- **A runtime protocol check in the SDK.** The SDK compares the contract fingerprint only. A check of the server's protocol major version is not in 1.0; it is a 1.0.x candidate.
- **Extension interface stability.** The extension ABI is `Open`.

## SDK and engine versions together {#sdk-versions}

Both SDKs report their version and send it in `x-aip-sdk`, and the server logs it. A caller from before this header existed (development builds, all numbered `0.1.0`) sends nothing; the log has no `sdk` field. Mixing a new binding with such an SDK fails with a `TypeError` as soon as it uses a function the old SDK lacks, for example `client.session is not a function`. The fix is to move the SDK to the same release as the binding. A browser using SDK 1.0.0 needs engine 1.0.0 or newer because of the CORS preflight.

## Platforms and databases {#platforms}

Supported CLI targets, glibc and macOS minimums are on [Installation](/docs/installation/#platforms). PostgreSQL 17 is the only verified database. See [Known limitations](/docs/known-limitations/#database).
