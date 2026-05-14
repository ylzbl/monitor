# 行业监控系统 v1.0 — TODO 及开发记录

> 最后更新：2026-05-14 | 当前版本：v1.0
> 知识产权：娱乐资本论 (https://ylzbl.com/)

---

## 一、已完成事项

### v1.0 — CORS修复 + URL修正 + Cloudflare部署（2026-05-14）
- [x] 部署到Cloudflare Workers (yz-monitor.lishuhang.workers.dev)，自建CORS代理
- [x] 修复CORS跨域报错：自建Worker代理 > corsproxy.io > allorigins.win 三级降级
- [x] 修复广电板块信息源URL（广电总局公告col113→col68，补充斜杠等）
- [x] 修复骨朵数据平台URL（d2.guduomedia.com→www.guduodata.com）
- [x] 36氪快讯从RSS改为页面轮询（原RSS地址不可用）
- [x] 界面文娱URL从移动端改为桌面端
- [x] 移除合规检查设置中多余的说明文字
- [x] GitHub Pages同步更新

### v0.1 ~ v0.9（2026-05-13 ~ 2026-05-14）
- [x] 全部功能（详见历史changelog）

---

## 二、未完成事项

### 高优先级
- [ ] JS动态渲染网站采集（SPA网站无法通过fetch获取内容）
- [ ] dsbei.nrta.gov.cn不可达（返回530）
- [ ] ctoy.com.cn 403（反爬措施）

### 中优先级
- [ ] 数据持久化升级：localStorage→IndexedDB
- [ ] 信息源健康监控
- [ ] PWA离线支持
- [ ] 移动端优化

### 低优先级
- [ ] 用户账户系统
- [ ] API Key加密存储
- [ ] 自动化测试
- [ ] DNS配置：yz-monitor.lishuhang.com自定义域名

---

## 三、部署信息

| 项目 | 地址 |
|------|------|
| Cloudflare Workers | https://yz-monitor.lishuhang.workers.dev |
| 自定义域名 | https://yz-monitor.lishuhang.com（待配置DNS） |
| GitHub Pages | https://ylzbl.github.io/monitor/ |
| GitHub仓库 | https://github.com/ylzbl/monitor |
