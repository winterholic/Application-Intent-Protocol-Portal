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
  - product/SDK.md
checked: 2026-11-22
---

This page lists what AIP 1.0 does not do or does only under conditions. The support scope below follows [AIP Core's 1.0 support scope](https://github.com/winterholic/Application-Intent-Protocol/blob/main/product/SUPPORT.md), which rests on the [release audit](https://github.com/winterholic/Application-Intent-Protocol/blob/main/plan-docs/reviews/2026-11-21-1.0-release-audit.md) of 2026-11-21. It is a draft until the project owner approves the release. If something here is missing from the product, take it as not supported.

## Support scope {#scope}

Core judged 19 candidate features: 11 supported, 7 conditional, 1 excluded. A feature counts as supported when the product path (`aip service`) has a test that runs a real PostgreSQL and HTTP or the installed SDK, and the known counterexamples are within documented limits. Every database judgement was made on PostgreSQL 17.

| # | Feature | Verdict | Condition and limit |
|---|---|---|---|
| 1 | Definition check (`aip service check`) | Supported | Five authoring forms: `.aip`, `.e.ts`, `.e.py`, `.h.ts`, `.h.py`. The optional development advice `--dev-checks` is conditional |
| 2 | Schema and types | Supported | Int, Text, Bool, Id/Uuid, Decimal(p,s), Time, Date, Email, Url, enum, Json. There is no Float |
| 3 | Resources, relations, constraints | Conditional | Only relation reads have product HTTP tests. Real-database evidence for foreign-key rejection, unique, limit and invariant is engine unit tests |
| 4 | Declarative reads and standard writes | Supported | Filter allowlist, sort, cursor and offset pages, to-one and to-many relations, `count`/`sum`/`min`/`max`. On PostgreSQL, `sum` accepts a single Decimal field: the result keeps the source scale and its precision is at least the source precision. `avg`, sorting or filtering on related fields and multiple `groupKey` cannot be declared |
| 5 | Partial update (null versus omitted) | Supported | `patch` and `expect`. Only declared fields can be changed |
| 6 | Contract HTTP | Supported | `/read`, `/apply`, `/status`, `/capabilities`, with error codes from `spec/wire-errors.md` |
| 7 | Generated bindings (TypeScript, Python) | Supported | `aip service gen`. Python generated types centre on public apply inputs and helpers |
| 8 | JWT and principal | Supported | RS256 `at+jwt` profile only. Connecting a real external identity provider account is conditional and the operator verifies it |
| 9 | Row and field policy | Conditional | `rows read`, `field … read` and transition `allow`. `count` does not inherit `rows read` (`sum`, `min` and `max` do) |
| 10 | Server validation | Supported | The server checks input types, ranges and filter allowlists on every request |
| 11 | Transactions | Supported | PostgreSQL. Writes that depend on absence run SERIALIZABLE. Declarative SQL transactions owned by the server retry serialization failures and deadlocks up to 3 times when that is safe. For a synchronous write extension the caller resends with the same key |
| 12 | Idempotency and `COMMIT_UNKNOWN` | Supported | Single database transaction only. External effects such as mail or payment calls are not made idempotent |
| 13 | Automatic tenant isolation | Excluded | Not implemented in the product path. Write the organisation boundary in the definition, such as `rows read when org = actor.org`, and repeat it in every policy |
| 14 | Contract fingerprint | Supported | A different fingerprint gives `WIRE.CONTRACT_MISMATCH`. Older clients are not supported alongside a new deployment |
| 15 | Init and migration | Conditional | PostgreSQL only. Rollback is restoring a backup; there is no reverse migration. Zero-downtime changes to large tables are out of scope |
| 16 | Node and Python extensions | Conditional | The extension ABI is not final (decision OI-X2). Linux Bubblewrap isolation has CI. macOS Seatbelt isolation is verified by hand, without CI. PostgreSQL write extensions support `ctx.data.read`, `ctx.data.apply` and `ctx.data.create` within an allowlist; read extensions may opt into an `access read.<Resource>` allowlist. Extension create on encrypted resources is excluded |
| 17 | Durable jobs | Conditional | PostgreSQL job store only. The MySQL job store is not in the release bundle |
| 18 | Diagnostics and observability | Conditional | OTLP, audit records and traces are verified up to engine tests. There are no dashboards or SLOs |
| 19 | Installable SDK and packages | Conditional | Versions derive from one Cargo workspace version, so the CLI and both SDKs match (`1.0.0`). Names follow `product/release.config.json`. Windows is not supported |

Supported: 1, 2, 4, 5, 6, 7, 8, 10, 11, 12, 14. Conditional: 3, 9, 15, 16, 17, 18, 19. Excluded: 13.

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

Reads support filter allow-lists, sorting, cursors, to-one and to-many traversal, and `count`, `sum` (Int, and Decimal on PostgreSQL), `min` and `max`. They do not support `avg`, sorting or filtering through a relation path, or grouping by several references. A to-many traversal sorts by one field. Writes support state transitions, partial updates with optimistic locking, atomic bundles that can use the ID of a row created earlier in the bundle, and `compose`. A transition can add or subtract one term from a number, not multiply or combine two terms. Needs beyond that belong in an [extension](/docs/workers/). The newer syntax is PostgreSQL only.

| # | Limit | Workaround |
|---|---|---|
| E1 | Atomic create of parent and children | One bundle passing the earlier create's ID with `refs` |
| E2 | Variable-amount increments | A positive `input` term added to or subtracted from the locked row in a transition |
| E3 | Computed aggregates such as the sum of quantity times price | An extension computes it and stores it in a denormalized field |
| E4 | A reference create needs a target row the caller can read | Make the directory readable and hide only the sensitive fields with field policies |
| E5 | Cursor paging cannot be combined with a nullable sort | Offset paging |
| E6 | A transition's `from` is required | `from true` |
| E7 | Atomic create inside a PostgreSQL write extension | `access create.<Resource>` and `ctx.data.create` |
| E8 | Extension inputs have no array type | Take `Json` and validate its shape in the extension, or create each row in a bundle |
| E9 | Rows selected by `target.where` or locked by effects follow operation order; named `target.ids` and compose targets are pre-locked by `(resource, id)` | Keep the same order across callers for rows selected at execution time or locked by effects |

For E9, a bundle pre-locks multiple rows named by `target.ids` or `compose` in `(resource, id)` order when the bundle starts. This changes when those locks are acquired, not operation execution, policy checks, error order or results. It only pre-locks rows the caller can read; missing or invisible targets are reported as `WIRE.MISSING_TARGET` when their operation runs. A single named row needs no pre-lock. The measured PostgreSQL 17 case used bundles that decremented several rows in one resource: with 2–12 concurrent requests and 2–8 target rows, it saw zero deadlocks and 100% success. That measurement is not a general deadlock guarantee.

Rows selected at execution time by `target.where`, rows created by an earlier operation, and rows locked by effects are not known during planning and are not pre-locked. Bundles that reach the same row through these paths can still deadlock, so callers should use a consistent operation order for those rows. Named target locks are held through the bundle, and may make other calls wait earlier; a bundle can wait for a later operation's target before an earlier operation fails. Other bundle shapes have not been shown to converge.

For E10, `expose aggregate` has no per-definition deadline setting. A standalone aggregate is stopped after 2 seconds with `WIRE.DEADLINE_EXCEEDED`; grouped aggregates or an extension are alternatives when the source is too large.

For E11, the service stores an unbounded `Int` as int64, but the TypeScript SDK rejects values outside ±(2^53−1) with `CLIENT.PROTOCOL_ERROR` and cannot write them exactly. Python preserves the exact integer. Use an `Int(lo..hi)` range within JavaScript's safe-integer range or `Text` when both SDKs need the value.

## Policy checks {#policy-checks}

- A definition that lets a value hidden by `field … read when` reach the caller by another route is rejected with `DEF.POLICY_FIELD_NOT_USABLE_IN_TRANSITION`. A definition written before this rule can be rejected after the upgrade.
- More than one `actor` is `DEF.MULTIPLE_ACTORS`. Earlier builds let the last declaration win silently.
- Advisories cover unscoped reads and writes, public counts, and counts whose caller input can vary. They are `DEF.ADVISORY_TENANT_UNSCOPED_READ`, `DEF.ADVISORY_PUBLIC_READ_TENANT_FIELD`, `DEF.ADVISORY_WRITE_WIDER_THAN_READ`, `DEF.ADVISORY_PUBLIC_COUNT`, `DEF.ADVISORY_PUBLIC_COUNT_INPUT` and `DEF.ADVISORY_TENANT_UNSCOPED_COUNT`. They compare structure only, so they can miss a case, such as an `exists` policy or a tenant field with another name, and can raise a false alarm. They never reject a definition and do not change its response or contract fingerprint.
- `DEF.ADVISORY_PUBLIC_COUNT_INPUT` applies when a count's `where` uses caller input without implying the source's `rows read` policy, unless a `sourceAccess` guard also receives that input. `DEF.ADVISORY_TENANT_UNSCOPED_COUNT` applies when an exposed standalone count over a resource with a tenant field does not bind that field to the actor in a `where` without input. These advisories do not change the response or contract fingerprint.
- `DEF.ACCESS_TARGET_NOT_EXPOSED` identifies a write extension or job that names a transition not exposed with `expose apply`. Earlier builds reported `DEF.UNKNOWN_SYMBOL` for this case; consumers matching that code should account for the new code.
- Definition diagnostics include machine fields (`code`, `severity`, `line`, `column`, and where applicable `located`, `anchor` and `scopePath`) separately from explanatory fields. The JSON code registry includes `severity` and `status`; see [Diagnostics](/docs/definition-syntax/#diagnostics).
- Run `aip service check` with the new binary before you deploy a definition written for an earlier build.

## Extensions and isolation {#extensions}

- The extension interface (ABI) is not final.
- `access read.<Resource>` is an optional declaration for read extensions. When present, `ctx.data.read` outside the declared resource list is refused with `WIRE.ACCESS_NOT_DECLARED`; omitting it preserves the earlier behavior.
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
