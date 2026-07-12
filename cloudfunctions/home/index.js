const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async () => {
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "早安呀" : hour < 18 ? "午安呀" : "晚上好呀";

  // 获取推荐菜品
  const rec = await db.collection("dishes")
    .where({ recommended: true, hidden: _.neq(true) })
    .limit(3)
    .get();

  // 获取文案
  const cw = await db.collection("copywriting")
    .where({ key: "home" })
    .limit(1)
    .get();

  const copywriting = cw.data.length ? cw.data[0] : {
    girlfriendName: "小宝",
    homeSlogan: "今天也要好好吃饭。想吃什么都可以点，男友负责安排。"
  };

  return {
    code: 200,
    data: {
      greeting,
      copywriting: {
        girlfriendName: copywriting.girlfriendName || "小宝",
        homeSlogan: copywriting.homeSlogan || "今天也要好好吃饭"
      },
      recommended: rec.data
    }
  };
};
