// 외부 라이브러리 선언
const mongodb = require("mongodb");

// 프로젝트 내 파일
const db = require("../data/database");

class Comments {
  constructor(comment) {
    this.comment = comment;
  }

  async findById(id) {
    const commentsId = new mongodb.ObjectId(id);

    return await db.getDb().collection("comments").findOne({ _id: commentsId });
  }

  async findByContentsId(contentsId) {
    return await db
      .getDb()
      .collection("comments")
      .find({ contentsId: contentsId })
      .toArray();
  }

  async writingComment() {
    return await db.getDb().collection("comments").insertOne(this.comment);
  }

  async deleteById(id) {
    const commentsId = new mongodb.ObjectId(id);

    return await db
      .getDb()
      .collection("comments")
      .deleteOne({ _id: commentsId });
  }
}

module.exports = Comments;
