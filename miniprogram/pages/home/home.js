const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    greeting: '晚上好呀',
    copywriting: {
      girlfriendName: '小宝',
      homeSlogan: '今天也要好好吃饭。想吃什么都可以点，男友负责安排。'
    },
    recommended: [],
    cartCount: 0,
    showRandom: false,
    states: ['有点累', '想吃甜', '想吃热乎', '没胃口', '想吃大餐'],
    randomState: '有点累',
    combo: { items: [], reason: '' }
  },

  onShow() {
    this.setData({ cartCount: app.getCart().length });
    this.loadHome();
  },

  loadHome() {
    api.getHome()
      .then(data => {
        this.setData({
          greeting: data.greeting,
          copywriting: data.copywriting,
          recommended: data.recommended.map(dish => ({
            ...dish,
            tagsText: dish.tags.slice(0, 2).join(' · ')
          }))
        });
      })
      .catch(() => wx.showToast({ title: '首页加载失败', icon: 'none' }));
  },

  goMenu() {
    wx.switchTab({ url: '/pages/menu/menu' });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/order/order' });
  },

  goDetail(event) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}` });
  },

  openRandom() {
    this.setData({ showRandom: true });
    this.refreshCombo();
  },

  closeRandom() {
    this.setData({ showRandom: false });
  },

  noop() {},

  chooseState(event) {
    this.setData({ randomState: event.currentTarget.dataset.state });
    this.refreshCombo();
  },

  refreshCombo() {
    api.getRandomCombo(this.data.randomState)
      .then(combo => this.setData({ combo }))
      .catch(() => wx.showToast({ title: '推荐失败啦', icon: 'none' }));
  },

  addCombo() {
    this.data.combo.items.forEach(dish => {
      app.addToCart({
        dishId: dish.id,
        dishName: dish.name,
        emoji: dish.emoji,
        cookTime: dish.cookTime,
        portion: '正常',
        tastes: dish.tags.slice(0, 2),
        note: ''
      });
    });
    this.setData({ cartCount: app.getCart().length, showRandom: false });
    wx.showToast({ title: '已加入点菜单', icon: 'success' });
  }
});
