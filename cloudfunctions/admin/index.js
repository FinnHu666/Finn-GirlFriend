const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { action, token, id, dishData } = event;

  // ========== 权限校验 ==========
  async function checkBoyfriend() {
    if (!token) return null;
    const sessions = await db.collection("sessions").where({ token }).get();
    if (!sessions.data.length) return null;
    const userRes = await db.collection("users").doc(sessions.data[0].userId).get();
    if (!userRes.data || userRes.data.role !== "boyfriend") return null;
    return userRes.data;
  }

  // ========== 查看所有订单 ==========
  if (action === "orders") {
    const user = await checkBoyfriend();
    if (!user) return { code: 403, message: "当前角色没有权限哦" };
    const { data } = await db.collection("orders")
      .orderBy("createdAt", "desc")
      .get();
    return { code: 200, data };
  }

  // ========== 新增菜品 ==========
  if (action === "addDish") {
    const user = await checkBoyfriend();
    if (!user) return { code: 403, message: "当前角色没有权限哦" };
    if (!dishData || !dishData.name) return { code: 400, message: "菜名必填" };
    const dish = {
      ...dishData,
      tags: Array.isArray(dishData.tags) ? dishData.tags : [],
      cookTime: Number(dishData.cookTime) || 0,
      loveScore: Number(dishData.loveScore) || 3,
      recommended: Boolean(dishData.recommended),
      hidden: Boolean(dishData.hidden),
      available: dishData.available !== false,
      createdBy: user._id,
      createdAt: new Date()
    };
    const res = await db.collection("dishes").add({ data: dish });
    return { code: 201, data: { id: res._id, ...dish } };
  }

  // ========== 修改菜品 ==========
  if (action === "updateDish") {
    const user = await checkBoyfriend();
    if (!user) return { code: 403, message: "当前角色没有权限哦" };
    if (!id) return { code: 400, message: "缺少菜品 ID" };
    const existing = await db.collection("dishes").doc(id).get();
    if (!existing.data) return { code: 404, message: "菜品不存在" };
    const updated = {
      ...existing.data,
      ...dishData,
      tags: dishData.tags !== undefined ? (Array.isArray(dishData.tags) ? dishData.tags : []) : existing.data.tags,
      cookTime: dishData.cookTime !== undefined ? Number(dishData.cookTime) : existing.data.cookTime,
      loveScore: dishData.loveScore !== undefined ? Number(dishData.loveScore) : existing.data.loveScore,
      recommended: dishData.recommended !== undefined ? Boolean(dishData.recommended) : existing.data.recommended,
      hidden: dishData.hidden !== undefined ? Boolean(dishData.hidden) : existing.data.hidden,
      available: dishData.available !== undefined ? dishData.available : existing.data.available,
      updatedBy: user._id,
      updatedAt: new Date()
    };
    await db.collection("dishes").doc(id).update({ data: updated });
    return { code: 200, data: updated };
  }

  return { code: 400, message: "未知操作" };
};
