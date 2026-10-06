---
translatedFrom: bc97b44ce25a
title: "Intent：表达与权限"
description: 在 AIP 中，调用方表达所需，是否执行以及如何执行由服务器决定。本页说明调用方可以表达什么，以及什么始终留在服务器上。
sidebarLabel: "Intent"
---

## 从 endpoint 到 intent {#endpoints-to-intent}

在 REST API 中，调用方的需求被编码为后端开发者为此专门实现的 URL 和 HTTP 方法。在 AIP 中，重要的是应用想做什么，而不是为此构建了哪条传输路径。

下面两行只是为了说明思路的转变。第二行**不是 AIP 语法**，AIP 的语法是 `Open`。

```text
POST /api/orders/:id/approve      # a route someone had to implement
approve(order)                    # the intent the application actually has
```

## 调用方可以表达什么 {#what-callers-express}

创始人希望前端的表达能取代如今在后端反复编写的大部分内容。研究范围包括：

| 表达 | 状态 |
|---|---|
| 选择特定字段 | 作为目标 `Decided` |
| 读取关联数据 | 作为目标 `Decided` |
| 条件过滤 | 作为目标 `Decided` |
| 排序与分页 | 作为目标 `Decided` |
| 服务器允许的简单数据修改 | 作为目标 `Decided` |
| 调用与组合标准操作 | 作为目标 `Decided`；原子组合的范围为 `Open` |
| 为复杂业务逻辑调用扩展 | `Decided` |

读取以调用方为中心：新页面组合所需的数据，服务器按策略执行。如果每个新页面都需要新的服务器 API，AIP 就偏离了它的目的。`Decided`

## 什么留在服务器上 {#what-the-server-decides}

表达一个请求从不意味着获得执行它的权利。服务器根据契约和策略检查每个请求，并继续负责：

- 认证与授权
- 数据访问控制
- 业务不变量与数据完整性
- 事务
- 执行成本与资源限制
- 对外部集成的控制
- 运行与运维的稳定性

禁止策略之外的任意查询，与禁止策略之内的安全组合是两回事。AIP 允许后者，拒绝前者。

## 待解决的问题 {#open}

- 新字段在被明确开放之前是否对调用方隐藏。`Direction`：作为安全的默认值被提出。
- 生产环境是否接受未预先注册的读取形态。`Direction`：在安全、性能和成本验证的前提下，于策略范围内允许。
- 首个版本中谁可以直接编写请求：自有前端、AI 智能体、合作伙伴或任意第三方。`Open`
- 调用方组合写入的自由程度以及事务边界。`Open`
