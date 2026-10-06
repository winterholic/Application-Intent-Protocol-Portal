---
title: Security model
description: In AIP, expressing a request never grants the right to run it. Final authority stays on the server, required safety checks always run there, and extensions cannot bypass them.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
checked: 2026-10-06
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

Extensions in JS/TS or Python must follow the server's security policies and contracts. They are not a way around permissions, cost limits or transactions. The isolation level for running extensions in production is `Open`. See [Extensions](/docs/concepts/extensions/).

## Natural language is not a security input {#natural-language}

Descriptions written in natural language are never used to decide execution permission or security. AIP does not interpret natural language per request to decide what may run. `Decided`

## Directions under validation {#direction}

| Topic | Direction |
|---|---|
| New fields | Hidden from callers until explicitly opened, as a safe default. `Direction` |
| Hidden side effects on reads | Allowed only when explicitly declared. `Direction` |
| Deploys that lose data or widen permissions | Explicit approval and impact review by default. `Direction` |
| Permission error detail | Useful to developers without exposing private resources or permission structure. `Direction` |
| Open source and server access | The framework's source being public does not make a running server public; real servers restrict access by authentication, permissions and resource policy. `Direction` |
