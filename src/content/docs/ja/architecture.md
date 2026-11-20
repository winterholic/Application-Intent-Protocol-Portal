---
translatedFrom: 080fd4a7117b
title: アーキテクチャ
description: AIP は、標準機能を内蔵して自前のポートで動くサーバーフレームワーク、公式TypeScript・Python SDK、両者の間のプロトコル、契約とポリシーが統制する共通 Rust エンジンで構成されます。
---

## 四つの構成要素 {#parts}

| 構成要素 | 役割 | ステータス |
|---|---|---|
| AIP サーバーフレームワーク | インストールと設定の後、標準機能を内蔵して自前のポートで動く | `Decided` |
| AIP TypeScript・Python SDK | フロントエンドがデータと操作を表現する公式の方法 | `Decided` |
| Application Intent Protocol | 両者の間の通信モデル | 1.0 の通信プロトコルは `aip-protocol/1.0` です。 |
| 共通実行エンジン | リクエストを実行する Rust エンジンと、契約・ポリシーの仕組み | `Decided` |

サーバーとTypeScript・Python SDKは互いを置き換えるものではありません。AIP は両方を提供します。Node や Python のパッケージからサーバーを自動起動する方式は、開発の利便機能として検討中です。`Open`

## Spring Boot と同じ始まり方、ただし最初から機能がある {#spring-boot}

Spring Boot プロジェクトをインストールして設定すると、アプリケーションサーバーがポートで起動します。機能を実装するまでは、ほとんど何もしません。

AIP も同じ始まり方を目指します。インストールして設定すれば、サーバーが自前のポートで動きます。違いは、AIP サーバーがすでに豊富な標準機能を備えていることです。データベース接続、データモデル、権限ポリシーは引き続き設定します。画面ごとに controller、service、API を実装することはしません。`Decided`

## リクエストの経路 {#request-path}

1. TypeScript・Python SDKが、画面が表現したものを送る。
2. ランタイムが呼び出し側を認証し、リクエストを契約とポリシーに照らして確認する。
3. エンジンが許可されたリクエストを計画・実行し、コストとリソースの制限を守る。
4. 標準機能の外のロジックは、同じ契約のもとで拡張として実行される。
5. 結果がTypeScript・Python SDKに返る。

契約と SDK については[互換性](/ja/docs/compatibility/)を参照してください。

## 現在存在するもの {#implementation-today}

1.0 の製品経路は PostgreSQL 17 と `aip service` です。外部 IdP の JWT 検証、移行、TypeScript・Python SDK、Node.js・Python ワーカーを提供します。条件は[既知の制限](/ja/docs/known-limitations/)を参照してください。
