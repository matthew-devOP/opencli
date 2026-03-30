---
name: adapter-dev
description: "OpenCLI adapter development guide — creating YAML pipeline or TypeScript adapters for new websites/apps. Use this skill whenever you need to create a new opencli adapter, add a command for a new platform, write a YAML pipeline, write a TypeScript CLI adapter, choose between YAML vs TS, debug pipeline steps, fix adapter issues, or understand opencli's adapter architecture. Triggers on: editing files in src/clis/, creating .yaml or .ts adapter files, 'add command for X', 'create adapter', 'new site', pipeline debugging."
---

# Adapter Development Guide

> 为 opencli 创建新 adapter 的完整指南。涵盖 YAML pipeline 和 TypeScript adapter 两种方式。

> [!IMPORTANT]
> **开始前必须阅读 [CLI-EXPLORER.md](../../../CLI-EXPLORER.md)**，它包含 API 发现工作流和认证策略决策树。
> 快速模式（一个命令）看 [CLI-ONESHOT.md](../../../CLI-ONESHOT.md)。

## 选择实现方式

| 场景 | 方式 | 原因 |
|------|------|------|
| Read + 简单 API（纯 fetch/select/map） | **YAML pipeline** | 声明式，通常 10-30 行 |
| Read + GraphQL/分页/签名/复杂逻辑 | **TypeScript adapter** | 需要 JS 逻辑 |
| Write 操作（DOM 点击/输入） | **TS + `Strategy.UI`** | UI 自动化 |
| Write + API（直接 POST） | **TS + `Strategy.COOKIE/HEADER`** | API 调用 |

## 收口规则（必须遵守）

1. 主参数优先用 positional arg — 不要默认做成 `--query` / `--id` / `--url`
2. 预期中的 adapter 失败优先抛 `CliError` 子类，不要直接 throw 原始 `Error`
3. 新增 adapter 时同步更新 `docs/adapters/index.md`、sidebar、README

## YAML Pipeline Adapter

Create `src/clis/<site>/<name>.yaml`，自动发现无需手动注册：

### Cookie 策略（最常见）

```yaml
site: mysite
name: hot
description: Hot topics
domain: www.mysite.com
strategy: cookie
browser: true

args:
  limit:
    type: int
    default: 20

pipeline:
  - navigate: https://www.mysite.com
  - evaluate: |
      (async () => {
        const res = await fetch('/api/hot', { credentials: 'include' });
        const d = await res.json();
        return d.data.items.map(item => ({
          title: item.title, score: item.score,
        }));
      })()
  - map:
      rank: ${{ index + 1 }}
      title: ${{ item.title }}
      score: ${{ item.score }}
  - limit: ${{ args.limit }}

columns: [rank, title, score]
```

### Public API 策略（无需 browser）

```yaml
strategy: public
browser: false

pipeline:
  - fetch:
      url: https://api.example.com/hot.json
  - select: data.items
  - map:
      title: ${{ item.title }}
  - limit: ${{ args.limit }}
```

## TypeScript Adapter

Create `src/clis/<site>/<name>.ts`，同样自动发现（不要手动 import）：

```typescript
import { cli, Strategy } from '../../registry.js';

cli({
  site: 'mysite',
  name: 'search',
  description: '搜索',
  strategy: Strategy.INTERCEPT,
  args: [{ name: 'query', required: true, positional: true }],
  columns: ['rank', 'title', 'url'],
  func: async (page, kwargs) => {
    await page.goto('https://www.mysite.com/search');
    await page.installInterceptor('/api/search');
    await page.autoScroll({ times: 3, delayMs: 2000 });

    const requests = await page.getInterceptedRequests();
    let results = [];
    for (const req of requests) {
      results.push(...req.data.items);
    }
    return results.map((item, i) => ({
      rank: i + 1, title: item.title, url: item.url,
    }));
  },
});
```

**何时用 TS**：XHR interception (`page.installInterceptor`)、infinite scrolling (`page.autoScroll`)、cookie extraction、GraphQL unwrapping 等复杂逻辑。

## Pipeline Steps Reference

| Step | Description | Example |
|------|-------------|---------|
| `navigate` | Go to URL | `navigate: https://example.com` |
| `fetch` | HTTP request (browser cookies) | `fetch: { url: "...", params: { q: "..." } }` |
| `evaluate` | Run JS in page | `evaluate: \| (async () => { ... })()` |
| `select` | Extract JSON path | `select: data.items` |
| `map` | Map fields | `map: { title: "${{ item.title }}" }` |
| `filter` | Filter items | `filter: item.score > 100` |
| `sort` | Sort items | `sort: { by: score, order: desc }` |
| `limit` | Cap result count | `limit: ${{ args.limit }}` |
| `intercept` | Declarative XHR capture | `intercept: { trigger: "navigate:...", capture: "api/hot" }` |
| `tap` | Store action + XHR capture | `tap: { store: "feed", action: "fetchFeeds", capture: "homefeed" }` |
| `snapshot` | Page accessibility tree | `snapshot: { interactive: true }` |
| `click` | Click element | `click: ${{ ref }}` |
| `type` | Type text | `type: { ref: "@1", text: "hello" }` |
| `wait` | Wait for time/text | `wait: 2` or `wait: { text: "loaded" }` |
| `press` | Press key | `press: Enter` |

## Template Syntax

```yaml
${{ args.query }}              # 参数引用
${{ args.limit | default(20) }} # 带默认值
${{ item.title }}               # 当前 item（map/filter 中）
${{ item.data.nested.field }}   # 嵌套字段
${{ index }}                    # 0-based 索引
${{ index + 1 }}                # 1-based
```

## Verification Checklist

```bash
npx tsc --noEmit                        # TypeScript 编译检查
opencli list | grep <site>              # 确认命令已注册
opencli <site> <command> --limit 3 -f json  # 实际运行
opencli <site> <command> --limit 3 -v       # verbose 看 pipeline
```

## Common Pitfalls

| 问题 | 原因 | 解决 |
|------|------|------|
| `Target page context` error | evaluate 之前没有 navigate | 加 `navigate:` 步骤 |
| Empty table | evaluate 返回的数据路径错误 | 用 `-v` 查看 pipeline 输出 |
| Cookie 失效 | Chrome 未登录目标网站 | 先在 Chrome 登录 |
| TS adapter 未注册 | 手动 import 了文件 | 删除手动 import，自动发现 |
