App({
  onLaunch() {
    // 初始化微信云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: "你的云开发环境ID" // 开通云开发后替换为实际环境 ID
      });
    }
  },

  globalData: {
    cartKey: "feeding_cart",
    latestOrderKey: "latest_order",
    authKey: "auth_session"
  },

  getSession() {
    return wx.getStorageSync(this.globalData.authKey) || null;
  },

  setSession(session) {
    wx.setStorageSync(this.globalData.authKey, session);
  },

  clearSession() {
    wx.removeStorageSync(this.globalData.authKey);
  },

  isLoggedIn() {
    const session = this.getSession();
    return Boolean(session && session.token && session.user);
  },

  hasRole(role) {
    const session = this.getSession();
    return Boolean(session && session.user && session.user.role === role);
  },

  getCart() {
    return wx.getStorageSync(this.globalData.cartKey) || [];
  },

  setCart(cart) {
    wx.setStorageSync(this.globalData.cartKey, cart);
  },

  addToCart(item) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(cartItem => cartItem.dishId === item.dishId);
    if (existingIndex >= 0) {
      cart[existingIndex] = { ...cart[existingIndex], ...item };
    } else {
      cart.push(item);
    }
    this.setCart(cart);
    return cart;
  },

  removeFromCart(dishId) {
    const cart = this.getCart().filter(item => item.dishId !== dishId);
    this.setCart(cart);
    return cart;
  },

  clearCart() {
    this.setCart([]);
  }
});
