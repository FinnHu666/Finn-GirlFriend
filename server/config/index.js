const path = require('path');

// __dirname = /app/config (容器) 或 .../server/config (本地)
// APP_DIR = /app (容器) 或 .../server (本地)
const APP_DIR = path.resolve(__dirname, '..');

module.exports = {
  server: {
    port: Number(process.env.PORT || 80)
  },
  storage: {
    // 容器内 /shared/data/seed.json，本地 ../../shared/data/seed.json
    seedPath: process.env.SEED_PATH || path.join(APP_DIR, '..', 'shared', 'data', 'seed.json'),
    dataDir: process.env.DATA_DIR || path.join(APP_DIR, 'data'),
    dbPath: process.env.DB_PATH || path.join(APP_DIR, 'data', 'db.json')
  },
  auth: {
    tokenPrefix: process.env.AUTH_TOKEN_PREFIX || 'girlfriend-menu-token',
    defaultUsers: [
      {
        id: 'user-girlfriend',
        username: process.env.GIRLFRIEND_USERNAME || 'girlfriend',
        password: process.env.GIRLFRIEND_PASSWORD || '123456',
        nickname: process.env.GIRLFRIEND_NICKNAME || '小宝',
        role: 'girlfriend'
      },
      {
        id: 'user-boyfriend',
        username: process.env.BOYFRIEND_USERNAME || 'boyfriend',
        password: process.env.BOYFRIEND_PASSWORD || '123456',
        nickname: process.env.BOYFRIEND_NICKNAME || '男友',
        role: 'boyfriend'
      }
    ]
  }
};
