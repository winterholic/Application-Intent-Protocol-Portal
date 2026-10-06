---
title: Why AIP
description: Most backend code in a web application exists to translate what a screen needs into endpoints, and then to keep both sides in sync. AIP aims to remove that repeated work instead of generating it faster.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - README.md
checked: 2026-10-06
---

## The repeated work {#repeated-work}

A typical web feature goes through the same steps every time:

1. The frontend defines the data it needs.
2. The backend implements an API that provides it.
3. Both sides maintain the request and response contract.
4. When the feature changes, both sides change together.
5. A similar feature gets yet another API and implementation.

Each step leaves code behind: routes, controllers, services, DTOs, validation, authorization checks, repositories, error handling and API documentation. All of it becomes maintenance surface.

## Why AI alone does not fix it {#ai-does-not-fix-it}

AI coding agents can produce this code quickly. But the structure that requires it is unchanged: every new screen still means a new contract on both sides, and every change still has to be made twice. Faster generation of the same layers keeps the same maintenance cost.

Existing frameworks were shaped around the assumption that people write, read and maintain the code. AIP re-examines that assumption for a time when AI does a large share of implementation and modification.

> AIP does not stop at helping AI write the existing structure better. It structurally reduces the code that has to be written and maintained in the first place.

## What AIP does instead {#what-aip-does}

- **The frontend expresses what it needs.** Field selection, related data, filtering, sorting and pagination, simple changes the server allows, and calls to standard or extension actions are expressed by the caller instead of being implemented as one more endpoint. `Decided` as the goal; the exact form is `Open`.
- **The server is designed to ship with standard capabilities.** Like a Spring Boot application, an AIP server starts on its own port after installation and configuration. Unlike an empty application, it already provides a rich set of standard capabilities. `Decided`
- **Policies decide, not callers.** Being able to express a request is not permission to run it. The server checks every request against its contracts and policies. `Decided`
- **Extensions cover the rest.** Logic the standard capabilities cannot express is written in JavaScript/TypeScript or Python as official extensions under the same contracts. `Decided`

## How it differs from familiar approaches {#comparison}

| Approach | Where the per-feature work lives |
|---|---|
| REST | A new endpoint and its backend implementation for each need |
| GraphQL | Callers select data, but the server still implements resolvers and authorization for the schema |
| AIP | Callers express data and actions; a shared runtime executes them under declared policies, and only application-specific logic is written as extensions |

AIP draws on GraphQL's idea of data selection and composition and on CQRS's separation of concerns, but it does not copy either. The AIP row describes the goal of the design. How far each part is realized is tracked on [Project status](/docs/status/).

## What it does not promise {#non-goals}

- The backend does not disappear. Its responsibilities stay; the repeated implementation of them is what AIP moves into shared infrastructure.
- No productivity or performance numbers are claimed. None have been measured yet.

## Next {#next}

- [Principles](/docs/concepts/)
- [Intent: expression and authority](/docs/concepts/intent/)
- [Architecture](/docs/architecture/)
