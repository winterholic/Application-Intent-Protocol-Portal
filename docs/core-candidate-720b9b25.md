# Core candidate: 720b9b25

Candidate Core SHA: `720b9b259034ac0b1e6176c378b2c7e2b81d6aea` (remote branch `ci/stab-final-20261122`, subject "fix: align migration columns and queued job state"). Portal branch `codex/portal-core-candidate-720b9b25`, forked from `83ee88db`. This is a candidate baseline only. It is not merged to `main` until the Core candidate is on Core `main` and the lead says so. No tag, Release, npm or PyPI action was taken.

## Core changes since c781dbf7 and their Portal effect

Of the watched documents, `README.md`, `CHANGELOG.md` and `product/SUPPORT.md` changed. Other changes since `c781dbf7` touched code, CI, fixtures and `product/OPERATIONS.md` only.

| Core change | Portal effect |
|---|---|
| `eba0ac35` macOS Seatbelt CI wording (README, CHANGELOG, SUPPORT row 16 and the audit note) | Already in Portal `83ee88db` (`known-limitations`, `release-notes`). No new edit |
| `d5f3a0fd`, `9fe22fcd` `aip service check --for-postgres-init` and SUPPORT row 1 | `en/known-limitations` row 1 and a paragraph in `en/deployment` (source `product/OPERATIONS.md`) |
| `5c831619`, `33510442` identifier quoting, `d2c2b269` durable job outcome, migration columns and QUEUED state | Code behavior fixes with no documented contract change. No Portal edit |
| SDK CI, Track B CI wiring, expr-apps fixtures | CI and tests only. The one watched fixture `orders.target.aip` is unchanged |

Translated pages stay English pointers; their `translatedFrom` hashes and the `status` SHA were refreshed.
