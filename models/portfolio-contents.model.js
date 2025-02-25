// 외부 라이브러리 선언
const mongodb = require("mongodb");

// 프로젝트 내 파일
const db = require("../data/database");

class Contents {
  constructor(contentsData) {
    this.contentsData = contentsData;
  }

  async allList() {
    return await db.getDb().collection("contents").find().toArray();
  }

  async findById(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db.getDb().collection("contents").findOne({ _id: objectId });
  }

  async findByLanguage(language) {
    return await db
      .getDb()
      .collection("contents")
      .find({ language: language })
      .toArray();
  }

  async save() {
    const contentsData = {
      ...this.contentsData,
      status: "view",
    };

    await db.getDb().collection("contents").insertOne(contentsData);
  }

  async updateById(id) {
    const objectId = new mongodb.ObjectId(id);

    const contentsData = {
      ...this.contentsData,
      status: "view",
    };

    return await db
      .getDb()
      .collection("contents")
      .updateOne({ _id: objectId }, { $set: { ...contentsData } });
  }

  async managementById(id, value) {
    const objectId = new mongodb.ObjectId(id);

    return await db
      .getDb()
      .collection("contents")
      .updateOne({ _id: objectId }, { $set: { status: value } });
  }

  async deleteById(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db.getDb().collection("contents").deleteOne({ _id: objectId });
  }
}

module.exports = Contents;
