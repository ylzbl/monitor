# 行业监控系统 v1.1 — TODO 及开发记录

> 最后更新：2026-05-14 | 当前版本：v1.1
> 知识产权：娱乐资本论 (https://ylzbl.com/)

---

## 一、已完成事项

### v1.1 — 代理错误修复 + URL修正（2026-05-14）
- [x] Worker代理始终返回200，通过X-Original-Status传递目标站真实状态码
- [x] 移除失效的公共CORS代理（corsproxy.io、allorigins.win）
- [x] 修复界面新闻URL（jiemian.com/article_list/146.html返回404，改为首页）
- [x] 移除合规检查设置中AI添加的描述文本
- [x] Worker新增/api/weibo/{uid}端点（微博Visitor Auth流程）

### v1.0 — CORS修复 + Cloudflare部署（2026-05-14）
- [x] 部署到Cloudflare Workers，自建CORS代理
- [x] 修复CORS跨域报错
- [x] 修复广电板块信息源URL
- [x] 修复骨朵数据平台URL
- [x] 36氪快讯从RSS改为页面轮询
- [x] 界面文娱URL从移动端改为桌面端

### v0.1 ~ v0.9（2026-05-13 ~ 2026-05-14）
- [x] 全部功能（详见CHANGELOG.md）

---

## 二、未完成事项

### 高优先级
- [ ] **微博RSS采集**：Worker内置的/api/weibo/{uid}端点受限于微博Visitor Auth需要JS执行
  - 方案A：部署RSSHub到VPS/Cloudflare Pages（推荐）
  - 方案B：使用headless browser服务
  - 方案C：使用第三方Weibo RSS服务
- [ ] **JS动态渲染网站采集**：猫眼、泡泡玛特等SPA网站fetch只能获取空壳HTML
- [ ] **dsbei.nrta.gov.cn不可达**：返回530错误
- [ ] **ctoy.com.cn反爬**：返回403

### 中优先级
- [ ] **数据持久化升级**：localStorage→IndexedDB
- [ ] **信息源健康监控**：失败标记、自动降级
- [ ] **PWA离线支持**：Service Worker + manifest.json
- [ ] **移动端优化**

### 低优先级
- [ ] **用户账户系统**
- [ ] **API Key加密存储**
- [ ] **自动化测试**
- [ ] **DNS配置**：yz-monitor.lishuhang.com自定义域名

---

## 三、已知问题

| 问题 | 原因 | 影响 | 解决方案 |
|------|------|------|----------|
| ctoy.com.cn 403 | 网站反爬机制 | 潮玩板块缺少中外玩具网数据 | 需要绕过反爬或使用API |
| dsbei.nrta.gov.cn 530 | DNS不可达 | 广电/短剧板块缺少备案数据 | 需要确认是否仅限境外不可达 |
| 微博无法采集 | Visitor Auth需JS执行 | 缺少微博动态源 | 部署RSSHub |
| 猫眼票房空壳 | SPA动态渲染 | 票房数据无法通过fetch获取 | 需要headless browser |
