const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    categories: [],
    tasteTags: [],
    dishes: [],
    activeCategory: 'all',
    activeTag: '推荐',
    keyword: '',
    cartCount: 0
  },

  onShow() {
    this.setData({ cartCount: app.getCart().length });
    this.loadDishes();
  },

  loadDishes() {
    api.getDishes({
      category: this.data.activeCategory,
      tag: this.data.activeTag === '推荐' ? '' : this.data.activeTag,
      keyword: this.data.keyword
    }).then(data => {
      this.setData({
        categories: data.categories,
        tasteTags: data.tasteTags,
        dishes: data.dishes
      });
    }).catch(() => wx.showToast({ title: '菜单加载失败', icon: 'none' }));
  },

  chooseCategory(event) {
    this.setData({ activeCategory: event.currentTarget.dataset.id });
    this.loadDishes();
  },

  chooseTag(event) {
    const tag = event.currentTarget.dataset.tag;
    this.setData({ activeTag: this.data.activeTag === tag ? '推荐' : tag });
    this.loadDishes();
  },

  onSearchInput(event) {
    this.setData({ keyword: event.detail.value });
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadDishes(), 250);
  },

  goDetail(event) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}` });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/order/order' });
  },

  quickAdd(event) {
    const dish = this.data.dishes.find(item => item.id === event.currentTarget.dataset.id);
    app.addToCart({
      dishId: dish.id,
      dishName: dish.name,
      emoji: dish.emoji,
      cookTime: dish.cookTime,
      portion: '正常',
      tastes: dish.tags.slice(0, 2),
      note: ''
    });
    this.setData({ cartCount: app.getCart().length });
    wx.showToast({ title: '已加入点菜单', icon: 'success' });
  }
});
