# 微信云托管 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 只复制 server 代码
COPY server/ ./

# 安装依赖
RUN npm install --production

# 云托管默认监听 80 端口
EXPOSE 80

CMD ["node", "src/index.js"]
