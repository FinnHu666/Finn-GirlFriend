const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    items: [],
    hungerOptions: ['一点点饿', '正常饿', '非常饿', '饿到要闹了'],
    moodOptions: ['开心', '累了', '想被哄', '想吃甜'],
    timeOptions: ['18:30', '19:00', '19:30', '自定义'],
    hungerLevel: '正常饿',
    mood: '开心',
    expectedTime: '19:00',
    note: '',
    totalCookTime: 0
  },

  onShow() {
    this.refreshCart();
  },

  refreshCart() {
    const cart = app.getCart().map(item => ({
      ...item,
      tastesText: (item.tastes || []).join('、') || '正常'
    }));
    const totalCookTime = cart.reduce((sum, item) => sum + (Number(item.cookTime) || 0), 0);
    this.setData({ items: cart, totalCookTime });
  },

  goMenu() {
    wx.switchTab({ url: '/pages/menu/menu' });
  },

  editItem(event) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}` });
  },

  removeItem(event) {
    const dishId = event.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除吗？',
      content: '要把这道菜从今日菜单里移除吗？',
      cancelText: '再想想',
      confirmText: '确认删除',
      success: res => {
        if (res.confirm) {
          app.removeFromCart(dishId);
          this.refreshCart();
        }
      }
    });
  },

  chooseHunger(event) {
    this.setData({ hungerLevel: event.currentTarget.dataset.value });
  },

  chooseMood(event) {
    this.setData({ mood: event.currentTarget.dataset.value });
  },

  chooseTime(event) {
    this.setData({ expectedTime: event.currentTarget.dataset.value });
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value });
  },

  submitOrder() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: '/pages/login/login?role=girlfriend' });
      return;
    }
    if (!app.hasRole('girlfriend')) {
      wx.showToast({ title: '只有女友可以提交点菜单哦', icon: 'none' });
      return;
    }
    if (!this.data.items.length) {
      wx.showToast({ title: '先选一道菜吧', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '提交今日投喂订单？',
      content: `共 ${this.data.items.length} 道菜，预计 ${this.data.totalCookTime} 分钟。`,
      success: res => {
        if (!res.confirm) return;
        api.createOrder({
          items: this.data.items,
          hungerLevel: this.data.hungerLevel,
          mood: this.data.mood,
          expectedTime: this.data.expectedTime,
          note: this.data.note,
          totalCookTime: this.data.totalCookTime
        }).then(order => {
          wx.setStorageSync(app.globalData.latestOrderKey, order);
          app.clearCart();
          wx.navigateTo({ url: `/pages/success/success?id=${order.id}` });
        }).catch(error => wx.showToast({ title: error.message || '提交失败啦', icon: 'none' }));
      }
    });
  }
});
