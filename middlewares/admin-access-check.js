// 프로젝트 내 파일
const logForm = require("../util/log-form");

function adminAccessCheck(req, res, next) {
  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  // 관리자만 사용할 수 있는 페이지
  if (!res.locals.auth) {
    console.log(logForm(userIp, "로그인 없이 접속 시도."));
    return res.status(401).render("errors/401");
  } else if (!res.locals.admin) {
    console.log(logForm(userIp, "어드민 이외 접속 시도."));
    return res.status(403).render("errors/403");
  }

  next();
}

module.exports = adminAccessCheck;
