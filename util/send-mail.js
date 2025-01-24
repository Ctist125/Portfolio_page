// 외부 라이브러리 선언
const nodemailer = require("nodemailer");

// 계정 관리
const account = {
  service: process.env.NODEMAILER_EMAIL_SERVICE,
  user: process.env.NODEMAILER_USER,
  pw: process.env.NODEMAILER_PW,
};

// 서비스 생성
const transporter = nodemailer.createTransport({
  service: account.service,
  auth: {
    user: account.user,
    pass: account.pw,
  },
});

// 메일 내용
function sendMailHTML(email, title, contents) {
  const mailContents = {
    from: account.user,
    to: email,
    subject: title,
    html: contents,
  };

  transporter.sendMail(mailContents, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Send email: ", info);
    }
  });

  return;
}

function sendMailText(email, title, contents) {
  const mailContents = {
    from: account.user,
    to: email,
    subject: title,
    text: contents,
  };

  transporter.sendMail(mailContents, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Send email: ", info);
    }
  });

  return;
}

module.exports = {
  sendMailHTML: sendMailHTML,
  sendMailText: sendMailText,
};
