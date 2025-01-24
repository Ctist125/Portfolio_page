// 외부 라이브러리
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");

// 프로젝트 내 파일
const db = require("../data/database");

class Auth {
  constructor(userName, email, pw) {
    this.userName = userName;
    this.email = email;
    this.pw = pw;
  }

  async allList() {
    return await db.getDb().collection("users").find().toArray();
  }

  async findById(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db.getDb().collection("users").findOne({ _id: objectId });
  }

  async findByUserName() {
    return await db
      .getDb()
      .collection("users")
      .findOne({ userName: this.userName });
  }

  async findByEmail() {
    return await db.getDb().collection("users").findOne({ email: this.email });
  }

  async findByLock() {
    return await db.getDb().collection("users").find({ lock: true }).toArray();
  }

  async signup() {
    const hashedPassword = await bcrypt.hash(this.pw, 12);

    const date = new Date();

    await db
      .getDb()
      .collection("users")
      .insertOne({
        userName: this.userName,
        email: this.email,
        pw: hashedPassword,
        terms: {
          check: true,
          date: date.toLocaleString(),
        },
        approval: false,
        personalInfoMail: [date.getFullYear(), date.getMonth() + 1],
      });
  }

  async changePwByEmail(newPw) {
    const hashedPassword = await bcrypt.hash(newPw, 12);

    return await db
      .getDb()
      .collection("users")
      .updateOne({ email: this.email }, { $set: { pw: hashedPassword } });
  }

  async changePwByUserName(newPw) {
    const hashedPassword = await bcrypt.hash(newPw, 12);

    return await db
      .getDb()
      .collection("users")
      .updateOne({ userName: this.userName }, { $set: { pw: hashedPassword } });
  }

  async matchingPw(hashedPw) {
    return bcrypt.compare(this.pw, hashedPw);
  }

  async accountLock() {
    let userInput = await this.findByEmail();

    if (!userInput) {
      return;
    }

    return await db
      .getDb()
      .collection("users")
      .updateOne({ email: this.email }, { $set: { lock: true } });
  }

  async unlockById(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db
      .getDb()
      .collection("users")
      .updateOne({ _id: objectId }, { $set: { lock: false } });
  }

  async watingApproval() {
    return await db
      .getDb()
      .collection("users")
      .find({ approval: false })
      .toArray();
  }

  async signupApproval(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db
      .getDb()
      .collection("users")
      .updateOne({ _id: objectId }, { $set: { approval: true } });
  }

  async deleteById(id) {
    const objectId = new mongodb.ObjectId(id);

    await db
      .getDb()
      .collection("users")
      .updateOne({ _id: objectId }, { $set: { email: null } });

    return await db.getDb().collection("users").deleteOne({ _id: objectId });
  }

  async promotion(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db
      .getDb()
      .collection("users")
      .updateOne({ _id: objectId }, { $set: { manager: true } });
  }

  async demotion(id) {
    const objectId = new mongodb.ObjectId(id);

    return await db
      .getDb()
      .collection("users")
      .updateOne({ _id: objectId }, { $set: { manager: false } });
  }

  async addAuthNum(authNum) {
    return await db
      .getDb()
      .collection("users")
      .updateOne({ userName: this.userName }, { $set: { authNum: authNum } });
  }

  async deleteAuthNum() {
    return await db
      .getDb()
      .collection("users")
      .updateOne({ userName: this.userName }, { $set: { authNum: null } });
  }
}

module.exports = Auth;
