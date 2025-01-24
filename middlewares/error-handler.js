// 프로젝트 내 파일
const logForm = require("../util/log-form");

function errorHandler(error, req, res, next) {
  console.log(error);

  if (error.code === 404) {
    return res.status(404).render("errors/404");
  }
  // 로그
  const url = req.originalUrl;
  console.log(logForm("SERVER", url + " 서버에 오류 발생."));

  return res.status(500).render("errors/500");
}

module.exports = errorHandler;
