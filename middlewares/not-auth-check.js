// 프로젝트 내 파일
const logForm = require("../util/log-form");

function notAuthCheck(req, res, next) {
  if (res.locals.auth) {
    // 로그
    const userIp = "USER: " + req.ip;
    console.log(logForm(userIp, "로그인 없이 접속 시도."));
    return res.status(400).render("errors/400");
  }

  next();
}

module.exports = notAuthCheck;
