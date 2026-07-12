const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    loggedIn: false,
    user: {},
    roleText: '',
    orders: []
  },

  onShow() {
    this.refreshSession();
  },

  refreshSession() {
    const session = app.getSession();
    const user = session && session.user ? session.user : {};
    this.setData({
      loggedIn: Boolean(session && session.token),
      user,
      roleText: user.role === 'boyfriend' ? '男友端' : '女友端',
      orders: []
    });
  },

  goLogin(event) {
    const role = event.currentTarget.dataset.role;
    wx.navigateTo({ url: `/pages/login/login?role=${role}` });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/order/order' });
  },

  goManage() {
    wx.navigateTo({ url: '/pages/manage/manage' });
  },

  loadOrders() {
    api.getAdminOrders()
      .then(orders => {
        this.setData({
          orders: orders.slice(0, 5).map(order => ({
            ...order,
            itemsText: order.items.map(item => item.dishName).join('、')
          }))
        });
      })
      .catch(error => wx.showToast({ title: error.message, icon: 'none' }));
  },

  logout() {
    api.logout().catch(() => {}).finally(() => {
      app.clearSession();
      this.refreshSession();
      wx.showToast({ title: '已退出', icon: 'success' });
    });
  }
});
