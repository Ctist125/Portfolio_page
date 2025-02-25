// 외부 라이브러리 선언
const mongodb = require("mongodb");

// 프로젝트 내 파일
const db = require("../data/database");

class History {
  constructor(historyInfo) {
    this.historyInfo = historyInfo;
  }

  async allList() {
    return await db.getDb().collection("history").find().toArray();
  }

  async findById(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db.getDb().collection("history").findOne({ _id: objectId });
  }

  async writingHistory() {
    const history = {
      ...this.historyInfo,
      status: "view",
    };

    return await db.getDb().collection("history").insertOne(history);
  }

  async deleteById(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db.getDb().collection("history").deleteOne({ _id: objectId });
  }

  async managementById(id, value) {
    const objectId = new mongodb.ObjectId(id);

    return await db
      .getDb()
      .collection("history")
      .updateOne({ _id: objectId }, { $set: { status: value } });
  }

  async updateById(id) {
    const objectId = new mongodb.ObjectId(id);

    const history = {
      ...this.historyInfo,
      status: "view",
    };

    return db.getDb().collection("history").updateOne({ _id: objectId }, { $set: { ...history } });
  }
}

module.exports = History;
