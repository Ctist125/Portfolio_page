// 프로젝트 내 파일
const db = require("../data/database");

class Management {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  // 처음 database가 제대로 구축되지 않았을 때 오류를 없애기 위한 구문F
  async serviceFindByServiceName() {
    return await db
      .getDb()
      .collection("management")
      .findOne({ serviceName: this.serviceName });
  }

  async signupFunction(value) {
    const check = await this.serviceFindByServiceName();

    if (check) {
      return await db
        .getDb()
        .collection("management")
        .updateOne(
          { serviceName: this.serviceName },
          { $set: { value: value } }
        );
    } else {
      return await db
        .getDb()
        .collection("management")
        .insertOne({ serviceName: this.serviceName, value: value });
    }
  }
}

module.exports = Management;
