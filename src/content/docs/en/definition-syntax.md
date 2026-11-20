---
title: Definition syntax
description: The definition language that `aip service` reads in AIP 1.0, with what it never assumes, the blocks and keys, two checked examples, and the rules that most often surprise new authors.
status: sourced
source:
  - spec/definition-syntax.md
  - spec/definition-diagnostics.md
  - product/SDK.md
  - README.md
checked: 2026-11-21
---

A definition says what an application's data looks like, who may read which rows, which changes are allowed and how large a read may be. The server checks every request against it. This page is a reading guide. The complete reference, generated from the compiler, is [`spec/definition-syntax.md`](https://github.com/winterholic/Application-Intent-Protocol/blob/main/spec/definition-syntax.md) in AIP Core, and it wins wherever the two differ.

> [!NOTE]
> AIP Core has two definition languages. The 1.0 product path, `aip service`, reads the language on this page. The proof-of-concept language (`entity`, `command`, `query`, extension `.aipoc`) is read by `aip check` and friends and is not part of the 1.0 product. Never mix them. See [Known limitations](/docs/known-limitations/#poc-language).

## Forms {#forms}

A definition is written in one of five forms, and all of them produce the same contract:

- a `.aip` text file
- an `aip` block inside TypeScript or Python source (`.e.ts`, `.e.py`)
- a TypeScript or Python data literal (`.h.ts`, `.h.py`)

That is five file types in total.

`aip service check` validates any of them. The Quick Start and this page use `.aip`.

## What the language never assumes {#no-defaults}

There are no unlimited defaults and no implicit permissions. Leave something out and it stays closed or becomes an error.

- A resource without `rows read` has no readable rows, and one without `expose read` cannot be read.
- An `expose read` without a `budget` cannot be a root read. A budget needs all four values: rows, depth, deadline and cost.
- `expose apply` needs `bulk maxRows`. An `aggregate` needs `sourceAccess`.
- A field with a read policy (`field ... read when`) cannot be used to filter, sort or aggregate.
- Unknown keys are errors, not ignored.
- Syntax errors stop at the first one. Semantic errors are collected, causes first.

## Blocks and keys {#blocks}

| Declaration | Meaning |
|---|---|
| `enum` | A closed set of values |
| `actor` | The resource that identifies the caller. Exactly one |
| `predicate` | A named, reusable condition |
| `access` | A guard that decides who receives an aggregate or extension result |
| `limit` | An upper bound on matching rows, applied per field with `invariant` |
| `resource` | One table and the ways it is opened |
| `operation` | A call that has no resource, implemented by an extension |

Inside a `resource`:

| Key | Meaning |
|---|---|
| `fields` | Columns. `?` allows null; naming another resource makes a foreign key |
| `rows read when` | Which rows a caller can read. Absent means none |
| `field name read when` | A per-field read condition. A false condition returns null |
| `expose read`, `apply`, `create`, `compose`, `aggregate` | What is opened to callers |
| `transition` | A state change with `from`, `to` or `patch`, and `allow` |
| `aggregate` | A per-row or standalone count, sum, min or max |
| `unique`, `check`, `invariant` | Constraints |
| `extension` | A call into a Node.js or Python worker |
| `docs` | A human-readable note that never affects execution or permissions |

Every key, its form and its meaning are tabulated in the Core reference.

## Example: read, policy and write {#example}

This is the definition from the [Quick Start](/docs/getting-started/). A caller reads only its own events and may flip one to checked.

```aip
resource Member { fields { id: Id } }
actor Member

resource Event {
  fields { id: Id; member: Member; checked: Bool; title: Text }
  rows read when member = actor
  transition mark { allow member = actor; from checked = false; to checked = true; repeat unchanged }
  expose read {
    select id, checked, title
    filter id.eq, checked.eq
    sort id
    budget { rows 50; depth 1; deadline 1s; cost 100 }
  }
  expose apply mark { target id, where; bulk maxRows 20 }
}
```

## Example: an aggregate {#aggregate-example}

An aggregate counts rows of another resource per row of this one. Here each post shows how many bookmarks the caller has made on it.

```aip
resource Member { fields { id: Id } }
actor Member

resource Bookmark {
  fields { id: Id; post: Post; member: Member }
  rows read when member = actor
}

access visiblePosts = totalOfVisible(Post)

resource Post {
  fields { id: Id; title: Text(1..100); published: Bool }
  rows read when published = true
  aggregate bookmarkCount: Int {
    source Bookmark
    sourceAccess visiblePosts
    groupKey post
    where member = actor
    callerFilter none
    rowOutput none
    release count
  }
  expose read {
    select id, title, bookmarkCount
    filter id.eq
    sort id
    budget { rows 50; depth 1; deadline 1s; cost 100 }
  }
}
```

## Public count {#public-count}

`release count` counts the population chosen by `sourceAccess` and `where`. It does not apply the source's `rows read`. `sum`, `min` and `max` do apply it. The difference is deliberate and the response values do not change in 1.0, but it has two consequences you must design for:

- A `count` with no `where` is a public count. It includes rows the caller cannot read, so its value moves when hidden rows are added. `aip service check` reports `DEF.ADVISORY_PUBLIC_COUNT` as an advisory, not an error.
- If the source has `rows read` and the aggregate uses `callerFilter read`, the aggregate's `where` must imply that policy, or the check fails with `DEF.CALLER_FILTER_POLICY_REQUIRED`. Without that rule a caller could count hidden rows one filter value at a time. Imply the policy by repeating it as an AND term of `where`; when the policy reads `A or B`, one branch is enough.

Two alternatives that would change response values, an explicit `release count public` and applying `rows read` to every count, are left to the project owner and are not in 1.0.

## Easy mistakes {#separators}

- In a `transition`, assignments inside `to` are separated by commas: `to done = true, views = views + 1`. Semicolons separate items such as `from`, `to` and `allow`. Inside an effect block such as `update Member where id = author { ... }` the separator is a semicolon.
- Numbers change only as `f = f + 1`. Adding a value from another field, or incrementing a related row, is not expressible; use an [extension](/docs/workers/).
- `Decimal(p,s)` literals are quoted strings: `to total = "0.00"`. A bare `0.00` is `DEF.BAD_VALUE`.
- `Int(lo..hi)` includes both ends and accepts negative bounds.
- A primary key is `id: Id` (numeric, the default) or `id: Uuid`. Write references as the resource name (`owner: Member`); `X.Id` is only for inputs and operation types.

## What it cannot express {#not-expressible}

These were checked against 1.0 and are rejected by `aip service check`, so they are not hidden surprises:

- `avg` aggregates, and `sum` over a `Decimal` field
- sorting or filtering through a relation path such as `sort author.name`
- grouping an aggregate by more than one reference
- increments of a related row's fields or computed from another field

Such needs go through an extension. See [Known limitations](/docs/known-limitations/).

## Diagnostics {#diagnostics}

Every error is `AREA.NAME`: `DEF` for definitions, `WIRE` for the HTTP API, `CLIENT` for SDK-raised errors and `POC` for the proof-of-concept language.

```sh
aip explain-code DEF.CALLER_FILTER_POLICY_REQUIRED
aip diagnostics --area def
```

The first prints the meaning, the fix and, for wire codes, the retry guidance. The second lists every definition code.
