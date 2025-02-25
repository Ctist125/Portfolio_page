// 프로젝트 내 파일
const logForm = require("../util/log-form");

function managerAccessCheck(req, res, next) {
  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  if (res.locals.manager || res.locals.admin) {
    return next();
  } else {
    if (!res.locals.auth) {
      console.log(logForm(userIp, "로그인 없이 접속 시도."));
      return res.status(401).render("errors/401");
    } else {
      console.log(logForm(userIp, "manager 이하 접속 시도."));
      return res.status(403).render("errors/403");
    }
  }
}

module.exports = managerAccessCheck;
