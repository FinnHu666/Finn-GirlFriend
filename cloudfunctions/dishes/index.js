const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { action, id, categoryId, keyword, tasteTag, state } = event;

  // ========== 菜品列表 ==========
  if (action === "list") {
    let query = db.collection("dishes").where({ hidden: _.neq(true) });
    if (categoryId) query = query.where({ categoryId });
    if (tasteTag) query = query.where({ tags: _.in([tasteTag]) });
    if (keyword) {
      query = query.where(_.or([
        { name: db.RegExp({ regexp: keyword, options: "i" }) },
        { description: db.RegExp({ regexp: keyword, options: "i" }) }
      ]));
    }
    const { data: dishes } = await query.get();
    const { data: categories } = await db.collection("categories").get();
    const { data: tasteTags } = await db.collection("tasteTags").get();
    return { code: 200, data: { dishes, categories, tasteTags } };
  }

  // ========== 菜品详情 ==========
  if (action === "detail") {
    if (!id) return { code: 400, message: "缺少菜品 ID" };
    const { data } = await db.collection("dishes").doc(id).get();
    if (!data) return { code: 404, message: "没有找到这个菜品" };
    return { code: 200, data };
  }

  // ========== 随机推荐 ==========
  if (action === "random") {
    const { data: all } = await db.collection("dishes")
      .where({ hidden: _.neq(true) })
      .get();
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 3);
    const reasons = {
      "有点累": "累了就该犒劳一下自己 ~",
      "想吃甜": "甜食让人心情好，试试这道！",
      "想吃热乎": "热乎乎的饭菜最治愈了",
      "没胃口": "来点开胃的，唤醒你的味蕾",
      "想吃大餐": "安排！今天吃顿好的"
    };
    return {
      code: 200,
      data: {
        items: shuffled,
        reason: reasons[state] || "随机为你搭配了一组 ~"
      }
    };
  }

  return { code: 400, message: "未知操作" };
};
