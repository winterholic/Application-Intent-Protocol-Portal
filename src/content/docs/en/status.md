---
title: Project status
description: Where AIP stands at version 1.0.0, what is decided, what is a direction, what is still open, and what has been verified. Check this page before assuming anything that the documentation does not state.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - plan-docs/STATUS.md
  - plan-docs/90-open-questions.md
  - product/VERIFICATION.md
  - README.md
  - CHANGELOG.md
  - COMPATIBILITY.md
  - product/SUPPORT.md
  - product/LIMITS.md
checked: 2026-11-22
---

AIP Core is preparing version 1.0.0. The public tag and registry packages are pending. Build from source to try the product before publication.

> [!IMPORTANT]
> `Open` means AIP has not decided the answer. People and AI coding agents should not fill these items in with guesses, whether explaining AIP or writing code for it.

## Release state {#release}

| Item | State on 2026-11-22 |
|---|---|
| Version | 1.0.0 for the engine and both SDKs. Protocol `aip-protocol/1.0` |
| Tag `v1.0.0` and GitHub Release | Not created. 1.0.0 is a release candidate, not a stable release |
| npm `@aip/sdk` and PyPI `application-intent-protocol-sdk` | Not published. Names are provisional until the owner approves them |
| Release gate on the final commit | Not recorded yet. AIP Core's `CHANGELOG.md` lists the 1.0.0 entry as a draft |
| License | MIT |
| Supported database | PostgreSQL 17 |
| Compared with AIP Core | Commit `c781dbf7` |

Install commands in [Installation](/docs/installation/) are the ones that apply after the release. Until then the engine is built from source.

## What 1.0 covers {#scope}

AIP Core's 1.0 release audit of 2026-11-21 sorted 19 candidate features into 11 supported, 7 supported with conditions and 1 excluded (automatic tenant isolation). The product path is `aip service` with the `.aip` definition language; the `.aipoc` language is a proof of concept. The table with each condition and limit is on [Known limitations](/docs/known-limitations/#scope).

## Decided {#decided}

| Topic | Decision |
|---|---|
| Purpose | Minimize application-specific backend implementation and duplicated frontend/backend maintenance, without removing the backend |
| Caller model | The caller expresses the data and actions it needs; the server decides and executes |
| Reads | Caller-composed reads executed under server policy |
| Simple writes | Supported in a standard form where possible, instead of a server command per change |
| Product shape | An AIP server framework that runs on its own port, plus an official caller library (SDK) |
| Engine and ecosystem | Rust engine; JavaScript/TypeScript and Python ecosystems, with JS/TS weighted highly |
| Extensions | Official JS/TS and Python extensions under the server's contracts and controls |
| Syntax direction | A structured, AIP-specific way of expressing definitions; declarative style preferred |
| Natural-language metadata | Optional, attached to declarations, never a basis for execution or security |
| Checks | Required server-side safety checks are separate from optional development checks |
| Open source | Developed as open source under the MIT license; outside contributions welcome |

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
| Syntax compatibility | Whether definitions written for 1.0 keep their meaning when syntax is added later. AIP Core has no grammar version field |
| Write composition | How much freedom callers get to combine writes. 1.0 has atomic bundles that can use the ID of an earlier create, and `compose`, within fixed limits; the final choice is not made |
| Language parity | Whether TS and Python have equal features. Both SDKs ship in 1.0 at the same version |
| Frontend integration | Which official framework integration, if any, follows the framework-independent TypeScript SDK |
| Extension ecosystem | Initial scope of third-party extension packages |
| Extension isolation | Isolation level for running extensions in production, and the extension interface (ABI) |
| Compatibility | How long an old contract keeps working after a change. 1.0 serves one contract per deployment |
| First-release callers | Who may write requests directly in the first release |
| Public count default | Whether a `count` should inherit `rows read`. 1.0 keeps the current meaning and adds a check and an advisory |
| Package names | The final npm and PyPI names |

## Verification {#verification}

AIP Core runs its regression on GitHub Actions, on Ubuntu with PostgreSQL 17, and its release gate on a clean clone with bundle smoke tests and upgrade and rollback drills. Local product checks use a real PostgreSQL, real JWTs from a controlled issuer, the installed SDKs, and the Node.js and Python extension workers. Some paths have no automatic coverage: macOS worker isolation, accounts at external identity providers beyond Keycloak, and a TLS reverse proxy other than Caddy. The audit also records workflows that had not run on the current commit. See [Known limitations](/docs/known-limitations/).

Use the [Quick Start](/docs/getting-started/) for a local PostgreSQL 17 walkthrough. [Core’s release gate](https://github.com/winterholic/Application-Intent-Protocol/blob/main/product/RELEASE-GATE.md) tracks integrated test evidence.

## Earlier prototype {#prototype}

Before 1.0, AIP Core assembled a prototype that was verified on macOS on 2026-10-06 with JWT verification, planned database migrations, a locally installed TypeScript SDK and Node.js and Python extensions. That work became the `aip service` product path. Its details are in [product/VERIFICATION.md](https://github.com/winterholic/Application-Intent-Protocol/blob/main/product/VERIFICATION.md) and are not a statement about 1.0.

## Keeping this page current {#updating}

When a decision changes in AIP Core, this page is updated and its `checked` date moves. Nothing is added here that cannot be traced to AIP Core.
