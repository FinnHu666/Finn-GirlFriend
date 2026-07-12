const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    order: { items: [] },
    reply: '收到，马上安排，宝宝等我投喂。'
  },

  onLoad(query) {
    const cached = wx.getStorageSync(app.globalData.latestOrderKey);
    if (cached) {
      this.setData({ order: cached, reply: cached.reply || this.data.reply });
    }
    if (query.id) {
      api.getOrder(query.id)
        .then(order => this.setData({ order, reply: order.reply || this.data.reply }))
        .catch(() => {});
    }
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' });
  },

  goMenu() {
    wx.switchTab({ url: '/pages/menu/menu' });
  }
});
