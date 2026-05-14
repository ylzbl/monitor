# 行业监控系统 — 变更日志

> 知识产权：娱乐资本论 (https://ylzbl.com/)

---

## v1.1 (2026-05-14)

### 新增
- **微博RSS采集**：Worker内置微博Visitor Auth流程，通过/api/weibo/{uid}端点实时抓取微博动态转为RSS
  - 潮玩板块新增：微博-娱乐资本论
  - 广电板块新增：微博-广电时评
  - 票房板块新增：微博-中国电影报道
  - 短剧板块新增：微博-新腕儿
  - 上市公司板块新增：微博-娱乐资本论

### 修复
- **Worker代理错误码传递**：Worker代理现在始终返回200（通过X-Original-Status头传递真实状态码），防止前端因403/404而级联到已失效的公共CORS代理
- **移除失效的公共CORS代理**：corsproxy.io和allorigins.win已不稳定，从代理列表中移除，仅使用自建Worker代理
- **界面新闻URL**：jiemian.com/article_list/146.html返回404，改为jiemian.com首页
- **合规检查设置文案**：移除AI添加的"在中国大陆使用，请进行严格的合规检查"描述文本，恢复为简洁的开/关状态显示

---

## v1.0 (2026-05-14)

### 新增
- **Cloudflare Workers部署**：自建CORS代理解决跨域问题
  - workers.dev: https://yz-monitor.lishuhang.workers.dev
  - 自定义域名: https://yz-monitor.lishuhang.com（需配置DNS）
- Worker自带静态文件服务 + CORS代理（/api/proxy），彻底解决GitHub Pages的CORS限制

### 修复
- **CORS跨域报错**：corsproxy.io和allorigins.win均不再提供CORS头，导致所有采集失败。现在优先使用自建Cloudflare Worker代理
- **广电板块信息源URL**：
  - 广电总局公告从 col113 改为 col68（实际通知公告栏目）
  - 广电总局-网络剧许可改名为广电总局-网络视听节目备案
  - 国家电影局-公映许可URL末尾补充斜杠
- **骨朵数据平台URL**：d2.guduomedia.com 改为 www.guduodata.com
- **36氪快讯**：从RSS改为页面轮询（原RSS地址不可用）
- **界面文娱URL**：从移动端 m.jiemian.com 改为桌面端 www.jiemian.com
- **合规检查设置文案**：移除多余的"勾选后将屏蔽被墙的境外新闻源"说明

---

## v0.9 (2026-05-14)

### 新增
- **5个独立子系统页面**
- **行业专属信息源**：5个子系统共配置51个行业专属源
- **出版物风格PDF报告**
- **首页自动运行监控**，新内容脉冲动画
- **关键字词云**

### 修复
- 移除Google News RSS（敏感内容风险）
- 修复CSV导出Excel乱码（UTF-8 BOM）

---

## v0.8 (2026-05-14)
- 多文件架构、合规过滤、关键字词云

## v0.7 (2026-05-13)
- 关键字相关性过滤

## v0.6 (2026-05-13)
- 仪表盘可视化、自定义AI

## v0.5 (2026-05-13)
- Portal数据刷新修复

## v0.4 (2026-05-13)
- 去重逻辑、关键字匹配

## v0.3 (2026-05-13)
- rss2json备选方案

## v0.2 (2026-05-13)
- 修复默认信息源、进度条

## v0.1 (2026-05-13)
- 初始版本
