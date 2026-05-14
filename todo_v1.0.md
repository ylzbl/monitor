# 行业监控系统 v1.0 — TODO 及开发记录

> 最后更新：2026-05-14 | 当前版本：v1.0
> 知识产权：娱乐资本论 (https://ylzbl.com/)

---

## 一、已完成事项

### v1.0 — CORS修复 + URL修正 + Cloudflare部署（2026-05-14）
- [x] 部署到Cloudflare Workers (yz-monitor.lishuhang.com)，自建CORS代理
- [x] 修复CORS跨域报错：自建Worker代理 > corsproxy.io > allorigins.win 三级降级
- [x] 修复广电板块信息源URL（广电总局公告col113→col68，补充斜杠等）
- [x] 修复骨朵数据平台URL（d2.guduomedia.com→www.guduodata.com）
- [x] 36氪快讯从RSS改为页面轮询（原RSS地址不可用）
- [x] 界面文娱URL从移动端改为桌面端
- [x] 移除合规检查设置中多余的说明文字

### v0.9 — 独立子系统页面 + 行业源 + PDF报告（2026-05-14）
- [x] 拆分为5个独立子系统HTML页面
- [x] 全面替换行业专属信息源（51个源）
- [x] 扩充关键字库
- [x] 新增出版物风格PDF报告生成
- [x] 首页自动运行监控，新内容脉冲动画
- [x] 设置面板README
- [x] 合规检查默认开启
- [x] 深色模式统一管理
- [x] CSV导出UTF-8 BOM
- [x] JSON导入/导出

### v0.1 ~ v0.8（2026-05-13 ~ 2026-05-14）
- [x] 单文件→多文件架构
- [x] RSS订阅 + 网页轮询采集
- [x] 关键字/告警关键字管理
- [x] AI报告生成
- [x] 仪表盘可视化
- [x] 合规内容过滤
- [x] GitHub Pages部署

---

## 二、未完成事项

### 高优先级
- [ ] **定时自动推送**：Service Worker定时采集 + 推送通知
- [ ] **内容相关性深度优化**：正文分析、语义相似度

### 中优先级
- [ ] **数据持久化升级**：localStorage→IndexedDB
- [ ] **信息源健康监控**：失败标记、自动降级
- [ ] **PWA离线支持**：Service Worker + manifest.json
- [ ] **移动端优化**

### 低优先级
- [ ] **用户账户系统**
- [ ] **API Key加密存储**
- [ ] **自动化测试**

---

## 三、已知问题

### 1. CORS代理 ⚠️
- 公共代理(corsproxy.io, allorigins.win)不稳定，经常返回CORS错误
- **已解决**：部署Cloudflare Worker自建代理
- GitHub Pages部署仍可能因公共代理不稳定导致采集失败

### 2. 网页轮询 ⚠️
- 政府网站(广电总局、国家电影局)使用JS动态渲染，fetch只能获取空壳HTML
- 即使通过CORS代理也无法获取动态渲染内容
- 后续考虑：使用headless browser或官方API

### 3. RSS解析 ⚠️
- rss2json.com免费版限制10条/请求、10次/分钟
- 部分中文RSS含BOM或非标准XML

---

## 四、关键配置

- **版本号**：v1.0
- **Cloudflare Worker**：yz-monitor.lishuhang.com
- **CORS代理路径**：/api/proxy?url=
- **GitHub Pages**：https://ylzbl.github.io/monitor/
- **智谱API Key**：已预填测试Key
- **合规过滤**：默认开启
- **数据存储**：localStorage, key前缀 `mon_{sysId}_`
