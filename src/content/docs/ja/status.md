---
translatedFrom: "5066a975a4e8"
title: "プロジェクトの現状"
description: "AIP 1.0.0 の公開状況、サポート範囲、今後の判断項目です。"
---

AIP 1.0.0 はリリース候補として準備中で、安定版ではありません。CLI と SDK の公開前は[ソースからビルド](/ja/docs/installation/#from-source)できます。

## リリース状況 {#release}

`v1.0.0` タグと GitHub Release はまだなく、npm と PyPI にも公開していません。通信プロトコルは `aip-protocol/1.0`、ライセンスは MIT、対応データベースは PostgreSQL 17 です。レジストリのパッケージ名は、オーナーの承認までは暫定です。このページは AIP Core のコミット `720b9b25`（2026-11-22）と照合しました。

## 1.0 の範囲 {#scope}

PostgreSQL 17 を使う `aip service` と TypeScript・Python SDK が正式な経路です。Core は候補機能 19 個を、対応 11、条件付き 7、対象外 1（テナントの自動分離）と判定しました。機能ごとの条件は[既知の制限](/ja/docs/known-limitations/)と英語版の[判定表](/docs/known-limitations/#scope)にあります。

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
