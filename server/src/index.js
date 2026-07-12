const http = require('http');
const { URL } = require('url');
const config = require('../config');
const { ensureDb, readDb, writeDb } = require('./jsonDatabase');

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function notFound(res) {
  sendJson(res, 404, { message: '没有找到这个接口' });
}

function badRequest(res, message) {
  sendJson(res, 400, { message });
}

function unauthorized(res, message = '请先登录') {
  sendJson(res, 401, { message });
}

function forbidden(res, message = '当前角色没有权限哦') {
  sendJson(res, 403, { message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('请求内容太大'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('JSON 格式不正确'));
      }
    });
    req.on('error', reject);
  });
}

function nowId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role
  };
}

function createToken(user) {
  return `${config.auth.tokenPrefix}.${user.role}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;
}

function getAuthUser(req, db) {
  const authorization = req.headers.authorization || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const session = db.sessions.find(item => item.token === token);
  if (!session) return null;
  return db.users.find(user => user.id === session.userId) || null;
}

function requireUser(req, res, db) {
  const user = getAuthUser(req, db);
  if (!user) {
    unauthorized(res);
    return null;
  }
  return user;
}

function requireRole(req, res, db, role) {
  const user = requireUser(req, res, db);
  if (!user) return null;
  if (user.role !== role) {
    forbidden(res);
    return null;
  }
  return user;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return '早安呀';
  if (hour < 18) return '午安呀';
  return '晚上好呀';
}

function normalizeDish(dish) {
  return {
    ...dish,
    tags: Array.isArray(dish.tags) ? dish.tags : [],
    cookTime: Number(dish.cookTime) || 0,
    loveScore: Number(dish.loveScore) || 3,
    recommended: Boolean(dish.recommended),
    hidden: Boolean(dish.hidden),
    available: dish.available !== false
  };
}

function publicDishes(db, options = {}) {
  const includeHidden = options.includeHidden === 'true' || options.includeHidden === true;
  const includeUnavailable = options.includeUnavailable === 'true' || options.includeUnavailable === true;
  return db.dishes
    .map(normalizeDish)
    .filter(dish => includeUnavailable || dish.available)
    .filter(dish => includeHidden || !dish.hidden);
}

function filterDishes(db, query) {
  const category = query.get('category') || 'all';
  const tag = query.get('tag') || '';
  const keyword = (query.get('keyword') || '').trim().toLowerCase();
  const includeHidden = query.get('includeHidden');
  const includeUnavailable = query.get('includeUnavailable');

  return publicDishes(db, { includeHidden, includeUnavailable }).filter(dish => {
    if (category !== 'all' && dish.category !== category) return false;
    if (tag && !dish.tags.includes(tag)) return false;
    if (!keyword) return true;
    const searchable = [dish.name, dish.description, dish.reason, dish.category, ...dish.tags]
      .join(' ')
      .toLowerCase();
    return searchable.includes(keyword);
  });
}

function pickRecommended(db) {
  const recommended = publicDishes(db)
    .filter(dish => dish.recommended)
    .sort((a, b) => b.loveScore - a.loveScore);
  return recommended.slice(0, 4);
}

function categoryName(db, id) {
  const category = db.categories.find(item => item.id === id);
  return category ? category.name : id;
}

function buildRandomCombo(db, state) {
  const dishes = publicDishes(db);
  const preferences = {
    '有点累': ['热乎', '下饭', '清淡'],
    '想吃甜': ['香甜', '甜品'],
    '想吃热乎': ['热乎', '下饭'],
    '没胃口': ['酸甜', '清淡'],
    '想吃大餐': ['下饭', '惊喜']
  };
  const tags = preferences[state] || preferences['有点累'];
  const score = dish => tags.reduce((sum, tag) => sum + (dish.tags.includes(tag) ? 3 : 0), 0) + dish.loveScore;
  const sorted = dishes.slice().sort((a, b) => score(b) - score(a));
  const main = sorted.find(dish => ['meat', 'staple', 'hidden'].includes(dish.category)) || sorted[0];
  const veggie = sorted.find(dish => dish.category === 'veggie' && dish.id !== main.id);
  const soup = sorted.find(dish => dish.category === 'soup' && dish.id !== main.id);
  const dessert = sorted.find(dish => ['dessert', 'drink'].includes(dish.category) && dish.id !== main.id);
  const items = [main, veggie, soup || dessert].filter(Boolean).slice(0, 3);

  return {
    state: state || '有点累',
    reason: `按“${state || '有点累'}”帮你选了更${tags.slice(0, 2).join('、')}的一组。`,
    items: items.map(item => ({ ...item, categoryName: categoryName(db, item.category) }))
  };
}

async function route(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const db = readDb();

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      name: 'girlfriend-menu-server',
      storage: 'local-json-db'
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readBody(req);
    const user = db.users.find(item => item.username === body.username && item.password === body.password);
    if (!user) {
      unauthorized(res, '账号或密码不对哦');
      return;
    }
    const token = createToken(user);
    db.sessions.unshift({
      token,
      userId: user.id,
      role: user.role,
      createdAt: new Date().toISOString()
    });
    db.sessions = db.sessions.slice(0, 20);
    writeDb(db);
    sendJson(res, 200, { token, user: safeUser(user) });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/auth/me') {
    const user = requireUser(req, res, db);
    if (!user) return;
    sendJson(res, 200, safeUser(user));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
    const authorization = req.headers.authorization || '';
    const token = authorization.replace(/^Bearer\s+/i, '');
    db.sessions = db.sessions.filter(item => item.token !== token);
    writeDb(db);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/home') {
    sendJson(res, 200, {
      greeting: getGreeting(),
      copywriting: db.copywriting,
      recommended: pickRecommended(db),
      cartTip: '不知道吃什么，就交给我吧。'
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/dishes') {
    sendJson(res, 200, {
      categories: db.categories,
      tasteTags: db.tasteTags,
      dishes: filterDishes(db, url.searchParams)
    });
    return;
  }

  const dishMatch = url.pathname.match(/^\/api\/dishes\/([^/]+)$/);
  if (req.method === 'GET' && dishMatch) {
    const dish = publicDishes(db, { includeHidden: true }).find(item => item.id === dishMatch[1]);
    if (!dish) {
      notFound(res);
      return;
    }
    sendJson(res, 200, dish);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/recommend/random') {
    sendJson(res, 200, buildRandomCombo(db, url.searchParams.get('state')));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/orders') {
    const user = requireRole(req, res, db, 'girlfriend');
    if (!user) return;
    const body = await readBody(req);
    if (!Array.isArray(body.items) || body.items.length === 0) {
      badRequest(res, '至少要选择一道菜');
      return;
    }
    const order = {
      id: nowId('order'),
      date: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.nickname,
      items: body.items,
      hungerLevel: body.hungerLevel || '正常饿',
      mood: body.mood || '开心',
      expectedTime: body.expectedTime || '19:00',
      note: body.note || '',
      totalCookTime: Number(body.totalCookTime) || body.items.reduce((sum, item) => sum + (Number(item.cookTime) || 0), 0),
      status: '已提交',
      reply: db.copywriting.successReply
    };
    db.orders.unshift(order);
    writeDb(db);
    sendJson(res, 201, order);
    return;
  }

  const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (req.method === 'GET' && orderMatch) {
    const user = requireUser(req, res, db);
    if (!user) return;
    const order = db.orders.find(item => item.id === orderMatch[1]);
    if (!order) {
      notFound(res);
      return;
    }
    sendJson(res, 200, order);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/orders') {
    const user = requireRole(req, res, db, 'boyfriend');
    if (!user) return;
    sendJson(res, 200, db.orders);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/dishes') {
    const user = requireRole(req, res, db, 'boyfriend');
    if (!user) return;
    const body = await readBody(req);
    if (!body.name || !body.category || !body.description) {
      badRequest(res, '菜名、分类和描述必填');
      return;
    }
    const dish = normalizeDish({
      id: nowId('dish'),
      emoji: '🍽️',
      reason: body.description,
      createdBy: user.id,
      ...body
    });
    db.dishes.unshift(dish);
    writeDb(db);
    sendJson(res, 201, dish);
    return;
  }

  const adminDishMatch = url.pathname.match(/^\/api\/admin\/dishes\/([^/]+)$/);
  if (req.method === 'PUT' && adminDishMatch) {
    const user = requireRole(req, res, db, 'boyfriend');
    if (!user) return;
    const body = await readBody(req);
    const index = db.dishes.findIndex(item => item.id === adminDishMatch[1]);
    if (index < 0) {
      notFound(res);
      return;
    }
    db.dishes[index] = normalizeDish({ ...db.dishes[index], ...body, id: db.dishes[index].id, updatedBy: user.id });
    writeDb(db);
    sendJson(res, 200, db.dishes[index]);
    return;
  }

  notFound(res);
}

const server = http.createServer((req, res) => {
  route(req, res).catch(error => {
    sendJson(res, 500, { message: error.message || '服务开小差了' });
  });
});

server.listen(config.server.port, () => {
  ensureDb();
  console.log(`Girlfriend menu API is running at http://localhost:${config.server.port}`);
  console.log(`Local database: ${config.storage.dbPath}`);
});
