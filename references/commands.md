# OpenCLI Commands Reference

> 完整的命令列表。按平台分类，每个命令包含示例用法。
> 从 SKILL.md 提取，按需查阅而非全量加载。

## Table of Contents

- [Data Commands](#data-commands) — 社交/内容/金融/工具类网站
- [Desktop Adapter Commands](#desktop-adapter-commands) — Electron/桌面应用
- [Management Commands](#management-commands) — list/install/validate/doctor
- [AI Agent Workflow](#ai-agent-workflow) — explore/synthesize/generate/record/cascade

---

## Data Commands

```bash
# Bilibili (browser)
opencli bilibili hot --limit 10          # B站热门视频
opencli bilibili search "rust"            # 搜索视频 (query positional)
opencli bilibili me                       # 我的信息
opencli bilibili favorite                 # 我的收藏
opencli bilibili history --limit 20       # 观看历史
opencli bilibili feed --limit 10          # 动态时间线
opencli bilibili user-videos --uid 12345  # 用户投稿
opencli bilibili subtitle --bvid BV1xxx   # 获取视频字幕 (支持 --lang zh-CN)
opencli bilibili dynamic --limit 10       # 动态
opencli bilibili ranking --limit 10       # 排行榜
opencli bilibili following --limit 20     # 我的关注列表 (支持 --uid 查看他人)

# 知乎 (browser)
opencli zhihu hot --limit 10             # 知乎热榜
opencli zhihu search "AI"                # 搜索 (query positional)
opencli zhihu question 34816524            # 问题详情和回答 (id positional)

# 小红书 (browser)
opencli xiaohongshu search "美食"           # 搜索笔记 (query positional)
opencli xiaohongshu notifications             # 通知（mentions/likes/connections）
opencli xiaohongshu feed --limit 10           # 推荐 Feed
opencli xiaohongshu user xxx               # 用户主页 (id positional)
opencli xiaohongshu creator-notes --limit 10   # 创作者笔记列表
opencli xiaohongshu creator-note-detail --note-id xxx  # 笔记详情
opencli xiaohongshu creator-notes-summary      # 笔记数据概览
opencli xiaohongshu creator-profile            # 创作者资料
opencli xiaohongshu creator-stats              # 创作者数据统计

# 雪球 Xueqiu (browser)
opencli xueqiu hot-stock --limit 10      # 雪球热门股票榜
opencli xueqiu stock --symbol SH600519   # 查看股票实时行情
opencli xueqiu watchlist                 # 获取自选股/持仓列表
opencli xueqiu feed                      # 我的关注 timeline
opencli xueqiu hot --limit 10            # 雪球热榜
opencli xueqiu search "特斯拉"            # 搜索 (query positional)
opencli xueqiu earnings-date SH600519    # 股票财报发布日期 (symbol positional)
opencli xueqiu fund-holdings             # 蛋卷基金持仓明细 (支持 --account 过滤)
opencli xueqiu fund-snapshot             # 蛋卷基金快照（总资产、子账户、持仓）

# GitHub (via gh External CLI)
opencli gh repo list                     # 列出仓库 (passthrough to gh)
opencli gh pr list --limit 5             # PR 列表
opencli gh issue list                    # Issue 列表

# Twitter/X (browser)
opencli twitter trending --limit 10      # 热门话题
opencli twitter bookmarks --limit 20     # 获取收藏的书签推文
opencli twitter search "AI"              # 搜索推文 (query positional)
opencli twitter profile elonmusk         # 用户资料
opencli twitter timeline --limit 20      # 时间线
opencli twitter thread 1234567890        # 推文 thread（原文 + 回复）
opencli twitter article 1891511252174299446 # 推文长文内容
opencli twitter follow elonmusk          # 关注用户
opencli twitter unfollow elonmusk        # 取消关注
opencli twitter bookmark https://x.com/... # 收藏推文
opencli twitter unbookmark https://x.com/... # 取消收藏
opencli twitter post "Hello world"       # 发布推文 (text positional)
opencli twitter like https://x.com/...   # 点赞推文 (url positional)
opencli twitter reply https://x.com/... "Nice!" # 回复推文 (url + text positional)
opencli twitter delete https://x.com/... # 删除推文 (url positional)
opencli twitter block elonmusk           # 屏蔽用户 (username positional)
opencli twitter unblock elonmusk         # 取消屏蔽 (username positional)
opencli twitter followers elonmusk       # 用户的粉丝列表 (user positional)
opencli twitter following elonmusk       # 用户的关注列表 (user positional)
opencli twitter notifications --limit 20 # 通知列表
opencli twitter hide-reply https://x.com/... # 隐藏回复 (url positional)
opencli twitter download elonmusk        # 下载用户媒体 (username positional, 支持 --tweet-url)
opencli twitter accept "群,微信"          # 自动接受含关键词的 DM 请求 (query positional)
opencli twitter reply-dm "消息内容"       # 批量回复 DM (text positional)

# Reddit (browser)
opencli reddit hot --limit 10            # 热门帖子
opencli reddit hot --subreddit programming  # 指定子版块
opencli reddit frontpage --limit 10      # 首页 /r/all
opencli reddit popular --limit 10        # /r/popular 热门
opencli reddit search "AI" --sort top --time week  # 搜索（支持排序+时间过滤）
opencli reddit subreddit rust --sort top --time month  # 子版块浏览（支持时间过滤）
opencli reddit read --post-id 1abc123    # 阅读帖子 + 评论
opencli reddit user spez                 # 用户资料（karma、注册时间）
opencli reddit user-posts spez           # 用户发帖历史
opencli reddit user-comments spez        # 用户评论历史
opencli reddit upvote --post-id xxx --direction up  # 投票（up/down/none）
opencli reddit save --post-id xxx        # 收藏帖子
opencli reddit comment --post-id xxx "Great!"  # 发表评论 (text positional)
opencli reddit subscribe --subreddit python  # 订阅子版块
opencli reddit saved --limit 10          # 我的收藏
opencli reddit upvoted --limit 10        # 我的赞

# V2EX (public + browser)
opencli v2ex hot --limit 10              # 热门话题
opencli v2ex latest --limit 10           # 最新话题
opencli v2ex topic 1024                  # 主题详情 (id positional)
opencli v2ex daily                       # 每日签到 (browser)
opencli v2ex me                          # 我的信息 (browser)
opencli v2ex notifications --limit 10    # 通知 (browser)
opencli v2ex node python                 # 节点话题列表 (name positional)
opencli v2ex nodes --limit 30            # 所有节点列表
opencli v2ex member username             # 用户资料 (username positional)
opencli v2ex user username               # 用户发帖列表 (username positional)
opencli v2ex replies 1024                # 主题回复列表 (id positional)

# Hacker News (public)
opencli hackernews top --limit 10        # Top stories
opencli hackernews new --limit 10        # Newest stories
opencli hackernews best --limit 10       # Best stories
opencli hackernews ask --limit 10        # Ask HN posts
opencli hackernews show --limit 10       # Show HN posts
opencli hackernews jobs --limit 10       # Job postings
opencli hackernews search "rust"         # 搜索 (query positional)
opencli hackernews user dang             # 用户资料 (username positional)

# BBC (public)
opencli bbc news --limit 10             # BBC News RSS headlines

# 微博 (browser)
opencli weibo hot --limit 10            # 微博热搜

# BOSS直聘 (browser)
opencli boss search "AI agent"          # 搜索职位 (query positional)
opencli boss detail --security-id xxx    # 职位详情
opencli boss recommend --limit 10        # 推荐职位
opencli boss joblist --limit 10          # 职位列表
opencli boss greet --security-id xxx     # 打招呼
opencli boss batchgreet --job-id xxx     # 批量打招呼
opencli boss send --uid xxx "消息内容"    # 发消息 (text positional)
opencli boss chatlist --limit 10         # 聊天列表
opencli boss chatmsg --security-id xxx   # 聊天记录
opencli boss invite --security-id xxx    # 邀请沟通
opencli boss mark --security-id xxx      # 标记管理
opencli boss exchange --security-id xxx  # 交换联系方式
opencli boss resume                    # 简历管理
opencli boss stats                     # 数据统计

# YouTube (browser)
opencli youtube search "rust"            # 搜索视频 (query positional)
opencli youtube video "https://www.youtube.com/watch?v=xxx"  # 视频元数据
opencli youtube transcript "https://www.youtube.com/watch?v=xxx"  # 获取视频字幕/转录
opencli youtube transcript "xxx" --lang zh-Hans --mode raw  # 指定语言 + 原始时间戳模式

# Yahoo Finance (browser)
opencli yahoo-finance quote --symbol AAPL  # 股票行情

# Sina Finance
opencli sinafinance news --limit 10 --type 1  # 7x24实时快讯

# Reuters (browser)
opencli reuters search "AI"              # 路透社搜索 (query positional)

# 什么值得买 (browser)
opencli smzdm search "耳机"              # 搜索好价 (query positional)

# 携程 (browser)
opencli ctrip search "三亚"              # 搜索目的地 (query positional)

# Antigravity (Electron/CDP)
opencli antigravity status              # 检查 CDP 连接
opencli antigravity send "hello"        # 发送文本到当前 agent 聊天框
opencli antigravity read                # 读取整个聊天记录面板
opencli antigravity new                 # 清空聊天、开启新对话
opencli antigravity dump               # 导出 DOM 和快照调试信息
opencli antigravity extract-code        # 自动抽取 AI 回复中的代码块
opencli antigravity model claude        # 切换底层模型
opencli antigravity watch               # 流式监听增量消息

# Barchart (browser)
opencli barchart quote --symbol AAPL     # 股票行情
opencli barchart options --symbol AAPL   # 期权链
opencli barchart greeks --symbol AAPL    # 期权 Greeks
opencli barchart flow --limit 20         # 异常期权活动

# Jike 即刻 (browser)
opencli jike feed --limit 10             # 动态流
opencli jike search "AI"                 # 搜索 (query positional)
opencli jike create "内容"                # 发布动态 (text positional)
opencli jike like xxx                    # 点赞 (id positional)
opencli jike comment xxx "评论"           # 评论 (id + text positional)
opencli jike repost xxx                  # 转发 (id positional)
opencli jike notifications               # 通知

# Linux.do (public + browser)
opencli linux-do hot --limit 10          # 热门话题
opencli linux-do latest --limit 10       # 最新话题
opencli linux-do search "rust"           # 搜索 (query positional)
opencli linux-do topic 1024              # 主题详情 (id positional)
opencli linux-do categories --limit 20   # 分类列表 (browser)
opencli linux-do category dev 7          # 分类内话题 (slug + id positional, browser)

# StackOverflow (public)
opencli stackoverflow hot --limit 10     # 热门问题
opencli stackoverflow search "typescript"  # 搜索 (query positional)
opencli stackoverflow bounties --limit 10  # 悬赏问题

# WeRead 微信读书 (browser)
opencli weread shelf --limit 10          # 书架
opencli weread search "AI"               # 搜索图书 (query positional)
opencli weread book xxx                  # 图书详情 (book-id positional)
opencli weread highlights xxx            # 划线笔记 (book-id positional)
opencli weread notes xxx                 # 想法笔记 (book-id positional)
opencli weread ranking --limit 10        # 排行榜

# Jimeng 即梦 AI (browser)
opencli jimeng generate --prompt "描述"  # AI 生图
opencli jimeng history --limit 10        # 生成历史

# Yollomi yollomi.com (browser)
opencli yollomi models --type image      # 列出图像模型与积分
opencli yollomi generate "提示词" --model z-image-turbo   # 文生图
opencli yollomi video "提示词" --model kling-2-1        # 视频
opencli yollomi upload ./photo.jpg       # 上传得 URL
opencli yollomi remove-bg <image-url>    # 去背景（免费）
opencli yollomi edit <image-url> "改成油画风格"        # Qwen 图像编辑
opencli yollomi background <image-url>   # AI 背景生成 (5 credits)
opencli yollomi face-swap --source <url> --target <url>  # 换脸 (3 credits)
opencli yollomi object-remover <image-url> <mask-url>    # AI 去除物体 (3 credits)
opencli yollomi restore <image-url>      # AI 修复老照片 (4 credits)
opencli yollomi try-on --person <url> --cloth <url>      # 虚拟试衣 (3 credits)
opencli yollomi upscale <image-url>      # AI 超分辨率 (1 credit)

# Grok
opencli grok ask --prompt "问题"         # 提问 Grok
opencli grok ask --prompt "问题" --web   # grok.com consumer web UI 路径

# HuggingFace (public)
opencli hf top --limit 10                # 热门模型

# 超星学习通 (browser)
opencli chaoxing assignments             # 作业列表
opencli chaoxing exams                   # 考试列表

# Douban 豆瓣 (browser)
opencli douban search "三体"              # 搜索 (query positional)
opencli douban top250                     # 豆瓣 Top 250
opencli douban subject 1234567            # 条目详情 (id positional)
opencli douban photos 30382501            # 图片列表 / 直链
opencli douban download 30382501          # 下载海报 / 剧照
opencli douban marks --limit 10           # 我的标记
opencli douban reviews --limit 10         # 短评

# Facebook (browser)
opencli facebook feed --limit 10          # 动态流
opencli facebook profile username         # 用户资料 (id positional)
opencli facebook search "AI"              # 搜索 (query positional)
opencli facebook friends                  # 好友列表
opencli facebook groups                   # 群组
opencli facebook events                   # 活动
opencli facebook notifications            # 通知
opencli facebook memories                 # 回忆
opencli facebook add-friend username      # 添加好友 (id positional)
opencli facebook join-group groupid       # 加入群组 (id positional)

# Instagram (browser)
opencli instagram explore                 # 探索
opencli instagram profile username        # 用户资料 (id positional)
opencli instagram search "AI"             # 搜索 (query positional)
opencli instagram user username           # 用户详情 (id positional)
opencli instagram followers username      # 粉丝 (id positional)
opencli instagram following username      # 关注 (id positional)
opencli instagram follow username         # 关注用户 (id positional)
opencli instagram unfollow username       # 取消关注 (id positional)
opencli instagram like postid             # 点赞 (id positional)
opencli instagram unlike postid           # 取消点赞 (id positional)
opencli instagram comment postid "评论"   # 评论 (id + text positional)
opencli instagram save postid             # 收藏 (id positional)
opencli instagram unsave postid           # 取消收藏 (id positional)
opencli instagram saved                   # 已收藏列表

# TikTok (browser)
opencli tiktok explore                    # 探索
opencli tiktok search "AI"                # 搜索 (query positional)
opencli tiktok profile username           # 用户资料 (id positional)
opencli tiktok user username              # 用户详情 (id positional)
opencli tiktok following username         # 关注列表 (id positional)
opencli tiktok follow username            # 关注 (id positional)
opencli tiktok unfollow username          # 取消关注 (id positional)
opencli tiktok like videoid               # 点赞 (id positional)
opencli tiktok unlike videoid             # 取消点赞 (id positional)
opencli tiktok comment videoid "评论"     # 评论 (id + text positional)
opencli tiktok save videoid               # 收藏 (id positional)
opencli tiktok unsave videoid             # 取消收藏 (id positional)
opencli tiktok live                       # 直播
opencli tiktok notifications              # 通知
opencli tiktok friends                    # 朋友

# Medium (browser)
opencli medium feed --limit 10            # 动态流
opencli medium search "AI"                # 搜索 (query positional)
opencli medium user username              # 用户主页 (id positional)

# Substack (browser)
opencli substack feed --limit 10          # 订阅动态
opencli substack search "AI"              # 搜索 (query positional)
opencli substack publication name         # 出版物详情 (id positional)

# Sinablog 新浪博客 (browser)
opencli sinablog hot --limit 10           # 热门
opencli sinablog search "AI"              # 搜索 (query positional)
opencli sinablog article url              # 文章详情
opencli sinablog user username            # 用户主页 (id positional)

# Lobsters (public)
opencli lobsters hot --limit 10           # 热门
opencli lobsters newest --limit 10        # 最新
opencli lobsters active --limit 10        # 活跃
opencli lobsters tag rust                 # 按标签筛选 (tag positional)

# Google (public)
opencli google news --limit 10            # 新闻
opencli google search "AI"                # 搜索 (query positional)
opencli google suggest "AI"               # 搜索建议 (query positional)
opencli google trends                     # 趋势

# DEV.to (public)
opencli devto top --limit 10              # 热门文章
opencli devto tag javascript --limit 10   # 按标签 (tag positional)
opencli devto user username               # 用户文章 (username positional)

# Steam (public)
opencli steam top-sellers --limit 10      # 热销游戏

# Apple Podcasts (public)
opencli apple-podcasts top --limit 10     # 热门播客排行榜 (支持 --country)
opencli apple-podcasts search "科技"       # 搜索播客 (query positional)
opencli apple-podcasts episodes 12345     # 播客剧集列表 (id positional)

# arXiv (public)
opencli arxiv search "attention"          # 搜索论文 (query positional)
opencli arxiv paper 1706.03762            # 论文详情 (id positional)

# Bloomberg (public RSS + browser)
opencli bloomberg main --limit 10         # 首页头条 (RSS)
opencli bloomberg markets --limit 10      # 市场新闻 (RSS)
opencli bloomberg tech --limit 10         # 科技新闻 (RSS)
opencli bloomberg politics --limit 10     # 政治新闻 (RSS)
opencli bloomberg feeds                   # 列出所有 RSS feed 别名
opencli bloomberg news "https://..."      # 阅读文章全文 (link positional, browser)

# Coupang 쿠팡 (browser)
opencli coupang search "耳机"             # 搜索商品 (query positional, 支持 --filter rocket)
opencli coupang add-to-cart 12345         # 加入购物车 (product-id positional)

# Dictionary (public)
opencli dictionary search "serendipity"   # 单词释义 (word positional)
opencli dictionary synonyms "happy"       # 近义词 (word positional)
opencli dictionary examples "ubiquitous"  # 例句 (word positional)

# 豆包 Doubao Web (browser)
opencli doubao status                     # 检查豆包页面状态
opencli doubao new                        # 新建对话
opencli doubao send "你好"                # 发送消息 (text positional)
opencli doubao read                       # 读取对话记录
opencli doubao ask "问题"                 # 一键提问并等回复 (text positional)

# 京东 JD (browser)
opencli jd item 100291143898             # 商品详情 (sku positional)

# LinkedIn (browser)
opencli linkedin search "AI engineer"    # 搜索职位 (query positional)
opencli linkedin timeline --limit 20     # 首页动态流

# Pixiv (browser)
opencli pixiv ranking --limit 20         # 插画排行榜 (支持 --mode daily/weekly/monthly)
opencli pixiv search "風景"               # 搜索插画 (query positional)
opencli pixiv user 12345                 # 画师资料 (uid positional)
opencli pixiv illusts 12345              # 画师作品列表 (user-id positional)
opencli pixiv detail 12345               # 插画详情 (id positional)
opencli pixiv download 12345             # 下载插画 (illust-id positional)

# Web (browser)
opencli web read --url "https://..."     # 抓取任意网页导出为 Markdown

# 微信公众号 Weixin (browser)
opencli weixin download --url "https://mp.weixin.qq.com/s/xxx"  # 下载公众号文章为 Markdown

# 小宇宙 Xiaoyuzhou (public)
opencli xiaoyuzhou podcast 12345          # 播客资料 (id positional)
opencli xiaoyuzhou podcast-episodes 12345 # 播客剧集列表 (id positional)
opencli xiaoyuzhou episode 12345          # 单集详情 (id positional)

# Wikipedia (public)
opencli wikipedia search "AI"             # 搜索 (query positional)
opencli wikipedia summary "Python"        # 摘要 (title positional)
```

## Desktop Adapter Commands

```bash
# Cursor (desktop — CDP via Electron)
opencli cursor status                    # 检查连接
opencli cursor send "message"            # 发送消息
opencli cursor read                      # 读取回复
opencli cursor new                       # 新建对话
opencli cursor dump                      # 导出 DOM 调试信息
opencli cursor composer                  # Composer 模式
opencli cursor model claude              # 切换模型
opencli cursor extract-code              # 提取代码块
opencli cursor ask "question"            # 一键提问并等回复
opencli cursor screenshot                # 截图
opencli cursor history                   # 对话历史
opencli cursor export                    # 导出对话

# Codex (desktop — headless CLI agent)
opencli codex status / send / read / new / dump / extract-diff / model / ask / screenshot / history / export

# ChatGPT (desktop — macOS AppleScript/CDP)
opencli chatgpt status / new / send / read / ask

# ChatWise (desktop — multi-LLM client)
opencli chatwise status / new / send / read / ask / model / history / export / screenshot

# Notion (desktop — CDP via Electron)
opencli notion status / search / read / new / write / sidebar / favorites / export

# Discord App (desktop — CDP via Electron)
opencli discord-app status / send / read / channels / servers / search / members

# Doubao App 豆包桌面版 (desktop — CDP via Electron)
opencli doubao-app status / new / send / read / ask / screenshot / dump
```

## Management Commands

```bash
opencli list                # List all commands (including External CLIs)
opencli list --json         # JSON output
opencli list -f yaml        # YAML output
opencli install <name>      # Auto-install an external CLI (e.g., gh, obsidian)
opencli register <name>     # Register a local custom CLI for unified discovery
opencli validate            # Validate all CLI definitions
opencli validate bilibili   # Validate specific site
opencli doctor              # Diagnose browser bridge (auto-starts daemon, includes live test)
```

## AI Agent Workflow

```bash
# Deep Explore: network intercept → response analysis → capability inference
opencli explore <url> --site <name>

# Synthesize: generate evaluate-based YAML pipelines from explore artifacts
opencli synthesize <site>

# Generate: one-shot explore → synthesize → register
opencli generate <url> --goal "hot"

# Record: YOU operate the page, opencli captures every API call → YAML candidates
opencli record <url>                            # 录制，site name 从域名推断
opencli record <url> --site mysite             # 指定 site name
opencli record <url> --timeout 120000          # 自定义超时（毫秒）
opencli record <url> --poll 1000               # 缩短轮询间隔
opencli record <url> --out .opencli/record/x   # 自定义输出目录

# Strategy Cascade: auto-probe PUBLIC → COOKIE → HEADER
opencli cascade <api-url>

# Explore with interactive fuzzing
opencli explore <url> --auto --click "字幕,CC,评论"
```

## Output Formats

All commands support `--format` / `-f`: `table`, `json`, `yaml`, `md`, `csv`.

```bash
opencli bilibili hot -f json    # JSON (pipe to jq, feed to AI agent)
opencli bilibili hot -f yaml    # YAML
opencli bilibili hot -f md      # Markdown
opencli bilibili hot -f csv     # CSV
opencli bilibili hot -v         # Verbose: show pipeline step data flow
```
