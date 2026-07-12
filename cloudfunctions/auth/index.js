const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { action } = event;

  // ========== 登录 ==========
  if (action === "login") {
    const { username, password } = event;
    const res = await db.collection("users")
      .where({ username, password })
      .get();
    if (!res.data.length) {
      return { code: 401, message: "账号或密码错误" };
    }
    const user = res.data[0];
    // 生成 token
    const token = "tk_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    await db.collection("sessions").add({
      data: {
        token,
        userId: user._id,
        createdAt: new Date()
      }
    });
    const { password: _, ...safeUser } = user;
    return { code: 200, data: { token, user: safeUser } };
  }

  // ========== 获取当前用户 ==========
  if (action === "me") {
    const { token } = event;
    if (!token) return { code: 401, message: "请先登录" };
    const sessions = await db.collection("sessions").where({ token }).get();
    if (!sessions.data.length) return { code: 401, message: "登录已过期" };
    const userRes = await db.collection("users").doc(sessions.data[0].userId).get();
    if (!userRes.data) return { code: 401, message: "用户不存在" };
    const { password: _, ...safeUser } = userRes.data;
    return { code: 200, data: safeUser };
  }

  // ========== 注销 ==========
  if (action === "logout") {
    const { token } = event;
    if (token) {
      await db.collection("sessions").where({ token }).remove();
    }
    return { code: 200, message: "已退出" };
  }

  return { code: 400, message: "未知操作" };
};
