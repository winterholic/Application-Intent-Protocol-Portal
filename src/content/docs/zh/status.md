---
translatedFrom: "8ecd1ef5bee6"
title: "项目状态"
description: "AIP 1.0.0 的发布状态、支持范围和待定事项。"
---

AIP 1.0.0 是正在准备的发布候选，不是稳定版。在 CLI 和 SDK 公开之前，可[从源码构建](/zh/docs/installation/#from-source)。

## 发布状态 {#release}

`v1.0.0` 标签和 GitHub Release 目前都没有，也没有发布到 npm 或 PyPI。通信协议是 `aip-protocol/1.0`，许可证是 MIT，支持的数据库是 PostgreSQL 17。注册表的包名在所有者批准之前是暂定的。本页已与 AIP Core 提交 `d3acc393`（2026-11-22）对照。

## 1.0 范围 {#scope}

使用 PostgreSQL 17 的 `aip service` 与 TypeScript、Python SDK 是正式路径。Core 把 19 个候选功能判定为支持 11 项、有条件支持 7 项、排除 1 项（自动租户隔离）。逐项条件见[已知限制](/zh/docs/known-limitations/)和英文版的[判定表](/docs/known-limitations/#scope)。

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
