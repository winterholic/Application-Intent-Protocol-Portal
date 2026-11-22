---
title: Guides
description: Task-oriented pages for applying AIP 1.0 to a real application, in the order most projects need them.
status: sourced
source:
  - product/GETTING-STARTED.md
  - product/OPERATIONS.md
  - product/APP-DEPLOY.md
  - product/SDK.md
  - product/LIMITS.md
  - spec/definition-syntax.md
checked: 2026-11-22
---

Each guide below was written against AIP Core 1.0 documents. Start with the Quick Start if you have not used AIP before.

## Where to start {#current-state}

| I want to | Go to |
|---|---|
| Install the tool and SDKs | [Installation](/docs/installation/) |
| See a working service in minutes | [Quick Start](/docs/getting-started/) |
| Write a definition | [Definition syntax](/docs/definition-syntax/) |
| Call a service from code | [SDK](/docs/sdk/) |
| Create a parent and its children in one request | [Use a row created earlier](/docs/sdk/#bundle-refs) |
| Change a quantity or a balance safely | [Changing numbers](/docs/definition-syntax/#arithmetic) |
| Total an amount of money | [Sum over Decimal](/docs/definition-syntax/#decimal-sum) |
| Connect my identity provider | [Authentication and authorization](/docs/authentication/) |
| Run my own logic on the server | [Extensions and workers](/docs/workers/) |
| Create rows from server logic | [Create rows from a write extension](/docs/workers/#create) |
| Go to production, change a definition, upgrade or roll back | [Deploy and migrate](/docs/deployment/) |
| Learn what is not covered | [Known limitations](/docs/known-limitations/) |

## A typical path {#path}

1. Install the engine and an SDK, then run the Quick Start against a throwaway PostgreSQL database.
2. Write your own definition. Run `aip service check` after every edit. It names the rule you broke, and `aip explain-code` explains it.
3. Link your identity provider and test it with `aip service idp-readiness` and one real token.
4. Add extensions only for logic the definition cannot express.
5. Plan production: database roles, a TLS reverse proxy, backups before every upgrade, and the limits that apply to you.

## When a declaration is not enough {#beyond}

Try these in order before writing an extension, and see the full list of limits with their workarounds on [Known limitations](/docs/known-limitations/#expressiveness).

1. Parent and children together: one bundle, with the later `create` referencing the earlier one.
2. A quantity that goes up or down: a transition with an `input` amount and a one-term `to`.
3. A total of money: a `Decimal` aggregate with `sum`. A total of quantity times price is not possible; compute it in an extension and store it.
4. Logic the server must run itself: a write extension, which can read, call transitions and create rows under the caller's policies. Business refusals use `ctx.reject`.

All of this is PostgreSQL only, and every declaration is checked again by the server on each request.
