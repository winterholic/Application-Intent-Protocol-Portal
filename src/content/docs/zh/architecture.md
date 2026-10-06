---
translatedFrom: 5a48739cc165
title: 架构
description: AIP 由内置标准能力、在自己端口上运行的服务器框架，官方前端库，两者之间的协议，以及受契约与策略约束的共享 Rust 引擎组成。
---

## 四个组成部分 {#parts}

| 组成部分 | 作用 | 状态 |
|---|---|---|
| AIP 服务器框架 | 安装并配置后，内置标准能力并在自己的端口上运行 | `Decided` |
| AIP 前端库 | 前端表达数据和操作的官方方式 | `Decided` |
| Application Intent Protocol | 两者之间的通信模型 | `Decided`；wire 格式细节为 `Open` |
| 共享执行引擎 | 执行请求的 Rust 引擎以及契约与策略体系 | `Decided` |

服务器和前端库并不互相替代，AIP 两者都提供。从 Node 或 Python 包自动启动服务器，作为开发便利功能正在评估中。`Open`

## 像 Spring Boot 一样启动，但自带能力 {#spring-boot}

安装并配置一个 Spring Boot 项目后，应用服务器会在某个端口启动。在你实现功能之前，它几乎什么都不做。

AIP 追求同样的起点：安装、配置，服务器就在自己的端口上运行。区别在于 AIP 服务器已经具备丰富的标准能力。你仍然需要配置数据库连接、数据模型和权限策略，但不必为每个页面实现 controller、service 和 API。`Decided`

## 请求的路径 {#request-path}

1. 前端库发送页面所表达的内容。
2. 运行时对调用方进行认证，并根据契约和策略检查请求。
3. 引擎规划并执行被允许的请求，同时遵守成本与资源限制。
4. 标准能力之外的逻辑在同样的契约下作为扩展运行。
5. 结果返回给前端库。

以上描述的是职责所在。协议和 wire 细节为 `Open`。

## 目前已有的内容 {#implementation-today}

AIP Core 仓库中有一个可运行的原型。它不是正式发布，其行为也不是规范。截至 2026-10-06，仓库包含：

- 面向 PostgreSQL 运行服务器的 Rust 引擎和 `aip service` 命令
- 运维访问令牌（RS256 JWT）的验证，以及在服务器端映射到 actor
- 先规划、再以事务方式应用的数据库迁移
- 本地安装的 TypeScript SDK 包，以及从应用契约生成的类型
- 在服务器控制下运行的 Node.js 和 Python 扩展

这些在 macOS 和本地 PostgreSQL 上完成验证。外部身份提供方、TLS 代理部署和其他操作系统尚未测试。原型使用的定义语法不是最终的 AIP 语法。参见[项目状态](/zh/docs/status/)。
