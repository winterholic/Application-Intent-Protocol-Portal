---
translatedFrom: 3611fd430ece
title: "SPR：Specification、Presentation、Runtime"
description: SPR 是理解 AIP 中谁负责什么的基本模型。它描述职责，而不是固定的包结构。
---

SPR 作为理解职责的模型是 `Decided`。不会以 SPR 之名固定具体的包结构或内部实现。

## Specification {#specification}

在服务器端定义数据模型、允许范围、权限、策略、业务规则和扩展契约。这是应用开发者声明"什么可以发生"的地方。

## Presentation {#presentation}

前端通过官方前端库，以 AIP 的结构化形式表达所需的数据和操作。这是页面声明"想要什么"的地方。

## Runtime {#runtime}

运行时校验每个请求，并按策略安全执行。这是服务器决定请求是否执行以及如何执行的地方。

## 三者如何配合 {#flow}

| 步骤 | 职责 | 承担方 |
|---|---|---|
| 页面表达所需 | Presentation | 前端 |
| 根据契约和策略检查请求 | 使用 Specification 的 Runtime | 服务器 |
| 执行被允许的请求 | Runtime | 服务器 |
| 运行标准能力之外的逻辑 | 受 Specification 契约约束的扩展 | 服务器 |

调用方可见的契约与服务器内部的策略是两回事。契约的哪些部分公开为 `Open`。
