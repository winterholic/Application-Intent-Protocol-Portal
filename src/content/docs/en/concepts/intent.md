---
title: "Intent: expression and authority"
description: In AIP the caller expresses what it needs and the server decides whether and how it runs. This page explains what a caller can express and what always stays with the server.
sidebarLabel: "Intent"
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - docs/PRINCIPLES.md
checked: 2026-10-06
---

## From endpoints to intent {#endpoints-to-intent}

With a REST API, the caller's need is encoded as a URL and an HTTP method that a backend developer implemented for that purpose. In AIP, what matters is what the application is trying to do, not which transport route was built for it.

The two lines below only illustrate the shift in thinking. The second line is **not AIP syntax**; AIP's syntax is `Open`.

```text
POST /api/orders/:id/approve      # a route someone had to implement
approve(order)                    # the intent the application actually has
```

## What a caller can express {#what-callers-express}

The founder asked that the frontend's expression replace a large part of what is repeatedly written on the backend today. The scope under study includes:

| Expression | Status |
|---|---|
| Selecting specific fields | `Decided` as a goal |
| Reading related data | `Decided` as a goal |
| Conditional filtering | `Decided` as a goal |
| Sorting and pagination | `Decided` as a goal |
| Simple data changes the server allows | `Decided` as a goal |
| Calling and combining standard actions | `Decided` as a goal; atomic combination scope is `Open` |
| Calling extensions for complex business logic | `Decided` |

Reading is caller-centred: a new screen composes the data it needs, and the server executes it under policy. If every new screen required a new server API, AIP would miss its purpose. `Decided`

## What stays with the server {#what-the-server-decides}

Expressing a request never grants the right to execute it. The server checks every request against its contracts and policies and remains responsible for:

- authentication and authorization
- data access control
- business invariants and data integrity
- transactions
- execution cost and resource limits
- control over external integrations
- runtime and operational stability

Forbidding arbitrary queries outside policy is different from forbidding safe compositions inside it. AIP allows the second and rejects the first.

## Open questions {#open}

- Whether new fields are hidden from callers until explicitly opened. `Direction`: a safe default is proposed.
- Whether production accepts read shapes that were not registered in advance. `Direction`: allow them within policy, subject to security, performance and cost validation.
- Who may write requests directly in the first release: first-party frontends, AI agents, partners or any third party. `Open`
- How much freedom callers get when combining writes, and where transaction boundaries lie. `Open`
