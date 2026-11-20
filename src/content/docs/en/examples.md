---
title: Examples
description: Example applications you can read and run with AIP 1.0, starting with the Quick Start definition.
status: sourced
source:
  - product/examples/README.md
  - product/GETTING-STARTED.md
  - spec/definition-syntax.md
checked: 2026-11-21
---

## Quick Start application {#current-state}

The smallest complete example is the one on the [Quick Start](/docs/getting-started/): one actor, one resource with a row policy, one transition and one read. The same definition is printed on [Definition syntax](/docs/definition-syntax/#example), next to an aggregate example. Both definitions are checked with `aip service check`.

## Packaged applications {#packaged}

AIP Core contains two independent applications, ready to build as application packages:

| Example | What it shows |
|---|---|
| `product/examples/event-checkin` | Numeric ids and a transition that checks in the caller's own event |
| `product/examples/folder-notes` | UUID ids and a partial update (patch) that renames and reorders the caller's own folders |

Neither uses external workers or extra dependencies. They have no login screen and no API for creating users: the operator prepares the actor rows and principals. Build a package, then follow [Deploy and migrate](/docs/deployment/#app-package):

```sh
npm ci --prefix spikes/spike-0-ts --ignore-scripts --no-audit --no-fund
node product/tools/package.mjs --manifest product/examples/event-checkin --out /absolute/new-event-bundle
```

Run the commands from a checkout of AIP Core. The output path must not exist yet.

## Extension example {#extension}

The release archive contains `example.aip` and `extensions/event.mjs` and `event.py`. They declare a read operation, a durable job and a write extension. See [Extensions and workers](/docs/workers/).

## Larger ports {#ports}

AIP Core also carries ports of existing applications (FaceReview, FlaskBB, Infisical) used as test material. They are not 1.0 requirements and their parity is partial, so they serve as regression material. See [Known limitations](/docs/known-limitations/#not-included).
