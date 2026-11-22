---
title: Deploy and migrate
description: Running an AIP 1.0 service in production, changing a deployed definition with a reviewed plan, upgrading to a new release, rolling back from a backup, and packaging an application for a server.
status: sourced
source:
  - product/OPERATIONS.md
  - product/APP-DEPLOY.md
  - product/DATABASE-ROLES.md
  - COMPATIBILITY.md
checked: 2026-11-21
---

AIP 1.0 runs on PostgreSQL 17. An application keeps its data in its own schema; the service adds a deployment journal so it always knows which definition the data belongs to. This page covers the commands for the first deployment, changes, upgrades and rollback. Facts that matter before you plan production are collected in [Known limitations](/docs/known-limitations/).

## First deployment {#first-deployment}

```sh
aip service check app.aip
aip service init app.aip --config service.json
aip service principal --config service.json bind --subject user-42 --actor 42
aip service gen app.aip --wire decimal --out app.binding.ts
aip service serve app.aip --config service.json
```

`check` validates the definition and does not choose an init target. To check ahead of time that `init` can generate the PostgreSQL schema, run `aip service check app.aip --for-postgres-init`. It does not connect to a database, and it rejects a `default database` declaration (`EXTERNAL_DEFAULT_REQUIRED`) because an external PostgreSQL schema is checked against the real database defaults on the `adopt-external` path. It is not a MySQL init check.

`init` runs once on an empty schema and refuses one that exists. The actor row must exist before you `bind` a subject to it. The listener is loopback HTTP; put a TLS reverse proxy in front. Use separate database roles for migrating and serving: add `migrate_database_url_env` to the configuration, create the infrastructure tables ahead of time with `aip service provision`, and give the server role only the privileges described in AIP Core's `product/DATABASE-ROLES.md`. With a single role, that role owns the application schema.

## Health checks {#probes}

`GET /health` answers 200 when the listener works and does not touch the database. `GET /ready` answers 200 when it can get a database connection and the stored deployment matches this process's definition; otherwise 503 (`WIRE.DB_UNAVAILABLE` or `WIRE.DEPLOYMENT_CHANGED`). Both need no authentication and expose no digests or addresses. They do not prove worker imports or external providers.

## Change a deployed definition {#migrate}

A change is planned first, reviewed, then applied by passing back the exact digest of the plan you reviewed.

```sh
aip service migrate next.aip --config service.json
aip service migrate next.aip --config service.json --apply <reviewed-plan-digest>
```

The first command is read-only. It classifies each change (for example `Safe`), lists the SQL and reports `blocked` and `requiresReview`. The second applies exactly that plan: DDL, data and the journal succeed or roll back together. If the commit outcome is unclear, repeat the same digest to learn the result from the journal. Backfills and conversions use structured migration JSON (`--migration migration.json`, passed to both commands), not arbitrary SQL.

While a migration runs, in-flight requests finish first because they share a database lock with the migration. After it applies, a server still running the old definition refuses work with `WIRE.DEPLOYMENT_CHANGED`. Restart with the new definition and regenerate the bindings. There is no protocol for serving old and new clients at once: a client holding the old contract fingerprint gets `WIRE.CONTRACT_MISMATCH` after the change.

## Take over existing data {#adopt}

A schema made by the earlier prototype, which carries a structural marker, can be adopted with `aip service adopt app.aip --config service.json`, then `--apply <reviewed-plan-digest>`. Stop the prototype first. Rows and committed idempotency results are kept. Schemas without that marker are never adopted automatically. For an existing production PostgreSQL schema, `aip service introspect` and `aip service adopt-external` map tables through views in a separate AIP schema; read the AIP Core guide `plan-docs/uuid-adoption/DESIGN.md` and its limits before you try it.

## Upgrade to a new release {#upgrade}

A new binary can need changes to the schemas AIP owns (durable jobs, infrastructure tables) even when your definition did not change. Follow this order.

1. Stop the service and back up the application schema together with the infrastructure schema. The infrastructure schema name is `aip_infra_` plus the first 52 hex characters of the SHA-256 of the application schema name: `printf %s aip_my_app | shasum -a 256 | cut -c1-52`.

   ```sh
   pg_dump -Fc --no-owner --schema aip_my_app --schema aip_infra_<52hex> --file pre-upgrade.dump "$AIP_DATABASE_URL"
   ```

2. Plan with the new binary and apply the digest. The plan must contain no DROP, TRUNCATE or DELETE, and `blocked` must be `false`.

   ```sh
   aip service migrate app.aip --config service.json
   aip service migrate app.aip --config service.json --apply <reviewed-plan-digest>
   aip service provision --config service.json
   ```

3. Start the service and check that `/ready` returns 200.

Without step 2 the new binary will not serve the old schema: `serve` ends with `WIRE.SCHEMA_MISMATCH`. Nothing runs against a half-upgraded schema.

## Roll back {#rollback}

Starting the old binary on an upgraded schema also ends in `WIRE.SCHEMA_MISMATCH`, because there is no reverse migration. Rolling back means restoring the backup from step 1:

```sh
psql "$AIP_DATABASE_URL" -c 'DROP SCHEMA aip_my_app CASCADE' -c 'DROP SCHEMA aip_infra_<52hex> CASCADE'
pg_restore --no-owner --dbname "$AIP_DATABASE_URL" pre-upgrade.dump
```

A restore also removes writes committed after the backup, along with their idempotency records, so a client that resends the same key will execute it again as a new write. If the upgraded service took traffic, check those writes before you roll back. Mixing the old binary with the new schema is not supported. Switching the executable back is not a database rollback.

## Package an application {#app-package}

`package.mjs --manifest` builds an application package that contains the definition, the engine, the SDK tarball and a standalone `tools/app-deploy.mjs`. The target server needs the package and Node.js, not Rust or the source checkout. The server's OS and CPU must match the build target (macOS arm64 or x64, Linux GNU arm64 or x64).

```sh
node /incoming/bundle/tools/app-deploy.mjs install --out /srv/my-app/1.0.0
node /srv/my-app/1.0.0/tools/app-deploy.mjs preflight --config /srv/my-app/operator/service.json
node /srv/my-app/1.0.0/tools/app-deploy.mjs init --config /srv/my-app/operator/service.json
node /srv/my-app/1.0.0/tools/app-deploy.mjs serve --config /srv/my-app/operator/service.json
```

A change deploy installs the new package beside the old one, runs `plan`, then `migrate --digest <reviewed-64-hex-digest>`, then `serve` and `ready`. The installed directory is immutable; configuration, JWKS, logs and uploads live outside it. A package checksum checks integrity only. It does not identify the publisher, so receive packages over a channel you trust. Failure causes from `init`, `plan` and `migrate` are classified as `DB_UNREACHABLE`, `SCHEMA_EXISTS`, `DB_PRIVILEGE`, `PLAN_DIGEST_MISMATCH` and others; engine messages are withheld so secrets do not leak.

The command does not provide zero-downtime switching, remote deployment, automatic backup and restore, or operating-system hardening.

## Observe a running service {#observe}

- Every response has `x-request-id`; failure bodies repeat it as `requestId`. Request logs carry the same id.
- `{"metrics":{"token_env":"AIP_METRICS_TOKEN"}}` in the configuration opens a Prometheus `GET /metrics` that needs that bearer token. Compute error rates from the `code` label, not the HTTP status, because many refusals arrive as HTTP 200 with an error code in the body.
- `{"otlp":{"endpoint":"http://collector:4318"}}` exports traces and metrics over OTLP/HTTP. It is off by default and never includes tokens, query strings or payloads.
- Every committed transition leaves one business audit row in the same transaction. Operators read it with `aip service audit --config service.json list --resource Order --target-id 11`. The table is protected from `UPDATE` by a trigger as a safeguard against mistakes, not against tampering; for regulated audit, separate the owner role from the service role and copy the rows elsewhere.
