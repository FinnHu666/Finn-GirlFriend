// 连接模式配置
// USE_CLOUD=true  → 云托管模式 (wx.cloud.callContainer)
// USE_CLOUD=false → 本地开发 (wx.request → localhost:3000)
module.exports = {
  USE_CLOUD: false,

  // 本地服务器地址
  API_BASE_URL: 'http://localhost:3000',

  // 云托管环境 ID（部署后替换为你的环境 ID）
  CLOUD_ENV: '你的云托管环境ID',

  // 云托管服务名（与 container.config.json 中 name 一致）
  CLOUD_SERVICE: 'girlfriend-menu'
};
