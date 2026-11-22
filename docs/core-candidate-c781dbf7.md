# Core candidate review: c781dbf7

## Recorded draft

- Portal branch: `codex/portal-core-candidate-c781dbf7`, forked from the clean initial Portal commit `274a26ae9f646eb7e63ce0f2a3f67f0bcd480fd0`.
- Portal documentation draft commit: `84f927abc865a6ebd8814420cf0771c465d5e98c`.
- Candidate Core SHA: `c781dbf7bc7f2c00da6e4728fbb5ffc42cd943d4`.
- Candidate baseline commit (kept separate from the documentation draft): `c6b15d0d3cae97de3250e86c9c9d51d724fd0183`.
- Candidate source was checked out as a detached read-only worktree at `/private/tmp/aip-core-candidate-c781dbf7-readonly`. The Core worker checkout was not changed.

This is a candidate comparison only. The final Core SHA is pending integration of B, D, F1 and C. The candidate baseline does not approve a release, publish support promises, or finalize the extension ABI. Portal `main` was not pushed.

## Candidate verification

| Command | Result |
|---|---|
| `node scripts/check-core-drift.mjs --core /private/tmp/aip-core-candidate-c781dbf7-readonly` | Exit 0; `75/75 passed, Core c781dbf7, baseline c781dbf7`; `no drift` |
| `pnpm verify` | Exit 0; `verified 92 docs in 4 languages, 101 pages, 24686 internal links, translations in sync, robots.txt + sitemap (100 urls), token-only css` |
| `pnpm check` | Exit 0; `0 errors`, `0 warnings`, `0 hints` |
| `node scripts/i18n-status.mjs` | Exit 0; `all translations match the English source` |
| `git diff --check` | Exit 0; no whitespace errors |

The changed public documentation records E9's named-target lock behavior and its uncovered paths, E10/E11 in prose, the diagnostic JSON fields and code changes, selected SDK unsettled-write retry behavior, the optional read-extension allowlist, and the write-extension contract-header result. Translated pages retain the existing English-pointer convention where full translation is not maintained.

## Recheck after final Core SHA is chosen

1. In a read-only snapshot of the integrated Core, compare the full exact final SHA and run `git diff c781dbf7bc7f2c00da6e4728fbb5ffc42cd943d4..<FINAL_SHA> -- COMPATIBILITY.md CHANGELOG.md product/SUPPORT.md product/LIMITS.md`.
2. Review all paths in Portal's `WATCHED` list, not only those four: the Core drift check also hashes README, SECURITY, install/SDK/release documents, release configuration, definition syntax and a fixture.
3. Reconcile support counts and verdicts, lock boundary (E9), E10/E11 limits, diagnostics and code registry, SDK retry/types, extension access and ABI status, header errors, package names/versions, release tags and any newly cited source/code blocks.
4. Rerun `node scripts/check-core-drift.mjs --core <final-read-only-snapshot>`, `node scripts/i18n-status.mjs`, `git diff --check`, `pnpm verify` and `pnpm check` after the last Portal edits.
5. Only after review, replace the candidate baseline with the exact integrated Core SHA in a separate local commit. Keep the draft branch local until the lead completes the Core handoff; do not treat this candidate baseline as a final compatibility declaration.
