---
translatedFrom: e22145b82c9a
title: "项目状态"
description: "AIP 1.0.0 的发布状态、支持范围和待定事项。"
---

AIP 1.0.0 正在准备发布。在 CLI 和 SDK 公开之前，可[从源码构建](/zh/docs/installation/#from-source)。

## 发布状态 {#release}

计划标签为 `v1.0.0`，通信协议为 `aip-protocol/1.0`。软件仓库的发布名暂定。

## 1.0 范围 {#scope}

正式入口是基于 PostgreSQL 17 的 `aip service` 和 TypeScript、Python SDK。参见[已知限制](/zh/docs/known-limitations/)。

## Decided {#decided}

应用表达所需的数据和操作，服务器依据契约和策略执行。

## Direction {#direction}

优先使用标准能力，用 Node.js 或 Python 扩展实现应用专属逻辑。

## Open {#open}

公开包名和扩展 ABI 仍待最终确认。

## 验证 {#verification}

集成测试和各运行环境的证据见[英文文档](/docs/status/#verification)。

## 早期概念验证 {#prototype}

`.aipoc` 是概念验证格式。正式产品使用 `.aip`。

## 如何更新本页 {#updating}

实现和发布决策以 AIP Core 为准。详情见[英文文档](/docs/status/)。
