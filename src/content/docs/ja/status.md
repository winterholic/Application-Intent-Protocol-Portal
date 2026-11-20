---
translatedFrom: e22145b82c9a
title: "プロジェクトの現状"
description: "AIP 1.0.0 の公開状況、サポート範囲、今後の判断項目です。"
---

AIP 1.0.0 は公開準備中です。CLI と SDK の公開前は[ソースからビルド](/ja/docs/installation/#from-source)できます。

## 公開状況 {#release}

予定のタグは `v1.0.0`、通信プロトコルは `aip-protocol/1.0` です。レジストリ名は暫定です。

## 1.0 の範囲 {#scope}

製品の入口は PostgreSQL 17 に対する `aip service` と、TypeScript・Python SDK です。詳しくは[既知の制限](/ja/docs/known-limitations/)を参照してください。

## Decided {#decided}

アプリは必要なデータと操作を表現し、サーバーが契約とポリシーのもとで実行します。

## Direction {#direction}

標準機能を先に使い、アプリ固有の処理を Node.js・Python の拡張に置きます。

## Open {#open}

公開パッケージ名と拡張 ABI の最終確定は今後の判断項目です。

## 検証 {#verification}

統合テストと環境別の証拠は[英語版](/docs/status/#verification)で確認できます。

## 以前の概念実証 {#prototype}

`.aipoc` は概念実証用の形式です。製品は `.aip` を使います。

## このページの更新 {#updating}

実装とリリース判断は AIP Core に従います。詳細は[英語版](/docs/status/)を参照してください。
