// 외부 라이브러리 선언
const mongodb = require("mongodb");

// 프로젝트 내 파일
const db = require("../data/database");

class Skills {
  constructor(language, link, group) {
    this.language = language;
    this.link = link;
    this.group = group;
  }

  async allList() {
    return await db.getDb().collection("skills").find().toArray();
  }

  async findByGroup(languageGroup) {
    return await db
      .getDb()
      .collection("skills")
      .find({ group: languageGroup })
      .toArray();
  }

  async deleteSkill(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db.getDb().collection("skills").deleteOne({ _id: objectId });
  }

  async save() {
    const inputValue = {
      language: this.language,
      link: this.link,
      group: this.group,
    };

    return db.getDb().collection("skills").insertOne(inputValue);
  }
}

module.exports = Skills;
