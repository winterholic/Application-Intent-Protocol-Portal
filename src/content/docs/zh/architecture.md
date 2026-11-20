---
translatedFrom: 080fd4a7117b
title: 架构
description: AIP 由内置标准能力、在自己端口上运行的服务器框架，官方TypeScript 和 Python SDK，两者之间的协议，以及受契约与策略约束的共享 Rust 引擎组成。
---

## 四个组成部分 {#parts}

| 组成部分 | 作用 | 状态 |
|---|---|---|
| AIP 服务器框架 | 安装并配置后，内置标准能力并在自己的端口上运行 | `Decided` |
| AIP TypeScript 和 Python SDK | 前端表达数据和操作的官方方式 | `Decided` |
| Application Intent Protocol | 两者之间的通信模型 | 1.0 的通信协议为 `aip-protocol/1.0`。 |
| 共享执行引擎 | 执行请求的 Rust 引擎以及契约与策略体系 | `Decided` |

服务器和TypeScript 和 Python SDK并不互相替代，AIP 两者都提供。从 Node 或 Python 包自动启动服务器，作为开发便利功能正在评估中。`Open`

## 像 Spring Boot 一样启动，但自带能力 {#spring-boot}

安装并配置一个 Spring Boot 项目后，应用服务器会在某个端口启动。在你实现功能之前，它几乎什么都不做。

AIP 追求同样的起点：安装、配置，服务器就在自己的端口上运行。区别在于 AIP 服务器已经具备丰富的标准能力。你仍然需要配置数据库连接、数据模型和权限策略，但不必为每个页面实现 controller、service 和 API。`Decided`

## 请求的路径 {#request-path}

1. TypeScript 和 Python SDK发送页面所表达的内容。
2. 运行时对调用方进行认证，并根据契约和策略检查请求。
3. 引擎规划并执行被允许的请求，同时遵守成本与资源限制。
4. 标准能力之外的逻辑在同样的契约下作为扩展运行。
5. 结果返回给TypeScript 和 Python SDK。

契约与 SDK 请参见[兼容性](/zh/docs/compatibility/)。

## 目前已有的内容 {#implementation-today}

1.0 的正式入口是使用 PostgreSQL 17 的 `aip service`。它支持外部 IdP 的 JWT 验证、迁移、TypeScript 和 Python SDK，以及 Node.js 和 Python 工作进程。参见[已知限制](/zh/docs/known-limitations/)。
