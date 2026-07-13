// 连接模式配置
// USE_CLOUD=true  → 云托管模式 (wx.cloud.callContainer)
// USE_CLOUD=false → 本地开发 (wx.request → localhost:3000)
module.exports = {
  USE_CLOUD: false,

  // 本地服务器地址
  API_BASE_URL: 'http://localhost:3000',

  // 云托管环境 ID
  CLOUD_ENV: 'prod-d8gqx4z5od98e2c0a',

  // 云托管服务名（与 container.config.json 中 name 一致）
  CLOUD_SERVICE: 'girlfriend-menu'
};
