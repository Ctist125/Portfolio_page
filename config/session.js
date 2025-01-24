// 외부 라이브러리 선언
const expressSession = require("express-session");
const mongoDbStore = require("connect-mongodb-session");

// 프로젝트 내 파일
const randomNumber = require("../util/random-number");

function createSessionStore() {
  const MongoDBStore = mongoDbStore(expressSession);

  const store = new MongoDBStore({
    uri: "mongodb://localhost:27017",
    databaseName: "portfolio",
    collection: "sessions",
  });

  return store;
}

function createSessionConfig() {
  return {
    secret: randomNumber(128),
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000,
    },
  };
}

module.exports = createSessionConfig;
