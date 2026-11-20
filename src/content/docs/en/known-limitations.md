---
title: Known limitations
description: What AIP 1.0 supports, supports with conditions, and leaves out, including no automatic tenant isolation, PostgreSQL 17 only, and a proof-of-concept `.aipoc` language that is not the product.
status: sourced
source:
  - product/SUPPORT.md
  - product/LIMITS.md
  - CHANGELOG.md
  - COMPATIBILITY.md
  - product/INSTALL.md
  - product/RELEASE-NOTES-1.0.0.md
  - product/OPERATIONS.md
  - spec/definition-syntax.md
checked: 2026-11-21
---

This page lists what AIP 1.0 does not do or does only under conditions. The support scope below follows the AIP Core 1.0 release audit of 2026-11-21 ([audit document](https://github.com/winterholic/Application-Intent-Protocol/blob/release/1.0-audit-20261121/plan-docs/reviews/2026-11-21-1.0-release-audit.md), on the branch `release/1.0-audit-20261121`, not yet on `main`). It is a draft until the project owner approves the release. If something here is missing from the product, take it as not supported.

## Support scope {#scope}

The audit judged 19 candidate features. A feature counts as supported when the product path (`aip service`) has a test that runs a real PostgreSQL and HTTP or the installed SDK, and the known counterexamples are within documented limits.

| Judgement | Features |
|---|---|
| Supported (11) | Definition check, schema and types, declarative reads and standard writes, partial update, contract HTTP, generated bindings (TypeScript and Python), JWT and principal, server validation, transactions, idempotency and `COMMIT_UNKNOWN`, fingerprint |
| Conditional (7) | Resources, relations and constraints; row and field policy (counts are not covered by `rows read`); init and migration; Node.js and Python extensions; durable jobs; diagnostics and observability; installed SDK and packages |
| Excluded (1) | Automatic tenant isolation |

## No automatic tenant isolation {#tenants}

Tenant isolation as a built-in declaration is excluded from 1.0. The product path has no `tenant` declaration or implementation. It exists only in the proof-of-concept path. You can still separate organizations by writing the condition yourself, for example `rows read when org = actor.org`, in every policy that needs it, and by testing that each policy does. Nothing in 1.0 checks that you did not forget one. Durable job, file and event owner isolation is a per-principal scope, not a general tenant or organization model.

## PostgreSQL 17 only {#database}

- **PostgreSQL 17** is the only supported database in 1.0. Other PostgreSQL versions were not verified.
- **MySQL and MariaDB** are not part of the release. The release binary is built without the MySQL feature. MariaDB works only as a job store, and product reads and writes reject it.
- **Brokers and object storage.** External brokers (Kafka, RabbitMQ) are outside the release build. S3 and GCS object storage was verified only against MinIO, and an upload that finishes after a second check can bypass quota, so do not rely on storage quotas.
- **Migration.** There is no reverse migration, and rollback means restoring a backup. Zero-downtime changes of large tables and automatic reverse migration are out of scope. See [Deploy and migrate](/docs/deployment/).

## The `.aipoc` language is a proof of concept {#poc-language}

The `.aipoc` language (`entity`, `command`, `query`) and the commands that read it (`aip check`, `core`, `ddl`, `ir`, `explain`, `contract`, `gen-ts`) are AIP Core's earlier proof of concept. They are not the 1.0 product. `aip run`, `migrate`, `rekey` and `token` do nothing in the release binary; they answer `RUNTIME_FEATURE_DISABLED` unless the binary is built with `--features poc-runtime`. Product definitions use the `.aip` language and the `aip service` commands. Results from the proof-of-concept path are not evidence that a feature is supported. Several proof-of-concept features, such as search, publishable content, consent and subscribe, do not exist in the product definition language at all.

## Counts and policy {#counts}

- A `count` does not apply the source's `rows read`, though `sum`, `min` and `max` do. A count without `where` includes rows the caller cannot read. See [Definition syntax](/docs/definition-syntax/#public-count).
- A `callerFilter read` aggregate over a source that has `rows read` is rejected unless its `where` implies that policy (`DEF.CALLER_FILTER_POLICY_REQUIRED`). A definition written before this rule can be rejected after the upgrade.
- A standalone aggregate has a fixed 2-second limit and no budget of its own.

## Expressiveness {#expressiveness}

Reads support filter allow-lists, sorting, cursors, to-one and to-many traversal, and `count`, `sum`, `min` and `max`. They do not support `avg`, `sum` over `Decimal`, sorting or filtering through a relation path, or grouping by several references. A to-many traversal sorts by one field. Writes support state transitions, partial updates with optimistic locking and atomic bundles. They do not support incrementing a related row or adding another field's value. Needs like these belong in an [extension](/docs/workers/). There is also no value passing between the operations of a bundle, other than `compose`.

## Extensions and isolation {#extensions}

- The extension interface (ABI) is not final.
- Linux worker isolation (Bubblewrap) is covered by CI, but at the audit date the current code had not run through that job. macOS Seatbelt isolation has no CI and is a manually verified level of support.
- Extension modules and their installed dependencies are not hashed beyond the top-level files; the deployer must pin them.
- Outside providers are not part of the database transaction. The service does not claim exactly-once effects with them.

## Identity, clients and platforms {#environment}

- Real Auth0 and Entra ID tokens against the token profile were not verified. Keycloak was, in a container.
- Old and new clients are not served together after a definition change.
- Windows is not supported. Intel macOS depends on a runner that may be withdrawn. Linux binaries need glibc 2.34 or newer. See [Installation](/docs/installation/#platforms).
- There is no public Docker image.

## Not in 1.0 {#not-included}

Encrypted fields (`aip diagnostics` lists `DEF.ADVISORY_ENCRYPTION_RUNTIME_DISABLED`: encrypted definitions cannot yet be deployed), automatic tenant isolation, full ports of the FaceReview, FlaskBB and Infisical applications, and a public registry image are not 1.0 features. Optional development checks (`--dev-checks`) are conditional: their tests ran in the audit but not in CI at that date.

## Release state {#release-state}

At the date above AIP 1.0.0 is not tagged, no registry package exists, and several continuous-integration workflows had not run on the exact release commit. The audit lists those as blockers for the project to close. See [Release notes](/docs/release-notes/) and [Project status](/docs/status/).
