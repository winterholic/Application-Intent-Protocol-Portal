---
title: Security model
description: In AIP, expressing a request never grants the right to run it. Final authority stays on the server, required safety checks always run there, and extensions cannot bypass them.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - product/OPERATIONS.md
  - spec/definition-syntax.md
  - SECURITY.md
checked: 2026-11-21
---

## Expression is not authority {#expression-not-authority}

AIP lets the frontend express the data and actions it needs. That convenience never moves the security boundary to the frontend. Whatever a caller sends, the server decides the allowed scope and how to execute it. `Decided`

## What the server always enforces {#required-checks}

These checks are required and are always enforced by the server. `Decided`

- authentication and authorization
- type and input constraints
- data integrity
- permission scope
- transaction safety
- execution cost and resource limits

The optional development checks described in [Built for AI](/docs/concepts/ai-first/#verification) are separate. Not using them never skips a required check.

## Extensions follow the same rules {#extensions}

Extensions in JS/TS or Python must follow the server's security policies and contracts. They are not a way around permissions, cost limits or transactions. AIP 1.0 runs workers in an operating-system sandbox (Bubblewrap on Linux, Seatbelt on macOS) with limits described on [Extensions and workers](/docs/workers/#isolation). See also [Extensions](/docs/concepts/extensions/).

## Natural language is not a security input {#natural-language}

Descriptions written in natural language are never used to decide execution permission or security. AIP does not interpret natural language per request to decide what may run. `Decided`

## How 1.0 enforces it {#enforcement}

- Tokens are verified against the provider's keys and linked to an actor by the server; claims never grant permission. See [Authentication and authorization](/docs/authentication/).
- Nothing is open by default: a resource with no `rows read` has no readable rows, and an unlisted field, filter or transition cannot be requested. See [Definition syntax](/docs/definition-syntax/#no-defaults).
- Rows a caller cannot see are indistinguishable from rows that do not exist. A `count` is the exception, and an aggregate that could leak hidden values through its filter is rejected by `aip service check`.
- There is no automatic tenant isolation in 1.0, and counts do not inherit row policy. See [Known limitations](/docs/known-limitations/).
- Report a vulnerability privately through GitHub's private vulnerability reporting on the AIP Core repository, not in a public issue. AIP Core's `SECURITY.md` has the steps and response targets.

## Directions under validation {#direction}

| Topic | Direction |
|---|---|
| New fields | Hidden from callers until explicitly opened, as a safe default. `Direction` |
| Hidden side effects on reads | Allowed only when explicitly declared. `Direction` |
| Deploys that lose data or widen permissions | Explicit approval and impact review by default. `Direction` |
| Permission error detail | Useful to developers without exposing private resources or permission structure. `Direction` |
| Open source and server access | The framework's source being public does not make a running server public; real servers restrict access by authentication, permissions and resource policy. `Direction` |
