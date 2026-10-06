---
translatedFrom: e1f8d726bc55
title: 简介
description: AIP 是一个以 AI 编写并维护大部分代码为前提、正在设计中的开源 Web 框架。前端表达所需的数据和操作，AIP 服务器按照策略判断并执行。
---

AIP（Application Intent Protocol）始于一个观察：当页面需要新的数据或操作时，团队仍然要把它转换成新的 endpoint、controller、service、DTO、校验、授权检查和 API 文档，并在前端和后端两侧维护这一切。

AI 可以更快地写出这些代码，但重复并不会因此消失。

AIP 走另一条路。前端以结构化的形式表达所需的数据和操作。按设计将内置丰富标准能力的 AIP 服务器，根据你定义的契约和策略检查请求并执行。应用特有的后端代码缩减到真正属于该应用的部分。

> [!IMPORTANT]
> AIP 正处于设计与验证阶段，尚无公开发布，定义语法也未确定。本文档只记录 AIP Core 项目已决定的内容，其余内容标注为 direction 或 open。参见[项目状态](/zh/docs/status/)。

## AIP 是什么 {#what-aip-is}

- **后端服务器框架**：安装并配置后在自己的端口上运行，并已内置标准能力
- **前端库**：应用用它来表达所需的数据和操作
- 两者之间的 **Application Intent Protocol**
- 用 Rust 编写的**共享执行引擎**，以及让服务器保持控制的契约与策略体系

AIP 针对的问题见 [Why AIP](/zh/docs/why-aip/)，每个设计决定都必须遵守的规则见[原则](/zh/docs/concepts/)。

## AIP 不是什么 {#what-aip-is-not}

- 它不取消后端。认证、授权、数据访问控制、业务不变量、数据完整性、事务和资源限制都留在服务器上。
- 它不是 REST endpoint 生成器。它借鉴了 GraphQL 和 CQRS 的思想，但并不复制它们。
- 它不是在现有框架上附加 AI 功能，也不会把自然语言提示当作应用逻辑来执行。
- 它不是新的通用编程语言。开发者继续使用 JavaScript/TypeScript 和 Python 生态。

## 如何阅读本文档 {#how-these-docs-work}

每个页面都在顶部和 Markdown 版本中标明状态。

| 状态 | 含义 |
|---|---|
| `sourced` | 只记录 AIP Core 项目已决定的内容，并附来源链接 |
| `stub` | 只有占位。内容等待 AIP Core 决定 |

页面中的条目使用与 AIP Core 项目相同的词汇标注，这些词汇不翻译。

| 标注 | 含义 |
|---|---|
| `Decided` | 创始人亲自说明或明确决定 |
| `Direction` | 符合创始人意图的方向，细节仍需验证 |
| `Open` | 尚未决定 |

## 面向 AI 编码智能体 {#for-ai-agents}

HTML 页面和下面的文本版本由同一份源文件生成，因此不会彼此偏离。

| 路径 | 内容 |
|---|---|
| `/llms.txt` | 所有页面的列表及其 Markdown 路径 |
| `/llms-full.txt` | 所有页面的全文 |
| `/docs/<page>.md` | 页面的 Markdown 版本。把页面 URL 末尾的 `/` 换成 `.md` |

```sh
curl https://aip-portal.vercel.app/llms.txt
curl https://aip-portal.vercel.app/docs/concepts.md
```

`#what-aip-is` 这样的章节 id 即使措辞或语言改变也保持不变。标注为 `Open` 的内容尚未决定，在解释 AIP 或生成 AIP 代码时不要用猜测去填补。
