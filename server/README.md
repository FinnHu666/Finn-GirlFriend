# 后端 API 说明

默认地址：`http://localhost:3000`

## 配置

配置文件：`server/config/index.js`

可通过环境变量覆盖端口、数据库路径和默认账号：

- `PORT`
- `DB_PATH`
- `DATA_DIR`
- `SEED_PATH`
- `GIRLFRIEND_USERNAME` / `GIRLFRIEND_PASSWORD`
- `BOYFRIEND_USERNAME` / `BOYFRIEND_PASSWORD`

默认账号：

| 角色 | 账号 | 密码 |
|---|---|---|
| 女友 | `girlfriend` | `123456` |
| 男友 | `boyfriend` | `123456` |

## 接口

### GET /api/health

健康检查。

### POST /api/auth/login

登录。返回 `token` 和当前用户。后续需要权限的接口在请求头带上：

```text
Authorization: Bearer <token>
```

```json
{
  "username": "boyfriend",
  "password": "123456"
}
```

### GET /api/auth/me

获取当前登录用户。

### POST /api/auth/logout

退出登录。

### GET /api/home

首页数据：问候、文案、今日推荐。

### GET /api/dishes

查询菜品。

参数：

- `category`：分类 ID，默认 `all`。
- `tag`：口味标签。
- `keyword`：关键词。
- `includeHidden=true`：包含隐藏菜单。
- `includeUnavailable=true`：包含下架菜品。

### GET /api/dishes/:id

菜品详情。

### GET /api/recommend/random?state=有点累

随机推荐套餐。

### POST /api/orders

提交订单。需要女友角色登录。

```json
{
  "items": [
    {
      "dishId": "dish-tomato-beef",
      "dishName": "番茄牛腩",
      "portion": "正常",
      "tastes": ["微辣"],
      "note": "多放土豆"
    }
  ],
  "hungerLevel": "非常饿",
  "mood": "累了",
  "expectedTime": "19:00",
  "note": "今天想吃热乎一点的"
}
```

### GET /api/orders/:id

订单详情。需要登录。

### GET /api/admin/orders

订单列表。需要男友角色登录。

### POST /api/admin/dishes

新增菜品。需要男友角色登录。

### PUT /api/admin/dishes/:id

更新菜品字段。需要男友角色登录。
