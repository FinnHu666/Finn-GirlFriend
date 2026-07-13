# 微信云托管 Node.js Dockerfile
# 参考：https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/quickstart/custom/node.html

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制服务端代码
COPY server/ ./

# 复制 shared 数据到 /shared（供服务端读取 seed.json 初始化数据库）
COPY shared/ /shared/

# 创建数据目录（运行时 db.json 写入位置）
RUN mkdir -p /app/data

# 安装依赖（仅生产依赖）
RUN npm install --omit=dev

# 云托管健康检查默认探测 3000 端口
EXPOSE 3000

# 设置端口（与云托管健康检查一致）
ENV PORT=3000

# 启动服务
CMD ["node", "src/index.js"]
