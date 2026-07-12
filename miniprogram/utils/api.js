const config = require('./config');
const app = getApp();

/**
 * 统一请求层
 * - 本地模式 (USE_CLOUD=false): wx.request → localhost:3000
 * - 云托管模式 (USE_CLOUD=true):  wx.cloud.callContainer
 */
function request(path, options = {}) {
  const session = app.getSession ? app.getSession() : null;
  const header = { 'content-type': 'application/json' };
  if (session && session.token) {
    header.Authorization = 'Bearer ' + session.token;
  }

  if (config.USE_CLOUD) {
    // ========= 云托管模式 =========
    return wx.cloud.callContainer({
      config: {
        env: config.CLOUD_ENV,
        serviceName: config.CLOUD_SERVICE
      },
      path: path,
      method: options.method || 'GET',
      data: options.data,
      header: header
    }).then(res => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        return res.data;
      }
      const message = res.data && res.data.message ? res.data.message : '请求失败啦';
      if (res.statusCode === 401) {
        app.clearSession && app.clearSession();
      }
      throw new Error(message);
    }).catch(err => {
      if (err && err.errMsg && err.errMsg.indexOf('callContainer:fail') !== -1) {
        throw new Error('云托管连接失败，请检查服务是否已部署');
      }
      throw err;
    });
  }

  // ========= 本地开发模式 =========
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.API_BASE_URL + path,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        const message = res.data && res.data.message ? res.data.message : '请求失败啦';
        if (res.statusCode === 401) {
          app.clearSession && app.clearSession();
        }
        reject(new Error(message));
      },
      fail(err) {
        const errMsg = err && err.errMsg ? err.errMsg : '网络请求失败';
        if (errMsg.indexOf('timeout') !== -1) {
          reject(new Error('请求超时，请检查网络或后端服务'));
        } else if (errMsg.indexOf('fail: url not in domain list') !== -1) {
          reject(new Error('域名未配置：请在开发者工具中勾选\"不校验合法域名\"'));
        } else {
          reject(new Error('连接失败：请确认后端服务 ' + config.API_BASE_URL + ' 已启动'));
        }
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
