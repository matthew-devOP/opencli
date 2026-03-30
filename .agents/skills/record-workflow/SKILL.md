---
name: record-workflow
description: "OpenCLI record workflow — capture browser API calls by manually operating a page, then generate YAML adapter candidates. Use this skill when the user mentions 'record', 'opencli record', wants to capture API calls from a webpage, needs to generate adapters from manual browsing, converts captured JSON to YAML/TS adapters, or troubleshoots record output. Also triggers on: editing .opencli/record/ files, 'captured.json', 'candidates/', record debugging."
---

# Record Workflow

> `record` 是为「无法用 `explore` 自动发现」的页面准备的手动录制方案。
> 适用场景：需要登录操作、复杂交互、SPA 内路由的页面。

## 工作原理

```
opencli record <url>
  → 打开 automation window 并导航到目标 URL
  → 向所有 tab 注入 fetch/XHR 拦截器（幂等，可重复注入）
  → 每 2s 轮询：发现新 tab 自动注入，drain 所有 tab 的捕获缓冲区
  → 超时（默认 60s）或按 Enter 停止
  → 分析捕获 JSON：去重 → 评分 → 生成候选 YAML
```

**拦截器特性**：
- 同时 patch `window.fetch` 和 `XMLHttpRequest`
- 只捕获 `Content-Type: application/json` 的响应
- 过滤纯对象少于 2 个 key 的响应（避免 tracking/ping）
- 跨 tab 隔离，幂等注入

## 使用步骤

```bash
# 1. 启动录制
opencli record "https://example.com/page" --timeout 120000

# 2. 在 automation window 里正常操作页面
#    打开列表、搜索、点击条目、切换 Tab — 触发网络请求的操作都会被捕获

# 3. 按 Enter 停止（或等超时）

# 4. 查看结果
cat .opencli/record/<site>/captured.json        # 原始捕获
ls  .opencli/record/<site>/candidates/          # 候选 YAML
```

### 命令参数

```bash
opencli record <url>                            # 录制，site name 从域名推断
opencli record <url> --site mysite             # 指定 site name
opencli record <url> --timeout 120000          # 自定义超时（毫秒，默认 60000）
opencli record <url> --poll 1000               # 缩短轮询间隔（毫秒，默认 2000）
opencli record <url> --out .opencli/record/x   # 自定义输出目录
```

### 输出结构

```
.opencli/record/<site>/
├── captured.json            ← 原始捕获数据（url/method/body）
└── candidates/*.yaml        ← 高置信度候选适配器（score ≥ 8，有 array 结果）
```

## 页面类型与捕获预期

| 页面类型 | 预期捕获量 | 说明 |
|---------|-----------|------|
| 列表/搜索页 | 多（5~20+） | 每次搜索/翻页触发新请求 |
| 详情页（只读） | 少（1~5） | 首屏数据一次性返回 |
| SPA 内路由 | 中等 | 路由切换触发新接口，但首屏请求在注入前已发出 |
| 需要登录 | 视操作而定 | 确保 Chrome 已登录目标网站 |

> **注意**：SSR 页面在导航完成前就发出的请求会被错过。
> 解决方案：手动触发新请求（搜索、翻页、展开折叠项等）。

## 候选 YAML → TS CLI 转换

候选 YAML 是起点，复杂场景需要转为 TypeScript：

**候选 YAML（自动生成）**：
```yaml
site: tae
name: getList
strategy: cookie
browser: true
pipeline:
  - navigate: https://...
  - evaluate: |
      (async () => {
        const res = await fetch('/approval/getList.json?procInsId=...', { credentials: 'include' });
        const data = await res.json();
        return (data?.content?.operatorRecords || []).map(item => ({ ... }));
      })()
```

**转换为 TS**（参考 adapter-dev skill 的模板）：

转换要点：
1. URL 中的动态 ID 提取为 `args`
2. `captured.json` 里的真实 body 确定正确数据路径
3. 认证方式：cookie（`credentials: 'include'`），通常不需要额外 header
4. 文件放入 `src/clis/<site>/`，`npm run build` 后自动发现

## 故障排查

| 现象 | 原因 | 解法 |
|------|------|------|
| 捕获 0 条请求 | 拦截器注入失败或页面无 JSON API | `curl localhost:19825/status` 检查 daemon |
| 捕获量少（1~3 条） | 详情页首屏数据已在注入前发出 | 手动操作触发更多请求（搜索/翻页） |
| 候选 YAML 为 0 | 捕获的 JSON 都没有 array 结构 | 直接看 `captured.json` 手写 TS |
| 新 tab 没有被拦截 | 轮询间隔内 tab 已关闭 | 缩短 `--poll 500` |
