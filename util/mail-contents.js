// 내부 라이브러리 선언
const path = require("path");
const fs = require("fs");

// 파일 내용 불러오기
function getMailConents(fileName) {
  // 파일 경로 지정
  const filePath = path.join(__dirname, fileName);

  // 파일 내용 불러오기
  const data = fs.readFileSync(filePath, "utf8");

  return data;
}

module.exports = getMailConents;
