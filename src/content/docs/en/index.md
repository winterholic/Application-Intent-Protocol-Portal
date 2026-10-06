---
title: Introduction
description: AIP is an open-source web framework being designed for an era in which AI writes and maintains much of the code. The frontend expresses the data and actions it needs; the AIP server decides and executes them under your policies.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - README.md
checked: 2026-10-06
---

AIP (Application Intent Protocol) starts from one observation: when a screen needs new data or a new action, teams still translate that need into a new endpoint, a controller, a service, DTOs, validation, authorization checks and API docs, and then maintain all of it on both the frontend and the backend.

AI can write that code faster. It does not make the duplication go away.

AIP takes a different route. The frontend expresses the data and actions it needs in a structured form. The AIP server, designed to ship with a rich set of built-in capabilities, checks the request against the contracts and policies you defined and executes it. Application-specific backend code shrinks to what is genuinely specific to your application.

> [!IMPORTANT]
> AIP is in active design and validation. It has no public release yet, and its definition syntax is not final. This documentation only states what the AIP Core project has decided, and marks everything else as direction or open. See [Project status](/docs/status/).

## What AIP is {#what-aip-is}

- A **backend server framework** that you install and configure, which then runs on its own port with standard capabilities already built in.
- A **frontend library** that the application uses to express the data and actions it needs.
- The **Application Intent Protocol** between the two.
- A **shared execution engine** written in Rust, with contracts and policies that keep the server in control.

Read [Why AIP](/docs/why-aip/) for the problem it targets, and [Principles](/docs/concepts/) for the rules every design decision has to respect.

## What AIP is not {#what-aip-is-not}

- It does not remove the backend. Authentication, authorization, data access control, business invariants, data integrity, transactions and resource limits stay on the server.
- It is not a REST endpoint generator, and it is not a copy of GraphQL or CQRS, although it draws on ideas from both.
- It is not AI features added to an existing framework, and it does not run natural-language prompts as application logic.
- It is not a new general-purpose programming language. Developers keep using the JavaScript/TypeScript and Python ecosystems.

## How this documentation works {#how-these-docs-work}

Every page has a status shown at the top and in its Markdown version.

| Status | Meaning |
|---|---|
| `sourced` | States only what the AIP Core project has decided, with links to the source documents |
| `stub` | A placeholder. The content waits for AIP Core to decide it |

Inside pages, items are labelled with the same vocabulary the AIP Core project uses:

| Label | Meaning |
|---|---|
| `Decided` | Stated or explicitly decided by the founder |
| `Direction` | Consistent with the founder's intent; details still need validation |
| `Open` | Not decided yet |

## For AI coding agents {#for-ai-agents}

The HTML pages and the text versions below are generated from the same source files, so they cannot drift apart.

| Path | Content |
|---|---|
| `/llms.txt` | Index of all pages with their Markdown paths |
| `/llms-full.txt` | Full text of every page |
| `/docs/<page>.md` | Markdown version of a page. Replace the trailing `/` of a page URL with `.md` |

```sh
curl https://aip-portal.vercel.app/llms.txt
curl https://aip-portal.vercel.app/docs/concepts.md
```

Section ids such as `#what-aip-is` stay stable even when wording or language changes. Treat anything marked `Open` as undecided: do not fill it in with guesses when explaining or generating AIP code.
