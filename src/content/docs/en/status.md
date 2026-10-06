---
title: Project status
description: What AIP has decided, what is a direction under validation, what is still open, and what the prototype has verified. Check this page before assuming anything that the documentation does not state.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - plan-docs/STATUS.md
  - plan-docs/90-open-questions.md
  - product/VERIFICATION.md
checked: 2026-10-06
---

AIP is in active design and validation. This page reflects the AIP Core documents as of the date above and changes when they change.

> [!IMPORTANT]
> `Open` means AIP has not decided the answer. People and AI coding agents should not fill these items in with guesses, whether explaining AIP or writing code for it.

## Decided {#decided}

| Topic | Decision |
|---|---|
| Purpose | Minimize application-specific backend implementation and duplicated frontend/backend maintenance, without removing the backend |
| Caller model | The caller expresses the data and actions it needs; the server decides and executes |
| Reads | Caller-composed reads executed under server policy |
| Simple writes | Supported in a standard form where possible, instead of a server command per change |
| Product shape | An AIP server framework that runs on its own port, plus an official frontend library |
| Engine and ecosystem | Rust engine; JavaScript/TypeScript and Python ecosystems, with JS/TS weighted highly |
| Extensions | Official JS/TS and Python extensions under the server's contracts and controls |
| Syntax direction | A structured, AIP-specific way of expressing definitions; declarative style preferred |
| Natural-language metadata | Optional, attached to declarations, never a basis for execution or security |
| Checks | Required server-side safety checks are separate from optional development checks |
| Open source | Developed as open source; outside contributions welcome |

## Direction {#direction}

| Topic | Direction |
|---|---|
| Unregistered read shapes in production | Allow within policy, subject to security, performance and cost validation |
| Batch failure | All-or-nothing for an atomic operation; a partial-success batch mode under review |
| Deployment environments | Ordinary servers and containers first; serverless analysed later |
| Screen synchronization | Refetch-based by default; real-time as a possible option |
| Frontend library scope | Data access, request building, contract handling and state synchronization first |

## Open {#open}

| Topic | Question |
|---|---|
| Definition format | Whether standalone `.aip` files are needed, and the concrete syntax |
| Write composition | How much freedom callers get to combine writes, and transaction boundaries |
| Language parity | Whether TS and Python have equal features in the first release |
| Frontend integration | Framework-independent core first or a first official integration such as React |
| Extension ecosystem | Initial scope of third-party extension packages |
| Extension isolation | Isolation level for running extensions in production |
| Databases | Supported databases and capability model. Current validation uses PostgreSQL |
| Compatibility | How long old fields keep working after a rename |
| First-release callers | Who may write requests directly in the first release |
| License | The specific open-source license |

## Prototype verification {#prototype}

The AIP Core repository contains a prototype that assembles the validated pieces into one server, as of 2026-10-06:

- operational JWT verification and server-side actor mapping
- planned, transactional database migrations
- a locally installed TypeScript SDK with contract-generated types
- Node.js and Python extensions under server controls
- runs against a real PostgreSQL on macOS

These are test results for a prototype, not guarantees of a release. External identity providers, TLS proxy deployment and other operating systems were not tested, and the prototype's definition syntax is not final. Details: [product/VERIFICATION.md](https://github.com/winterholic/Application-Intent-Protocol/blob/main/product/VERIFICATION.md).

## Keeping this page current {#updating}

When a decision changes in AIP Core, this page is updated and its `checked` date moves. Nothing is added here that cannot be traced to AIP Core.
