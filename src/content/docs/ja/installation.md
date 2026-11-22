---
translatedFrom: "2f97e3fd8a83"
title: "インストール"
description: "AIP 1.0.0 の CLI と TypeScript・Python SDK をインストールする手順です。"
---

AIP 1.0.0 は公開準備中です。アーカイブとレジストリの手順は公開後に使えます。それまでは[ソースからのビルド](#from-source)を使ってください。SDK の配布名は暫定です。

## インストールするもの {#components}

CLI、TypeScript SDK、Python SDK はすべて 1.0.0 です。通信プロトコルは `aip-protocol/1.0` です。

## CLI {#cli}

公開後は対象プラットフォームのアーカイブと SHA256SUMS を GitHub Releases から取得します。ハッシュに加えて、GitHub CLI でアーカイブの来歴を検証できます。Linux では `sha256sum -c SHA256SUMS --ignore-missing` を使います。

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

## 対象プラットフォーム {#platforms}

対象は Linux x86_64・arm64（glibc 2.34 以降）と macOS arm64・x86_64 です。Intel Mac の下限は確認中です。利用するデータベースは PostgreSQL 17 です。

## TypeScript SDK {#typescript-sdk}

公開前はローカルで作成した tarball を使います。次のオフライン用コマンドは、ローカルのインストール一式の `sdk` ディレクトリで実行します。

```sh
npm install @aip/sdk
```

```sh
npm install --offline ./aip-sdk-1.0.0.tgz
```

## Python SDK {#python-sdk}

Python 3.9 以降が必要です。配布名と import 名は異なります。公開前は Core のチェックアウトで `pip install ./product/python` を実行します。

```sh
pip install application-intent-protocol-sdk
python -c "import aip_sdk; print(aip_sdk.__version__, aip_sdk.PROTOCOL)"
```

Python SDK は仮想環境の中にインストールします。Homebrew や Debian 系の Python はシステム全体へのインストールを拒否し（PEP 668、`externally-managed-environment`）、macOS には `pip` がなく `pip3` だけの場合があります。`uv` を使うなら `uv venv .venv && uv pip install --python .venv/bin/python <wheel>` です。

## 間違えやすい配布名 {#do-not-install}

crates.io の `aip`・`aip-cli` と PyPI の `aip-sdk` は別のプロジェクトです。

## ソースからビルド {#from-source}

Rust 1.98.1 と Node.js 26 を用意します。出力先の `artifact` がまだ存在しない場所で実行し、作成したディレクトリから[クイックスタート](/ja/docs/getting-started/)に進みます。

```sh
git clone https://github.com/winterholic/Application-Intent-Protocol
cd Application-Intent-Protocol
cargo build -p aip-cli --release --locked
npm ci --prefix spikes/spike-0-ts --ignore-scripts --no-audit --no-fund
node product/tools/package.mjs --out ./artifact --profile release
./artifact/bin/aip --version
```

## 確定前の配布名 {#pending}

npm のスコープと PyPI の配布名は承認待ちです。
