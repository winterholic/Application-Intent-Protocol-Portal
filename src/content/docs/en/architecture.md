---
title: Architecture
description: AIP is a server framework that runs on its own port with built-in capabilities, plus an official frontend library, a protocol between them, and a shared Rust engine governed by contracts and policies.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - README.md
  - product/VERIFICATION.md
checked: 2026-10-06
---

## The four parts {#parts}

| Part | Role | Status |
|---|---|---|
| AIP server framework | Installed and configured, then runs on its own port with standard capabilities built in | `Decided` |
| AIP frontend library | The official way for the frontend to express data and actions | `Decided` |
| Application Intent Protocol | The communication model between the two | `Decided`; wire format details `Open` |
| Shared execution engine | Rust engine plus the contract and policy system that executes requests | `Decided` |

The server and the frontend library do not replace each other; AIP ships both. Starting the server automatically from a Node or Python package is a possible convenience under review. `Open`

## Like Spring Boot, but not empty {#spring-boot}

Install and configure a Spring Boot project and an application server starts on a port. Until you implement features, it does almost nothing.

AIP aims for the same start: install, configure and a server runs on its own port. The difference is that the AIP server already provides a rich set of standard capabilities. You still configure the database connection, the data model and permission policies. You do not implement a controller, a service and an API for every screen. `Decided`

## A request's path {#request-path}

1. The frontend library sends what the screen expressed.
2. The runtime authenticates the caller and checks the request against the contracts and policies.
3. The engine plans and executes the allowed request, enforcing cost and resource limits.
4. Logic outside the standard capabilities runs as an extension under the same contracts.
5. The result returns to the frontend library.

This describes where responsibilities sit. Protocol and wire details are `Open`.

## What exists today {#implementation-today}

AIP has a working prototype in the AIP Core repository. It is not a release, and its behaviour is not a specification. As of 2026-10-06 the repository contains:

- a Rust engine and an `aip service` command that runs a server against PostgreSQL
- verification of operational access tokens (RS256 JWT) and mapping them to actors on the server
- planned, transactional database migrations
- a TypeScript SDK package installed locally, with types generated from the application's contract
- Node.js and Python extensions running under the server's controls

This was verified on macOS with a local PostgreSQL. External identity providers, TLS proxy deployment and other operating systems were not tested. The definition syntax used by the prototype is not the final AIP syntax. See [Project status](/docs/status/).
