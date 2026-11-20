---
title: Architecture
description: AIP is a server framework that runs on its own port with built-in capabilities, plus official caller SDKs, a protocol between them, and a shared Rust engine governed by contracts and policies.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - README.md
  - product/VERIFICATION.md
  - product/OPERATIONS.md
  - COMPATIBILITY.md
checked: 2026-11-21
---

## The four parts {#parts}

| Part | Role | Status |
|---|---|---|
| AIP server framework | Installed and configured, then runs on its own port with standard capabilities built in | `Decided` |
| AIP SDKs (TypeScript, Python) | The official way for a caller to express data and actions | `Decided` |
| Application Intent Protocol | The communication model between the two | `Decided`; the 1.0 wire protocol is `aip-protocol/1.0` |
| Shared execution engine | Rust engine plus the contract and policy system that executes requests | `Decided` |

The server and the SDKs do not replace each other; AIP ships both. Starting the server automatically from a Node or Python package is a possible convenience under review. `Open`

## Like Spring Boot, but not empty {#spring-boot}

Install and configure a Spring Boot project and an application server starts on a port. Until you implement features, it does almost nothing.

AIP aims for the same start: install, configure and a server runs on its own port. The difference is that the AIP server already provides a rich set of standard capabilities. You still configure the database connection, the data model and permission policies. You do not implement a controller, a service and an API for every screen. `Decided`

## A request's path {#request-path}

1. The SDK sends what the screen or the calling program expressed.
2. The runtime authenticates the caller and checks the request against the contracts and policies.
3. The engine plans and executes the allowed request, enforcing cost and resource limits.
4. Logic outside the standard capabilities runs as an extension under the same contracts.
5. The result returns to the SDK.

This describes where responsibilities sit. The 1.0 contract, versions and error codes are on [Compatibility](/docs/compatibility/) and [SDK](/docs/sdk/).

## What exists today {#implementation-today}

AIP 1.0.0 is being prepared for release (see [Project status](/docs/status/)). The product path in the AIP Core repository is:

- a Rust engine and the `aip service` command, which checks a definition, creates and migrates the schema, and serves it against PostgreSQL 17
- verification of operational access tokens (RS256 JWT) and server-side mapping from token subject to actor ([Authentication](/docs/authentication/))
- planned, transactional database migrations with a deployment journal ([Deploy and migrate](/docs/deployment/))
- TypeScript and Python SDKs, with a binding generated from the application's contract ([SDK](/docs/sdk/))
- Node.js and Python extensions running as workers under the server's controls ([Extensions and workers](/docs/workers/))

Applications are written in the `.aip` definition language ([Definition syntax](/docs/definition-syntax/)). AIP Core also keeps an earlier proof-of-concept language, `.aipoc`, which is not part of the product. The scope that 1.0 supports, and what it leaves out, is on [Known limitations](/docs/known-limitations/).
