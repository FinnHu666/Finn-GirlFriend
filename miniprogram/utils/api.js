const app = getApp();

/**
 * 云托管模式：通过 wx.cloud.callContainer 调用 Node.js 后端
 * 无需域名、无需备案、自动 HTTPS
 */
function request(path, options = {}) {
  const session = app.getSession();
  const header = { 'content-type': 'application/json' };
  if (session && session.token) {
    header.Authorization = 'Bearer ' + session.token;
  }

  return wx.cloud.callContainer({
    config: {
      env: 'prod-d8gqx4z5od98e2c0a'  // 环境 ID
    },
    path: path,
    method: options.method || 'GET',
    data: options.data,
    header: header
  }).then(res => {
    const data = res.data;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return data;
    }
    const message = (data && data.message) ? data.message : '请求失败啦';
    if (res.statusCode === 401) {
      app.clearSession();
    }
    throw new Error(message);
  }).catch(err => {
    if (err.message && err.message.indexOf('401') === -1) {
      throw err;
    }
    throw err;
  });
}

module.exports = {
  login(payload) {
    return request('/api/auth/login', {
      method: 'POST',
      data: payload
    });
  },

  logout() {
    return request('/api/auth/logout', {
      method: 'POST'
    });
  },

  getMe() {
    return request('/api/auth/me');
  },

  getHome() {
    return request('/api/home');
  },

  getDishes(params = {}) {
    const query = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '')
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
      .join('&');
    return request('/api/dishes' + (query ? '?' + query : ''));
  },

  getDish(id) {
    return request('/api/dishes/' + id);
  },

  getRandomCombo(state = '') {
    const suffix = state ? '?state=' + encodeURIComponent(state) : '';
    return request('/api/recommend/random' + suffix);
  },

  createOrder(order) {
    return request('/api/orders', {
      method: 'POST',
      data: order
    });
  },

  getOrder(id) {
    return request('/api/orders/' + id);
  },

  getAdminOrders() {
    return request('/api/admin/orders');
  },

  createDish(dish) {
    return request('/api/admin/dishes', {
      method: 'POST',
      data: dish
    });
  },

  updateDish(id, patch) {
    return request('/api/admin/dishes/' + id, {
      method: 'PUT',
      data: patch
    });
  }
};
