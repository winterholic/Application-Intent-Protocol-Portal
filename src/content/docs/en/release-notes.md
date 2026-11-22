---
title: Release notes
description: What AIP 1.0.0 contains, how it differs from the unreleased 0.1.0 development builds, what is still undecided, and how to upgrade. A draft until the release is tagged.
status: sourced
source:
  - product/RELEASE-NOTES-1.0.0.md
  - CHANGELOG.md
  - COMPATIBILITY.md
  - product/RELEASE-GATE.md
  - product/LIMITS.md
checked: 2026-11-22
---

> [!IMPORTANT]
> These notes follow AIP Core's draft release notes. AIP 1.0.0 is pre-release: it has no tag, no GitHub Release and no registry package as of 2026-11-22, and it is not a stable release. Items marked `TBD` wait for the owner or for the first publication.

## Summary {#summary}

AIP 1.0.0 is a release candidate, not yet released, of an engine (`aip`) that serves one definition file as an authenticated, policy-checked service over PostgreSQL, together with two caller SDKs (TypeScript and Python). The engine and the SDKs share the version 1.0.0.

| Part | Value |
|---|---|
| Engine | `aip 1.0.0` |
| TypeScript SDK | `@aip/sdk@1.0.0` (name provisional) |
| Python SDK | `application-intent-protocol-sdk==1.0.0`, import `aip_sdk` (name provisional) |
| Wire protocol | `aip-protocol/1.0` |
| Core IR | `aip-core/0.11`, unchanged |

## What is in it {#contents}

- `aip service`: `check`, `gen`, `init`, `adopt`, `migrate`, `serve` and `principal`, plus `provision`, `jobs`, `audit` and `idp-readiness`. RS256 JWT authentication with a public JWKS, PostgreSQL 17 reads and writes, Node.js and Python extension workers, and installable SDKs.
- General migrations with a reviewed plan, structured backfill and convert, a DDL transaction and a deployment journal, and adoption of existing data.
- Application packages and a Docker or native service path.
- Linux worker isolation (Bubblewrap, optional cgroup v2 limits) and macOS Seatbelt isolation (manually verified).
- A release-gate script: a clean-clone full regression, bundle smoke tests, and upgrade and rollback drills.
- A FlaskBB port covering `Topic.move`, `Post.unhide` and the `PostOrder` contract.

## Changes {#changes}

- **One version source.** The Cargo workspace version drives the engine, both SDKs, the packaging tools and the smoke tests. A mismatch fails `scripts/check-versions.mjs`.
- **Protocol `aip-protocol/0.1` to `aip-protocol/1.0`.** Only the contract document's `protocol` field and the header comment of generated bindings change. Contract fingerprints do not change.
- **Publishable packages.** The TypeScript tarball is no longer private and carries a license, repository, files list, README and LICENSE. Python wheels and sdists include the LICENSE and README. Package names are set in one file, `product/release.config.json`.
- **Build stays clean.** A `PG*` variable in a developer shell no longer blocks a product build; release builds do not link the test safety guard, and test builds still refuse `PG*`.
- **Development token tool shipped.** The release archive contains `tools/dev-jwt.mjs` so no checkout is needed. It is for development only and is not part of application packages.
- **Stricter application packaging.** A definition that declares a worker extension without a matching manifest entry or module file fails packaging. `config.example.json` includes a `workers` example.
- **Deploy failures are classified.** `app-deploy` reports `cause` and `engineCode` (`DB_UNREACHABLE`, `SCHEMA_EXISTS`, `DB_PRIVILEGE`, `PLAN_DIGEST_MISMATCH`, and more) while withholding engine messages.
- **SDK version identity.** Both SDKs expose their version and send `x-aip-sdk`. The server logs it and never rejects on it.
- **Offline Python builds.** `scripts/build-python.sh --wheelhouse` and `--no-isolation`.
- **Release automation.** A tag starts `release.yml`: four platform archives, `SHA256SUMS`, build provenance, a draft GitHub Release, npm provenance publishing and PyPI trusted publishing, all behind approval in the `release` environment.
- **A lower glibc floor.** Linux binaries built on Debian 12 need glibc 2.34 (down from 2.39, measured on aarch64).
- **Public count guard.** A `callerFilter read` aggregate over a source with `rows read` must repeat that policy in `where`, and a count without `where` reports an advisory. No response value of an accepted definition changes.
- **Security.** Dependency advisories are checked weekly in CI. One allowed exception, `RUSTSEC-2023-0071`, applies because only RSA signature verification is used.

## Expressiveness changes {#expressiveness}

Writes and reads that needed an extension before can now be declared. All of it is PostgreSQL only and applies to new definitions. Details are on [Definition syntax](/docs/definition-syntax/#arithmetic), [SDK](/docs/sdk/#bundle-refs) and [Extensions and workers](/docs/workers/#create).

- **Result references.** A later `create` or transition in a bundle can use the ID of an earlier `create` (`refs`, `target.created`). TypeScript has `client.bundle(b => ...)`; Python has `aip_sdk.created(i)`.
- **Limited arithmetic.** A transition `input` block and `to f = f ± term` with one positive term.
- **`compose` inside a bundle**, with an `ops` list in the response.
- **`ctx.data.create` in write extensions**, and a transition `input` for `ctx.data.apply`.
- **Decimal `sum`.** The result is `Decimal(p',s)` as a JSON string.
- **Three policy advisories** that never reject a definition, and a fixed JSON shape for `aip service check` output.
- **Replay without a worker slot.** A repeated key for a write extension replays the stored result, so a busy worker no longer answers `WIRE.WORKER_BUSY`.
- **Row locks.** Transitions that leave key columns alone use `FOR NO KEY UPDATE`, which removes a deadlock between a bundle that creates lines first and one that decrements stock.

## Install {#install}

See [Installation](/docs/installation/). In short:

```sh
npm install @aip/sdk
pip install application-intent-protocol-sdk
```

The CLI comes from a GitHub Release archive. `cargo install aip-cli` and `pip install aip-sdk` install other people's packages; do not use them.

## Known limits and open items {#known}

- Package names await owner approval (`TBD`).
- The SDKs only warn about a protocol mismatch; the TypeScript client has no automatic warning (`TBD`).
- There is no public Docker image.
- The upgrade and rollback gate still uses a development commit as its baseline; moving it to the previous release tag comes after the first release (`TBD`).
- Intel macOS support depends on a runner (`TBD`). An SBOM attestation is considered for 1.0.1 and later (`TBD`).
- Declarations still cannot express `avg`, computed aggregates, a cursor with a nullable sort, relation-path sorting or filtering, or arrays in extension input.
- A `count` still ignores `rows read`; the owner has not decided to change it.

The complete list is on [Known limitations](/docs/known-limitations/).

## Upgrade from 0.1.0 {#upgrade}

0.1.0 development builds were never published. If you built them, three things change: the header comment of generated bindings (`aip-protocol/1.0`), the SDK file name inside application packages (`aip-sdk-1.0.0.tgz`) and the Python distribution name (`aip-sdk` becomes `application-intent-protocol-sdk`). The version labels alone do not change fingerprints or the stored Core IR digest. Changes to your definition or its contract can still require a migration and new bindings. Follow the steps on [Deploy and migrate](/docs/deployment/#upgrade).

## Verification {#verification}

AIP Core's [release gate](https://github.com/winterholic/Application-Intent-Protocol/blob/main/product/RELEASE-GATE.md) records the clean-clone regression, bundle smoke tests and the upgrade and rollback drills, with their limits. Checksums come with the Release as `SHA256SUMS`.
