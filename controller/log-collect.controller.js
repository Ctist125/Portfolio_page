// 프로젝트 내 파일
const logForm = require("../util/log-form");

function getLogCollectPage(req, res) {
  // 기존에 로그 수집 동의를 한 상황에서 해당 페이지 점근
  if (req.session.logCollect) {
    // 로그
    const userIp = "USER: " + req.ip;
    console.log(logForm(userIp, "로그 수집 동의 후, 재접속 시도."));
    return res.status(400).render("errors/400");
  }

  res.render("basic/log-collect");
}

function logAgree(req, res) {
  // 로그 수집 동의 확인
  const value = req.body.logCollect;

  if (value === "on") {
    req.session.logCollect = true;

    // 로그
    const userIp = "USER: " + req.ip;

    console.log(logForm(userIp, "로그 수집 동의."));

    return res.redirect("/");
  }

  // 의도된 방법 외의 접근
  req.session.logCollect = false;

  res.status(400).render("errors/400");
}

module.exports = {
  getLogCollectPage: getLogCollectPage,
  logAgree: logAgree,
};
