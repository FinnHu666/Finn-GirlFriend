const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    role: 'girlfriend',
    username: 'girlfriend',
    password: '123456',
    redirect: ''
  },

  onLoad(query) {
    const role = query.role || 'girlfriend';
    this.setData({
      role,
      username: role === 'boyfriend' ? 'boyfriend' : 'girlfriend',
      redirect: query.redirect || ''
    });
  },

  chooseRole(event) {
    const role = event.currentTarget.dataset.role;
    this.setData({
      role,
      username: role === 'boyfriend' ? 'boyfriend' : 'girlfriend'
    });
  },

  onUsernameInput(event) {
    this.setData({ username: event.detail.value });
  },

  onPasswordInput(event) {
    this.setData({ password: event.detail.value });
  },

  submitLogin() {
    api.login({
      username: this.data.username,
      password: this.data.password
    }).then(session => {
      app.setSession(session);
      wx.showToast({ title: '登录成功', icon: 'success' });
      const redirect = this.data.redirect;
      setTimeout(() => {
        if (redirect === 'manage' && session.user.role === 'boyfriend') {
          wx.redirectTo({ url: '/pages/manage/manage' });
          return;
        }
        wx.switchTab({ url: '/pages/my/my' });
      }, 350);
    }).catch(error => wx.showToast({ title: error.message, icon: 'none' }));
  }
});
