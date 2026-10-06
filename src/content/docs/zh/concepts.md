---
translatedFrom: d0bf76775aba
title: 原则
description: AIP 每一个设计决定都必须遵守的七条原则，以及每个新功能都必须回答的问题。
---

这些原则来自创始人本人的陈述，优先于现有代码、设计文档和贡献者之间的共识。七条全部为 `Decided`。

## AIP 存在的理由 {#purpose}

> 服务器提供安全的执行环境。前端表达所需的数据和操作后，应用应当无需每次都在后端新增 API 就能工作。

> 将请求的自由与执行的权限分开。

## 七条原则 {#principles}

### 1. 最小化应用特有的后端工作 {#principle-backend}

安装并配置 AIP 服务器后，它应当已经可以执行通用功能。前端通过表达所需内容，应当无需单独实现服务器 API 就能使用许多功能。目标不是取消后端，而是最小化每个应用的重复实现与维护。

### 2. 全新的 Application Intent Protocol {#principle-protocol}

AIP 不是生成 REST endpoint 的框架，而是一种让前端表达所需数据和操作的通信模型。能够表达某件事与获准执行它是两回事：允许的范围和执行方式由服务器决定。

### 3. Rust 引擎与 JavaScript/TypeScript、Python {#principle-ecosystem}

核心执行引擎使用 Rust。开发者在 JavaScript/TypeScript 和 Python 生态中自然地工作，并特别重视 JS/TS 的体验。Rust 引擎不应给开发者带来不必要的复杂性。

### 4. 为 AI 结构化，减少随意的选择 {#principle-structure}

当 AI 实现一个功能时，不应在许多等价模式中随意挑选一种。AIP 提供标准能力和结构化语法，并尽可能提供一种明确的标准表达。目的不是取消所有自由，而是把没有依据的实现差异降到最低。

### 5. 结构化的自然语言元数据 {#principle-metadata}

AIP 提供一个确定的位置，把说明附加到特定声明上，使说明归属始终清楚。编写是可选的，其含义不会被自动验证，也绝不作为权限或安全的依据。

### 6. SPR：Specification、Presentation、Runtime {#principle-spr}

Specification 定义服务器端的模型、允许范围、权限、策略、业务规则和扩展契约。Presentation 是前端表达所需数据和操作的方式。Runtime 校验请求并按策略安全执行。参见 [SPR](/zh/docs/concepts/spr/)。

### 7. JavaScript/TypeScript 与 Python 官方扩展 {#principle-extensions}

标准能力无法处理的复杂或特殊逻辑用 JS/TS 或 Python 编写。这不是临时的变通手段，而是官方的扩展结构，扩展同样遵守服务器的安全策略和契约。参见[扩展](/zh/docs/concepts/extensions/)。

## 每个设计都要回答的问题 {#design-questions}

1. 它消除了哪种现有的重复实现？
2. 新增页面或功能时，服务器代码的改动减少了多少？
3. 前后端之间的契约重复是否减少？
4. AI 需要自行做出的实现选择是否减少？
5. 人类开发者能否理解并验证？
6. 安全和数据完整性是否得到保持？
7. 是否只是把复杂性转移到了另一层？

无法回答这些问题的抽象会被重新审视。

## 常见误解 {#misreadings}

- "调用方表达"并不意味着无限制的请求。调用方在服务器允许的契约范围内提出请求。
- AI-first 并不意味着人难以使用，既不是 AI 专用语言，也不是放弃人的可读性。
- Rust 是引擎的实现语言，与开发者用什么编写定义无关。
- 语法、中间表示和编译器是手段，不是目的。
