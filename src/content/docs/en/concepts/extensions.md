---
title: Extensions
description: Logic that AIP's standard capabilities cannot express is written in JavaScript/TypeScript or Python as official extensions that stay under the server's contracts and controls.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - plan-docs/STATUS.md
checked: 2026-10-06
---

## A paved road and an official way out {#paved-road}

AIP tries to cover as much as possible with standard capabilities and one clear standard expression. Real applications still have logic that no standard can anticipate. For that, AIP provides official extensions in JavaScript/TypeScript and Python. `Decided`

Extensions are not a temporary workaround or an exception that needs special approval each time. They are a first-class part of AIP. What they do not get is a way around the server's rules.

## What extensions keep {#controls}

Extensions run under the same controls as everything else:

- types and data access contracts
- permissions
- execution cost limits
- transaction boundaries

An extension must not bypass the server's security policies. `Decided`

## Who writes them {#authors}

Application developers and AI agents write extensions in JS/TS or Python. `Decided` How far a third-party extension package ecosystem is supported at first is `Open`.

## What is still being validated {#open}

- The isolation technology for running extensions in production. Experiments showed that running an extension in a separate process alone does not stop it from connecting to the database directly, so the isolation level is `Open`.
- The extension interface (ABI) and the execution boundary between the Rust engine and JS/TS or Python are designed from measured cost and extensibility, not assumed.
