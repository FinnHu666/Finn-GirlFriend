# 微信云托管 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 server 代码到 /app
COPY server/ ./

# 复制 shared 数据到 /shared（供 server 读取 seed.json）
COPY shared/ /shared/

# 创建数据目录
RUN mkdir -p /app/data

# 安装依赖
RUN npm install --omit=dev

# 云托管默认监听 80 端口
EXPOSE 80

CMD ["node", "src/index.js"]
