const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    categories: [],
    categoriesWithoutAll: [],
    dishes: [],
    displayedDishes: [],
    orders: [],
    activeTab: 'dishes',
    dishFilter: 'all',
    dishFilterOptions: [
      { id: 'all', name: '全部' },
      { id: 'available', name: '已上架' },
      { id: 'unavailable', name: '已下架' },
      { id: 'hidden', name: '隐藏菜' }
    ],
    orderStatuses: ['已提交', '准备中', '已完成', '已取消'],
    form: {
      name: '',
      emoji: '🍽️',
      description: '',
      category: 'meat',
      tags: '惊喜',
      cookTime: '30'
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
    Promise.all([
      api.getDishes({ category: 'all', includeUnavailable: 'true', includeHidden: 'true' }),
      api.getAdminOrders()
    ])
      .then(([data, orders]) => {
        const categoryMap = data.categories.reduce((map, category) => {
          map[category.id] = category.name;
          return map;
        }, {});
        const dishes = data.dishes.map(dish => ({
          ...dish,
          categoryName: categoryMap[dish.category] || dish.category,
          tagsText: dish.tags.join('、')
        }));
        this.setData({
          categories: data.categories,
          categoriesWithoutAll: data.categories.filter(item => item.id !== 'all'),
          dishes,
          orders: orders.map(order => ({
            ...order,
            itemsText: order.items.map(item => `${item.dishName} × ${item.portion || 1}`).join('、'),
            createdAtText: (order.date || '').replace('T', ' ').slice(0, 16)
          }))
        }, () => this.applyDishFilter());
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

  changeTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab });
  },

  chooseDishFilter(event) {
    this.setData({ dishFilter: event.currentTarget.dataset.id }, () => this.applyDishFilter());
  },

  applyDishFilter() {
    const { dishes, dishFilter } = this.data;
    const displayedDishes = dishes.filter(dish => {
      if (dishFilter === 'available') return dish.available && !dish.hidden;
      if (dishFilter === 'unavailable') return !dish.available;
      if (dishFilter === 'hidden') return dish.hidden;
      return true;
    });
    this.setData({ displayedDishes });
  },

  createDish() {
    const form = this.data.form;
    if (!form.name || !form.description) {
      wx.showToast({ title: '菜名和描述要填写哦', icon: 'none' });
      return;
    }
    api.createDish({
      ...form,
      tags: form.tags.split(/[、,，\s]+/).filter(Boolean),
      cookTime: Number(form.cookTime) || 30,
      difficulty: '简单',
      loveScore: 3,
      recommended: false,
      hidden: form.category === 'hidden',
      available: true
    }).then(() => {
      wx.showToast({ title: '已新增', icon: 'success' });
      this.setData({ form: { name: '', emoji: '🍽️', description: '', category: 'meat', tags: '惊喜', cookTime: '30' } });
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
  },

  updateOrderStatus(event) {
    const id = event.currentTarget.dataset.id;
    const status = event.currentTarget.dataset.status;
    api.updateOrder(id, { status })
      .then(() => {
        wx.showToast({ title: `已更新为${status}`, icon: 'success' });
        this.loadData();
      })
      .catch(error => wx.showToast({ title: error.message || '订单更新失败', icon: 'none' }));
  }
});
