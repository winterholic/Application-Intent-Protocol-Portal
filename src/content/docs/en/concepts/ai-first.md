---
title: Built for AI, readable by people
description: What "AI-first" means in AIP. Fewer arbitrary choices, a defined place for explanations, and a separate optional verification layer, without giving up human readability or server-side safety.
sidebarLabel: "Built for AI"
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
checked: 2026-10-06
---

## What AI-first means {#meaning}

AIP is designed for a time when AI writes and maintains much of the code. That is `Decided`. It does **not** mean:

- a framework that is hard for human developers
- syntax that gives up human readability
- a programming language only AI can use
- AI code generation added to an existing framework
- helping AI write today's complex structures faster, and nothing more

The goal is a structure that both people and AI can understand and verify, while removing implementation work that does not need to exist.

## One clear way {#one-clear-way}

When there are ten equivalent ways to build something, an AI agent has to pick one each time, and different picks become inconsistency. AIP provides standard capabilities and one clear standard expression wherever it can. The aim is to remove implementation variety that has no reason behind it, not to remove every freedom. Where the standard does not fit, [extensions](/docs/concepts/extensions/) take over. `Decided`

The syntax is evaluated by questions like these:

- Is it clear which declaration something belongs to?
- Is the same concept always expressed the same way?
- Are types and constraints easy to see?
- Is implicit behaviour kept small?
- Can AI easily discover the available standard capabilities?
- Are wrong expressions easy to detect statically?
- Can a human understand it, without needless verbosity?

The founder prefers a declarative syntax. The concrete syntax, and whether it lives in standalone files or inside JS/TS and Python, is `Open`.

## Explanations with a defined place {#metadata}

Ordinary comments can be ambiguous about which declaration they describe. AIP gives natural-language explanations a defined place attached to a specific declaration. `Decided`

- Writing them is optional, and no length is enforced.
- Their meaning is not automatically verified by default.
- They are never the basis for execution permission or security.
- Natural language is not interpreted per request to decide what may run.

AIP is not a natural-language framework. Behaviour, permissions and validation are defined in structured form.

## Two kinds of checks {#verification}

AIP separates two layers of checking. `Decided`

| Layer | Examples | Where |
|---|---|---|
| Required execution safety | authentication and authorization, type and input constraints, data integrity, permission scope, transaction safety, cost and resource limits | Always enforced by the server |
| Optional development checks | static analysis, structural consistency, duplicate implementation detection, reviewing AI-written code, recommendations | Used when the developer wants them |

Not using the optional layer never skips the required one. Which checks the optional layer provides, and whether it can fix issues automatically, is still being designed.
