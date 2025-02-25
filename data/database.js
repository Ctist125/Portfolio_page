// 외부 라이브러리 선언
const mongodb = require("mongodb");

// mongodb
const MongoClient = mongodb.MongoClient;

// 변수 선언
let database;

async function connectToDatabase() {
  const client = await MongoClient.connect("mongodb://localhost:27017");
  database = client.db("portfolio");
}

function getDb() {
  if (!database) {
    throw new Error("먼저 Database를 연결해 주십시오.");
  }

  return database;
}

module.exports = {
  connectToDatabase: connectToDatabase,
  getDb: getDb,
};
