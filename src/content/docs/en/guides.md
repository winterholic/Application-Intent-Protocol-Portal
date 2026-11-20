---
title: Guides
description: Task-oriented pages for applying AIP 1.0 to a real application, in the order most projects need them.
status: sourced
source:
  - product/GETTING-STARTED.md
  - product/OPERATIONS.md
  - product/APP-DEPLOY.md
  - product/SDK.md
checked: 2026-11-21
---

Each guide below was written against AIP Core 1.0 documents. Start with the Quick Start if you have not used AIP before.

## Where to start {#current-state}

| I want to | Go to |
|---|---|
| Install the tool and SDKs | [Installation](/docs/installation/) |
| See a working service in minutes | [Quick Start](/docs/getting-started/) |
| Write a definition | [Definition syntax](/docs/definition-syntax/) |
| Call a service from code | [SDK](/docs/sdk/) |
| Connect my identity provider | [Authentication and authorization](/docs/authentication/) |
| Run my own logic on the server | [Extensions and workers](/docs/workers/) |
| Go to production, change a definition, upgrade or roll back | [Deploy and migrate](/docs/deployment/) |
| Learn what is not covered | [Known limitations](/docs/known-limitations/) |

## A typical path {#path}

1. Install the engine and an SDK, then run the Quick Start against a throwaway PostgreSQL database.
2. Write your own definition. Run `aip service check` after every edit. It names the rule you broke, and `aip explain-code` explains it.
3. Link your identity provider and test it with `aip service idp-readiness` and one real token.
4. Add extensions only for logic the definition cannot express.
5. Plan production: database roles, a TLS reverse proxy, backups before every upgrade, and the limits that apply to you.
