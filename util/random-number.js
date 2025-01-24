// 내부 라이브러리 선언
const crypto = require("crypto");

// 특수 문자를 포함한 난수 세팅
const memory =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";

function randomNumber(length) {
  let result = "";

  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += memory[randomBytes[i] % memory.length];
  }

  return result;
}

module.exports = randomNumber;
