---
name: opencli
description: "OpenCLI — Make any website or Electron App your CLI. Use this skill when running opencli commands, looking up command syntax, checking supported platforms, troubleshooting opencli issues, or understanding how opencli works. Covers 50+ websites (Bilibili, Twitter, Reddit, GitHub, 知乎, 小红书, etc.) and desktop apps (Cursor, ChatGPT, Notion, Discord). Trigger on: 'opencli', any platform name + CLI action, 'how do I use opencli for X', command lookup, output format questions."
version: 1.5.5
author: jackwener
tags: [cli, browser, web, chrome-extension, cdp, AI, agent]
---

# OpenCLI

> Make any website or Electron App your CLI. Reuse Chrome login, zero risk, AI-powered discovery.

> [!CAUTION]
> **AI Agent 必读：创建或修改任何适配器之前，你必须先阅读 [CLI-EXPLORER.md](./CLI-EXPLORER.md)！**
> 该文档包含完整的 API 发现工作流、5 级认证策略决策树、平台 SDK 速查表。
> **本文件仅提供概览和索引，不足以正确开发适配器。**

> [!IMPORTANT]
> 创建或修改 adapter 时，遵守 3 条收口规则：
> 1. 主参数优先用 positional arg，不要默认做成 `--query` / `--id`
> 2. 预期中的 adapter 失败优先抛 `CliError` 子类
> 3. 新增 adapter 时同步更新 docs、`docs/adapters/index.md`、sidebar、README

## Install & Run

```bash
npm install -g @jackwener/opencli    # npm global install (recommended)
opencli <command>

cd ~/code/opencli && npx tsx src/main.ts <command>  # from source

npm update -g @jackwener/opencli     # update
```

## Prerequisites

Browser commands require:
1. Chrome running + logged into target sites
2. **opencli Browser Bridge** Chrome extension (load `extension/` as unpacked)
3. Daemon auto-starts on first browser command

Public API commands (`hackernews`, `v2ex`, `lobsters` etc.) need no browser.

## Commands Overview

> **完整命令参考**: 查看 [references/commands.md](./references/commands.md)

### Supported Platforms (50+)

| 类型 | 平台 |
|------|------|
| **社交/内容** | Bilibili, 知乎, 小红书, Twitter/X, Reddit, V2EX, Hacker News, 微博, Jike, Linux.do, Medium, Substack, Facebook, Instagram, TikTok, Lobsters, DEV.to |
| **金融** | 雪球 Xueqiu, Yahoo Finance, Sina Finance, Barchart, Bloomberg |
| **工具/阅读** | YouTube, WeRead, arXiv, Wikipedia, Google, StackOverflow, Dictionary, Steam, Apple Podcasts |
| **电商/服务** | BOSS直聘, 携程, 什么值得买, Coupang, 京东, LinkedIn, Pixiv, Douban |
| **AI/生成** | Grok, HuggingFace, Jimeng, Yollomi, 豆包 |
| **通用** | Web (任意网页→Markdown), 微信公众号 |
| **桌面应用** | Cursor, Codex, ChatGPT, ChatWise, Notion, Discord, 豆包 App, Antigravity |

### Common Patterns

```bash
opencli <site> hot --limit 10          # 热门/排行
opencli <site> search "query"          # 搜索 (query positional)
opencli <site> feed --limit 10         # 动态/时间线
opencli <site> <action> <target>       # Write 操作 (follow/like/post etc.)
```

### Management

```bash
opencli list              # 列出所有命令
opencli validate          # 验证 adapter 定义
opencli doctor            # 诊断 browser bridge
opencli install <name>    # 安装 external CLI
```

### Output Formats

所有命令支持 `--format` / `-f`: `table`(default), `json`, `yaml`, `md`, `csv`。
加 `-v` 显示 pipeline 每步数据流。

## 5-Tier Authentication Strategy

| Tier | Name | Method | Example |
|------|------|--------|---------|
| 1 | `public` | No auth, Node.js fetch | Hacker News, V2EX |
| 2 | `cookie` | Browser fetch + `credentials: include` | Bilibili, Zhihu |
| 3 | `header` | Custom headers (ct0, Bearer) | Twitter GraphQL |
| 4 | `intercept` | XHR interception + store mutation | 小红书 Pinia |
| 5 | `ui` | Full UI automation (click/type/scroll) | Last resort |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLI_DAEMON_PORT` | 19825 | Daemon listen port |
| `OPENCLI_BROWSER_CONNECT_TIMEOUT` | 30 | Browser connection timeout (sec) |
| `OPENCLI_BROWSER_COMMAND_TIMEOUT` | 45 | Command execution timeout (sec) |
| `OPENCLI_BROWSER_EXPLORE_TIMEOUT` | 120 | Explore timeout (sec) |
| `OPENCLI_VERBOSE` | — | Show daemon/extension logs |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Extension not connected` | Chrome must be open + install Browser Bridge extension |
| `Target page context` error | Add `navigate:` step before `evaluate:` in YAML |
| Empty table data | Check if evaluate returns correct data path |
| Daemon issues | `curl localhost:19825/status` to check |

## Related Skills & Docs

| 需求 | 去哪里 |
|------|--------|
| 查具体命令语法 | [references/commands.md](./references/commands.md) |
| 开发新 adapter | `.agents/skills/adapter-dev/SKILL.md` + [CLI-EXPLORER.md](./CLI-EXPLORER.md) |
| 使用 record 录制 | `.agents/skills/record-workflow/SKILL.md` |
| 从外部 CLI 迁移 | `.agents/skills/cross-project-adapter-migration/SKILL.md` |
| Review PR | `.agents/skills/review-pr/SKILL.md` |
