// 내부 라이브러리 선언
const path = require("path");
const fs = require("fs");

// 외부 라이브러리 선언
const express = require("express");
const expressSession = require("express-session");
const Csrf = require("csrf");
const morgan = require("morgan");

// 프로젝트 내 파일
const db = require("./data/database");
const createSessionConfig = require("./config/session");
const authCheckMiddleware = require("./middlewares/auth-check");
const managerAccessCheckMiddleware = require("./middlewares/manager-access-check");
const adminAccessCheckMiddleware = require("./middlewares/admin-access-check");
const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const logCollectCheckMiddleware = require("./middlewares/log-collect-check");
const logCollectRoutes = require("./routes/log-collect.routes");
const basicRoutes = require("./routes/basic.routes");
const writingRoutes = require("./routes/writing.routes");
const authRoutes = require("./routes/auth.routes");
const managementRoutes = require("./routes/management.routes");
const portfolioRoutes = require("./routes/portfolio.routes");
const useDateNameUtil = require("./util/use-date-as-name");
const logForm = require("./util/log-form");

// express
const app = express();

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// setting
app.use(express.static("public"));
app.use("/resource", express.static("resource"));
app.use(express.urlencoded({ extended: false }));

// session setting
const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));

// csrf setting
global.csrf = new Csrf();

// 로그 수집 약관
app.use(logCollectRoutes);
app.use(logCollectCheckMiddleware);

// morgan
const logDirectory = path.join(__dirname, "../portfolio_log");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = fs.createWriteStream(path.join(logDirectory, useDateNameUtil() + ".log"), { flags: "a" });
app.use(morgan("combined", { stream: accessLogStream }));

// 미들웨어 & 라우트
app.use(authCheckMiddleware);

app.use(basicRoutes);
app.use(authRoutes);
app.use("/writing", adminAccessCheckMiddleware, writingRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/management", managerAccessCheckMiddleware, managementRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

db.connectToDatabase()
  .then(function () {
    app.listen(3215);
  })
  .catch(function (error) {
    console.log(logForm("SERVER", "Database 연결에 실패했습니다."));
    console.log(error);
  });
