# 给女友的电子点菜菜单 🐳

基于微信小程序 + **微信云托管（CloudRun）** 搭建的电子点菜菜单，Node.js 部署在微信云端，零服务器运维。

## 技术栈

- **前端**：微信小程序（WXML / WXSS / JS）
- **后端**：Node.js → 微信云托管（Docker 容器）
- **通信**：wx.cloud.callContainer（免域名、免备案、自动 HTTPS）

## 快速开始

### 1. 本地开发（可选）

```bash
cd server
npm install
node src/index.js
```

默认监听 `http://localhost:80`

### 2. 部署到微信云托管

#### 方式 A：微信开发者工具一键部署

1. 开发者工具打开 `miniprogram` 目录
2. 工具栏点击「云开发」→「云托管」
3. 新建服务 → 选择「本地代码」→ 选择项目根目录
4. 点击「创建并部署」，自动识别 Dockerfile 并构建

#### 方式 B：微信云托管控制台

1. 登录 [cloud.weixin.qq.com](https://cloud.weixin.qq.com)
2. 进入环境 `prod-d8gqx4z5od98e2c0a` →「云托管」
3. 新建服务 → 上传代码（或关联 Git 仓库）
4. 自动构建 Docker 镜像并部署

### 3. 小程序调用

`api.js` 已配置通过 `wx.cloud.callContainer` 调用云托管服务，无需填写域名。

## 目录结构

```text
├── miniprogram/          # 微信小程序前端
│   ├── app.js            # 含 cloud.init
│   ├── pages/            # 8 个页面
│   └── utils/
│       ├── api.js        # callContainer 调用
│       └── config.js
├── server/               # Node.js 后端（云托管运行）
│   ├── src/index.js      # HTTP API 入口
│   ├── src/jsonDatabase.js
│   ├── config/index.js
│   └── data/db.json
├── shared/data/          # 种子数据
├── Dockerfile            # 云托管容器构建
├── container.config.json # 云托管配置
└── README.md
```

## API 接口

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| POST | /api/auth/login | 登录 |
| GET | /api/auth/me | 当前用户 |
| POST | /api/auth/logout | 注销 |
| GET | /api/home | 首页数据 |
| GET | /api/dishes | 菜品列表 |
| GET | /api/dishes/:id | 菜品详情 |
| GET | /api/recommend/random | 随机推荐 |
| POST | /api/orders | 创建订单 |
| GET | /api/orders/:id | 订单详情 |
| GET | /api/admin/orders | 管理订单 |
| POST | /api/admin/dishes | 新增菜品 |
| PUT | /api/admin/dishes/:id | 修改菜品 |

## 默认账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 女友 | `girlfriend` | `123456` |
| 男友 | `boyfriend` | `123456` |

## 云托管 vs 自建服务器

| | 云托管 | 自建 VPS |
|------|--------|----------|
| 域名备案 | ❌ 不需要 | ✅ 必须 |
| HTTPS | 🟢 自动 | 🔧 自配 Nginx |
| 运维 | 🟢 微信管 | 🔧 自己管 |
| 成本 | 免费额度 | ~68 元/月 |

## 版本

- **V3.0**：微信云托管（CloudRun），Node.js 容器化
- V2.0：微信云开发（云函数）
- V1.0：自建服务器 Node.js
