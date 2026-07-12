const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    dish: {},
    tasteOptions: ['清淡', '正常', '重口', '微辣', '不要香菜', '多放土豆', '少油', '多汤汁'],
    portionOptions: ['小份', '正常', '多一点'],
    selectedTastes: ['正常'],
    portion: '正常',
    note: ''
  },

  onLoad(query) {
    this.dishId = query.id;
    this.loadDish();
  },

  loadDish() {
    api.getDish(this.dishId)
      .then(dish => {
        wx.setNavigationBarTitle({ title: dish.name });
        this.setData({
          dish,
          selectedTastes: dish.tags && dish.tags.length ? [dish.tags[0]] : ['正常']
        });
      })
      .catch(() => wx.showToast({ title: '菜品加载失败', icon: 'none' }));
  },

  toggleTaste(event) {
    const value = event.currentTarget.dataset.value;
    const selected = this.data.selectedTastes.slice();
    const index = selected.indexOf(value);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(value);
    }
    this.setData({ selectedTastes: selected });
  },

  choosePortion(event) {
    this.setData({ portion: event.currentTarget.dataset.value });
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value });
  },

  addToCart() {
    const { dish, selectedTastes, portion, note } = this.data;
    app.addToCart({
      dishId: dish.id,
      dishName: dish.name,
      emoji: dish.emoji,
      cookTime: dish.cookTime,
      portion,
      tastes: selectedTastes,
      note
    });
    wx.showModal({
      title: '已加入今日点菜单 ❤️',
      content: '要不要再选一道汤或者甜品？',
      cancelText: '去确认',
      confirmText: '继续点菜',
      success(res) {
        if (res.confirm) {
          wx.switchTab({ url: '/pages/menu/menu' });
        } else {
          wx.switchTab({ url: '/pages/order/order' });
        }
      }
    });
  }
});
