---
title: Specification
description: Where the AIP 1.0 specification lives. The definition language reference, the error code registries and the compatibility table are generated or maintained in AIP Core, and these pages explain them.
status: sourced
source:
  - spec/definition-syntax.md
  - spec/definition-diagnostics.md
  - spec/wire-errors.md
  - spec/client-errors.md
  - COMPATIBILITY.md
checked: 2026-11-21
---

AIP Core is the source of truth for the specification. Portal does not copy or redefine it. These are the 1.0 documents, with the pages here that explain them.

## Reference documents {#current-state}

| Document in AIP Core | What it defines | Read it here first |
|---|---|---|
| `spec/definition-syntax.md` | The product definition language: blocks, keys, defaults that are not assumed. Generated from the compiler | [Definition syntax](/docs/definition-syntax/) |
| `spec/definition-diagnostics.md` | `DEF.*` codes for definition errors, and how to fix each | [Definition syntax](/docs/definition-syntax/#diagnostics) |
| `spec/wire-errors.md` | `WIRE.*` codes of the HTTP API, with retry guidance | [SDK](/docs/sdk/#errors) |
| `spec/client-errors.md` | `CLIENT.*` codes that the TypeScript and Python SDKs raise themselves | [SDK](/docs/sdk/#errors) |
| `COMPATIBILITY.md` | Which engine, SDK, protocol and format versions belong together | [Compatibility](/docs/compatibility/) |

All error codes have the form `AREA.NAME`. `aip explain-code <code>` and `aip diagnostics` list every code from the command line, covering all four areas (`DEF`, `WIRE`, `CLIENT`, `POC`).

## Versions {#versions}

The 1.0 wire protocol is `aip-protocol/1.0`. Its major version is the compatibility boundary: inside 1.x the contract document may only gain optional fields. The definition language has no version marker of its own in 1.0. See [Compatibility](/docs/compatibility/#not-promised).

## What is not specification {#not-spec}

`spec/grammar.md` and `spec/diagnostics.md` describe the proof-of-concept language `.aipoc` and its `POC.*` codes. They are not the 1.0 product. See [Known limitations](/docs/known-limitations/#poc-language).
