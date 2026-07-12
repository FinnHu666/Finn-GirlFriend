const { API_BASE_URL } = require('./config');
const app = getApp();

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const session = app.getSession ? app.getSession() : null;
    const header = {
      'content-type': 'application/json'
    };
    if (session && session.token) {
      header.Authorization = `Bearer ${session.token}`;
    }

    wx.request({
      url: `${API_BASE_URL}${path}`,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        const message = res.data && res.data.message ? res.data.message : '请求失败啦，稍后再试试';
        if (res.statusCode === 401) {
          app.clearSession && app.clearSession();
        }
        reject(new Error(message));
      },
      fail(err) {
        reject(err);
      }
    });
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
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    return request(`/api/dishes${query ? `?${query}` : ''}`);
  },

  getDish(id) {
    return request(`/api/dishes/${id}`);
  },

  getRandomCombo(state = '') {
    const suffix = state ? `?state=${encodeURIComponent(state)}` : '';
    return request(`/api/recommend/random${suffix}`);
  },

  createOrder(order) {
    return request('/api/orders', {
      method: 'POST',
      data: order
    });
  },

  getOrder(id) {
    return request(`/api/orders/${id}`);
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
    return request(`/api/admin/dishes/${id}`, {
      method: 'PUT',
      data: patch
    });
  }
};
