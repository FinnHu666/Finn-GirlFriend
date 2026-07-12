const app = getApp();

/**
 * 统一的云函数调用封装
 * 自动附带登录 token，处理 401 登出
 */
function callCloud(name, data = {}) {
  const session = app.getSession();
  if (session && session.token) {
    data.token = session.token;
  }
  return wx.cloud.callFunction({ name, data })
    .then(res => {
      if (res.result.code === 401) {
        app.clearSession();
      }
      if (res.result.code >= 400) {
        throw new Error(res.result.message || "请求失败");
      }
      return res.result.data;
    });
}

module.exports = {
  // ===== 认证 =====
  login(payload) {
    return callCloud("auth", { action: "login", ...payload });
  },
  logout() {
    return callCloud("auth", { action: "logout" });
  },
  getMe() {
    return callCloud("auth", { action: "me" });
  },

  // ===== 首页 =====
  getHome() {
    return callCloud("home");
  },

  // ===== 菜品 =====
  getDishes(params = {}) {
    return callCloud("dishes", { action: "list", ...params });
  },
  getDish(id) {
    return callCloud("dishes", { action: "detail", id });
  },
  getRandomCombo(state = "") {
    return callCloud("dishes", { action: "random", state });
  },

  // ===== 订单 =====
  createOrder(order) {
    return callCloud("orders", { action: "create", data: order });
  },
  getOrder(id) {
    return callCloud("orders", { action: "get", id });
  },

  // ===== 管理端（男友） =====
  getAdminOrders() {
    return callCloud("admin", { action: "orders" });
  },
  createDish(dish) {
    return callCloud("admin", { action: "addDish", dishData: dish });
  },
  updateDish(id, patch) {
    return callCloud("admin", { action: "updateDish", id, dishData: patch });
  }
};
