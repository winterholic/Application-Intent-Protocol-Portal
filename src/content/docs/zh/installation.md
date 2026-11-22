---
translatedFrom: "2f97e3fd8a83"
title: "安装"
description: "安装 AIP 1.0.0 CLI、TypeScript SDK 和 Python SDK。"
---

AIP 1.0.0 正在准备发布。归档下载和软件仓库安装命令在正式发布后可用。在此之前请[从源码构建](#from-source)。SDK 发布名称暂定。

## 安装组件 {#components}

CLI、TypeScript SDK 和 Python SDK 均为 1.0.0。通信协议是 `aip-protocol/1.0`。

## CLI {#cli}

发布后，从 GitHub Releases 下载对应平台的归档和 SHA256SUMS。除校验文件哈希外，还可用 GitHub CLI 验证归档来源。Linux 上使用 `sha256sum -c SHA256SUMS --ignore-missing`。

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

## 目标平台 {#platforms}

目标平台为 Linux x86_64、arm64（glibc 2.34 或更新）及 macOS arm64、x86_64。Intel Mac 的最低系统版本待验证。数据库使用 PostgreSQL 17。

## TypeScript SDK {#typescript-sdk}

发布前可安装本地生成的 tarball。下方离线命令在安装包的 `sdk` 目录中运行。

```sh
npm install @aip/sdk
```

```sh
npm install --offline ./aip-sdk-1.0.0.tgz
```

## Python SDK {#python-sdk}

需要 Python 3.9 或更新版本。发布名与导入名不同。发布前可在 Core 源码目录中运行 `pip install ./product/python`。

```sh
pip install application-intent-protocol-sdk
python -c "import aip_sdk; print(aip_sdk.__version__, aip_sdk.PROTOCOL)"
```

请在虚拟环境中安装 Python SDK。Homebrew 或 Debian 系的 Python 会拒绝系统级安装（PEP 668，`externally-managed-environment`），macOS 上可能只有 `pip3` 而没有 `pip`。使用 `uv` 时，运行 `uv venv .venv && uv pip install --python .venv/bin/python <wheel>`。

## 易混淆的包名 {#do-not-install}

crates.io 的 `aip`、`aip-cli` 和 PyPI 的 `aip-sdk` 属于其他项目。

## 从源码构建 {#from-source}

准备 Rust 1.98.1 和 Node.js 26。输出目录 `artifact` 必须尚不存在。在新建的目录中继续[快速入门](/zh/docs/getting-started/)。

```sh
git clone https://github.com/winterholic/Application-Intent-Protocol
cd Application-Intent-Protocol
cargo build -p aip-cli --release --locked
npm ci --prefix spikes/spike-0-ts --ignore-scripts --no-audit --no-fund
node product/tools/package.mjs --out ./artifact --profile release
./artifact/bin/aip --version
```

## 暂定发布名称 {#pending}

npm 作用域和 PyPI 发布名称正在等待批准。
