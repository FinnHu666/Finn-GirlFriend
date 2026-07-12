const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { action, data, id } = event;

  // ========== 创建订单 ==========
  if (action === "create") {
    if (!data || !data.items || !data.items.length) {
      return { code: 400, message: "点菜单不能为空哦" };
    }
    const order = {
      userId: data.userId || "",
      items: data.items,
      mood: data.mood || "",
      hungerLevel: data.hungerLevel || "",
      expectTime: data.expectTime || "",
      note: data.note || "",
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await db.collection("orders").add({ data: order });
    return { code: 201, data: { id: res._id, ...order } };
  }

  // ========== 查询订单 ==========
  if (action === "get") {
    if (!id) return { code: 400, message: "缺少订单 ID" };
    const { data: order } = await db.collection("orders").doc(id).get();
    if (!order) return { code: 404, message: "订单不存在" };
    return { code: 200, data: order };
  }

  return { code: 400, message: "未知操作" };
};
