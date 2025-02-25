// 프로젝트 내 파일
const Auth = require("../models/auth.model");

function noEmpty(value) {
  if (value.trim()) {
    return true;
  } else {
    return false;
  }
}

function noWhiteSpace(value) {
  if (!value.match(/\s/)) {
    return true;
  } else {
    return false;
  }
}

function noSpecialChar(value) {
  if (!value.match(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/)) {
    return true;
  } else {
    return false;
  }
}

async function sameUserName(value) {
  const auth = new Auth(value);

  const userName = await auth.findByUserName();

  if (userName) {
    return true;
  } else {
    return false;
  }
}

function emailValid(value) {
  if (value.match(/\w+@\w+[.]\w+/)) {
    return true;
  } else {
    return false;
  }
}

async function sameEmail(value) {
  const auth = new Auth("", value);

  const email = await auth.findByEmail();

  if (email) {
    return true;
  } else {
    return false;
  }
}

function pwValid(value) {
  if (
    value.match(/[A-Z]/) &&
    value.match(/[a-z]/) &&
    value.match(/[0-9]/) &&
    value.match(/[!@#$%^&*_+?]/)
  ) {
    return true;
  } else {
    return false;
  }
}

function jpgValid(value) {
  if (value.match(/jpg$/) || value.match(/jpeg$/)) {
    return true;
  } else {
    return false;
  }
}

function dateValid(value) {
  if (value.match(/\d+-\d+-\d+/)) {
    return true;
  } else {
    return false;
  }
}

function lengthValid(value, maxLength) {
  if (value.length <= maxLength) {
    return true;
  } else {
    return false;
  }
}

function languageGroupValid(value) {
  const languageList = [
    "frontEnd",
    "backEnd",
    "database",
    "versionControl",
    "tools",
    "studying",
  ];

  for (let language of languageList) {
    if (value === language) {
      return true;
    }
  }

  return false;
}

module.exports = {
  noEmpty: noEmpty,
  noWhiteSpace: noWhiteSpace,
  noSpecialChar: noSpecialChar,
  sameUserName: sameUserName,
  emailValid: emailValid,
  sameEmail: sameEmail,
  pwValid: pwValid,
  jpgValid: jpgValid,
  dateValid: dateValid,
  lengthValid: lengthValid,
  languageGroupValid: languageGroupValid,
};
