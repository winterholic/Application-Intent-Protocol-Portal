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

## macOS Seatbelt CI wording correction (2026-11-22)

- The 2026-11-21 release audit remains a historical snapshot: it recorded no macOS Seatbelt CI run at that time. The current `macos-platform-tests.yml` workflow covers Seatbelt profile tests, network-denied Node/Python workers, an operation-only service flow, and macOS-only v6 worker lifetime/sandbox tests.
- `gh run view 44985825145 --json headSha,headBranch,event,status,conclusion,jobs` reported a completed successful `macos-sandbox` job on remote `main` SHA `c86d69021284d19ebf769d8f53ad41e2d2f89bb3`; the Seatbelt profile, Node/Python network-denial, operation-only service, and v6 macOS-only steps all succeeded. This run did not test candidate `c781dbf7` or the final integrated Core SHA.
- Core wording commit: `be8a569e03d3e9893be7cae6185378710cd494e0` on local branch `codex/macos-seatbelt-docs-c781dbf7`, created in a separate worktree from `c781dbf7`. It changes only `product/SUPPORT.md`, `README.md`, and `CHANGELOG.md`. Local checks: `git diff --check` passed; `python3 tools/check_plan_docs.py` reported 178 Markdown files checked, 0 errors.
- Portal's existing candidate digest remains pinned to `c781dbf7bc7f2c00da6e4728fbb5ffc42cd943d4`; it was not updated. Before applying the wording correction, `node scripts/check-core-drift.mjs --core /private/tmp/aip-core-candidate-c781dbf7-readonly` reproduced `75/75 passed` and `no drift`. Against Core commit `be8a569e03d3e9893be7cae6185378710cd494e0`, the same checker reported `74/75 passed`, with only the pinned baseline check failing for the reviewed changes to `README.md`, `CHANGELOG.md`, and `product/SUPPORT.md`. The support counts/verdicts, release state, markers, sources and remaining drift checks passed.
- Portal changes update the English `known-limitations` and `release-notes` canonicals; Korean, Japanese and Chinese remain English pointers and their `translatedFrom` hashes were refreshed. No Core final baseline was repinned.
- Portal checks: `pnpm verify` passed (92 docs, 4 languages, 101 pages, 24686 internal links; translations in sync); `pnpm check` reported 0 errors, 0 warnings, 0 hints; `node scripts/i18n-status.mjs` reported all translations match; `git diff --check` passed.
- Local merge path: carry Core commit `be8a569e03d3e9893be7cae6185378710cd494e0` into the eventual Core integration branch by cherry-pick or fast-forward only after the integration owner chooses the base; then compare the exact integrated SHA against `c781dbf7` across the full `WATCHED` set and rerun the drift checker. Merge the Portal local commit from this branch after that review, then update its baseline in a separate commit to the exact integrated Core SHA. Until then, keep the current candidate pin and both branches local. No push, CI dispatch, or release action was performed.
