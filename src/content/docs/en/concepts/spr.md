---
title: "SPR: Specification, Presentation, Runtime"
description: SPR is the basic model for who is responsible for what in AIP. It describes responsibilities, not a fixed package layout.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
checked: 2026-10-06
---

SPR is `Decided` as the model for understanding responsibilities. Concrete package structure or internals are not fixed by the name SPR.

## Specification {#specification}

The server side defines the data model, the allowed scope, permissions, policies, business rules and extension contracts. This is where the application developer states what may happen.

## Presentation {#presentation}

The frontend expresses the data and actions it needs in AIP's structured form, through the official frontend library. This is where a screen states what it wants.

## Runtime {#runtime}

The runtime validates each request and executes it safely according to policy. This is where the server decides whether and how a request runs.

## How the three fit together {#flow}

| Step | Responsibility | Owner |
|---|---|---|
| The screen expresses what it needs | Presentation | Frontend |
| The request is checked against contracts and policies | Runtime, using the Specification | Server |
| The allowed request is executed | Runtime | Server |
| Logic outside the standard capabilities runs | Extension, under the Specification's contracts | Server |

The contract a caller can see and the internal policy of the server are different things. Exactly which parts of a contract are public is `Open`.
