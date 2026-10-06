---
title: Principles
description: The seven principles every AIP design decision must respect, and the questions each new feature has to answer.
status: sourced
source:
  - plan-docs/sources/founder-integrated-directive-2026-10-03.md
  - docs/PRINCIPLES.md
checked: 2026-10-06
---

These principles come from the founder's own statements. They take priority over existing code, design documents and agreements between contributors. All seven are `Decided`.

## Why AIP exists {#purpose}

> The server provides a safe execution environment. When the frontend expresses the data and actions it needs, the application should work without adding a new backend API every time.

> Separate the freedom to request from the authority to execute.

## The seven principles {#principles}

### 1. Minimize application-specific backend work {#principle-backend}

After installing and configuring an AIP server, it should be ready to perform common functionality. By expressing what it needs, the frontend should be able to use many features without a separate server API implementation. The goal is not to eliminate the backend but to minimize per-application repetition and maintenance.

### 2. A new Application Intent Protocol {#principle-protocol}

AIP is not a framework that generates REST endpoints. It is a communication model in which the frontend expresses the data and actions it needs. Being able to express something is different from being allowed to run it: the server decides the allowed scope and how it executes.

### 3. A Rust engine with JavaScript/TypeScript and Python {#principle-ecosystem}

The core execution engine uses Rust. Developers work naturally in the JavaScript/TypeScript and Python ecosystems, with special weight on the JS/TS experience. The Rust engine must not force unnecessary complexity on developers.

### 4. Structure for AI, with fewer arbitrary choices {#principle-structure}

When AI implements a feature, it should not have to pick one of many equivalent patterns at random. AIP provides standard capabilities and a structured syntax, and one clear standard expression wherever possible. The aim is not to remove all freedom but to minimize implementation variety that has no reason behind it.

### 5. Structured natural-language metadata {#principle-metadata}

AIP provides a defined place to attach an explanation to a specific declaration, so it is always clear what a description belongs to. Writing it is optional, its meaning is not automatically verified, and it is never used as the basis for permissions or security.

### 6. SPR: Specification, Presentation, Runtime {#principle-spr}

Specification defines the server-side model, allowed scope, permissions, policies, business rules and extension contracts. Presentation is how the frontend expresses the data and actions it needs. Runtime validates requests and executes them safely under policy. See [SPR](/docs/concepts/spr/).

### 7. Official JavaScript/TypeScript and Python extensions {#principle-extensions}

Complex or special logic that the standard capabilities cannot handle is written in JS/TS or Python. This is not a temporary workaround; it is an official extension structure, and extensions follow the server's security policies and contracts. See [Extensions](/docs/concepts/extensions/).

## Questions every design has to answer {#design-questions}

1. Which existing repeated implementation does this remove?
2. How much less server code changes when a screen or feature is added?
3. Does contract duplication between frontend and backend shrink?
4. Are there fewer implementation choices that AI has to make on its own?
5. Can human developers understand and verify it?
6. Are security and data integrity preserved?
7. Is it just moving complexity to another layer?

An abstraction that cannot answer these is reconsidered.

## Common misreadings {#misreadings}

- "Callers express" does not mean unlimited requests. Callers ask within the contract the server allows.
- AI-first does not mean hard for people. It does not mean an AI-only language or giving up human readability.
- Rust is the engine's implementation language. It is separate from what developers write definitions in.
- Syntax, intermediate representations and compilers are means, not goals.
