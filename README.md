# 给女友的电子点菜菜单

基于当前 PRD、产品原型和 HTML 原型搭建的微信小程序 + Node.js 后端项目。

## 目录结构

```text
miniprogram/          # 微信小程序前端
server/               # Node.js HTTP 后端
shared/data/          # 前后端共享初始数据
README.md             # 运行说明
```

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
npm run dev
```

默认服务地址：`http://localhost:3000`。

### 2. 启动微信小程序

1. 使用微信开发者工具打开 `miniprogram` 目录。
2. 如果本地调试后端，请在微信开发者工具中勾选“不校验合法域名”。
3. 如需改后端地址，修改 `miniprogram/utils/config.js` 中的 `API_BASE_URL`。

## 已实现功能

- 首页：专属问候、今日推荐、快捷入口、随机推荐。
- 菜单页：分类/口味筛选、搜索、加入今日点菜单。
- 详情页：口味多选、份量单选、备注、加入点菜单。
- 今日点菜单：菜品汇总、心情/饥饿程度/用餐时间、提交订单。
- 提交成功页：订单摘要与温柔反馈。
- 我的页：登录状态、角色入口、男友订单查看和管理入口。
- 登录校验：简单账号密码登录，区分女友端和男友端。
- 管理页：男友角色可维护菜品、新增、下架/恢复、推荐/隐藏状态。
- 后端 API：登录、菜品、分类、推荐、随机套餐、订单、管理接口。

## 数据说明

后端首次启动会从 `shared/data/seed.json` 初始化数据到 `server/data/db.json`。后续订单、登录 session 和菜品修改会写入 `server/data/db.json`。

本地数据库和服务配置已提取到：

```text
server/config/index.js
```

可通过环境变量覆盖：

- `PORT`：后端端口，默认 `3000`。
- `DB_PATH`：本地 JSON 数据库路径，默认 `server/data/db.json`。
- `DATA_DIR`：本地数据目录。
- `SEED_PATH`：初始数据路径。
- `GIRLFRIEND_USERNAME` / `GIRLFRIEND_PASSWORD`：女友账号密码。
- `BOYFRIEND_USERNAME` / `BOYFRIEND_PASSWORD`：男友账号密码。

默认账号：

| 角色 | 账号 | 密码 |
|---|---|---|
| 女友 | `girlfriend` | `123456` |
| 男友 | `boyfriend` | `123456` |
