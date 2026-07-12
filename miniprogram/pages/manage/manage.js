const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    categories: [],
    categoriesWithoutAll: [],
    dishes: [],
    form: {
      name: '',
      emoji: '🍽️',
      description: '',
      category: 'meat'
    }
  },

  onShow() {
    if (!app.isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login?role=boyfriend&redirect=manage' });
      return;
    }
    if (!app.hasRole('boyfriend')) {
      wx.showToast({ title: '只有男友可以管理菜单哦', icon: 'none' });
      setTimeout(() => wx.switchTab({ url: '/pages/my/my' }), 500);
      return;
    }
    this.loadData();
  },

  loadData() {
    api.getDishes({ category: 'all', includeUnavailable: 'true', includeHidden: 'true' })
      .then(data => {
        const categoryMap = data.categories.reduce((map, category) => {
          map[category.id] = category.name;
          return map;
        }, {});
        this.setData({
          categories: data.categories,
          categoriesWithoutAll: data.categories.filter(item => item.id !== 'all'),
          dishes: data.dishes.map(dish => ({
            ...dish,
            categoryName: categoryMap[dish.category] || dish.category,
            tagsText: dish.tags.join('、')
          }))
        });
      })
      .catch(error => wx.showToast({ title: error.message || '管理数据加载失败', icon: 'none' }));
  },

  onFormInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  chooseCategory(event) {
    this.setData({ 'form.category': event.currentTarget.dataset.id });
  },

  createDish() {
    const form = this.data.form;
    if (!form.name || !form.description) {
      wx.showToast({ title: '菜名和描述要填写哦', icon: 'none' });
      return;
    }
    api.createDish({
      ...form,
      tags: ['惊喜'],
      cookTime: 30,
      difficulty: '简单',
      loveScore: 3,
      recommended: false,
      hidden: form.category === 'hidden',
      available: true
    }).then(() => {
      wx.showToast({ title: '已新增', icon: 'success' });
      this.setData({ form: { name: '', emoji: '🍽️', description: '', category: 'meat' } });
      this.loadData();
    }).catch(error => wx.showToast({ title: error.message || '新增失败', icon: 'none' }));
  },

  toggleRecommend(event) {
    const id = event.currentTarget.dataset.id;
    const dish = this.data.dishes.find(item => item.id === id);
    this.updateDish(id, { recommended: !dish.recommended });
  },

  toggleHidden(event) {
    const id = event.currentTarget.dataset.id;
    const dish = this.data.dishes.find(item => item.id === id);
    this.updateDish(id, { hidden: !dish.hidden });
  },

  toggleAvailable(event) {
    const id = event.currentTarget.dataset.id;
    const dish = this.data.dishes.find(item => item.id === id);
    this.updateDish(id, { available: !dish.available });
  },

  updateDish(id, patch) {
    api.updateDish(id, patch)
      .then(() => this.loadData())
      .catch(error => wx.showToast({ title: error.message || '更新失败', icon: 'none' }));
  }
});
