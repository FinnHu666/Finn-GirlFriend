const fs = require('fs');
const config = require('../config');

function ensureDb() {
  if (!fs.existsSync(config.storage.dataDir)) {
    fs.mkdirSync(config.storage.dataDir, { recursive: true });
  }
  if (!fs.existsSync(config.storage.dbPath)) {
    fs.copyFileSync(config.storage.seedPath, config.storage.dbPath);
  }
  migrateDb();
}

function readDb() {
  ensureDbFileOnly();
  const db = JSON.parse(fs.readFileSync(config.storage.dbPath, 'utf8'));
  return normalizeDb(db);
}

function writeDb(db) {
  fs.writeFileSync(config.storage.dbPath, JSON.stringify(normalizeDb(db), null, 2));
}

function ensureDbFileOnly() {
  if (!fs.existsSync(config.storage.dataDir)) {
    fs.mkdirSync(config.storage.dataDir, { recursive: true });
  }
  if (!fs.existsSync(config.storage.dbPath)) {
    fs.copyFileSync(config.storage.seedPath, config.storage.dbPath);
  }
}

function migrateDb() {
  const db = readDb();
  writeDb(db);
}

function normalizeDb(db) {
  return {
    categories: Array.isArray(db.categories) ? db.categories : [],
    tasteTags: Array.isArray(db.tasteTags) ? db.tasteTags : [],
    dishes: Array.isArray(db.dishes) ? db.dishes : [],
    orders: Array.isArray(db.orders) ? db.orders : [],
    users: normalizeUsers(db.users),
    sessions: Array.isArray(db.sessions) ? db.sessions : [],
    copywriting: db.copywriting || {}
  };
}

function normalizeUsers(users) {
  const list = Array.isArray(users) ? users : [];
  const byRole = list.reduce((map, user) => {
    map[user.role] = user;
    return map;
  }, {});
  const missingDefaults = config.auth.defaultUsers.filter(user => !byRole[user.role]);
  return list.concat(missingDefaults);
}

module.exports = {
  ensureDb,
  readDb,
  writeDb
};
