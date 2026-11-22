---
translatedFrom: "2f97e3fd8a83"
title: 설치
description: AIP 1.0.0 명령줄 도구, TypeScript SDK, Python SDK를 설치하는 방법과 지원 플랫폼, 이름이 비슷하지만 설치하면 안 되는 패키지.
---

> [!IMPORTANT]
> AIP 1.0.0은 아직 태그도 배포도 되지 않았다. 2026-11-21 기준으로 GitHub Release, npm 패키지, PyPI 패키지가 없고, 패키지 이름은 프로젝트 소유자가 승인하기 전까지 잠정이다. 이 페이지의 명령은 릴리스 뒤에 쓰는 명령이다. 그 전에는 [소스에서 빌드](#from-source)를 쓴다.

## 설치하는 것 {#components}

| 구성 | 배포 위치 | 설치 |
|---|---|---|
| `aip` 명령줄 도구와 서비스 엔진 | GitHub Release 아카이브 `aip-<version>-<target>.tar.gz` | [내려받기와 검증](#cli) |
| TypeScript SDK | npm, `@aip/sdk` | `npm install @aip/sdk` |
| Python SDK | PyPI, `application-intent-protocol-sdk` (import 이름은 `aip_sdk`) | `pip install application-intent-protocol-sdk` |

엔진과 두 SDK는 같은 버전 1.0.0을 쓰고 wire protocol `aip-protocol/1.0`으로 통신한다. [호환성](/ko/docs/compatibility/)을 본다.

PostgreSQL도 필요하다. AIP 1.0은 PostgreSQL 17에서만 검증했고 다른 버전은 확인하지 않았다.

## 명령줄 도구 {#cli}

내 컴퓨터에 맞는 `target`을 고른 뒤 아카이브를 내려받아 검증하고 푼다.

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

마지막 명령은 `aip 1.0.0`을 출력한다. Linux에서는 `shasum` 대신 `sha256sum -c SHA256SUMS --ignore-missing`을 쓴다.

`SHA256SUMS`는 파일이 손상되지 않았음을, `gh attestation verify`는 이 저장소의 릴리스 워크플로가 만든 파일임을 확인한다. 둘은 서로 다른 검사이며, 해시만으로는 누가 만들었는지 알 수 없다.

아카이브에는 `bin/aip`, `config.example.json`, `example.aip`, `extensions/`, `tools/dev-jwt.mjs`(개발용 토큰 도구, 운영 금지), `LICENSE`, `COMPATIBILITY.md`, 설치 안내가 들어 있다. 첫 실행은 [Quick Start](/ko/docs/getting-started/)를 따른다.

## 지원 플랫폼 {#platforms}

| Target | 최소 요구 |
|---|---|
| `x86_64-unknown-linux-gnu` | glibc 2.34 이상(Debian 12, Ubuntu 22.04, RHEL 9 계열). x86_64 값은 첫 CI 실행에서 확인한다 |
| `aarch64-unknown-linux-gnu` | glibc 2.34 이상 |
| `aarch64-apple-darwin` | macOS 11 이상 |
| `x86_64-apple-darwin` | 아직 정해지지 않았다. GitHub의 Intel runner에 의존하며 제공이 끊길 수 있다 |

Windows는 지원하지 않는다. RHEL 8처럼 glibc가 더 오래된 배포판은 바이너리 아카이브로 지원하지 않으므로 엔진을 컨테이너로 실행한다. 1.0에는 공개 Docker 이미지가 없다. 이미지는 앱 패키지로 앱마다 직접 만든다.

CI는 네 target 모두에서 빌드, `aip --version`, `aip service check`를 증명한다. PostgreSQL 전체 회귀와 worker 격리 검사는 Linux x86_64 CI와 macOS 수동 실행이 맡는다. [알려진 한계](/ko/docs/known-limitations/)를 본다.

## TypeScript SDK {#typescript-sdk}

```sh
npm install @aip/sdk
```

릴리스 전에는 빌드가 만드는 `aip-sdk-<version>.tgz`로 같은 패키지를 오프라인 설치할 수 있다.

```sh
npm install --offline ./aip-sdk-1.0.0.tgz
```

타입이 있는 binding은 SDK와 같은 릴리스로 만든다(`aip service gen ... --sdk-import @aip/sdk`). 패키지 이름이 바뀌면 `--sdk-import`에 새 이름을 준다. [SDK](/ko/docs/sdk/)를 본다.

## Python SDK {#python-sdk}

```sh
pip install application-intent-protocol-sdk
python -c "import aip_sdk; print(aip_sdk.__version__, aip_sdk.PROTOCOL)"
```

두 번째 명령은 `1.0.0 aip-protocol/1.0`을 출력한다. Python 3.9 이상이 필요하고 외부 의존성은 없다.

Python SDK는 가상환경 안에 설치한다. Homebrew나 Debian 계열 Python은 시스템 전체 설치를 막고(PEP 668, `externally-managed-environment`), macOS에는 `pip` 없이 `pip3`만 있을 수 있다. `uv`를 쓰면 `uv venv .venv && uv pip install --python .venv/bin/python <wheel>`이다.

## 설치하면 안 되는 것 {#do-not-install}

이름이 비슷한 세 가지는 다른 프로젝트의 것이다. 쓰지 않는다.

- `cargo install aip-cli`와 `cargo install aip`는 관련 없는 crate를 설치한다. AIP의 Cargo workspace는 crates.io에 올라 있지 않다.
- `pip install aip-sdk`는 관련 없는 PyPI 프로젝트를 설치한다. AIP 패키지는 `application-intent-protocol-sdk`이고 import 이름만 `aip_sdk`다.
- 받을 수 있는 공개 Docker 이미지는 없다.

## 소스에서 빌드 {#from-source}

릴리스가 나오기 전에는 AIP Core에서 동작하는 `aip`를 얻는 방법이 이것이다. AIP Core가 검증한 Rust 1.98.1이 필요하다.

```sh
git clone https://github.com/winterholic/Application-Intent-Protocol
cd Application-Intent-Protocol
cargo build -p aip-cli --release --locked
npm ci --prefix spikes/spike-0-ts --ignore-scripts --no-audit --no-fund
node product/tools/package.mjs --out ./artifact --profile release
./artifact/bin/aip --version
```

마지막 명령은 `aip 1.0.0`을 출력한다. 새로 만든 `artifact` 디렉터리에서 [빠른 시작](/ko/docs/getting-started/)을 따라간다. Python SDK는 Core 체크아웃에서 `pip install ./product/python`으로 설치한다.

## 승인 대기 중인 이름 {#pending}

| 항목 | 상태 |
|---|---|
| npm scope `@aip` | 소유가 확인되지 않았다. 쓸 수 없으면 `@application-intent-protocol` 같은 이름으로 바뀐다 |
| PyPI 이름 `application-intent-protocol-sdk` | 아직 등록하지 않았고 선점하지도 않았다 |
| 배포 설정 | 소유자가 trusted publisher를 등록하고 `release` environment를 만들어야 한다 |

이름이 바뀌면 이 페이지도 바뀐다. 이름은 AIP Core의 `product/release.config.json` 한 곳에서 정한다.
