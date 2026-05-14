# 行业监控系统 v1.1

> 全网内容实时巡检与自动化采集平台
> 知识产权：**娱乐资本论** (https://ylzbl.com/)

---

## 一、系统概述

行业监控系统是由**娱乐资本论**自主研发的全网内容实时巡检与自动化采集平台，覆盖五大行业板块：

| 板块 | 文件 | 主题色 | 说明 |
|------|------|--------|------|
| 🎮 潮玩行业每日监控 | chaowan.html | 玫红 #E91E8C | 潮玩舆情、产品热度、价格波动、竞品动作 |
| 📡 广电总局数据监控 | guangdian.html | 蓝色 #1565C0 | 项目发行、节目备案、传播数据、违规风险 |
| 🎬 中国电影票房监控 | piaofang.html | 金色 #D97706 | 影片票房、排片占比、上座率、口碑评分 |
| 📱 短剧数据监控 | duanju.html | 紫色 #7C3AED | 播放量、热度、竞品动态、政策变化 |
| 📈 娱乐传媒上市公司监控 | shangshi.html | 青色 #0D9488 | 财报、股价、公告、舆情、项目动态 |

---

## 二、部署方式

### 方式一：Cloudflare Workers（推荐）
自带CORS代理，解决跨域限制。
- workers.dev: https://yz-monitor.lishuhang.workers.dev
- 自定义域名: https://yz-monitor.lishuhang.com（需在Cloudflare Dashboard配置DNS记录）

### 方式二：GitHub Pages
- 部署地址：https://ylzbl.github.io/monitor/
- 注意：GitHub Pages部署依赖Worker代理（跨域），部分源可能因反爬机制采集失败

### 方式三：本地打开
直接在浏览器中打开 `index.html` 即可使用，无需服务器。

---

## 三、CORS代理说明

本系统通过自建Cloudflare Worker代理解决浏览器跨域限制：

- **workers.dev/lishuhang.com** 部署时，自动使用 `/api/proxy` 作为代理（零CORS问题）
- **GitHub Pages/本地** 部署时，自动使用 `yz-monitor.lishuhang.workers.dev/api/proxy` 作为代理
- Worker代理始终返回HTTP 200（通过 `X-Original-Status` 头传递目标站真实状态码），避免前端级联到已失效的公共代理

---

## 四、已知限制

1. **JS动态渲染网站**：泡泡玛特、猫眼等SPA网站通过fetch只能获取空壳HTML，无法提取内容
2. **部分政府网站不可达**：dsbei.nrta.gov.cn 返回530错误，可能是DNS或地域限制
3. **部分网站反爬**：中外玩具网(ctoy.com.cn)返回403
4. **微博RSS**：微博Visitor Auth需要JS执行，Cloudflare Worker无法完成。待部署RSSHub后可用
5. **localStorage 5MB限制**：大量数据时可能溢出

---

## 五、文件结构

```
monitor/
├── index.html          # 门户首页（全板块概览）
├── chaowan.html        # 🎮 潮玩行业每日监控
├── guangdian.html      # 📡 广电总局数据监控
├── piaofang.html       # 🎬 中国电影票房监控
├── duanju.html         # 📱 短剧数据监控
├── shangshi.html       # 📈 娱乐传媒上市公司监控
├── common.js           # 共享核心逻辑
├── common.css          # 共享样式
├── world-map.svg       # 世界地图剪影
├── CHANGELOG.md        # 变更日志
├── README.md           # 本文件
├── todo_v1.0_new.md    # TODO及开发记录
└── worker/
    ├── worker.js       # Cloudflare Worker（静态站点+CORS代理+微博RSS）
    └── wrangler.toml   # Worker配置
```

---

## 六、知识产权

本系统全部知识产权归 [娱乐资本论](https://ylzbl.com/) 所有。
系统版本：v1.1
构建日期：2026-05-14
