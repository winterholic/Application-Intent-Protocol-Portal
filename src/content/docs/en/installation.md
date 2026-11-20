---
title: Installation
description: How to install the AIP 1.0.0 command-line tool, the TypeScript SDK and the Python SDK, which platforms are supported, and which look-alike packages not to install.
status: sourced
source:
  - product/INSTALL.md
  - COMPATIBILITY.md
  - product/release.config.json
  - product/RELEASE-NOTES-1.0.0.md
checked: 2026-11-21
---

> [!IMPORTANT]
> AIP 1.0.0 is not tagged or published yet. As of 2026-11-21 there is no GitHub Release, no npm package and no PyPI package, and the package names are provisional until the project owner approves them. The commands on this page are the ones that apply after the release. Until then, use [Build from source](#from-source).

## What you install {#components}

| Part | Where it is published | Install |
|---|---|---|
| `aip` command-line tool and service engine | GitHub Release archive `aip-<version>-<target>.tar.gz` | [Download and verify](#cli) |
| TypeScript SDK | npm, `@aip/sdk` | `npm install @aip/sdk` |
| Python SDK | PyPI, `application-intent-protocol-sdk` (import name `aip_sdk`) | `pip install application-intent-protocol-sdk` |

The engine and both SDKs use the same version number, 1.0.0, and speak the wire protocol `aip-protocol/1.0`. See [Compatibility](/docs/compatibility/).

You also need PostgreSQL. AIP 1.0 is verified on PostgreSQL 17 only; other versions were not checked.

## Command-line tool {#cli}

Pick the `target` that matches your machine, then download, verify and unpack the archive.

```sh
version=1.0.0
target=x86_64-unknown-linux-gnu   # aarch64-unknown-linux-gnu, aarch64-apple-darwin, x86_64-apple-darwin
base=https://github.com/winterholic/Application-Intent-Protocol/releases/download/v$version
curl -fsSLO "$base/aip-$version-$target.tar.gz"
curl -fsSLO "$base/SHA256SUMS"
shasum -a 256 -c SHA256SUMS --ignore-missing
gh attestation verify "aip-$version-$target.tar.gz" --repo winterholic/Application-Intent-Protocol
tar -xzf "aip-$version-$target.tar.gz"
"./aip-$version-$target/bin/aip" --version
```

The last command prints `aip 1.0.0`. On Linux use `sha256sum -c SHA256SUMS --ignore-missing` instead of `shasum`.

`SHA256SUMS` proves the file is intact. `gh attestation verify` proves the file was built by this repository's release workflow. They are different checks, and the hash alone does not tell you who built the file.

The archive contains `bin/aip`, `config.example.json`, `example.aip`, `extensions/`, `tools/dev-jwt.mjs` (a development token tool, never for production), `LICENSE`, `COMPATIBILITY.md` and the install guide. The first run is in the [Quick Start](/docs/getting-started/).

## Supported platforms {#platforms}

| Target | Minimum |
|---|---|
| `x86_64-unknown-linux-gnu` | glibc 2.34 or newer (Debian 12, Ubuntu 22.04, RHEL 9 family). The x86_64 value is confirmed on the first CI run |
| `aarch64-unknown-linux-gnu` | glibc 2.34 or newer |
| `aarch64-apple-darwin` | macOS 11 or newer |
| `x86_64-apple-darwin` | Not yet determined. It depends on a GitHub Intel runner that may be withdrawn |

Windows is not supported. RHEL 8 and other distributions with an older glibc are not supported by the binary archive; run the engine in a container instead. There is no public Docker image in 1.0. Images are built per application from an application package.

CI proves the build, `aip --version` and `aip service check` on all four targets. The full PostgreSQL regression and worker isolation checks run on Linux x86_64 CI and by hand on macOS. See [Known limitations](/docs/known-limitations/).

## TypeScript SDK {#typescript-sdk}

```sh
npm install @aip/sdk
```

The local bundle contains `sdk/aip-sdk-1.0.0.tgz`. To install it offline, run this command from the bundle’s `sdk` directory.

```sh
npm install --offline ./aip-sdk-1.0.0.tgz
```

Generate the typed binding with the same release as the SDK (`aip service gen ... --sdk-import @aip/sdk`). If the package name changes, pass the new name in `--sdk-import`. See [SDK](/docs/sdk/).

## Python SDK {#python-sdk}

```sh
pip install application-intent-protocol-sdk
python -c "import aip_sdk; print(aip_sdk.__version__, aip_sdk.PROTOCOL)"
```

The second command prints `1.0.0 aip-protocol/1.0`. Python 3.9 or newer is required and the SDK has no third-party dependencies.

## Do not install these {#do-not-install}

Three look-alike names belong to other projects. Do not use them.

- `cargo install aip-cli` and `cargo install aip` install unrelated crates. AIP's Cargo workspace is not on crates.io.
- `pip install aip-sdk` installs an unrelated PyPI project. The AIP package is `application-intent-protocol-sdk`; only the import name is `aip_sdk`.
- There is no public Docker image to pull.

## Build from source {#from-source}

Until the release exists, this is the way to get a working `aip` from AIP Core. It needs Rust 1.98.1, which is the version AIP Core verifies with.

```sh
git clone https://github.com/winterholic/Application-Intent-Protocol
cd Application-Intent-Protocol
cargo build -p aip-cli --release --locked
npm ci --prefix spikes/spike-0-ts --ignore-scripts --no-audit --no-fund
node product/tools/package.mjs --out ./artifact --profile release
./artifact/bin/aip --version
```

The last command prints `aip 1.0.0`. Continue in the new `artifact` directory using the [Quick Start](/docs/getting-started/). Install the Python SDK with `pip install ./product/python` from the Core checkout.

## Names still awaiting approval {#pending}

| Item | State |
|---|---|
| npm scope `@aip` | Ownership is not confirmed. If unavailable the name changes, for example to `@application-intent-protocol` |
| PyPI name `application-intent-protocol-sdk` | Not registered yet; not reserved |
| Publishing setup | The owner must register trusted publishers and create the `release` environment |

When a name changes, this page changes with it. `product/release.config.json` in AIP Core is the single place the names are set.
